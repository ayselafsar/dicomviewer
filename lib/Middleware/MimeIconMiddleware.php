<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Middleware;

use OCA\DICOMViewer\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Middleware;
use OCP\IRequest;
use OCP\IURLGenerator;

class MimeIconMiddleware extends Middleware {
	public function __construct(
		private IRequest $request,
		private IURLGenerator $urlGenerator,
	) {
	}

	public function afterController(Controller $controller, string $methodName, Response $response): Response {
		if ($methodName !== 'getMimeIconUrl' || $this->request->getParam('mime') !== 'application/dicom') {
			return $response;
		}

		try {
			$url = $this->urlGenerator->imagePath(Application::APP_ID, 'application-dicom.svg');
		} catch (\RuntimeException $e) {
			return $response;
		}

		return new RedirectResponse($this->urlGenerator->getAbsoluteURL($url));
	}
}
