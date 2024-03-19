<?php
		// Group 0x2010
		Nanodicom_Dictionary::$dict[0x2010][0x0010] = array('ST', ' 1', 'ImageDisplayFormat');
		Nanodicom_Dictionary::$dict[0x2010][0x0030] = array('CS', ' 1', 'AnnotationDisplayFormatID');
		Nanodicom_Dictionary::$dict[0x2010][0x0040] = array('CS', ' 1', 'FilmOrientation');
		Nanodicom_Dictionary::$dict[0x2010][0x0050] = array('CS', ' 1', 'FilmSizeID');
		Nanodicom_Dictionary::$dict[0x2010][0x0052] = array('CS', ' 1', 'PrinterResolutionID');
		Nanodicom_Dictionary::$dict[0x2010][0x0054] = array('CS', ' 1', 'DefaultPrinterResolutionID');
		Nanodicom_Dictionary::$dict[0x2010][0x0060] = array('CS', ' 1', 'MagnificationType');
		Nanodicom_Dictionary::$dict[0x2010][0x0080] = array('CS', ' 1', 'SmoothingType');
		Nanodicom_Dictionary::$dict[0x2010][0x00A6] = array('CS', ' 1', 'DefaultMagnificationType');
		Nanodicom_Dictionary::$dict[0x2010][0x00A7] = array('CS', ' 1-n', 'OtherMagnificationTypesAvailable');
		Nanodicom_Dictionary::$dict[0x2010][0x00A8] = array('CS', ' 1', 'DefaultSmoothingType');
		Nanodicom_Dictionary::$dict[0x2010][0x00A9] = array('CS', ' 1-n', 'OtherSmoothingTypesAvailable');
		Nanodicom_Dictionary::$dict[0x2010][0x0100] = array('CS', ' 1', 'BorderDensity');
		Nanodicom_Dictionary::$dict[0x2010][0x0110] = array('CS', ' 1', 'EmptyImageDensity');
		Nanodicom_Dictionary::$dict[0x2010][0x0120] = array('US', ' 1', 'MinDensity');
		Nanodicom_Dictionary::$dict[0x2010][0x0130] = array('US', ' 1', 'MaxDensity');
		Nanodicom_Dictionary::$dict[0x2010][0x0140] = array('CS', ' 1', 'Trim');
		Nanodicom_Dictionary::$dict[0x2010][0x0150] = array('ST', ' 1', 'ConfigurationInformation');
		Nanodicom_Dictionary::$dict[0x2010][0x0152] = array('LT', ' 1', 'ConfigurationInformationDescription');
		Nanodicom_Dictionary::$dict[0x2010][0x0154] = array('IS', ' 1', 'MaximumCollatedFilms');
		Nanodicom_Dictionary::$dict[0x2010][0x015E] = array('US', ' 1', 'Illumination');
		Nanodicom_Dictionary::$dict[0x2010][0x0160] = array('US', ' 1', 'ReflectedAmbientLight');
		Nanodicom_Dictionary::$dict[0x2010][0x0376] = array('DS', ' 2', 'PrinterPixelSpacing');
		Nanodicom_Dictionary::$dict[0x2010][0x0500] = array('SQ', ' 1', 'ReferencedFilmSessionSequence');
		Nanodicom_Dictionary::$dict[0x2010][0x0510] = array('SQ', ' 1', 'ReferencedImageBoxSequence');
		Nanodicom_Dictionary::$dict[0x2010][0x0520] = array('SQ', ' 1', 'ReferencedBasicAnnotationBoxSequence');
