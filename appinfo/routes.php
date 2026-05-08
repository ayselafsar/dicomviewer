<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\AppInfo;

return ['routes' => [
	['name' => 'display#showDICOMViewer', 'url' => '/ncviewer', 'verb' => 'GET'],
	['name' => 'display#showDICOMViewerModeViewer', 'url' => '/ncviewer/viewer', 'verb' => 'GET'],
	['name' => 'display#showDICOMViewerModeJson', 'url' => '/ncviewer/viewer/dicomjson', 'verb' => 'GET'],
	['name' => 'display#getDICOMViewerFile', 'url' => '/ncviewer/{filepath}', 'verb' => 'GET'],
	['name' => 'display#getDICOMViewerAsset', 'url' => '/ncviewer/assets/{assetpath}', 'verb' => 'GET'],
	['name' => 'display#getDICOMViewerAssetImages', 'url' => '/ncviewer/assets/images/{assetpath}', 'verb' => 'GET'],
	['name' => 'display#getDICOMViewerAssetSub', 'url' => '/ncviewer/viewer/assets/{assetpath}', 'verb' => 'GET'],
	['name' => 'display#getDICOMViewerAssetSubImages', 'url' => '/ncviewer/viewer/assets/images/{assetpath}', 'verb' => 'GET'],
	['name' => 'display#getDICOMJson', 'url' => '/dicomjson', 'verb' => 'GET'],
	['name' => 'display#getPublicDICOMJson', 'url' => '/publicdicomjson', 'verb' => 'GET'],
	['name' => 'display#verifySharePassword', 'url' => '/verifySharePassword', 'verb' => 'POST'],

	// Public share viewer with password-auth support (AuthPublicShareController flow)
	// Route names must match the PHP class short name (PublicDisplay from PublicDisplayController)
	// so that AuthPublicShareController::getRoute() can resolve them correctly.
	['name' => 'PublicDisplay#showShare', 'url' => '/s/{token}', 'verb' => 'GET'],
	['name' => 'PublicDisplay#showAuthenticate', 'url' => '/s/{token}/authenticate', 'verb' => 'GET'],
	['name' => 'PublicDisplay#authenticate', 'url' => '/s/{token}/authenticate', 'verb' => 'POST'],
]];
