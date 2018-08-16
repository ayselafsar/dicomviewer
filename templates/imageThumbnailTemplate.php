<script id="imageThumbnailTemplate" type="text/x-handlebars-template">
    <div class="thumbnailEntry">
        <div class="imageThumbnail {{#if (and activeStudy (eq @index 0))}}active{{/if}}">
            <div id="imageThumbnailCanvas{{stack.seriesNumber}}_{{stack.displaySetInstanceUid}}" class="imageThumbnailCanvas"></div>
        </div>
        <div class="seriesDetails">
            <div class="seriesDescription">{{stack.seriesDescription}}</div>
            <div class="seriesInformation">
                <div class="item item-series clearfix">
                    <div class="icon">S:</div>
                    <div class="value">{{stack.seriesNumber}}</div>
                </div>
                <div class="item item-frames clearfix">
                    <div class="icon"><div></div></div>
                    <div class="value">{{stack.numImageFrames}}</div>
                </div>
            </div>
        </div>
    </div>
    {{renderThumbnail}}
</script>
