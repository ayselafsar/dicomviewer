<div class="sidebar-container">
    <div class="sidebar-thumbnail-container">
        <div class="sidebar-thumbnail">
            <div class="sidebar-thumbnail-loading">
                <i class="fa fa-spin fa-spinner fa-lg"></i>
            </div>
        </div>
    </div>
    <h5><strong><?php print_unescaped($this->l10n->t('DICOM Attributes')); ?></strong></h5>
    <div class="attributes-search-container">
        <input type="text" class="form-control dicom-attributes-search" placeholder="<?php print_unescaped($this->l10n->t('Search for attributes..')); ?>" title="<?php print_unescaped($this->l10n->t('Type in an attribute')); ?>">
    </div>

    <div class="sidebar-content-loading">
        <i class="fa fa-spinner fa-spin"></i>
        <span><?php print_unescaped($this->l10n->t('Parsing DICOM file...')); ?></span>
    </div>

    <div class="sidebar-table-container">
        <table class="dicom-elements-table">
            <thead>
            <tr>
                <th><?php print_unescaped($this->l10n->t('Attribute')); ?></th>
                <th><?php print_unescaped($this->l10n->t('Value')); ?></th>
            </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>
