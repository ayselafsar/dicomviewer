import { cornerstone, cornerstoneWADOImageLoader } from '../../lib/cornerstonejs';

/**
 *
 * @param origin
 */
export default function (origin) {
    const maxWebWorkers = Math.max(navigator.hardwareConcurrency - 1, 1);
    const config = {
        maxWebWorkers,
        startWebWorkersOnDemand: true,
        webWorkerPath: `${origin}/apps/dicomviewer/js/public/cornerstoneWADOImageLoaderWebWorker.js`,
        taskConfiguration: {
            decodeTask: {
                loadCodecsOnStartup: true,
                initializeCodecsOnStartup: false,
                codecsPath: `${origin}/apps/dicomviewer/js/public/cornerstoneWADOImageLoaderCodecs.js`,
                usePDFJS: false
            },
        },
    };

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}
