<?php

namespace OCA\DICOMViewer\Migration;

use OCP\App\IAppManager;
use OCP\Files\IMimeTypeLoader;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;
use Psr\Log\LoggerInterface;

class RegisterMimeType implements IRepairStep {
    protected $logger;
    private $customMimetypeMapping;
    private IMimeTypeLoader $mimeTypeLoader;
    private IAppManager $appManager;

    public function __construct(LoggerInterface $logger, IMimeTypeLoader $mimeTypeLoader, IAppManager $appManager) {
        $this->logger = $logger;
        $this->mimeTypeLoader = $mimeTypeLoader;
        $this->appManager = $appManager;

        // Define the custom mimetype mapping
        $this->customMimetypeMapping = array(
            "dcm" => array("application/dicom"),
            "ima" => array("application/dicom"),
            "dicom" => array("application/dicom"),
            "dic" => array("application/dicom"),
            "dc3" => array("application/dicom"),
            "pano" => array("application/dicom")
        );
    }

    public function getName() {
        return 'Register MIME type for "application/dcm"';
    }

    private function registerForExistingFiles() {
        $mimetypeMapping = $this->customMimetypeMapping;
        foreach($mimetypeMapping as $mimetypeKey => $mimetypeValues) {
            foreach($mimetypeValues as $mimetypeValue) {
                $mimeId = $this->mimeTypeLoader->getId($mimetypeValue);
                $this->mimeTypeLoader->updateFilecache($mimetypeKey, $mimeId);
            }
        }
    }

    private function registerForNewFiles() {
        $mimetypeMapping = $this->customMimetypeMapping;
        $mimetypeMappingFile = \OC::$configDir . 'mimetypemapping.json';

        if (file_exists($mimetypeMappingFile)) {
            $existingMimetypeMapping = json_decode(file_get_contents($mimetypeMappingFile), true);
            $mimetypeMapping = array_merge($existingMimetypeMapping, $mimetypeMapping);
        }

        file_put_contents($mimetypeMappingFile, json_encode($mimetypeMapping, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    }

    private function registerIcon() {
        $source = $this->appManager->getAppPath('dicomviewer') . '/img/application-dicom.svg';
        $targetDirectory = \OC::$SERVERROOT . '/core/img/filetypes';
        $target = $targetDirectory . '/application-dicom.svg';

        if (!is_file($source) || !is_dir($targetDirectory) || !is_writable($targetDirectory)) {
            $this->logger->warning('Unable to install the DICOM file icon.');
            return;
        }

        if (!is_file($target) || file_get_contents($source) !== file_get_contents($target)) {
            copy($source, $target);
        }
    }

    public function run(IOutput $output) {
        $this->logger->info('Registering the mimetype...');

        // Register the mime type for existing files
        $this->registerForExistingFiles();

        // Register the mime type for new files
        $this->registerForNewFiles();

        // The Files list resolves icons through /core/mimeicon, which only reads core/img/filetypes.
        $this->registerIcon();

        $this->logger->info('The mimetype was successfully registered.');
    }
}
