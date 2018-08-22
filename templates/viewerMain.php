<?php
    // Check if a single DICOM file is opened
    $isSingleDICOMFile = $_['isSingleDICOMFile'];
?>

<div id="viewerMain" class="app-dicomviewer">
    <!-- Toolbar -->
    <div class="toolbar">
        <?php print_unescaped($this->inc('toolbarTemplate')); ?>
    </div>

    <!-- Viewport Content -->
    <div class="content">
        <div class="sidebarMenu <?php if(!$isSingleDICOMFile) { echo 'sidebar-open'; } ?>">
            <div class="studyBrowser">
                <?php print_unescaped($this->inc('studyBrowserTemplate')); ?>
            </div>
        </div>
        <div class="mainContent <?php if($isSingleDICOMFile) { echo 'content-full'; } ?>">
            <div id="layoutManagerTarget">
                <div class="viewportContainer">
                    <div class="removable">
                        <div class="imageViewerViewport"
                             oncontextmenu="return false;"
                             unselectable="on"
                             onselectstart="return false;"
                             tabindex="0">
                        </div>
                        <?php print_unescaped($this->inc('viewportOverlayTemplate')); ?>
                        <?php print_unescaped($this->inc('imageControlsTemplate')); ?>
                        <?php print_unescaped($this->inc('viewportOrientationMarkersTemplate')); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading View which shows the percentage of the loaded files -->
    <div class="loadingViewerMain">
        Loading... <span id="loadingPercentage">0</span>%
    </div>
</div>