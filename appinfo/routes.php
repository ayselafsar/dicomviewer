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
]];
