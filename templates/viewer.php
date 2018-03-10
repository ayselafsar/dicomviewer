<div id="viewer">
    <div class="toolbarSection">
        <a class="button-close js-close-viewer" title="Close Viewer"><i class="fa fa-times fa-lg"></i></a>
    </div>
    <div class="viewerSection">
        <div class="viewerMain">
            <div class="imageViewerViewport"></div>

            <!-- Overlay -->
            <div class="imageViewerViewportOverlay">
                <div class="topleft dicomTag">
                    <div id="patientName"></div>
                    <div id="patientId"></div>
                </div>

                <div class="topright dicomTag">
                    <div id="studyDescription"></div>
                    <div id="studyDate"></div>
                </div>

                <div class="load-progress-content"></div>

                <div class="bottomleft dicomTag">
                    <div id="seriesNumber"></div>
                    <div id="instanceNumber"></div>
                    <div id="dimensions"></div>
                    <div id="seriesDescription"></div>
                </div>

                <div class="bottomright dicomTag">
                    <div id="zoomLevel"></div>
                    <div id="compression"></div>
                    <div id="windowLevel"></div>
                </div>
            </div>

            <div class="viewportOrientationMarkers noselect">
                <div class="topMid orientationMarker">
                </div>
                <div class="leftMid orientationMarker">
                </div>
            </div>
        </div>
    </div>
</div>
