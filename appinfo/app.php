<?php

namespace OCA\DICOMViewer\AppInfo;

use OCP\Util;

// Only load CSS/JS on the Files app
$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener(
	'OCA\Files::loadAdditionalScripts',
	function () {
		Util::addStyle('dicomviewer', 'viewer');
		Util::addStyle('dicomviewer', 'sidebar');
		Util::addStyle('dicomviewer', 'bootstrap_accordion');
		Util::addStyle('dicomviewer', 'viewerMain');
		Util::addStyle('dicomviewer', 'viewerMainDialog');
		Util::addStyle('dicomviewer', 'captureImageDialog');
		Util::addStyle('dicomviewer', 'external/font-awesome/font-awesome.min');
		Util::addScript('dicomviewer', 'app.bundle');
	}
);

// Get the server name
$server_name = '';
if (isset($_SERVER['SERVER_NAME'])) {
    $server_name = $_SERVER['SERVER_NAME'];
}

// Add security policy
$cspManager = \OC::$server->getContentSecurityPolicyManager();
$csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
$csp->addAllowedChildSrcDomain("'self' ".$server_name);
$csp->addAllowedScriptDomain("'self' ".$server_name);
$csp->addAllowedImageDomain('*');
$csp->addAllowedFontDomain("'self'");
$csp->allowEvalScript(false);
$cspManager->addDefaultPolicy($csp);
