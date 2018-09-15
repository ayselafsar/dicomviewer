<?php
// Check if series panel is open
$seriesPanelOpen = $_['seriesPanelOpen'];
?>

<script id="toolbarTemplate" type="text/x-handlebars-template">
    <div class="toggleSeriesPanel">
        <div id="toggleSeriesPanelButton" tabindex="1" class="toolbarSectionButton roundedButton toggleSeriesPanelButton <?php if($seriesPanelOpen === 'true') echo 'active'; ?> {{classes}}" title="<?php print_unescaped($this->l10n->t('Toggle Series Panel')); ?>">
            <div class="svgContainer">
                <div class="svgContent series-panel"></div>
            </div>
            <div class="buttonLabel">
                <span><?php print_unescaped($this->l10n->t('Series')); ?></span>
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

        <div class="moreTools js-more-tools">
            <div class="toolbarSectionButton notTool">
                <div class="svgContainer">
                    <i class="fa fa-chevron-down"></i>
                </div>
                <div class="buttonLabel">
                    <span><?php print_unescaped($this->l10n->t('More')); ?></span>
                </div>
            </div>
        </div>
    </div>

    <a class="button-close js-close-viewer" title="<?php print_unescaped($this->l10n->t('Close Viewer')); ?>"><i class="fa fa-times fa-lg"></i></a>
</script>

<div id="toolbar"></div>
