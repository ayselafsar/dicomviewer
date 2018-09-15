<?php
    // Check if series panel is open
    $seriesPanelOpen = $_['seriesPanelOpen'];
?>
<div id="viewerMain" class="app-dicomviewer">
    <!-- Toolbar -->
    <div class="toolbar">
        <?php print_unescaped($this->inc('toolbarTemplate')); ?>
    </div>

    <!-- Viewport Content -->
    <div class="content">
        <div class="sidebarMenu <?php if($seriesPanelOpen === 'true') { echo 'sidebar-open'; } ?>">
            <div class="studyBrowser">
                <?php print_unescaped($this->inc('studyBrowserTemplate')); ?>
            </div>
        </div>
        <div class="mainContent <?php if($seriesPanelOpen === 'false') { echo 'content-full'; } ?>">
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
        <?php print_unescaped($this->l10n->t('Loading...')); ?> <span id="loadingPercentage">0</span>%
    </div>
</div>
