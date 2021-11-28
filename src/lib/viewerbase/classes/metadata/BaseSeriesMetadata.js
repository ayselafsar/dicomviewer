import { Metadata } from './Metadata';
import { BaseInstanceMetadata } from './BaseInstanceMetadata';

export class BaseSeriesMetadata extends Metadata {
    constructor(data, uid) {
        super(data, uid);
        // Initialize Private Properties
        Object.defineProperties(this, {
            _seriesInstanceUID: {
                configurable: true, // configurable so that it can be redefined in sub-classes...
                enumerable: false,
                writable: true,
                value: null
            },
            _instances: {
                configurable: false,
                enumerable: false,
                writable: false,
                value: []
            },
            _firstInstance: {
                configurable: false,
                enumerable: false,
                writable: true,
                value: null
            }
        });
        // Initialize Public Properties
        this._definePublicProperties();
    }

    /**
     * Private Methods
     */

    /**
     * Define Public Properties
     * This method should only be called during initialization (inside the class constructor)
     */
    _definePublicProperties() {
        /**
         * Property: this.seriesInstanceUID
         * Same as this.getSeriesInstanceUID()
         * It's specially useful in contexts where a method call is not suitable like in search criteria. For example:
         * seriesCollection.findBy({
         *   seriesInstanceUID: '1.2.3.4.5.6.77777.8888888.99999999999.0'
         * });
         */
        Object.defineProperty(this, 'seriesInstanceUID', {
            configurable: false,
            enumerable: false,
            get() {
                return this.getSeriesInstanceUID();
            }
        });
    }

    /**
     * Public Methods
     */

    /**
     * Returns the SeriesInstanceUID of the current series.
     */
    getSeriesInstanceUID() {
        return this._seriesInstanceUID;
    }

    /**
     * Append an instance to the current series.
     * @param {BaseInstanceMetadata} instance The instance to be added to the current series.
     * @returns {boolean} Returns true on success, false otherwise.
     */
    addInstance(instance) {
        let result = false;
        if (instance instanceof BaseInstanceMetadata && this.getInstanceByUID(instance.getSOPInstanceUID()) === undefined) {
            this._instances.push(instance);
            result = true;
        }
        return result;
    }

    /**
     * Get the first instance of the current series retaining a consistent result across multiple calls.
     * @return {BaseInstanceMetadata} An instance of the InstanceMetadata class or null if it does not exist.
     */
    getFirstInstance() {
        let instance = this._firstInstance;
        if (!(instance instanceof BaseInstanceMetadata)) {
            instance = null;
            const found = this.getInstanceByIndex(0);
            if (found instanceof BaseInstanceMetadata) {
                this._firstInstance = found;
                instance = found;
            }
        }
        return instance;
    }

    /**
     * Find an instance by index.
     * @param {number} index An integer representing a list index.
     * @returns {BaseInstanceMetadata} Returns a InstanceMetadata instance when found or undefined otherwise.
     */
    getInstanceByIndex(index) {
        let found; // undefined by default...
        if (Metadata.isValidIndex(index)) {
            found = this._instances[index];
        }
        return found;
    }

    /**
     * Find an instance by SOPInstanceUID.
     * @param {string} uid An UID string.
     * @returns {BaseInstanceMetadata} Returns a InstanceMetadata instance when found or undefined otherwise.
     */
    getInstanceByUID(uid) {
        let found; // undefined by default...
        if (Metadata.isValidUID(uid)) {
            found = this._instances.find(instance => instance.getSOPInstanceUID() === uid);
        }
        return found;
    }

    /**
     * Retrieve the number of instances within the current series.
     * @returns {number} The number of instances in the current series.
     */
    getInstanceCount() {
        return this._instances.length;
    }

    /**
     * Invokes the supplied callback for each instance in the current series passing
     * two arguments: instance (an InstanceMetadata instance) and index (the integer
     * index of the instance within the current series)
     * @param {function} callback The callback function which will be invoked for each instance in the series.
     * @returns {undefined} Nothing is returned.
     */
    forEachInstance(callback) {
        if (Metadata.isValidCallback(callback)) {
            this._instances.forEach((instance, index) => {
                callback.call(null, instance, index);
            });
        }
    }

    /**
     * Find the index of an instance inside the series.
     * @param {BaseInstanceMetadata} instance An instance of the SeriesMetadata class.
     * @returns {number} The index of the instance inside the series or -1 if not found.
     */
    indexOfInstance(instance) {
        return this._instances.indexOf(instance);
    }

    /**
     * Search the associated instances using the supplied callback as criteria. The callback is passed
     * two arguments: instance (a InstanceMetadata instance) and index (the integer
     * index of the instance within its series)
     * @param {function} callback The callback function which will be invoked for each instance.
     * @returns {BaseInstanceMetadata|undefined} If an instance is found based on callback criteria it
     *                                     returns a InstanceMetadata. "undefined" is returned otherwise
     */
    findInstance(callback) {
        if (Metadata.isValidCallback(callback)) {
            return this._instances.find((instance, index) => callback.call(null, instance, index));
        }
    }

    /**
     * Compares the current series with another one.
     * @param {BaseSeriesMetadata} series An instance of the SeriesMetadata class.
     * @returns {boolean} Returns true if both instances refer to the same series.
     */
    equals(series) {
        const self = this;
        return (
            series === self ||
            (
                series instanceof BaseSeriesMetadata &&
                series.getSeriesInstanceUID() === self.getSeriesInstanceUID()
            )
        );
    }
}
