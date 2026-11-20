<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Migration;

use OCA\DICOMViewer\Service\DicomPreamble;
use OCP\Files\File;
use OCP\Files\IRootFolder;
use OCP\IUserManager;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;

/**
 * Files imported before the cache listener existed keep the generic binary
 * type. Re-check those so an existing DICOMDIR disc opens in the viewer.
 */
class DetectExtensionlessDicom implements IRepairStep {
	public function __construct(
		private IRootFolder $rootFolder,
		private IUserManager $userManager,
		private DicomPreamble $dicomPreamble,
	) {
	}

	public function getName(): string {
		return 'Detect extensionless DICOM files';
	}

	public function run(IOutput $output): void {
		$updated = 0;
		$this->userManager->callForAllUsers(function ($user) use ($output, &$updated) {
			try {
				$folder = $this->rootFolder->getUserFolder($user->getUID());
			} catch (\Throwable $e) {
				$output->warning('Skipping ' . $user->getUID() . ': ' . $e->getMessage());
				return;
			}

			foreach ($folder->searchByMime('application/octet-stream') as $node) {
				if (!$node instanceof File) {
					continue;
				}
				if ($node->getSize() >= 0 && $node->getSize() < DicomPreamble::HEADER_LENGTH) {
					continue;
				}
				if (!$this->nodeHasDicomMarker($node)) {
					continue;
				}

				$node->getStorage()->getCache()->update($node->getId(), [
					'mimetype' => 'application/dicom',
				]);
				$updated++;
			}
		});

		$output->info('Marked ' . $updated . ' extensionless DICOM file(s) as application/dicom.');
	}

	private function nodeHasDicomMarker(File $node): bool {
		try {
			$handle = $node->fopen('r');
		} catch (\Throwable $e) {
			return false;
		}
		if ($handle === false) {
			return false;
		}

		try {
			$header = fread($handle, DicomPreamble::HEADER_LENGTH);
		} catch (\Throwable $e) {
			return false;
		} finally {
			fclose($handle);
		}

		return is_string($header) && $this->dicomPreamble->matches($header);
	}
}
