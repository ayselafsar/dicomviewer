<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Controller;

use OCA\DAV\Connector\Sabre\PublicAuth;
use OCA\DICOMViewer\AppInfo\Application;
use OCP\AppFramework\AuthPublicShareController;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\ISession;
use OCP\IURLGenerator;
use OCP\Share\Exceptions\ShareNotFound;
use OCP\Share\IManager;
use OCP\Share\IShare;

class PublicDisplayController extends AuthPublicShareController {

	private ?IShare $share = null;

	public function __construct(
		string $appName,
		IRequest $request,
		ISession $session,
		IURLGenerator $urlGenerator,
		private IManager $shareManager,
	) {
		parent::__construct($appName, $request, $session, $urlGenerator);
	}

	public function isValidToken(): bool {
		try {
			$this->share = $this->shareManager->getShareByToken($this->getToken());
		} catch (ShareNotFound $e) {
			return false;
		}
		return true;
	}

	protected function isPasswordProtected(): bool {
		return $this->share !== null && $this->share->getPassword() !== null;
	}

	protected function getPasswordHash(): ?string {
		return $this->share?->getPassword();
	}

	protected function verifyPassword(string $password): bool {
		if ($this->share === null) {
			return false;
		}
		return $this->shareManager->checkPassword($this->share, $password);
	}

	protected function authSucceeded(): void {
		if ($this->share === null) {
			return;
		}

		// Also store share ID in the DAV session key so WebDAV downloads work
		$allowedShareIds = $this->session->get(PublicAuth::DAV_AUTHENTICATED);
		if (!is_array($allowedShareIds)) {
			$allowedShareIds = [];
		}
		if (!in_array($this->share->getId(), $allowedShareIds, false)) {
			$this->session->set(
				PublicAuth::DAV_AUTHENTICATED,
				array_merge($allowedShareIds, [$this->share->getId()])
			);
		}
	}

	/**
	 * Show the password authentication form.
	 * Overridden to pass the share object to the template.
	 */
	#[PublicPage]
	#[NoCSRFRequired]
	public function showAuthenticate(): TemplateResponse {
		return new TemplateResponse('core', 'publicshareauth', [
			'share' => $this->share,
		], 'guest');
	}

	/**
	 * After successful authentication, render a page that redirects to the DICOM viewer.
	 */
	#[PublicPage]
	#[NoCSRFRequired]
	public function showShare(): TemplateResponse {
		$path = (string)$this->request->getParam('path', '');
		$token = $this->getToken();

		$dicomJsonUrl = $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->linkToRoute('dicomviewer.display.getPublicDICOMJson')
			. '?file=' . rawurlencode($token . '|' . $path)
		);

		$viewerUrl = $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->linkToRoute('dicomviewer.display.showDICOMViewerModeJson')
			. '?url=' . rawurlencode($dicomJsonUrl)
		);

		return new TemplateResponse(Application::APP_ID, 'public_viewer_redirect', [
			'viewerUrl' => $viewerUrl,
		], 'blank');
	}
}
