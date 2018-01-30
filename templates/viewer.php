<?php
  /** @var array $_ */
  /** @var OCP\IURLGenerator $urlGenerator */
  $urlGenerator = $_['urlGenerator'];
?>

<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Dicom Viewer</title>

    <!-- Load styles -->
    <link rel="stylesheet" type="text/css" href="<?php p($urlGenerator->linkTo('dicomviewer', 'css/external/font-awesome/font-awesome.min.css')) ?>"/>
    <link rel="stylesheet" type="text/css" href="<?php p($urlGenerator->linkTo('dicomviewer', 'css/external/bootstrap.min.css')) ?>"/>
    <link rel="stylesheet" type="text/css" href="<?php p($urlGenerator->linkTo('dicomviewer', 'css/external/cornerstone.min.css')) ?>"/>
    <link rel="stylesheet" type="text/css" href="<?php p($urlGenerator->linkTo('dicomviewer', 'css/viewer.css')) ?>"/>

    <!-- Cornerstone libraries -->
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstone/cornerstone.min.js')) ?>"></script>
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstone/cornerstoneMath.min.js')) ?>"></script>
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstone/cornerstoneTools.min.js')) ?>"></script>

    <!-- dicomParser libraries -->
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstone/dicomParser.min.js')) ?>"></script>

    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstoneWADO/cornerstoneWADOImageLoader.js')) ?>"></script>

    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/moment/moment.js')) ?>"></script>

    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/classes/MetadataProvider.js')) ?>"></script>
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/utils/formatDate.js')) ?>"></script>

    <!-- Custom js -->
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/viewer/viewerTools.js')) ?>"></script>
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/viewer/viewer.js')) ?>"></script>
</head>

<body>
    <div class="container">
        <div class="row toolbar">
            <div class="col-xs-11 col-sm-8 col-sm-offset-2 text-center">
                <!-- Levels -->
                <div id="wwwc" class="tool-button-container active">
                    <div class="tool-button"><i class="fa fa-sun-o fa-lg"></i></div>
                    <div class="tool-label">Levels</div>
                </div>

                <!-- Zoom -->
                <div id="zoom" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-search fa-lg"></i></div>
                    <div class="tool-label">Zoom</div>
                </div>

                <!-- Pan -->
                <div id="pan" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-arrows fa-lg"></i></div>
                    <div class="tool-label">Pan</div>
                </div>

                <!-- Invert -->
                <div id="invert" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-adjust fa-lg"></i></div>
                    <div class="tool-label">Invert</div>
                </div>

                <!-- Reset -->
                <div id="reset" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-undo fa-lg"></i></div>
                    <div class="tool-label">Reset</div>
                </div>

                <!-- Length -->
                <div id="length" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-arrows-v fa-lg"></i></div>
                    <div class="tool-label">Length</div>
                </div>

                <!-- Probe -->
                <div id="probe" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-dot-circle-o fa-lg"></i></div>
                    <div class="tool-label">Probe</div>
                </div>

                <!-- Elliptical ROI -->
                <div id="ellipticalRoi" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-circle-o fa-lg"></i></div>
                    <div class="tool-label">Elliptical ROI</div>
                </div>

                <!-- Rectangle ROI -->
                <div id="rectangleRoi" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-square-o fa-lg"></i></div>
                    <div class="tool-label">Rectangle ROI</div>
                </div>

                <!-- Angle -->
                <div id="angle" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-angle-left fa-lg"></i></div>
                    <div class="tool-label">Angle</div>
                </div>

                <!-- Clear -->
                <div id="clear" class="tool-button-container">
                    <div class="tool-button"><i class="fa fa-trash fa-lg"></i></div>
                    <div class="tool-label">Clear</div>
                </div>
            </div>
            <div class="col-xs-1 col-sm-2 text-right close-viewer">
                <a href="#" class="btn button-close js-close-viewer" title="Close Viewer">
                    <i class="fa fa-times fa-lg"></i>
                </a>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 dicom-image-wrap">
                <div class="dicom-image-container disable-selection noIbar"
                     unselectable="on">

                    <div id="dicomImage"></div>

                    <!-- Overlays -->
                    <div class="patient-information">
                        <div id="patientName"></div>
                        <div id="patientId"></div>
                    </div>

                    <div class="study-information">
                        <div id="studyDescription"></div>
                        <div id="studyDate"></div>
                    </div>

                    <div class="load-progress-content"></div>

                    <div class="bottom-right">
                        <div id="zoomLevel"></div>
                        <div id="compression"></div>
                        <div id="windowLevel"></div>
                    </div>

                    <div class="bottom-left">
                        <div id="seriesNumber"></div>
                        <div id="instanceNumber"></div>
                        <div id="dimensions"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>