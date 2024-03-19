<?php
		// Group 0x2020
		Nanodicom_Dictionary::$dict[0x2020][0x0010] = array('US', ' 1', 'ImageBoxPosition');
		Nanodicom_Dictionary::$dict[0x2020][0x0020] = array('CS', ' 1', 'Polarity');
		Nanodicom_Dictionary::$dict[0x2020][0x0030] = array('DS', ' 1', 'RequestedImageSize');
		Nanodicom_Dictionary::$dict[0x2020][0x0040] = array('CS', ' 1', 'RequestedDecimateCropBehavior');
		Nanodicom_Dictionary::$dict[0x2020][0x0050] = array('CS', ' 1', 'RequestedResolutionID');
		Nanodicom_Dictionary::$dict[0x2020][0x00A0] = array('CS', ' 1', 'RequestedImageSizeFlag');
		Nanodicom_Dictionary::$dict[0x2020][0x00A2] = array('CS', ' 1', 'DecimateCropResult');
		Nanodicom_Dictionary::$dict[0x2020][0x0110] = array('SQ', ' 1', 'BasicGrayscaleImageSequence');
		Nanodicom_Dictionary::$dict[0x2020][0x0111] = array('SQ', ' 1', 'BasicColorImageSequence');
		Nanodicom_Dictionary::$dict[0x2020][0x0130] = array('SQ', ' 1 ', 'ReferencedImageOverlayBoxSequence', 'RET');
		Nanodicom_Dictionary::$dict[0x2020][0x0140] = array('SQ', ' 1 ', 'ReferencedVOILUTBoxSequence', 'RET');
