<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\BackgroundJob;

use OCA\DICOMViewer\Service\ExtensionlessDicomScanner;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\BackgroundJob\IJobList;
use OCP\BackgroundJob\QueuedJob;

/**
 * Continues the extensionless DICOM scan for one short slice, then queues
 * itself again until the file cache has been walked.
 */
class DetectExtensionlessDicomJob extends QueuedJob {
	public function __construct(
		ITimeFactory $time,
		private ExtensionlessDicomScanner $scanner,
		private IJobList $jobList,
	) {
		parent::__construct($time);
		$this->setAllowParallelRuns(false);
	}

	protected function run($argument): void {
		if (!$this->scanner->acquireLock()) {
			$this->jobList->scheduleAfter(self::class, $this->time->getTime() + 60);
			return;
		}

		$done = false;
		try {
			$done = $this->scanner->processFor(ExtensionlessDicomScanner::RUN_SECONDS);
		} finally {
			$this->scanner->releaseLock();
			if ($done) {
				$this->jobList->remove(self::class);
			} else {
				$this->jobList->add(self::class);
			}
		}
	}
}
