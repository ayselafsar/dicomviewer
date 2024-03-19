<?php
/**
 * tools/getter.php file
 *
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */

/**
 * Dicom_Getter class.
 *
 * Extends Nanodicom. Simplifies the access to fields by element name.
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */
class Dicom_Getter extends Nanodicom {

	/**
	 * Parses the object.
	 *
	 * If the list of elements has a tag name, dictionaries will be loaded. For performance
	 * is better to pass only arrays of the form:
	 *   array(group, element)  where group and element are numbers (hex or decimal equivalents or any other base).
	 * @param   mixed    array for a list of elements tags to read. parsing stops when all found. Or TRUE to force
	 *                   load dictionaries when parsing. This tool force the reading of dictionaries
	 * @param   boolean  a flag to test if dicom file has DCM header only.
	 * @return	this
	 */
	public function parse($vr_reading_list = TRUE, $check_dicom_preamble = FALSE)
	{
		return parent::parse($vr_reading_list, $check_dicom_preamble);
	}
	
} // End Dicom_Getter
