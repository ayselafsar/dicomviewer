<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Tests;

use OCA\DICOMViewer\BackgroundJob\DetectExtensionlessDicomJob;
use OCA\DICOMViewer\Migration\DetectExtensionlessDicom;
use OCA\DICOMViewer\Service\ExtensionlessDicomScanner;
use OCP\BackgroundJob\IJobList;
use OCP\Migration\IOutput;
use PHPUnit\Framework\TestCase;

class DetectExtensionlessDicomTest extends TestCase {
	public function testEnableQueuesTheCronJobWithoutScanning(): void {
		$jobList = $this->createMock(IJobList::class);
		$scanner = $this->createMock(ExtensionlessDicomScanner::class);
		$scanner->method('isDone')->willReturn(false);
		$jobList->expects($this->once())
			->method('has')
			->with(DetectExtensionlessDicomJob::class, null)
			->willReturn(false);
		$jobList->expects($this->once())
			->method('add')
			->with(DetectExtensionlessDicomJob::class);

		$output = $this->createMock(IOutput::class);
		$output->expects($this->once())->method('info');

		$step = new DetectExtensionlessDicom($jobList, $scanner);
		$step->run($output);
	}

	public function testEnableDoesNotQueueASecondJob(): void {
		$jobList = $this->createMock(IJobList::class);
		$scanner = $this->createMock(ExtensionlessDicomScanner::class);
		$scanner->method('isDone')->willReturn(false);
		$jobList->method('has')->willReturn(true);
		$jobList->expects($this->never())->method('add');

		$step = new DetectExtensionlessDicom($jobList, $scanner);
		$step->run($this->createMock(IOutput::class));
	}

	public function testEnableQueuesACatchUpWhenThePreviousScanFinished(): void {
		$jobList = $this->createMock(IJobList::class);
		$scanner = $this->createMock(ExtensionlessDicomScanner::class);
		$scanner->method('isDone')->willReturn(true);
		$jobList->method('has')->willReturn(false);
		$jobList->expects($this->once())
			->method('add')
			->with(DetectExtensionlessDicomJob::class);

		$step = new DetectExtensionlessDicom($jobList, $scanner);
		$step->run($this->createMock(IOutput::class));
	}
}
