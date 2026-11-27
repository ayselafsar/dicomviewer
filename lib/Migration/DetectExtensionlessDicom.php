<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Migration;

use OCA\DICOMViewer\BackgroundJob\DetectExtensionlessDicomJob;
use OCA\DICOMViewer\Service\ExtensionlessDicomScanner;
use OCP\BackgroundJob\IJobList;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;

/**
 * Files imported before the cache listener existed keep the generic binary
 * type. The check itself reads file headers, so it runs from cron instead of
 * inside app:enable. On a large instance, including SMB external storage,
 * doing it here blocks Nextcloud until every binary file has been opened.
 */
class DetectExtensionlessDicom implements IRepairStep {
	public function __construct(
		private IJobList $jobList,
		private ExtensionlessDicomScanner $scanner,
	) {
	}

	public function getName(): string {
		return 'Detect extensionless DICOM files';
	}

	public function run(IOutput $output): void {
		if (!$this->jobList->has(DetectExtensionlessDicomJob::class, null)) {
			$this->jobList->add(DetectExtensionlessDicomJob::class);
		}

		if ($this->scanner->isDone()) {
			$output->info('Queued a cron check for extensionless DICOM files added since the last run.');
			return;
		}

		$output->info('Queued extensionless DICOM detection for the Nextcloud cron job.');
	}
}
