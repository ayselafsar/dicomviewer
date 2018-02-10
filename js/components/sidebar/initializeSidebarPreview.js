import $ from 'jquery';
import { dicomParser } from '../../lib/cornerstonejs';
import getDICOMAttributes from '../../lib/dicom/getDICOMAttributes';

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

function dumpByteArray(byteArray) {
    // Invoke the parseDicom function and get back a DataSet object with the contents
    let dataSet;

    try {
        dataSet = dicomParser.parseDicom(byteArray);
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
 *
 * @param $iframeElement
 * @param baseUrl
 * @param downloadUrl
 * @returns {boolean}
 */
export default function (baseUrl, downloadUrl) {
    const fileUrl = baseUrl + downloadUrl;
    const oReq = new XMLHttpRequest();
    try {
        oReq.open('get', fileUrl, true);
    } catch (err) {
        console.error(err);
        return false;
    }

    oReq.responseType = 'arraybuffer';
    oReq.onreadystatechange = () => {
        if (oReq.readyState === 4 && oReq.status === 200) {
            const byteArray = new Uint8Array(oReq.response);
            dumpByteArray(byteArray);
        }
    };
    oReq.send();

    return false;
}
