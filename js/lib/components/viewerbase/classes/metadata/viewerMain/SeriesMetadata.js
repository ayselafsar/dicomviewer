import { BaseSeriesMetadata } from '../BaseSeriesMetadata';
import { InstanceMetadata} from './InstanceMetadata';

export class SeriesMetadata extends BaseSeriesMetadata {

    /**
     * @param {Object} Series object.
     */
    constructor(data, study, uid) {
        super(data, uid);
        this.init(study);
    }

    init(study) {
        const series = this.getData();

        // define "_seriesInstanceUID" protected property...
        Object.defineProperty(this, '_seriesInstanceUID', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: series.seriesInstanceUid
        });

        // populate internal list of instances...
        series.instances.forEach(instance => {
            this.addInstance(new InstanceMetadata(instance, series, study));
        });
    }

}

