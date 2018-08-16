<script id="viewportOverlayTemplate" type="text/x-handlebars-template">
    <div class="imageViewerViewportOverlay">
        <div class="topleft dicomTag">
            <div id="patientName">{{formatPN this.patientName}}</div>
            <div id="patientId">{{patientId}}</div>
        </div>

        <div class="topright dicomTag">
            <div id="studyDescription">{{studyDescription}}</div>
            <div id="studyDate">{{formatDA this.studyDate}} {{formatTM this.studyTime}}</div>
        </div>

        <div class="load-progress-content"></div>

        <div class="bottomleft dicomTag">
            <div id="seriesNumber">Ser: {{seriesNumber}}</div>
            <div id="instanceNumber">Img: {{instanceNumber}} {{#if numImages}}({{imageIndex}}/{{numImages}}){{/if}}</div>
            <div id="dimensions">{{dimensions}}</div>
            <div id="seriesDescription">{{seriesDescription}}</div>
        </div>

        <div class="bottomright dicomTag">
            <div id="zoomLevel">{{zoomLevel}}</div>
            <div id="compression">{{compression}}</div>
            <div id="windowLevel">{{windowLevel}}</div>
        </div>
    </div>
</script>

<div id="viewportOverlay"></div>
