<div class="modal fade captureImageDialog" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Capture High Quality Image</h3>
            <button type="button" class="close btn-close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
        <div class="modal-body">
            <div class="full-width">
                <h3>Please specify the dimensions, and desired type for the output image.</h3>
            </div>
            <div class="form-content card-round">
                <div class="form-column">
                    <table class="capture-settings">
                        <tr>
                            <td>
                                Width (px)
                            </td>
                            <td>
                                <input type="number" id="viewport-preview-width" class="form-control form-control-fixed js-preview-size" data-size="width" value="512" min="1" max="16384">
                            </td>
                            <td rowspan="2">
                                <button id="keepAspectRatio" data-keep-ratio="true">
                                    <i class="fa fa-link"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>Height (px)</td>
                            <td>
                                <input type="number" id="viewport-preview-height" class="form-control form-control-fixed js-preview-size" data-size="height" value="512" min="1" max="16384">
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="form-column">
                    <table class="capture-settings">
                        <tr>
                            <td>File Name</td>
                            <td>
                                <input type="text" id="viewport-preview-name" class="form-control" value="image">
                            </td>
                        </tr>
                        <tr>
                            <td>File Type</td>
                            <td>
                                <select id="viewport-image-type" class="form-control">
                                    <option value="png" selected="selected">PNG</option>
                                    <option value="jpeg">JPEG</option>
                                </select>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="form-column">
                    <table class="capture-settings">
                        <tr>
                            <td colspan="2">
                                <div class="full-width show-annotations-container">
                                    <input type="checkbox" id="showAnnotations" class="form-control-checkbox" name="showAnnotations" checked value="show">
                                    <label class="form-label-checkbox">Show Annotations</label>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Image Quality (%)</td>
                            <td>
                                <input type="number" id="viewport-preview-quality" class="form-control form-control-fixed" data-size="height" value="100" min="1" max="100">
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="viewport-element-hidden"></div>
            <div class="viewport-preview-wrap">
                <div class="card-round">
                    <h4>Image Preview</h4>
                    <img class="viewport-preview"/>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            <button type="button" id="downloadImage" class="btn btn-primary">Download</button>
        </div>
    </div>
  </div>
</div>