const maxLength = 128;
const showPrivateElements = false;
const showP10Header = true;
const showEmptyValues = false;
const showLength = false;
const showVR = false;
const showGroupElement = false;

// helper function to see if a string only has ascii characters in it
function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function mapUid(str) {
    const uid = uids[str];
    if (uid) {
        return ` [ ${uid} ]`;
    }

    return '';
}

function isStringVr(vrValue) {
    if (vrValue === 'AT'
        || vrValue === 'FL'
        || vrValue === 'FD'
        || vrValue === 'OB'
        || vrValue === 'OF'
        || vrValue === 'OW'
        || vrValue === 'SI'
        || vrValue === 'SQ'
        || vrValue === 'SS'
        || vrValue === 'UL'
        || vrValue === 'US'
    ) {
        return false;
    }
    return true;
}

// Add a DICOM Attribute row into table
function addRow(row) {
    let { tagName } = row;
    let { tagValue } = row;

    if (!tagName) {
        tagName = 'Unknown Attribute';
    }

    if (!tagValue) {
        tagValue = '';
    }

    const tableRef = document.querySelector('.dicom-elements-table').getElementsByTagName('tbody')[0];
    const rowsLength = tableRef.rows.length;
    const newRow = tableRef.insertRow(rowsLength);

    const cellAttribute = newRow.insertCell(0);
    const cellValue = newRow.insertCell(1);

    cellAttribute.innerHTML = `<p class="tag-name">${tagName}</p><p class="tag-value">${tagValue}</p>`;
    cellValue.innerHTML = row.text;

    if (!row.tagName || !row.tagValue) {
        newRow.classList.add('unknown-attribute');
    }

    if (row.isFileMetaInformation) {
        newRow.classList.add('file-meta-information');
    }
}

