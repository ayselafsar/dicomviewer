<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Listeners;

use OCP\AppFramework\Http\EmptyContentSecurityPolicy;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Security\CSP\AddContentSecurityPolicyEvent;

class CSPListener implements IEventListener {
	public function handle(Event $event): void {
		if (!$event instanceof AddContentSecurityPolicyEvent) {
			return;
		}

		$csp = new EmptyContentSecurityPolicy();
		$csp->addAllowedFrameDomain('\'self\'');
		$event->addPolicy($csp);
	}
}
