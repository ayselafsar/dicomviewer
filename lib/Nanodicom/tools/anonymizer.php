<?php
/**
 * tools/anonymizer.php file
 *
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */

/**
 * Dicom_Anonymizer class.
 *
 * Extends Nanodicom. It overwrites certain file tags. Fully extensible.
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */
class Dicom_Anonymizer extends Nanodicom {

	const RETURN_BLOB	 = 0;

	// Very basic tag elements to anonymize
	protected static $_basic = array(
		array(0x0008, 0x0020, '{date|Ymd}'),			// Study Date
		array(0x0008, 0x0021, '{date|Ymd}'),			// Series Date
		array(0x0008, 0x0090, 'physician{random}'), 	// Referring Physician
		array(0x0010, 0x0010, 'patient{consecutive}'),  // Patient Name
		array(0x0010, 0x0020, 'id{consecutive}'), 		// Patient ID
	);
	
	// The mapped values
	protected $_map;

	// The tags to use
	protected $_tags;

	// The case sensitivity of the mapping
	protected static $case = 'insensitive';
	
	/**
	 * Anonymizes the dataset
	 *
	 * @param	mixed	 NULL or an array to overwrite defaults
	 * @param	array    a set of values to be used for mapping (higher preference than replacement)
	 *  Each entry has 4 values:
	 *  group = group of tag element
	 *  element = element of the tag element
	 *  value = the expect value to be matched (trimmed)
	 *  assignment = the new replacement value for the given tag element and found value combined
	 * @param	integer	 the mode
	 * @return	string	 the anonymized dataset
	 */
	public function anonymize($tags = NULL, $map = NULL, $mode = self::RETURN_BLOB)
	{
		$tags = ($tags == NULL) ? self::$_basic : $tags;
		$this->parse();
		$this->profiler['anonymize']['start'] = microtime(TRUE);

		// Set the tags
		foreach ($tags as $entry)
		{
			list($group, $element, $replacement) = $entry;
			$this->_tags[$group][$element] = $replacement;
		}

		if ($map !== NULL)
		{
			// Values were passed to be mapped
			foreach ($map as $entry)
			{
				// Each entry has 4 values:
				// group = group of tag element
				// element = element of the tag element
				// value = the expect value to be matched (trimmed)
				// assignment = the new replacement value for the given tag element and found value combined
				list ($group, $element, $value, $assignment) = $entry;
				$value = (self::$case == 'insensitive') ? strtolower($value) : $value;
				$name  = sprintf('0x%04X',$group).'.'.sprintf('0x%04X',$element);
				$this->_map[$name][$value] = $assignment;
			}
		}
		
		// Anonymize the top level dataset
		$this->_anonymize($this->_dataset);
		
		// Return the new blob
		// TODO: allow more modes. Maybe replace, backup?
		switch ($mode)
		{
			case self::RETURN_BLOB:
				// Return the blob
				$blob = $this->write();
			break;
			default:
				$blob = $this->write();
			break;
		}
		
		$this->profiler['anonymize']['end'] = microtime(TRUE);
		return $blob;
	}
	
	/**
	 * Anonymizes the dataset
	 *
	 * @param	array	 the dataset passed by reference
	 * @return	string	 the anonymized dataset
	 */
	protected function _anonymize(&$dataset)
	{
		// Iterate groups
		foreach ($dataset as $group => $elements)
		{
			// Iterate elements
			foreach ($elements as $element => $indexes)
			{
				// Iterate indexes
				foreach ($indexes as $index => $values)
				{
					if ( ! isset($values['done'])) 
					{
						// Read value if not read yet
						$this->_read_value_from_blob($dataset[$group][$element][$index], $group, $element);
					}
					
					// Update the tag element to anonymized values (if conditions are met)
					$this->_replace($dataset, $group, $element);

					if (count($values['ds']) > 0)
					{
						// Take care of items
						$this->_anonymize($dataset[$group][$element][$index]['ds']);
					}
					
				}
				unset($values);
			}
			unset($element, $indexes);
		}
		unset($group, $elements);
	}

	/**
	 * Replaces the values
	 *
	 * @param	array	 the dataset
	 * @param	integer	 the group
	 * @param	integer	 the element
	 * @return	boolean	 true if replacement was made, false otherwise
	 */
	protected function _replace( & $dataset, $group, $element)
	{
		// Search the value in the current dataset
		$original_value = $this->dataset_value($dataset, $group, $element);

		// Do not update arrays
		if (is_array($original_value))
			return FALSE;
			
		// In case the value is not set
		$value = (empty($original_value)) ? 'none' : trim($original_value);
		
		// Check if we are doing a case insensitive comparison
		$value = (self::$case == 'insensitive') ? strtolower($value) : $value;
		
		$name  = sprintf('0x%04X',$group).'.'.sprintf('0x%04X',$element);

		// A mapping was found. Return it
		if (isset($this->_map[$name][$value]))
		{
			$this->dataset_value($dataset, $group, $element, $this->_map[$name][$value]);
			return TRUE;
		}

		// If no tag is found, return false. Do not update dataset
		if ( ! isset($this->_tags[$group][$element]))
			return FALSE;
		
		// Get the replacement expression
		$replacement = $this->_tags[$group][$element];
		
		// Search for regex expressions
		if (preg_match('/{([a-z0-9]+)(\|([a-z0-9]+))?}$/i', $replacement, $matches))
		{
			switch ($matches[1])
			{
				// Set to date
				case 'date':
					$replacement = $this->_map[$name][$value] = str_replace('{date|'.$matches[3].'}', date($matches[3]), $replacement);
				break;
				// Consecutive
				case 'consecutive':
					$count = (isset($this->_map[$name])) ? count($this->_map[$name]) : 0;
					$replacement = $this->_map[$name][$value] = str_replace('{consecutive}', $count, $replacement);
				break;
				// Random, do not store it
				case 'random':
					$replacement = str_replace('{random}', sprintf('%04d',rand()), $replacement);
				break;
			}
		}
		else
		{
			$this->_map[$name][$value] = $replacement;
		}
		
		// Update the dataset
		$this->dataset_value($dataset, $group, $element, $replacement);
		// Return true
		return TRUE;
	}
	
} // End Dicom_Anonymizer
