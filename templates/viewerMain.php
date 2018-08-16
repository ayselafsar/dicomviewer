<div id="viewerMain">
    <div class="toolbar">
        <?php print_unescaped($this->inc('toolbarTemplate')); ?>
    </div>
    <div class="content">
        <div class="sidebarMenu sidebar-open">
            <div class="studyBrowser">
                <?php print_unescaped($this->inc('studyBrowserTemplate')); ?>
            </div>
        </div>
        <div class="mainContent">
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
    <div class="loadingViewerMain">
        Loading... <span id="loadingPercentage">0</span>%
    </div>
</div>