let element;

function configureCornerstoneWADO(origin) {
    if (!origin) {
        return;
    }

    const maxWebWorkers = Math.max(navigator.hardwareConcurrency - 1, 1);
    const config = {
        maxWebWorkers,
        startWebWorkersOnDemand: true,
        webWorkerPath: `${origin}/apps/dicomviewer/js/external/cornerstoneWADO/cornerstoneWADOImageLoaderWebWorker.js`,
        taskConfiguration: {
            decodeTask: {
                loadCodecsOnStartup: true,
                initializeCodecsOnStartup: false,
                codecsPath: `${origin}/apps/dicomviewer/js/external/cornerstoneWADO/cornerstoneWADOImageLoaderCodecs.js`,
                usePDFJS: false
            },
        },
    };

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}

function getCompression(instance) {
    if (instance.lossyImageCompression === '01' &&
        instance.lossyImageCompressionRatio !== '') {
        const compressionMethod = instance.lossyImageCompressionMethod || 'Lossy: ';
        const compressionRatio = parseFloat(instance.lossyImageCompressionRatio).toFixed(2);
        return `${compressionMethod} ${compressionRatio} : 1`;
    }

    return 'Lossless / Uncompressed';
}

function loadAndViewImage(imageId) {
    const metadataProvider = new MetadataProvider();
    cornerstone.metaData.addProvider(metadataProvider.getProvider());

    element = document.getElementById('dicomImage');

    try {
        cornerstone.enable(element);
        cornerstone.loadAndCacheImage(imageId).then((image) => {
            const viewport = cornerstone.getDefaultViewportForImage(element, image);
            cornerstone.displayImage(element, image, viewport);

            cornerstoneTools.mouseInput.enable(element);
            cornerstoneTools.mouseWheelInput.enable(element);
            // Enable all tools we want to use with this element
            // ww/wc is the default tool for left mouse button
            cornerstoneTools.wwwc.activate(element, 1);

            // pan is the default tool for middle mouse button
            cornerstoneTools.pan.activate(element, 2);

            // zoom is the default tool for right mouse button
            cornerstoneTools.zoom.activate(element, 4);

            // zoom is the default tool for middle mouse wheel
            cornerstoneTools.zoomWheel.activate(element);
            cornerstoneTools.probe.enable(element);
            cornerstoneTools.length.enable(element);
            cornerstoneTools.ellipticalRoi.enable(element);
            cornerstoneTools.rectangleRoi.enable(element);
            cornerstoneTools.angle.enable(element);
            cornerstoneTools.highlight.enable(element);

            // Hide Progress
            document.querySelector('.load-progress-content').style.display = 'none';

            // Add metadata to store image data
            metadataProvider.addMetadata(imageId, image.data);

            const patient = cornerstone.metaData.get('patient', imageId);
            const study = cornerstone.metaData.get('study', imageId);
            const series = cornerstone.metaData.get('series', imageId);
            const instance = cornerstone.metaData.get('instance', imageId);

            document.getElementById('patientName').textContent = patient.name;
            document.getElementById('patientId').textContent = patient.id;

            document.getElementById('studyDescription').textContent = study.studyDescription;
            document.getElementById('studyDate').textContent = formatDate(study.studyDate);

            document.getElementById('compression').textContent = getCompression(instance);

            document.getElementById('seriesNumber').textContent = `Ser: ${series.seriesNumber}`;
            document.getElementById('instanceNumber').textContent = `Img #: ${series.numImages}`;
            document.getElementById('dimensions').textContent = `${image.width} x ${image.height}`;
        }, (err) => {
            console.warn(err);
        });
    } catch (err) {
        console.warn(err);
    }
}

// Loading progress
cornerstone.events.addEventListener('cornerstoneimageloadprogress', (event) => {
    const eventData = event.detail;
    const loadProgress = document.querySelector('.load-progress-content');
    loadProgress.textContent = `Loading... ${eventData.percentComplete}%`;
});

window.addEventListener('load', () => {
    const baseUrl = window.frameElement.getAttribute('data-base-url');
    const downloadUrl = baseUrl + window.frameElement.getAttribute('data-download-url');
    const url = `wadouri:${downloadUrl}`;

    configureCornerstoneWADO(baseUrl);

    // Display image
    loadAndViewImage(url);

    // Bind events of tools
    bindTools(element);

    // Update dicom image container attributes to disallow manipulating viewer
    document.querySelector('.dicom-image-container').oncontextmenu = () => false;

    document.querySelector('.dicom-image-container').onmousedown = () => false;

    document.querySelector('.dicom-image-container').onselectstart = () => false;

    document.querySelector('#dicomImage').oncontextmenu = () => false;

    element.addEventListener('cornerstoneimagerendered', (e) => {
        const viewport = cornerstone.getViewport(e.target);

        document.getElementById('zoomLevel').textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
        document.getElementById('windowLevel').textContent = `WW/WC: ${Math.round(viewport.voi.windowWidth)} / ${Math.round(viewport.voi.windowCenter)}`;
    });
});

window.addEventListener('resize', () => {
    cornerstone.resize(element, true);
});
