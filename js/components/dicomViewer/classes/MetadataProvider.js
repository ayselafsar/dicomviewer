import { cornerstoneMath } from '../../../lib/cornerstonejs';

const FUNCTION = 'function';

export class MetadataProvider {
    constructor() {
        // Define the main "metadataLookup" private property as an immutable property.
        Object.defineProperty(this, 'metadataLookup', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: new Map()
        });

        // Local reference to provider function bound to current instance.
        Object.defineProperty(this, '_provider', {
            configurable: false,
            enumerable: false,
            writable: true,
            value: null
        });
    }

    /**
     * Constructs and returns the imagePlane given the metadata instance
     *
     * @param instance The metadata instance containing information to construct imagePlane
     * @returns imagePlane The constructed imagePlane to be used in viewer easily
     */
    getImagePlane(instance) {
        if (!instance) {
            return;
        }

        if (!instance.rows || !instance.columns || !instance.pixelSpacing ||
            !instance.frameOfReferenceUID || !instance.imageOrientationPatient ||
            !instance.imagePositionPatient) {
            return;
        }

        const imageOrientation = instance.imageOrientationPatient.split('\\');
        const imagePosition = instance.imagePositionPatient.split('\\');

        let columnPixelSpacing = 1.0;
        let rowPixelSpacing = 1.0;
        if (instance.pixelSpacing) {
            const split = instance.pixelSpacing.split('\\');
            rowPixelSpacing = parseFloat(split[0]);
            columnPixelSpacing = parseFloat(split[1]);
        }

        return {
            frameOfReferenceUID: instance.frameOfReferenceUID,
            rows: instance.rows,
            columns: instance.columns,
            rowCosines:
                new cornerstoneMath.Vector3(
                parseFloat(imageOrientation[0]),
                parseFloat(imageOrientation[1]),
                parseFloat(imageOrientation[2])
            ),
            columnCosines:
                new cornerstoneMath.Vector3(
                parseFloat(imageOrientation[3]),
                parseFloat(imageOrientation[4]),
                parseFloat(imageOrientation[5])
            ),
            imagePositionPatient:
                new cornerstoneMath.Vector3(
                parseFloat(imagePosition[0]),
                parseFloat(imagePosition[1]),
                parseFloat(imagePosition[2])
            ),
            rowPixelSpacing,
            columnPixelSpacing,
        };
    }

    /**
     * Cornerstone Metadata provider to store image meta data
     * Data from instances, series, and studies are associated with
     * imageIds to facilitate usage of this information by Cornerstone's Tools
     *
     * @param {String} imageId The Cornerstone ImageId
     * @param {Object} dataSet An object containing dicom dataset
     */
    addMetadata(imageId, dataSet) {
        const metadata = {};

        metadata.study = {
            accessionNumber: this.getFromDataSet(dataSet, 'string', 'x00080050'),
            patientId: this.getFromDataSet(dataSet, 'string', 'x00100020'),
            studyInstanceUid: this.getFromDataSet(dataSet, 'string', 'x0020000d'),
            studyDate: this.getFromDataSet(dataSet, 'string', 'x00080020'),
            studyTime: this.getFromDataSet(dataSet, 'string', 'x00080030'),
            studyDescription: this.getFromDataSet(dataSet, 'string', 'x00081030'),
            institutionName: this.getFromDataSet(dataSet, 'string', 'x00080080')
        };

        metadata.series = {
            seriesDescription: this.getFromDataSet(dataSet, 'string', 'x0008103e'),
            seriesNumber: this.getFromDataSet(dataSet, 'string', 'x00200011'),
            seriesDate: this.getFromDataSet(dataSet, 'string', 'x00080021'),
            seriesTime: this.getFromDataSet(dataSet, 'string', 'x00200031'),
            modality: this.getFromDataSet(dataSet, 'string', 'x00080060'),
            seriesInstanceUid: this.getFromDataSet(dataSet, 'string', 'x0020000e'),
            numImages: this.getFromDataSet(dataSet, 'string', 'x00200013')
        };

        metadata.patient = {
            name: this.getFromDataSet(dataSet, 'string', 'x00100010'),
            id: this.getFromDataSet(dataSet, 'string', 'x00100020'),
            birthDate: this.getFromDataSet(dataSet, 'string', 'x00100030'),
            sex: this.getFromDataSet(dataSet, 'string', 'x00100040'),
            age: this.getFromDataSet(dataSet, 'string', 'x00101010')
        };

        metadata.instance = {
            rows: this.getFromDataSet(dataSet, 'uint16', 'x00280010'),
            columns: this.getFromDataSet(dataSet, 'uint16', 'x00280011'),
            sopClassUid: this.getFromDataSet(dataSet, 'string', 'x00080016'),
            sopInstanceUid: this.getFromDataSet(dataSet, 'string', 'x00080018'),
            pixelSpacing: this.getFromDataSet(dataSet, 'string', 'x00280030'),
            frameOfReferenceUID: this.getFromDataSet(dataSet, 'string', 'x00200052'),
            imageOrientationPatient: this.getFromDataSet(dataSet, 'string', 'x00200037'),
            imagePositionPatient: this.getFromDataSet(dataSet, 'string', 'x00200032'),
            sliceThickness: this.getFromDataSet(dataSet, 'string', 'x00180050'),
            sliceLocation: this.getFromDataSet(dataSet, 'string', 'x00201041'),
            tablePosition: this.getFromDataSet(dataSet, 'string', 'x00189327'),
            spacingBetweenSlices: this.getFromDataSet(dataSet, 'string', 'x00180088'),
            lossyImageCompression: this.getFromDataSet(dataSet, 'string', 'x00282110'),
            lossyImageCompressionRatio: this.getFromDataSet(dataSet, 'string', 'x00282112'),
            lossyImageCompressionMethod: this.getFromDataSet(dataSet, 'string', 'x00282114'),
            frameIncrementPointer: this.getFromDataSet(dataSet, 'string', 'x00280009'),
            frameTime: this.getFromDataSet(dataSet, 'string', 'x00181063'),
            frameTimeVector: this.getFromDataSet(dataSet, 'string', 'x00181065')
        };

        metadata.imagePlane = this.getImagePlane(metadata.instance);

        // Add the metadata to the imageId lookup object
        this.metadataLookup.set(imageId, metadata);
    }

    getFromDataSet(dataSet, type, tag) {
        if (!dataSet) {
            return;
        }

        const fn = dataSet[type];
        if (!fn) {
            return;
        }

        return fn.call(dataSet, tag);
    }

    /**
     * Return the metadata for the given imageId
     * @param {String} imageId The Cornerstone ImageId
     * @returns image metadata
     */
    getMetadata(imageId) {
        return this.metadataLookup.get(imageId);
    }

    /**
     * Get a bound reference to the provider function.
     */
    getProvider() {
        let provider = this._provider;

        if (typeof this._provider !== FUNCTION) {
            provider = this.provider.bind(this);
            this._provider = provider;
        }

        return provider;
    }

    /**
     * Looks up metadata for Cornerstone Tools given a specified type and imageId
     * A type may be, e.g. 'study', or 'patient'. These types
     * are keys in the stored metadata objects.
     *
     * @param type
     * @param imageId
     * @returns {Object} Relevant metadata of the specified type
     */
    provider(type, imageId) {
        if (type === 'imagePlaneModule') {
            type = 'imagePlane';
        }

        const imageMetadata = this.metadataLookup.get(imageId);
        if (!imageMetadata || !imageMetadata.hasOwnProperty(type)) {
            return;
        }

        return imageMetadata[type];
    }
}
