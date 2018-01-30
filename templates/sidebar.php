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

    <link rel="stylesheet" type="text/css" href="<?php p($urlGenerator->linkTo('dicomviewer', 'css/external/font-awesome/font-awesome.min.css')) ?>"/>
    <link rel="stylesheet" type="text/css" href="<?php p($urlGenerator->linkTo('dicomviewer', 'css/external/bootstrap.min.css')) ?>"/>
    <link rel="stylesheet" type="text/css" href="<?php p($urlGenerator->linkTo('dicomviewer', 'css/sidebar.css')) ?>"/>

    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstone/dicomParser.min.js')) ?>"></script>
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstone/dataDictionary.js')) ?>"></script>
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/external/cornerstone/uids.js')) ?>"></script>

    <!-- Custom library -->
    <script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>" src="<?php p($urlGenerator->linkTo('dicomviewer', 'js/sidebar/sidebar.js')) ?>"></script>
<body>
    <div class="container sidebar-container">
        <h5>DICOM Attributes</h5>
        <div class="row">
            <div class="col-xs-12">
                <input type="text" class="form-control dicom-attributes-search" placeholder="Search for attributes.." title="Type in an attribute">
            </div>
        </div>
        <div class="row sidebar-content-loading">
            <i class="fa fa-spinner fa-spin"></i>
            <span>Parsing DICOM file...</span>
        </div>

        <div class="row">
            <div class="col-xs-12 sidebar-table-container">
                <table class="table table-bordered table-striped dicom-elements-table">
                    <thead>
                        <tr>
                            <th>Attribute</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
</body>

</html>