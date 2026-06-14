<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Listeners;

use OCA\DICOMViewer\AppInfo\Application;
use OCA\Files\Event\LoadSidebar;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

/** @template-implements IEventListener<LoadSidebar> */
class LoadSidebarListener implements IEventListener {
	public function handle(Event $event): void {
		if (!$event instanceof LoadSidebar) {
			return;
		}

		Util::addInitScript(Application::APP_ID, 'dicomviewer-sidebar');
	}
}
