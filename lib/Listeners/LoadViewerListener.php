<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Listeners;

use OCA\DICOMViewer\AppInfo\Application;
use OCA\Viewer\Event\LoadViewer;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class LoadViewerListener implements IEventListener {
	public function handle(Event $event): void {
		if (!$event instanceof LoadViewer) {
			return;
		}

		Util::addScript(Application::APP_ID, 'dicomviewer-main', 'viewer');
	}
}
