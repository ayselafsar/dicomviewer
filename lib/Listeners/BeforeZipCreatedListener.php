<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Listeners;

use OCA\DICOMViewer\AppInfo\Application;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Files\Cache\IScanner;
use OCP\Files\Events\BeforeZipCreatedEvent;
use OCP\Files\Folder;
use Psr\Log\LoggerInterface;

/**
 * Index a folder that Nextcloud has seen but not scanned before it is zipped.
 * Otherwise an external-storage download contains only empty directories.
 *
 * @template-implements IEventListener<BeforeZipCreatedEvent|Event>
 */
class BeforeZipCreatedListener implements IEventListener {
	public function __construct(
		private LoggerInterface $logger,
	) {
	}

	public function handle(Event $event): void {
		if (!$event instanceof BeforeZipCreatedEvent) {
			return;
		}

		$folder = $event->getFolder();
		if (!$folder instanceof Folder || $folder->getSize() >= 0) {
			return;
		}

		try {
			$internalPath = $folder->getInternalPath();
			$folder->getStorage()->getScanner($internalPath)->scan(
				$internalPath,
				IScanner::SCAN_RECURSIVE_INCOMPLETE,
				IScanner::REUSE_ETAG | IScanner::REUSE_SIZE,
			);
		} catch (\Throwable $e) {
			$this->logger->warning('Failed to index folder before zip download', [
				'exception' => $e,
				'app' => Application::APP_ID,
			]);
		}
	}
}
