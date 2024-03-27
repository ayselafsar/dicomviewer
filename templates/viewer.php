<?php
$urlGenerator = $_['urlGenerator'];
$ignoreFrontController = $_['ignoreFrontController'];
$dicomViewerAppPath = $_['dicomViewerAppPath'];
$nextcloudBasePath = $urlGenerator->getWebroot();

if (!$ignoreFrontController) {
    $nextcloudBasePath .= '/index.php';
}

$publicViewerIndexPath = $dicomViewerAppPath . '/js/public/viewer/index.html';

print str_replace('__NEXTCLOUD_BASE_PATH__', $nextcloudBasePath, file_get_contents($publicViewerIndexPath));
?>
