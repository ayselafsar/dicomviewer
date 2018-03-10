<?php

namespace OCA\DICOMViewer\AppInfo;

use OCP\Util;

Util::addStyle('dicomviewer', 'viewer');
Util::addStyle('dicomviewer', 'sidebar');
Util::addStyle('dicomviewer', 'viewerDialog');
Util::addStyle('dicomviewer', 'captureImageDialog');
Util::addStyle('dicomviewer', 'external/font-awesome/font-awesome.min');
Util::addScript('dicomviewer', 'app.bundle');

// Register Mime Type: dicom
$mimeTypeLoader = \OC::$server->getMimeTypeLoader();
$mimeId = $mimeTypeLoader->getId('application/dicom');
$mimeTypeLoader->updateFilecache('dcm', $mimeId);

// Add security policy
$server_name = $_SERVER['SERVER_NAME'];

$cspManager = \OC::$server->getContentSecurityPolicyManager();
$csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
$csp->addAllowedChildSrcDomain("'self' ".$server_name);
$csp->addAllowedScriptDomain("'self' ".$server_name);
$csp->addAllowedImageDomain('*');
$csp->addAllowedFontDomain('self');
$csp->allowEvalScript(false);
$cspManager->addDefaultPolicy($csp);
