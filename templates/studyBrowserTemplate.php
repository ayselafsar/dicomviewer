<script id="studyBrowserTemplate" type="text/x-handlebars-template">
    <div class="studyBrowser">
        <div class="scrollableStudyThumbnails">
            {{#if (eq this.studies.length 1)}}
                {{#each studies as |study|}}
                    {{#each (studyThumbnails study) as |thumbnail|}}
                        {{> imageThumbnail activeStudy=(eq @index 0)}}
                    {{/each}}
                {{/each}}
            {{else}}
                <div class="accordion" id="studyBrowserAccordion">
                    {{#each studies as |study|}}
                        <div class="card">
                            <div class="card-header" id="heading{{@index}}">
                                <div data-toggle="collapse" data-target="#collapse{{@index}}"
                                     aria-expanded="true" aria-controls="collapse{{@index}}">
                                    <div class="study-item-box">
                                        <div class="study-modality">
                                            <div class="study-modality-text">
                                                {{modalitiesList study}}
                                            </div>
                                        </div>
                                        <div class="study-text">
                                            <div class="study-date">{{formatDA study.studyDate}}</div>
                                            <div class="study-description">{{study.studyDescription}}</div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div id="collapse{{@index}}" class="collapse show" aria-labelledby="heading{{@index}}">
                                <div class="card-body">
                                    {{#if (eq @index 0)}}
                                        {{#each (studyThumbnails study) as |thumbnail|}}
                                            {{> imageThumbnail activeStudy=(eq @index 0)}}
                                        {{/each}}
                                    {{else}}
                                        {{#each (studyThumbnails study) as |thumbnail|}}
                                            {{> imageThumbnail}}
                                        {{/each}}
                                    {{/if}}
                                </div>
                            </div>
                        </div>
                    {{/each}}
                </div>
            {{/if}}
        </div>
    </div>
</script>

<div id="studyBrowser"></div>

<?php print_unescaped($this->inc('imageThumbnailTemplate')); ?>