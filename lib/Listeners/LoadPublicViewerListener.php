<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Listeners;

use OCA\DICOMViewer\AppInfo\Application;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class LoadPublicViewerListener implements IEventListener {
	public function handle(Event $event): void {
		if (!$event instanceof BeforeTemplateRenderedEvent) {
			return;
		}

		// Make sure we are on a public page rendering
		if ($event->getResponse()->getRenderAs() !== TemplateResponse::RENDER_AS_PUBLIC) {
			return;
		}

        Util::addScript(Application::APP_ID, 'dicomviewer-public');
	}
}
