<?php

namespace OCA\DICOMViewer\AppInfo;

return ['routes' => [
    ['name' => 'display#index', 'url' => '/', 'verb' => 'GET'],
    ['name' => 'display#sidebar', 'url' => '/dicomSidebar', 'verb' => 'GET'],
    ['name' => 'display#captureImageDialog', 'url' => '/captureImage', 'verb' => 'GET'],
]];