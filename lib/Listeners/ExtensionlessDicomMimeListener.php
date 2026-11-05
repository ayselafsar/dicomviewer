<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Listeners;

use OCA\DICOMViewer\Service\DicomPreamble;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Files\Cache\CacheEntryInsertedEvent;
use OCP\Files\Cache\CacheEntryUpdatedEvent;
use OCP\Files\Storage\IStorage;

/**
 * The file scanner names a type from the extension only. DICOMDIR and the
 * images it indexes have no extension, so they are stored as
 * application/octet-stream and a click downloads them.
 *
 * @template-implements IEventListener<CacheEntryInsertedEvent|CacheEntryUpdatedEvent>
 */
class ExtensionlessDicomMimeListener implements IEventListener {
	/** @var array<int, true> */
	private array $inProgress = [];

	public function __construct(
		private DicomPreamble $dicomPreamble,
	) {
	}

	public function handle(Event $event): void {
		if (!$event instanceof CacheEntryInsertedEvent && !$event instanceof CacheEntryUpdatedEvent) {
			return;
		}

		$fileId = $event->getFileId();
		if (isset($this->inProgress[$fileId])) {
			return;
		}

		$storage = $event->getStorage();
		$path = $event->getPath();
		$cache = $storage->getCache();
		$entry = $cache->get($path);
		if ($entry === false || $entry->getMimeType() !== 'application/octet-stream') {
			return;
		}
		if ($entry->getSize() >= 0 && $entry->getSize() < DicomPreamble::HEADER_LENGTH) {
			return;
		}
		if (!$this->storageHasDicomMarker($storage, $path)) {
			return;
		}

		// Updating the cache emits this event again. Ignore that re-entry.
		$this->inProgress[$fileId] = true;
		try {
			$cache->update($fileId, ['mimetype' => 'application/dicom']);
		} finally {
			unset($this->inProgress[$fileId]);
		}
	}

	private function storageHasDicomMarker(IStorage $storage, string $path): bool {
		try {
			$handle = $storage->fopen($path, 'r');
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
