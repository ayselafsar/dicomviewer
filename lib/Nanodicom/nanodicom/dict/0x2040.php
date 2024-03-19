<?php
		// Group 0x2040
		Nanodicom_Dictionary::$dict[0x2040][0x0010] = array('SQ', ' 1 ', 'ReferencedOverlayPlaneSequence', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0011] = array('US', ' 1-99 ', 'ReferencedOverlayPlaneGroups', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0020] = array('SQ', ' 1 ', 'OverlayPixelDataSequence', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0060] = array('CS', ' 1 ', 'OverlayMagnificationType', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0070] = array('CS', ' 1 ', 'OverlaySmoothingType', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0072] = array('CS', ' 1 ', 'OverlayOrImageMagnification', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0074] = array('US', ' 1 ', 'MagnifyToNumberOfColumns', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0080] = array('CS', ' 1 ', 'OverlayForegroundDensity', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0082] = array('CS', ' 1 ', 'OverlayBackgroundDensity', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0090] = array('CS', ' 1 ', 'OverlayMode', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0100] = array('CS', ' 1 ', 'ThresholdDensity', 'RET');
		Nanodicom_Dictionary::$dict[0x2040][0x0500] = array('SQ', ' 1 ', 'ReferencedImageBoxSequenceRetired', 'RET');
