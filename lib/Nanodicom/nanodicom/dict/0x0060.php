<?php
		// Group 0x0060
		Nanodicom_Dictionary::$dict[0x0060][0x3000] = array('SQ', ' 1', 'HistogramSequence');
		Nanodicom_Dictionary::$dict[0x0060][0x3002] = array('US', ' 1', 'HistogramNumberOfBins');
		Nanodicom_Dictionary::$dict[0x0060][0x3008] = array('US', ' 1', 'HistogramBinWidth');
		Nanodicom_Dictionary::$dict[0x0060][0x3010] = array('LO', ' 1', 'HistogramExplanation');
		Nanodicom_Dictionary::$dict[0x0060][0x3020] = array('UL', ' 1-n', 'HistogramData');
