import { dicomParser } from '../cornerstonejs';

/**
 * A small set of utilities to help parsing DICOM element values.
 * In the future the functionality provided by this library might
 * be incorporated into dicomParser library.
 */

export const parsingUtils = {

    /**
     * Check if supplied argument is a valid instance of the dicomParser.DataSet class.
     * @param data {Object} An instance of the dicomParser.DataSet class.
     * @returns {Boolean} Returns true if data is a valid instance of the dicomParser.DataSet class.
     */
    isValidDataSet(data) {
        return (data instanceof dicomParser.DataSet);
    },

    /**
     * Parses an element tag according to the 'AT' VR definition.
     * @param data {Object} An instance of the dicomParser.DataSet class.
     * @param tag {String} A DICOM tag with in the format xGGGGEEEE.
     * @returns {String} A string representation of a data element tag or null if the field is not present or data is not long enough.
     */
    attributeTag(data, tag) {
        if (this.isValidDataSet(data) && tag in data.elements) {
            const element = data.elements[tag];
            if (element && element.length === 4) {
                const parser = data.byteArrayParser.readUint16;
                const bytes = data.byteArray;
                const offset = element.dataOffset;
                return `x${(`00000000${(((parser(bytes, offset) * 256) * 256) + parser(bytes, offset + 2)).toString(16)}`).substr(-8)}`;
            }
        }

        return null;
    },

    /**
     * Parses the string representation of a multi-valued element into an array of strings. If the parser
     * parameter is passed and is a function, it will be applied to each element of the resulting array.
     * @param data {Object} An instance of the dicomParser.DataSet class.
     * @param tag {String} A DICOM tag with in the format xGGGGEEEE.
     * @param parser {Function} An optional parser function that can be applied to each element of the array.
     * @returns {Array} An array of floating point numbers or null if the field is not present or data is not long enough.
     */
    multiValue(data, tag, parser) {
        if (this.isValidDataSet(data) && tag in data.elements) {
            const element = data.elements[tag];
            if (element && element.length > 0) {
                const string = dicomParser.readFixedString(data.byteArray, element.dataOffset, element.length);
                if (typeof string === 'string' && string.length > 0) {
                    if (typeof parser !== 'function') {
                        parser = null;
                    }

                    return string.split('\\').map((value) => {
                        value = value.trim();
                        return parser !== null ? parser(value) : value;
                    });
                }
            }
        }

        return null;
    },

    /**
     * Parses a string to an array of floats for a multi-valued element.
     * @param data {Object} An instance of the dicomParser.DataSet class.
     * @param tag {String} A DICOM tag with in the format xGGGGEEEE.
     * @returns {Array} An array of floating point numbers or null if the field is not present or data is not long enough.
     */
    floatArray(data, tag) {
        return this.multiValue(data, tag, parseFloat);
    }

};
