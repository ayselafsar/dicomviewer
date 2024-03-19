<?php
		// Group 0x0004
		Nanodicom_Dictionary::$dict[0x0004][0x0000] = array('UL', '1', 'FileSetGroupLength', 'RET');
		Nanodicom_Dictionary::$dict[0x0004][0x1130] = array('CS', '1', 'FileSetID');
		Nanodicom_Dictionary::$dict[0x0004][0x1141] = array('CS', '8', 'FileSetDescriptorFileID');
		Nanodicom_Dictionary::$dict[0x0004][0x1142] = array('CS', '1', 'FileSetCharacterSet');
		Nanodicom_Dictionary::$dict[0x0004][0x1200] = array('UL', '1', 'RootDirectoryFirstRecord');
		Nanodicom_Dictionary::$dict[0x0004][0x1202] = array('UL', '1', 'RootDirectoryLastRecord');
		Nanodicom_Dictionary::$dict[0x0004][0x1212] = array('US', '1', 'FileSetConsistencyFlag');
		Nanodicom_Dictionary::$dict[0x0004][0x1220] = array('SQ', '1', 'DirectoryRecordSequence');
		Nanodicom_Dictionary::$dict[0x0004][0x1400] = array('UL', '1', 'NextDirectoryRecordOffset');
		Nanodicom_Dictionary::$dict[0x0004][0x1410] = array('US', '1', 'RecordInUseFlag');
		Nanodicom_Dictionary::$dict[0x0004][0x1420] = array('UL', '1', 'LowerLevelDirectoryOffset');
		Nanodicom_Dictionary::$dict[0x0004][0x1430] = array('CS', '1', 'DirectoryRecordType');
		Nanodicom_Dictionary::$dict[0x0004][0x1432] = array('UI', '1', 'PrivateRecordUID');
		Nanodicom_Dictionary::$dict[0x0004][0x1500] = array('CS', '8', 'ReferencedFileID');
		Nanodicom_Dictionary::$dict[0x0004][0x1504] = array('UL', '1', 'DirectoryRecordOffset');
		Nanodicom_Dictionary::$dict[0x0004][0x1510] = array('UI', '1', 'ReferencedSOPClassUIDInFile');
		Nanodicom_Dictionary::$dict[0x0004][0x1511] = array('UI', '1', 'ReferencedSOPInstanceUIDInFile');
		Nanodicom_Dictionary::$dict[0x0004][0x1512] = array('UI', '1', 'ReferencedTransferSyntaxUIDInFile');
		Nanodicom_Dictionary::$dict[0x0004][0x1600] = array('UL', '1', 'NumberOfReferences');
