<script id="toolbarTemplate" type="text/x-handlebars-template">
    <div class="toggleSeriesPanel">
        <div id="toggleSeriesPanelButton" tabindex="1" class="toolbarSectionButton roundedButton toggleSeriesPanelButton {{#if hasMultipleInstances}}active{{/if}} {{classes}}" title="Toggle Series Panel">
            <div class="svgContainer">
                <div class="svgContent series-panel"></div>
            </div>
            <div class="buttonLabel">
                <span>Series</span>
            </div>
        </div>
    </div>

    <div class="toolbarSectionTools">
        {{#each (toolbarButtons)}}
            <div id="{{id}}" tabindex="1" class="toolbarSectionButton {{#if toolActive}}active{{/if}} {{classes}}" title="{{title}}">
                <div class="svgContainer">
                    {{#if svgClasses}}
                        <div class="{{svgClasses}}"></div>
                    {{else}}
                        <i class="{{iconClasses}}"></i>
                    {{/if}}
                </div>
                <div class="buttonLabel">
                    <span>{{title}}</span>
                </div>
            </div>
        {{/each}}
    </div>

    <a class="button-close js-close-viewer" title="Close Viewer"><i class="fa fa-times fa-lg"></i></a>
</script>

<div id="toolbar"></div>