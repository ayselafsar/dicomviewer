<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Service;

use OCA\DICOMViewer\AppInfo\Application;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\Files\Config\IUserMountCache;
use OCP\Files\File;
use OCP\Files\IMimeTypeLoader;
use OCP\Files\IRootFolder;
use OCP\Files\ISetupManager;
use OCP\IAppConfig;
use OCP\IDBConnection;
use Psr\Log\LoggerInterface;

/**
 * Walks existing application/octet-stream files and retags the ones that
 * start with a DICOM preamble. One cron run reads only a short slice so
 * app enable and the rest of the background job queue stay responsive.
 */
class ExtensionlessDicomScanner {
	public const RUN_SECONDS = 15;
	private const BATCH_SIZE = 100;
	private const LOCK_TTL = 120;

	private const CURSOR_KEY = 'extensionless_dicom_cursor';
	private const DONE_KEY = 'extensionless_dicom_done';
	private const CHECKED_KEY = 'extensionless_dicom_checked';
	private const UPDATED_KEY = 'extensionless_dicom_updated';
	private const LOCK_KEY = 'extensionless_dicom_lock';

	/** @var array<int, \OCP\Files\Config\ICachedMountInfo|false> */
	private array $storageMount = [];

	private ?string $preparedUser = null;

	public function __construct(
		private IDBConnection $db,
		private IMimeTypeLoader $mimeTypeLoader,
		private IUserMountCache $userMountCache,
		private IRootFolder $rootFolder,
		private ISetupManager $setupManager,
		private IAppConfig $appConfig,
		private DicomPreamble $dicomPreamble,
		private LoggerInterface $logger,
	) {
	}

	public function isDone(): bool {
		return $this->appConfig->getValueBool(Application::APP_ID, self::DONE_KEY, false, true);
	}

	public function acquireLock(): bool {
		$now = time();
		$lockedAt = $this->appConfig->getValueInt(Application::APP_ID, self::LOCK_KEY, 0, true);
		if ($lockedAt > 0 && ($now - $lockedAt) < self::LOCK_TTL) {
			return false;
		}

		$this->appConfig->setValueInt(Application::APP_ID, self::LOCK_KEY, $now, true);
		return true;
	}

	public function releaseLock(): void {
		$this->appConfig->deleteKey(Application::APP_ID, self::LOCK_KEY);
	}

	/**
	 * Inspect the next slice of candidate files.
	 *
	 * @return bool true when every candidate has been visited
	 */
	public function processFor(int $seconds): bool {
		$deadline = time() + max(1, $seconds);
		$cursor = (int)$this->appConfig->getValueString(Application::APP_ID, self::CURSOR_KEY, '0', true);
		$checked = $this->appConfig->getValueInt(Application::APP_ID, self::CHECKED_KEY, 0, true);
		$updated = $this->appConfig->getValueInt(Application::APP_ID, self::UPDATED_KEY, 0, true);
		$sinceSave = 0;

		while (time() < $deadline) {
			$fileIds = $this->nextFileIds($cursor);
			if ($fileIds === []) {
				$this->saveProgress($cursor, $checked, $updated);
				$this->markDone($checked, $updated, $this->isDone());
				return true;
			}

			// A previous run can already be marked done while newer binary
			// files still need a look. Keep the flag false until this pass ends.
			if ($this->isDone()) {
				$this->appConfig->setValueBool(Application::APP_ID, self::DONE_KEY, false, true);
			}

			foreach ($fileIds as $fileId => $storageId) {
				$this->inspect($fileId, $storageId, $checked, $updated);
				$cursor = $fileId;
				$sinceSave++;
				$timedOut = time() >= $deadline;
				if ($sinceSave >= 25 || $timedOut) {
					$this->saveProgress($cursor, $checked, $updated);
					$sinceSave = 0;
				}
				if ($timedOut) {
					return false;
				}
			}

			if (count($fileIds) < self::BATCH_SIZE) {
				$this->saveProgress($cursor, $checked, $updated);
				$this->markDone($checked, $updated);
				return true;
			}
		}

		$this->saveProgress($cursor, $checked, $updated);
		return false;
	}

