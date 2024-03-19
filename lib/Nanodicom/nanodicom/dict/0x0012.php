<?php
		// Group 0x0012
		Nanodicom_Dictionary::$dict[0x0012][0x0010] = array('LO', ' 1', 'ClinicalTrialSponsorName');
		Nanodicom_Dictionary::$dict[0x0012][0x0020] = array('LO', ' 1', 'ClinicalTrialProtocolID');
		Nanodicom_Dictionary::$dict[0x0012][0x0021] = array('LO', ' 1', 'ClinicalTrialProtocolName');
		Nanodicom_Dictionary::$dict[0x0012][0x0030] = array('LO', ' 1', 'ClinicalTrialSiteID');
		Nanodicom_Dictionary::$dict[0x0012][0x0031] = array('LO', ' 1', 'ClinicalTrialSiteName');
		Nanodicom_Dictionary::$dict[0x0012][0x0040] = array('LO', ' 1', 'ClinicalTrialSubjectID');
		Nanodicom_Dictionary::$dict[0x0012][0x0042] = array('LO', ' 1', 'ClinicalTrialSubjectReadingID');
		Nanodicom_Dictionary::$dict[0x0012][0x0050] = array('LO', ' 1', 'ClinicalTrialTimePointID');
		Nanodicom_Dictionary::$dict[0x0012][0x0051] = array('ST', ' 1', 'ClinicalTrialTimePointDescription');
		Nanodicom_Dictionary::$dict[0x0012][0x0060] = array('LO', ' 1', 'ClinicalTrialCoordinatingCenterName');
		Nanodicom_Dictionary::$dict[0x0012][0x0062] = array('CS', ' 1', 'PatientIdentityRemoved');
		Nanodicom_Dictionary::$dict[0x0012][0x0063] = array('LO', ' 1-n', 'DeidentificationMethod');
		Nanodicom_Dictionary::$dict[0x0012][0x0064] = array('SQ', ' 1', 'DeidentificationMethodCodeSequence');
		Nanodicom_Dictionary::$dict[0x0012][0x0071] = array('LO', ' 1', 'ClinicalTrialSeriesID');
		Nanodicom_Dictionary::$dict[0x0012][0x0072] = array('LO', ' 1', 'ClinicalTrialSeriesDescription');
		Nanodicom_Dictionary::$dict[0x0012][0x0081] = array('LO', ' 1', 'ClinicalTrialProtocolEthicsCommitteeName');
		Nanodicom_Dictionary::$dict[0x0012][0x0082] = array('LO', ' 1', 'ClinicalTrialProtocolEthicsCommitteeApprovalNumber');
		Nanodicom_Dictionary::$dict[0x0012][0x0083] = array('SQ', ' 1', 'ConsentForClinicalTrialUseSequence');
		Nanodicom_Dictionary::$dict[0x0012][0x0084] = array('CS', ' 1', 'DistributionType');
		Nanodicom_Dictionary::$dict[0x0012][0x0085] = array('CS', ' 1', 'ConsentForDistributionFlag');