// This function iterates through dataSet recursively and creates DICOM Attributes table
function dumpDataSet(dataSet) {
    function getTag(tag) {
        const group = tag.substring(1, 5);
        const element = tag.substring(5, 9);
        const tagIndex = (`(${group},${element})`).toUpperCase();
        const attr = TAG_DICT[tagIndex];

        return attr;
    }

    try {
        const properties = [];
        for (const propertyName in dataSet.elements) {
            if (propertyName) {
                properties.push(propertyName);
            }
        }
        properties.sort();

        // the dataSet.elements object contains properties for each element parsed.
        // The name of the property is based on the elements tag and looks like 'xGGGGEEEE'
        // where GGGG is the group number and EEEE is the element number
        // both with lowercase hexadecimal letters.
        // For example, the Series Description DICOM element 0008,103E would be named 'x0008103e'.
        // Here we iterate over each property (element) so we can build a string describing its
        // contents to add to the output array
        for (let index = 0; index < properties.length; index += 1) {
            const propertyName = properties[index];
            const element = dataSet.elements[propertyName];
            const tag = getTag(element.tag);

            let text = '';
            let tagName = '';
            const row = {};

            if (showP10Header === false && element.tag <= 'x0002ffff') {
                continue;
            }

            if (showPrivateElements === false && dicomParser.isPrivateTag(element.tag)) {
                continue;
            }

            if (showEmptyValues === false && element.length <= 0) {
                continue;
            }

            if (element.tag <= 'x0002ffff') {
                row.isFileMetaInformation = true;
            }

            // The output string begins with the element name (or tag if not in data dictionary),
            // length and VR (if present). VR is undefined for implicit transfer syntaxes
            if (tag === undefined) {
                row.tagValue = element.tag;
            } else {
                tagName = tag.name;
                row.tagValue = tag.tag;
                row.tagName = tagName;

                if (showGroupElement) {
                    tagName += `(${element.tag})`;
                }
            }

            let lengthText = `length=${element.length}`;

            if (element.hadUndefinedLength) {
                lengthText += ' (-1)';
            }

            if (showLength === true) {
                text += `${lengthText};`;
            }

            let vrText = '';
            if (element.vr) {
                vrText += `VR=${element.vr}`;
            }

            if (showVR) {
                text += `${vrText};`;
            }

            if (element.items || element.fragments) {
                return;
            }

            // Use VR to display the right value
            let vr;

            if (element.vr !== undefined) {
                ({ vr } = element);
            } else if (tag !== undefined) {
                ({ vr } = tag);
            }

            // if the length of the element is less than 128 we try to show it.
            // We put this check in to avoid displaying large strings which makes it harder to use.
            if (element.length < maxLength) {
                // Since the dataset might be encoded using implicit transfer syntax
                // and we aren't using a data dictionary, we need some simple logic
                // to figure out what data types these elements might be.
                // Since the dataset might also be explicit we could be switch on the
                // VR and do a better job on this, perhaps we can do that in another example

                // First we check to see if the element's length is appropriate for a UI or US VR.
                // US is an important type because it is used for the
                // image Rows and Columns so that is why those are assumed over other VR types.
                if (element.vr === undefined && tag === undefined) {
                    if (element.length === 2) {
                        text += ` ( ${dataSet.uint16(propertyName)} )`;
                    } else if (element.length === 4) {
                        text += ` (${dataSet.uint32(propertyName)})`;
                    }

                    // Next we ask the dataset to give us the element's data in string form.
                    // Most elements are strings but some aren't so we do a quick check to make sure
                    // it actually has all ascii characters so
                    // we know it is reasonable to display it.
                    const str = dataSet.string(propertyName);
                    const stringIsAscii = isASCII(str);

                    if (stringIsAscii) {
                        // the string will be undefined if the element is present but has no data
                        // (i.e. attribute is of type 2 or 3 ) so we only display the string
                        // if it has data. Note that the length of the element will be 0
                        // to indicate "no data" so we don't put anything here for the value.
                        if (str !== undefined) {
                            text += `"${str}" ${mapUid(str)}`;
                        }
                    } else if (element.length !== 2 && element.length !== 4) {
                        // If it is some other length and we have no string
                        text += '<i>binary data</i>';
                    }
                } else if (isStringVr(vr)) {
                    // Next we ask the dataset to give us the element's data in string form.
                    // Most elements are strings but some aren't so
                    // we do a quick check to make sure it actually has all ascii characters so
                    // we know it is reasonable to display it.
                    const str = dataSet.string(propertyName);
                    const stringIsAscii = isASCII(str);

                    if (stringIsAscii) {
                        // the string will be undefined if the element is present but
                        // has no data (i.e. attribute is of type 2 or 3 ) so
                        // we only display the string if it has data.
                        // Note that the length of the element will be 0 to indicate "no data"
                        // so we don't put anything here for the value in that case.
                        if (str !== undefined) {
                            text += `"${str}"${mapUid(str)}`;
                        }
                    } else if (element.length !== 2 && element.length !== 4) {
                        // If it is some other length and we have no string
                        text += '<i>binary data</i>';
                    }
                } else if (vr === 'US') {
                    text += dataSet.uint16(propertyName);

                    for (let i = 1; i < dataSet.elements[propertyName].length / 2; i += 1) {
                        text += `\\${dataSet.uint16(propertyName, i)}`;
                    }
                } else if (vr === 'SS') {
                    text += dataSet.int16(propertyName);

                    for (let i = 1; i < dataSet.elements[propertyName].length / 2; i += 1) {
                        text += `\\${dataSet.int16(propertyName, i)}`;
                    }
                } else if (vr === 'UL') {
                    text += dataSet.uint32(propertyName);

                    for (let i = 1; i < dataSet.elements[propertyName].length / 4; i += 1) {
                        text += `\\${dataSet.uint32(propertyName, i)}`;
                    }
                } else if (vr === 'SL') {
                    text += dataSet.int32(propertyName);

                    for (let i = 1; i < dataSet.elements[propertyName].length / 4; i += 1) {
                        text += `\\${dataSet.int32(propertyName, i)}`;
                    }
                } else if (vr === 'FD') {
                    text += dataSet.double(propertyName);

                    for (let i = 1; i < dataSet.elements[propertyName].length / 8; i += 1) {
                        text += `\\${dataSet.double(propertyName, i)}`;
                    }
                } else if (vr === 'FL') {
                    text += dataSet.float(propertyName);

                    for (let i = 1; i < dataSet.elements[propertyName].length / 4; i += 1) {
                        text += `\\${dataSet.float(propertyName, i)}`;
                    }
                } else if (vr === 'OB' || vr === 'OW' || vr === 'UN' || vr === 'OF' || vr === 'UT') {
                    // If it is some other length and we have no string
                    if (element.length === 2) {
                        text += `<i>data of length ${element.length} as uint16: ${dataSet.uint16(propertyName)}`;
                    } else if (element.length === 4) {
                        text += `<i>data of length ${element.length} as uint32: ${dataSet.uint32(propertyName)}`;
                    } else {
                        text += `<i>data of length ${element.length} and VR ${vr} </i>`;
                    }
                } else if (vr === 'AT') {
                    const group = dataSet.uint16(propertyName, 0);
                    const groupHexStr = (`0000${group.toString(16)}`).substr(-4);
                    const elementHexStr = (`0000${group.toString(16)}`).substr(-4);
                    text += `x ${groupHexStr}${elementHexStr}`;
                } else if (vr === 'SQ') {
                    // TODO:
                } else {
                    // If it is some other length and we have no string
                    text += `<i>no display code for VR ${vr} yet.</i>`;
                }
            } else {
                // Add text saying the data is too long to show...
                text += `<i>data of length ${element.length} for VR ${vr} too long to show</i>`;
            }

            // Add a table row for the attribute
            row.text = text;
            addRow(row);
        }
    } catch (error) {
        console.warn(error);
    }
}

function dumpByteArray(byteArray) {
    setTimeout(() => {
        // Invoke the parseDicom function and get back a DataSet object with the contents
        let dataSet;

        try {
            dataSet = dicomParser.parseDicom(byteArray);
            // Here we call dumpDataSet to recursively iterate through the DataSet
            // and create a table of content
            dumpDataSet(dataSet);

            document.querySelector('.sidebar-content-loading').style.display = 'none';
            document.querySelector('.sidebar-table-container').style.display = 'block';

            if (dataSet.warnings.length > 0) {
                console.warn(' Warnings encountered while parsing file');
            } else {
                const pixelData = dataSet.elements.x7fe00010;
                if (!pixelData) {
                    console.log('No pixel data found');
                }
            }
        } catch (err) {
            console.warn(err);
        }
    }, 10);
}

window.addEventListener('load', () => {
    const baseUrl = window.frameElement.getAttribute('data-base-url');
    const downloadUrl = baseUrl + window.frameElement.getAttribute('data-download-url');

    // Search DICOM Attribute
    document.querySelector('.dicom-attributes-search').addEventListener('keyup', function (e) {
        const input = e.currentTarget;
        const table = document.querySelector('.dicom-elements-table');
        const filter = input.value.toUpperCase();
        const tr = table.getElementsByTagName('tr');

        for (let i = 0; i < tr.length; i += 1) {
            const td = tr[i].getElementsByTagName('td')[0];

            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = '';
                } else {
                    tr[i].style.display = 'none';
                }
            }
        }
    });

    const oReq = new XMLHttpRequest();
    try {
        oReq.open('get', downloadUrl, true);
    } catch (err) {
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
});