	/**
	 * @return array<int, int> file id => numeric storage id, ordered by file id
	 */
	private function nextFileIds(int $cursor): array {
		$mimeId = $this->mimeTypeLoader->getId('application/octet-stream');
		$query = $this->db->getQueryBuilder();
		$query->select('fileid', 'storage')
			->from('filecache')
			->where($query->expr()->eq('mimetype', $query->createNamedParameter($mimeId, IQueryBuilder::PARAM_INT)))
			->andWhere($query->expr()->gt('fileid', $query->createNamedParameter($cursor, IQueryBuilder::PARAM_INT)))
			->andWhere($query->expr()->orX(
				$query->expr()->lt('size', $query->createNamedParameter(0, IQueryBuilder::PARAM_INT)),
				$query->expr()->gte('size', $query->createNamedParameter(DicomPreamble::HEADER_LENGTH, IQueryBuilder::PARAM_INT)),
			))
			->orderBy('fileid', 'ASC')
			->setMaxResults(self::BATCH_SIZE);

		$result = $query->executeQuery();
		$fileIds = [];
		while (($row = $result->fetchAssociative()) !== false) {
			$fileIds[(int)$row['fileid']] = (int)$row['storage'];
		}
		$result->closeCursor();

		return $fileIds;
	}

	private function inspect(int $fileId, int $storageId, int &$checked, int &$updated): void {
		$checked++;
		try {
			$file = $this->resolveFile($fileId, $storageId);
			if (!$file instanceof File) {
				return;
			}
			if (!$this->hasDicomMarker($file)) {
				return;
			}

			$file->getStorage()->getCache()->update($file->getId(), [
				'mimetype' => 'application/dicom',
			]);
			$updated++;
		} catch (\Throwable $e) {
			$this->logger->debug('Skipping file {fileId} during extensionless DICOM detection: {message}', [
				'app' => Application::APP_ID,
				'fileId' => $fileId,
				'message' => $e->getMessage(),
				'exception' => $e,
			]);
		}
	}

	private function resolveFile(int $fileId, int $storageId): ?File {
		if (!array_key_exists($storageId, $this->storageMount)) {
			$mounts = $this->userMountCache->getMountsForStorageId($storageId);
			$this->storageMount[$storageId] = $mounts[0] ?? false;
		}
		$mount = $this->storageMount[$storageId];
		if ($mount === false) {
			return null;
		}

		try {
			$user = $mount->getUser();
			if ($this->preparedUser !== $user->getUID()) {
				if ($this->preparedUser !== null) {
					$this->setupManager->tearDown();
				}
				$this->setupManager->setupForUser($user);
				$this->preparedUser = $user->getUID();
			}

			$node = $this->rootFolder->getUserFolder($user->getUID())->getFirstNodeById($fileId);
		} catch (\Throwable $e) {
			$this->storageMount[$storageId] = false;
			$this->preparedUser = null;
			throw $e;
		}

		return $node instanceof File ? $node : null;
	}

	private function hasDicomMarker(File $file): bool {
		$handle = $file->fopen('r');
		if ($handle === false) {
			return false;
		}

		try {
			$header = fread($handle, DicomPreamble::HEADER_LENGTH);
		} finally {
			fclose($handle);
		}

		return is_string($header) && $this->dicomPreamble->matches($header);
	}

	private function saveProgress(int $cursor, int $checked, int $updated): void {
		$this->appConfig->setValueString(Application::APP_ID, self::CURSOR_KEY, (string)$cursor, true);
		$this->appConfig->setValueInt(Application::APP_ID, self::CHECKED_KEY, $checked, true);
		$this->appConfig->setValueInt(Application::APP_ID, self::UPDATED_KEY, $updated, true);
	}

	private function markDone(int $checked, int $updated, bool $quiet = false): void {
		$this->appConfig->setValueBool(Application::APP_ID, self::DONE_KEY, true, true);
		if ($quiet) {
			return;
		}
		$this->logger->info('Extensionless DICOM detection finished. Checked {checked} file(s) and marked {updated} as application/dicom.', [
			'app' => Application::APP_ID,
			'checked' => $checked,
			'updated' => $updated,
		]);
	}
}
