<?php

namespace OCA\DICOMViewer\Migration;

use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;
use OCP\ILogger;

class RegisterMimeType implements IRepairStep {
    protected $logger;
    private $customMimetypeMapping;

    public function __construct(ILogger $logger) {
        $this->logger = $logger;

        // Define the custom mimetype mapping
        $this->customMimetypeMapping = array(
            "dcm" => array("application/dicom"),
            "ima" => array("application/dicom"),
            "dicom" => array("application/dicom"),
            "dic" => array("application/dicom"),
            "dc3" => array("application/dicom")
        );
    }

    public function getName() {
        return 'Register MIME type for "application/dcm"';
    }

    private function registerForExistingFiles() {
        $mimetypeMapping = $this->customMimetypeMapping;
        $mimeTypeLoader = \OC::$server->getMimeTypeLoader();

        foreach($mimetypeMapping as $mimetypeKey => $mimetypeValues) {
            foreach($mimetypeValues as $mimetypeValue) {
                $mimeId = $mimeTypeLoader->getId($mimetypeValue);
                $mimeTypeLoader->updateFilecache($mimetypeKey, $mimeId);
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

    public function run(IOutput $output) {
        $this->logger->info('Registering the mimetype...');

        // Register the mime type for existing files
        $this->registerForExistingFiles();

        // Register the mime type for new files
        $this->registerForNewFiles();

        $this->logger->info('The mimetype was successfully registered.');
    }
}
