import { generateUrl } from '@nextcloud/router';
import { cornerstone, cornerstoneWADOImageLoader } from './cornerstonejs.js';
import generateFullUrl from './generateFullUrl.js';

/**
 * Configure cornerstone codecs and web workers
 */
export default function() {
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

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}
