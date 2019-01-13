import $ from 'jquery';
import { cornerstone } from '../../lib/cornerstonejs';
import getDICOMAttributes from '../../lib/dicom/getDICOMAttributes';
import generateFullUrl from '../../lib/generateFullUrl';

function addRow(attribute) {
    let { tagName } = attribute;
    let { tagValue } = attribute;

    if (!tagName) {
        tagName = 'Unknown Attribute';
    }

    if (!tagValue) {
        tagValue = '';
    }

    const tableRef = $('.dicom-elements-table > tbody')[0];
    const rowsLength = tableRef.rows.length;
    const newRow = tableRef.insertRow(rowsLength);

    const cellAttribute = newRow.insertCell(0);
    const cellValue = newRow.insertCell(1);

    cellAttribute.innerHTML = `<p class="tag-title">${tagName}</p><p class="tag-value">${tagValue}</p>`;
    cellValue.innerHTML = attribute.text;

    if (!attribute.tagName || !attribute.tagValue) {
        newRow.classList.add('unknown-attribute');
    }

    if (attribute.isFileMetaInformation) {
        newRow.classList.add('file-meta-information');
    }
}

function searchAttributesHandler() {
    // Search DICOM Attribute
    $('.dicom-attributes-search').keyup((e) => {
        const input = e.currentTarget;
        const $table = $('.dicom-elements-table');
        const filter = input.value.toUpperCase();
        const rows = $table.find('tr');
        rows.each((index, row) => {
            const td = $(row).find('td:first')[0];

            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    });
}

function dumpDataSet(dataSet) {
    try {
        // Here we call dumpDataSet to recursively iterate through the DataSet
        // and create a table of content
        const attributes = getDICOMAttributes(dataSet);
        attributes.forEach((attribute) => {
            addRow(attribute);
        });

        // Enable to search attributes
        searchAttributesHandler();

        $('.sidebar-content-loading').css({
            display: 'none',
        });
        $('.sidebar-table-container').css({
            display: 'block',
        });

        if (dataSet.warnings.length > 0) {
            console.warn(' Warnings encountered while parsing file');
        } else {
            const pixelData = dataSet.elements.x7fe00010;
            if (!pixelData) {
                console.log('No pixel data found');
            }
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Initialize sidebar component
 * @param fileDownloadUrl
 */
export default function (fileDownloadUrl) {
    const imageId = `wadouri:${generateFullUrl(fileDownloadUrl)}`;
    cornerstone.loadAndCacheImage(imageId).then((image) => {
        // Display sidebar thumbnail
        const $element = $('.sidebar-thumbnail');
        const element = $element.get(0);
        if (!element) {
            return;
        }

        $('.sidebar-thumbnail-loading').css({
            display: 'none'
        });

        cornerstone.enable(element);
        cornerstone.displayImage(element, image);

        dumpDataSet(image.data);
    });
}
