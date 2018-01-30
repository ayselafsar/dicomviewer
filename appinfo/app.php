<?php

namespace OCA\DICOMViewer\AppInfo;

use OCP\Util;

Util::addStyle('dicomviewer', 'style');
Util::addscript('dicomviewer', 'viewer/dicomViewerPlugin');
Util::addscript('dicomviewer', 'sidebar/sidebarPreview');

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
