<?php

declare(strict_types=1);

namespace OCA\DICOMViewer\Service;

/**
 * A DICOM file starts with a 128-byte preamble and the ASCII marker DICM.
 * Files on medical media usually have no extension, so the marker is the
 * only reliable way to tell them apart from other binary files.
 */
class DicomPreamble {
	public const MARKER_OFFSET = 128;
	public const MARKER = 'DICM';
	public const HEADER_LENGTH = 132;

	public function matches(string $header): bool {
		return strlen($header) >= self::HEADER_LENGTH
			&& substr($header, self::MARKER_OFFSET, strlen(self::MARKER)) === self::MARKER;
	}
}
