import { generateUrl } from '@nextcloud/router';
import { cornerstone, cornerstoneWADOImageLoader } from './cornerstonejs.js';
import generateFullUrl from './generateFullUrl.js';

let initialized = false;

/**
 * Configure cornerstone codecs and web workers
 */
export default function() {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

    if (initialized) {
        return;
    }

    initialized = true;

    const maxWebWorkers = Math.max(navigator.hardwareConcurrency - 1, 1);
    const config = {
        maxWebWorkers,
        startWebWorkersOnDemand: true,
        webWorkerPath: `${generateFullUrl(generateUrl('/apps/dicomviewer/js/public/cornerstoneWADOImageLoaderWebWorker.js'))}`,
        taskConfiguration: {
            decodeTask: {
                loadCodecsOnStartup: true,
                initializeCodecsOnStartup: false,
                codecsPath: `${generateFullUrl(generateUrl('/apps/dicomviewer/js/public/cornerstoneWADOImageLoaderCodecs.js'))}`,
                usePDFJS: false
            },
        },
    };

    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}
