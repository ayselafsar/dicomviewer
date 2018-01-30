const FUNCTION = 'function';

class MetadataProvider {

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
            studyDescription: this.getFromDataSet(dataSet, 'string', 'x00081030'),
            studyDate: this.getFromDataSet(dataSet, 'string', 'x00080020')
        };

        metadata.series = {
            seriesNumber: this.getFromDataSet(dataSet, 'string', 'x00200011'),
            numImages: this.getFromDataSet(dataSet, 'string', 'x00200013')
        };

        metadata.patient = {
            name: this.getFromDataSet(dataSet, 'string', 'x00100010'),
            id: this.getFromDataSet(dataSet, 'string', 'x00100020'),
        };

        metadata.instance = {
            lossyImageCompression: this.getFromDataSet(dataSet, 'string', 'x00282110'),
            lossyImageCompressionRatio: this.getFromDataSet(dataSet, 'string', 'x00282112'),
            lossyImageCompressionMethod: this.getFromDataSet(dataSet, 'string', 'x00282114')
        };

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
        const imageMetadata = this.metadataLookup.get(imageId);
        if (!imageMetadata) {
            return;
        }

        if (imageMetadata.hasOwnProperty(type)) {
            return imageMetadata[type];
        }
    }
}
