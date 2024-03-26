<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Controller;

include_once realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'Nanodicom'.DIRECTORY_SEPARATOR.'nanodicom.php';

use Nanodicom;
use OC\Files\Filesystem;
use OCA\DICOMViewer\AppInfo\Application;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\EmptyContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\StreamResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Files\IMimeTypeDetector;
use OCP\Files\IRootFolder;
use OCP\IConfig;
use OCP\ILogger;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUserSession;
use OCP\Share\IManager;

class DisplayController extends Controller {

	/** @var IURLGenerator */
	private $urlGenerator;
	private ?IAppManager $appManager = null;

	/**
	 * @param IRequest $request
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct(IConfig $config,
	    IRequest $request,
		IURLGenerator $urlGenerator,
		ILogger $logger,
		IMimeTypeDetector $mimeTypeDetector,
		IRootFolder $rootFolder,
		IManager $shareManager,
		IUserSession $userSession) {
		parent::__construct(Application::APP_ID, $request);
		$this->config = $config;
		$this->urlGenerator = $urlGenerator;
		$this->logger = $logger;
		$this->mimeTypeDetector = $mimeTypeDetector;
		$this->rootFolder = $rootFolder;
		$this->shareManager = $shareManager;
		$this->userSession = $userSession;

        $this->publicViewerFolderPath = null;
        $this->publicViewerAssetsFolderPath = null;

		$app_path = $this->getAppManager()->getAppPath('dicomviewer');
		$viewerFolder = $app_path . '/js/public/viewer';
        if (file_exists($viewerFolder)) {
            $this->publicViewerFolderPath = $viewerFolder;
            $this->publicViewerAssetsFolderPath = $viewerFolder . '/assets';
        } else {
            $this->logger->error('Unable to find dicom viewer folder: ' . $viewerFolder);
        }

        $this->dataFolder = $this->config->getSystemValue('datadirectory');
	}

    private function getAppManager(): IAppManager {
        if ($this->appManager !== null) {
            return $this->appManager;
        }
        $this->appManager = \OCP\Server::get(IAppManager::class);
        return $this->appManager;
    }

	private function getNextcloudBasePath() {
	    if ($this->config->getSystemValueBool('htaccess.IgnoreFrontController', false) || getenv('front_controller_active') === 'true') {
	        return $this->urlGenerator->getWebroot();
	    } else {
	        return $this->urlGenerator->getWebroot() . '/index.php';
	    }
	}

    private function getQueryParam($key) {
        $requestUri = $this->request->getRequestUri();
        $qPos = strpos($requestUri, '?');
        if (!$qPos) {
            return null;
        }

        $queryParamsStr = substr($requestUri, $qPos + 1);
        $queryParams = array();
        if ($queryParamsStr !== null) {
            $queryParamsStrSplit = explode('&', $queryParamsStr);
            for ($i = 0; $i < count($queryParamsStrSplit); $i++) {
                $queryParamKeyValueToMapSplit = explode('=', $queryParamsStrSplit[$i]);
                if (count($queryParamKeyValueToMapSplit) === 2 && $queryParamKeyValueToMapSplit[0] === $key) {
                    return urldecode($queryParamKeyValueToMapSplit[1]);
                }
            }
        }

        return null;
    }

    private function arrayFindIndex($array, $searchKey, $searchValue) {
        for ($i = 0; $i < count($array); $i++) {
            if ($array[$i][$searchKey] === $searchValue) {
                return $i;
            }
        }
        return -1;
    }

    private function cleanDICOMTagValue($value) {
        if (is_string($value)) {
            return str_replace('\u0000', '', trim($value));
        }

        return $value;
    }

    private function getAllDICOMFilesInFolder($parentPathToRemove, $folderNode, $isOpenNoExtension) {
        $filepaths = array();
        $nodes = $folderNode->getDirectoryListing();
        foreach($nodes as $node) {
            if ($node->getType() == 'dir') {
                $filepaths = array_merge($filepaths, $this->getAllDICOMFilesInFolder($parentPathToRemove, $node, $isOpenNoExtension));
            } else if ($node->getType() == 'file' && ($isOpenNoExtension || $node->getMimetype() == 'application/dicom')) {
                array_push($filepaths, implode('', explode($parentPathToRemove, $node->getPath(), 2)));
            }
        }
        return $filepaths;
    }

    private function getContentSecurityPolicy() {
        $policy = new EmptyContentSecurityPolicy();
        $policy->addAllowedChildSrcDomain('http: *');
        $policy->addAllowedFontDomain('data: http: *');
        $policy->addAllowedImageDomain('data: http: *');
        $policy->addAllowedScriptDomain('http: *');
        $policy->addAllowedStyleDomain('http: *');
        $policy->addAllowedConnectDomain('http: *');
        $policy->addAllowedWorkerSrcDomain('http: *');
        $policy->addAllowedFrameDomain('http: *');
        $policy->addAllowedFrameAncestorDomain('http: *');
        $policy->allowEvalScript(true);
        $policy->allowEvalWasm(true);
        $policy->allowInlineStyle(true);
        $policy->useStrictDynamic(false);
        $policy->useStrictDynamicOnScripts(false);
        return $policy;
    }

    private function generateDICOMJson($dicomFilePaths, $selectedFileFullPath, $parentFullPath, $currentUserPathToFile, $downloadUrlPrefix, $isPublic, $singlePublicFileDownload) {
        $dicomJson = array('studies' => array());

        foreach($dicomFilePaths as $dicomFilePath) {
            $fileUrlPath = '';
            if ($isPublic) {
                if ($singlePublicFileDownload) {
                    $urlParamFiles = substr($dicomFilePath, strrpos($dicomFilePath, '/') + 1);
                    $fileUrlPath = $downloadUrlPrefix.'/'.$urlParamFiles;
                } else {
                    $urlParamPath = substr($dicomFilePath, 0, strrpos($dicomFilePath, '/'));
                    $urlParamFiles = substr($dicomFilePath, strrpos($dicomFilePath, '/') + 1);
                    $fileUrlPath = $downloadUrlPrefix.'?path='.$urlParamPath.'&files='.$urlParamFiles;
                }
            } else if ($currentUserPathToFile != null) {
                $fileUrlPath = $downloadUrlPrefix.strstr($dicomFilePath, $currentUserPathToFile);
            } else {
                $fileUrlPath = $downloadUrlPrefix.$dicomFilePath;
            }

            $fileUrl = $this->urlGenerator->getAbsoluteURL($fileUrlPath);

            $fileFullPath = $parentFullPath.$dicomFilePath;
            $dicom = Nanodicom::factory($fileFullPath);

            if (!$dicom->is_dicom()) {
                // Do not parse if it is not a DICOM file
                continue;
            }

            $dicom->parse()->profiler_diff('parse');

            $StudyInstanceUID = $this->cleanDICOMTagValue($dicom->value(0x0020, 0x000D));
            $StudyDate = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0020));
            $StudyTime = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0030));
            $StudyDescription = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x1030));
            $PatientName = $this->cleanDICOMTagValue($dicom->value(0x0010, 0x0010));
            $PatientID = $this->cleanDICOMTagValue($dicom->value(0x0010, 0x0020));
            $PatientBirthDate = $this->cleanDICOMTagValue($dicom->value(0x0010, 0x0030));
            $AccessionNumber = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0050));
            $PatientAge = $this->cleanDICOMTagValue($dicom->value(0x0010, 0x1010));
            $PatientSex = $this->cleanDICOMTagValue($dicom->value(0x0010, 0x0040));
            $NumInstances = 0;
            $Modalities = '';
            $SeriesInstanceUID = $this->cleanDICOMTagValue($dicom->value(0x0020, 0x000E));
            $SeriesDescription = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x103E));
            $SeriesNumber = $this->cleanDICOMTagValue($dicom->value(0x0020, 0x0011));
            $Modality = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0060));
            $SliceThickness = $this->cleanDICOMTagValue($dicom->value(0x0018, 0x0050));
            $Columns = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0011));
            $Rows = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0010));
            $InstanceNumber = $this->cleanDICOMTagValue($dicom->value(0x0020, 0x0013));
            $SOPClassUID = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0016));
            $PhotometricInterpretation = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0004));
            $BitsAllocated = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0100));
            $BitsStored = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0101));
            $PixelRepresentation = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0103));
            $SamplesPerPixel = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0002));
            $PixelSpacing = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0030));
            $HighBit = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x0102));
            $ImageOrientationPatient = $this->cleanDICOMTagValue($dicom->value(0x0020, 0x0037));
            $ImagePositionPatient = $this->cleanDICOMTagValue($dicom->value(0x0020, 0x0032));
            $FrameOfReferenceUID = $this->cleanDICOMTagValue($dicom->value(0x0020, 0x0052));
            $ImageType = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0008));
            $Modality = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0060));
            $SOPInstanceUID = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0018));
            $WindowCenter = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x1050));
            $WindowWidth = $this->cleanDICOMTagValue($dicom->value(0x0028, 0x1051));
            $SeriesDate = $this->cleanDICOMTagValue($dicom->value(0x0008, 0x0021));

            // STUDY
            $studyIndex = $this->arrayFindIndex($dicomJson['studies'], 'StudyInstanceUID', $StudyInstanceUID);
            if ($studyIndex < 0) {
                $study = array(
                    'StudyInstanceUID' => $StudyInstanceUID,
                    'StudyDate' => $StudyDate,
                    'StudyTime' => $StudyTime,
                    'StudyDescription' => $StudyDescription,
                    'PatientName' => $PatientName,
                    'PatientID' => $PatientID,
                    'PatientBirthDate' => $PatientBirthDate,
                    'AccessionNumber' => $AccessionNumber,
                    'PatientAge' => $PatientAge,
                    'PatientSex' => $PatientSex,
                    'NumInstances' => $NumInstances,
                    'Modalities' => $Modalities,
                    'series' => array(),
                );
                array_push($dicomJson['studies'], $study);
                $studyIndex = count($dicomJson['studies']) - 1;
            }

            // SERIES
            $seriesIndex = $this->arrayFindIndex($dicomJson['studies'][$studyIndex]['series'], 'SeriesInstanceUID', $SeriesInstanceUID);
            if ($seriesIndex < 0) {
                $series = array(
                    'SeriesInstanceUID' => $SeriesInstanceUID,
                    'SeriesDescription' => $SeriesDescription,
                    'SeriesNumber' => $SeriesNumber,
                    'Modality' => $Modality,
                    'SliceThickness' => $SliceThickness,
                    'instances' => array(),
                );
                array_push($dicomJson['studies'][$studyIndex]['series'], $series);
                $seriesIndex++;
            }

            // INSTANCE
            $instance = array(
                'metadata' => array(
                    'selected' => $fileFullPath == $selectedFileFullPath,
                    'Columns' => $Columns,
                    'Rows' => $Rows,
                    'InstanceNumber' => $InstanceNumber,
                    'SOPClassUID' => $SOPClassUID,
                    'PhotometricInterpretation' => $PhotometricInterpretation,
                    'BitsAllocated' => $BitsAllocated,
                    'BitsStored' => $BitsStored,
                    'PixelRepresentation' => $PixelRepresentation,
                    'SamplesPerPixel' => $SamplesPerPixel,
                    'PixelSpacing' => $PixelSpacing ? array_map('trim', explode('\\', $PixelSpacing)) : $PixelSpacing,
                    'HighBit' => $HighBit,
                    'ImageOrientationPatient' => $ImageOrientationPatient ? array_map('trim', explode('\\', $ImageOrientationPatient)) : $ImageOrientationPatient,
                    'ImagePositionPatient' => $ImagePositionPatient ? array_map('trim', explode('\\', $ImagePositionPatient)) : $ImagePositionPatient,
                    'FrameOfReferenceUID' => $FrameOfReferenceUID,
                    'ImageType' => $ImageType ? array_map('trim', explode('\\', $ImageType)) : $ImageType,
                    'Modality' => $Modality,
                    'SOPInstanceUID' => $SOPInstanceUID,
                    'SeriesInstanceUID' => $SeriesInstanceUID,
                    'StudyInstanceUID' => $StudyInstanceUID,
                    'WindowCenter' => $WindowCenter ? explode('\\', $WindowCenter)[0] : $WindowCenter,
                    'WindowWidth' => $WindowWidth ? explode('\\', $WindowWidth)[0] : $WindowWidth,
                    'SeriesDate' => $SeriesDate,
                ),
                'url' => 'dicomweb:'.$fileUrl,
            );
            array_push($dicomJson['studies'][$studyIndex]['series'][$seriesIndex]['instances'], $instance);
            $dicomJson['studies'][$studyIndex]['NumInstances']++;
            if ($dicomJson['studies'][$studyIndex]['Modalities'] == '' || !in_array($Modality, explode(',', $dicomJson['studies'][$studyIndex]['Modalities']))) {
                if ($dicomJson['studies'][$studyIndex]['Modalities'] == '') {
                    $dicomJson['studies'][$studyIndex]['Modalities'] = $Modality;
                } else {
                    $dicomJson['studies'][$studyIndex]['Modalities'] .= ','.$Modality;
                }
            }
        }

        return $dicomJson;
    }

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function showDICOMViewer(): TemplateResponse {
		$params = [
			'urlGenerator' => $this->urlGenerator,
			'ignoreFrontController' => $this->config->getSystemValueBool('htaccess.IgnoreFrontController', false) || getenv('front_controller_active') === 'true'
		];

		$response = new TemplateResponse(Application::APP_ID, 'viewer', $params, 'blank');
		$response->setContentSecurityPolicy($this->getContentSecurityPolicy());
		$response->addHeader('Cross-Origin-Opener-Policy', 'same-origin');
		$response->addHeader('Cross-Origin-Embedder-Policy', 'require-corp');

		return $response;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function showDICOMViewerModeViewer(): TemplateResponse {
		$params = [
			'urlGenerator' => $this->urlGenerator,
			'ignoreFrontController' => $this->config->getSystemValueBool('htaccess.IgnoreFrontController', false) || getenv('front_controller_active') === 'true'
		];

		$response = new TemplateResponse(Application::APP_ID, 'viewer', $params, 'blank');
		$response->setContentSecurityPolicy($this->getContentSecurityPolicy());
		$response->addHeader('Cross-Origin-Opener-Policy', 'same-origin');
		$response->addHeader('Cross-Origin-Embedder-Policy', 'require-corp');

		return $response;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function showDICOMViewerModeJson(): TemplateResponse {
		$params = [
			'urlGenerator' => $this->urlGenerator,
			'ignoreFrontController' => $this->config->getSystemValueBool('htaccess.IgnoreFrontController', false) || getenv('front_controller_active') === 'true'
		];

		$response = new TemplateResponse(Application::APP_ID, 'viewer', $params, 'blank');
		$response->setContentSecurityPolicy($this->getContentSecurityPolicy());
		$response->addHeader('Cross-Origin-Opener-Policy', 'same-origin');
		$response->addHeader('Cross-Origin-Embedder-Policy', 'require-corp');

		return $response;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $filepath
	 * @return StreamResponse
	 */
	public function getDICOMViewerFile(string $filepath): StreamResponse {
	    $filename = str_replace('viewer/', '', $filepath);
	    $fullFilePath = $this->publicViewerFolderPath . '/' . $filename;
	    $fpHandle = null;

        // Replace nextcloud base path with the actual path in this environment
        // TODO: Move this to replace __NEXTCLOUD_BASE_PATH__ on app install and htaccess update only
	    if (str_ends_with($fullFilePath, '.html') || str_ends_with($fullFilePath, '.js')) {
	    	$fpHandle = fopen('php://temp/maxmemory:'.$filename.'.customized', 'r+');
	        fputs($fpHandle, str_replace('__NEXTCLOUD_BASE_PATH__', $this->getNextcloudBasePath(), file_get_contents($fullFilePath)));
	        rewind($fpHandle);
	    } else {
	        $fpHandle = fopen($fullFilePath, 'rb');
	    }

        $response = new StreamResponse($fpHandle);
	    $fileMimeType = mime_content_type($fullFilePath);
        $response->addHeader('Content-Disposition', 'attachment; filename="' . rawurldecode($filename) . '"');
        $response->addHeader('Content-Type', $this->mimeTypeDetector->detectPath($fullFilePath));
		$response->setContentSecurityPolicy($this->getContentSecurityPolicy());
		$response->addHeader('Cross-Origin-Opener-Policy', 'same-origin');
		$response->addHeader('Cross-Origin-Embedder-Policy', 'require-corp');

		return $response;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $assetpath
	 * @return StreamResponse
	 */
	public function getDICOMViewerAsset(string $assetpath): StreamResponse {
        $filename = str_replace('viewer/', '', $assetpath);
	    $fullFilePath = $this->publicViewerAssetsFolderPath . '/' . $filename;

        $response = new StreamResponse(fopen($fullFilePath, 'rb'));
        $response->addHeader('Content-Disposition', 'attachment; filename="' . rawurldecode($filename) . '"');
        $response->addHeader('Content-Type', $this->mimeTypeDetector->detectPath($fullFilePath));
		$response->setContentSecurityPolicy($this->getContentSecurityPolicy());
		$response->addHeader('Cross-Origin-Opener-Policy', 'same-origin');
		$response->addHeader('Cross-Origin-Embedder-Policy', 'require-corp');

		return $response;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param string $assetpath
	 * @return StreamResponse
	 */
	public function getDICOMViewerAssetSub(string $assetpath): StreamResponse {
        $filename = str_replace('viewer/', '', $assetpath);
        $fullFilePath = $this->publicViewerAssetsFolderPath . '/' . $filename;

        $response = new StreamResponse(fopen($fullFilePath, 'rb'));
        $response->addHeader('Content-Disposition', 'attachment; filename="' . rawurldecode($filename) . '"');
        $response->addHeader('Content-Type', $this->mimeTypeDetector->detectPath($fullFilePath));
        $response->setContentSecurityPolicy($this->getContentSecurityPolicy());
        $response->addHeader('Cross-Origin-Opener-Policy', 'same-origin');
        $response->addHeader('Cross-Origin-Embedder-Policy', 'require-corp');

        return $response;
    }

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return JSONResponse
	 */
	public function getDICOMJson(): JSONResponse {
	    $fileQueryParams = explode('|', $this->getQueryParam('file'));
	    $userId = $fileQueryParams[0];
	    $fileid = $fileQueryParams[1];
	    $isOpenNoExtension = count($fileQueryParams) > 2 && $fileQueryParams[2] == 1;

        // Find the file path located in the filesystem
	    $userFolder = $this->rootFolder->getUserFolder($userId);
        $file = $userFolder->getById((int)$fileid)[0];
	    $selectedFileFullPath = $file->getType() == 'dir' ? null : $this->dataFolder.$file->getPath();

	    // Find the file path by current user (e.g. file path in the shared folder)
        $currentUser = $this->userSession->getUser();
        $currentUserId = $currentUser->getUID();
        $currentUserFolder = $this->rootFolder->getUserFolder($currentUserId);
        $currentUserPathToFile = implode('', explode($currentUserFolder->getPath(), $currentUserFolder->getById((int)$fileid)[0]->getParent()->getPath(), 2));

	    // Get all DICOM files in the folder and sub folders
	    $parentPathToRemove = '/'.$userId.'/files';
	    $dicomFolder = $file->getType() == 'dir' ? $file : $file->getParent();
	    $dicomFilePaths = $this->getAllDICOMFilesInFolder($parentPathToRemove, $dicomFolder, $isOpenNoExtension);

        $dicomParentFullPath = $this->dataFolder.'/'.$userId.'/files';
        $downloadUrlPrefix = 'remote.php/dav/files/'.$currentUserId;
	    $dicomJson = $this->generateDICOMJson($dicomFilePaths, $selectedFileFullPath, $dicomParentFullPath, $currentUserPathToFile, $downloadUrlPrefix, false, false);
        $response = new JSONResponse($dicomJson);
		return $response;
	}

	/**
	 * @PublicPage
     * @NoCSRFRequired
     *
     * @return JSONResponse
     */
    public function getPublicDICOMJson(): JSONResponse {
        $fileQueryParams = explode('|', $this->getQueryParam('file'));
        $shareToken = $fileQueryParams[0];
        $filepath = ltrim($fileQueryParams[1], '/');

        try {
            $share = $this->shareManager->getShareByToken($shareToken);
            if ($share == null) {
                $response = new JSONResponse(array());
                return $response;
            }

            $selectedFileFullPath = '';
            $dicomParentFullPath = '';
            $dicomFilePaths = array();
            $singlePublicFileDownload = false;

            $shareNode = $share->getNode();
            if ($shareNode->getType() == 'dir') {
                $selectedFileFullPath = $this->dataFolder.$shareNode->get($filepath)->getPath();
                $dicomParentFullPath = $this->dataFolder.$shareNode->getPath();

                // Get all DICOM files in the share folder and sub folders
                $parentPathToRemove = $shareNode->getPath();
                $dicomFilePaths = $this->getAllDICOMFilesInFolder($parentPathToRemove, $shareNode, false);
            } else {
                $selectedFileFullPath = null;
                $dicomParentFullPath = $this->dataFolder;
                $singlePublicFileDownload = true;

                // Get only shared DICOM file
                array_push($dicomFilePaths, $shareNode->getPath());
            }

            $downloadUrlPrefix = $this->getNextcloudBasePath().'/s/'.$shareToken.'/download';
            $dicomJson = $this->generateDICOMJson($dicomFilePaths, $selectedFileFullPath, $dicomParentFullPath, null, $downloadUrlPrefix, true, $singlePublicFileDownload);

            $response = new JSONResponse($dicomJson);
            return $response;
        } catch (Exception $exception) {
            $response = new JSONResponse(array());
            return $response;
        }
    }
}
