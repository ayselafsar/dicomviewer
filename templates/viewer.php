<?php
$urlGenerator = $_['urlGenerator'];
$ignoreFrontController = $_['ignoreFrontController'];
$nextcloudBasePath = $urlGenerator->getWebroot();

if (!$ignoreFrontController) {
    $nextcloudBasePath .= '/index.php';
}

$publicViewerIndexPath = '';
$appsPaths = \OC::$server->getSystemConfig()->getValue('apps_paths');
foreach($appsPaths as $appsPath) {
    $viewerIndexFile = $appsPath['path'] . '/dicomviewer/js/public/viewer/index.html';
    if (file_exists($viewerIndexFile)) {
        $publicViewerIndexPath = $viewerIndexFile;
        break;
    }
}

print str_replace('__NEXTCLOUD_BASE_PATH__', $nextcloudBasePath, file_get_contents($publicViewerIndexPath));
?>
