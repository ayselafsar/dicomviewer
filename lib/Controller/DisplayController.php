<?php

namespace OCA\DICOMViewer\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;

class DisplayController extends Controller {
    private $urlGenerator;

    public function __construct($AppName,
                                IRequest $request,
                                IURLGenerator $urlGenerator) {
        parent::__construct($AppName, $request);
        $this->urlGenerator = $urlGenerator;
    }

    /**
     * @PublicPage
     * @NoCSRFRequired
     *
     * @param bool $minmode
     * @return TemplateResponse
     */
    public function index($minmode = false) {
        $params = [
            'urlGenerator' => $this->urlGenerator,
            'minmode' => $minmode,
        ];

        return new TemplateResponse('dicomviewer', 'viewer', $params, 'blank');
    }

    /**
     * @PublicPage
     * @NoCSRFRequired
     *
     * @param bool $minmode
     * @return TemplateResponse
     */
    public function viewerMain($minmode = false) {
        $params = [
            'urlGenerator' => $this->urlGenerator,
            'minmode' => $minmode,
        ];

        return new TemplateResponse('dicomviewer', 'viewerMain', $params, 'blank');
    }

    /**
     * @PublicPage
     * @NoCSRFRequired
     *
     * @param bool $minmode
     * @return TemplateResponse
     */
    public function sidebar($minmode = false) {
        $params = [
            'urlGenerator' => $this->urlGenerator,
            'minmode' => $minmode,
        ];

        return new TemplateResponse('dicomviewer', 'sidebar', $params, 'blank');
    }

    /**
         * @PublicPage
         * @NoCSRFRequired
         *
         * @return TemplateResponse
         */
        public function captureImageDialog() {
            $params = [
                'urlGenerator' => $this->urlGenerator,
            ];

            return new TemplateResponse('dicomviewer', 'captureImageDialog', $params, 'blank');
        }
}
