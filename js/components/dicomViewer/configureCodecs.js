import { cornerstone, cornerstoneWADOImageLoader } from '../../lib/cornerstonejs';
import generateFullUrl from '../../lib/generateFullUrl';

/**
 * Configure cornerstone codecs and web workers
 */
export default function () {
    const maxWebWorkers = Math.max(navigator.hardwareConcurrency - 1, 1);
    const config = {
        maxWebWorkers,
        startWebWorkersOnDemand: true,
        webWorkerPath: `${generateFullUrl(OC.generateUrl('/apps/dicomviewer/js/public/cornerstoneWADOImageLoaderWebWorker.js'))}`,
        taskConfiguration: {
            decodeTask: {
                loadCodecsOnStartup: true,
                initializeCodecsOnStartup: false,
                codecsPath: `${generateFullUrl(OC.generateUrl('/apps/dicomviewer/js/public/cornerstoneWADOImageLoaderCodecs.js'))}`,
                usePDFJS: false
            },
        },
    };

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}
