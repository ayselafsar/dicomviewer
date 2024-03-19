<?php
/**
 * nanodicom/core.php file
 *
 * @package    Nanodicom
 * @category   Base
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */

/**
 * Nanodicom_Core class.
 *
 * @package    Nanodicom
 * @category   Base
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */
abstract class Nanodicom_Core {

	// Release version and codename
	const VERSION  = '1.3.1';
	const CODENAME = 'Sunny Chiclayo';

	const BIG_ENDIAN 				= 100;
	const LITTLE_ENDIAN 			= 101;
	const VR_MODE_IMPLICIT			= 100;
	const VR_MODE_EXPLICIT			= 101;
	const IMPLICIT_VR_LITTLE_ENDIAN	= '1.2.840.10008.1.2';
	const EXPLICIT_VR_LITTLE_ENDIAN	= '1.2.840.10008.1.2.1';
	const EXPLICIT_VR_BIG_ENDIAN	= '1.2.840.10008.1.2.2';
	const DEFLATE_TRANSFER_SYNTAX	= '1.2.840.10008.1.2.1.99';
	const GROUP_LENGTH				= 0x0000;
	const METADATA_GROUP			= 0x0002;
	const GROUP_8					= 0x0008;
	const UNDEFINED_LENGTH   		= -1;
	const UNSIGNED			 		= 100;
	const SIGNED			 		= 101;
	const SEQUENCE_VR		 		= 'SQ';
	const ITEMS_GROUP		 		= 0xFFFE;
	const ITEM						= 0xE000;
	const ITEM_DELIMITER	 		= 0xE00D;
	const SEQUENCE_DELIMITER 		= 0xE0DD;
	const INITIAL					= 0; // Not parsed yet.
	const PARTIAL					= 1; // Some tags were read.
	const SUCCESS					= 2; // Is it a DICOM object.
	const FAILURE					= 3; // Not a DICOM object.

	/**
	 * The elements for group 0xFFFE should be Encoded as Implicit VR.
	 * DICOM Standard 09. PS 3.6 - Section 7.5: "Nesting of Data Sets"
	 * @var  array  item elements
	 */
	public static $items_elements = array(self::ITEM, self::ITEM_DELIMITER, self::SEQUENCE_DELIMITER);
	
	/**
	 * @var  array  default dictionary
	 */
	public static $default_dictionary = array('UN', '1', 'Unknown');

	/**
	 * @var  array  list of vr that have the explicit 4 bytes
	 */
	public static $vr_explicit_4bytes = array('OB', 'OW', 'OF', 'SQ', 'UT', 'UN');

	/**
	 * @var  boolean  command line environment?
	 */
	public static $is_cli = FALSE;

	/**
	 * @var  boolean  Windows environment?
	 */
	public static $is_windows = FALSE;

	/**
	* Value Representations (DICOM Standard PS 3.5 Section 6.2)
	* Bytes = 0 => Undefined length.
	* Fixed = 1 => Exact field length, otherwise max length.
	* each array contains:  Name, Bytes, Fixed
	* @var array
	*/
	public static $vr_array = array(
		'AE' => array('Application Entity', 16, 0),
		'AS' => array('Age String', 4, 1),
		'AT' => array('Attribute Tag', 4, 1),
		'CS' => array('Code String', 16, 0),
		'DA' => array('Date', 8, 1),
		'DS' => array('Decimal String', 16, 0),
		'DT' => array('Date Time', 26, 0),
		'FL' => array('Floating Point Single', 4, 1),
		'FD' => array('Floating Point Double', 8, 1),
		'IS' => array('Integer String', 12, 0),
		'LO' => array('Long String', 64, 0),
		'LT' => array('Long Text', 10240, 0),
		'OB' => array('Other Byte String', 0, 0),
		'OF' => array('Other Float String', 4294967292, 0),
		'OX' => array('Mixed. Other {Byte|Word} String', 0, 0),
		'OW' => array('Other Word String', 0, 0),
		'PN' => array('Person Name', 64, 0),
		'SH' => array('Short String', 16, 0),
		'SL' => array('Signed Long', 4, 1),
		'SQ' => array('Sequence of Items', 0, 0),
		'SS' => array('Signed Short', 2, 1),
		'ST' => array('Short Text', 1024, 0),
		'TM' => array('Time', 16, 0),
		'UI' => array('Unique Identifier UID', 64, 0),
		'UL' => array('Unsigned Long', 4, 1),
		'UN' => array('Unknown', 0, 0),
		'US' => array('Unsigned Short', 2, 1),
		'UT' => array('Unlimited Text', 4294967294, 0)
	);
	
	/**
	 * Create a new Nanodicom instance. It is usually called from a class extended 
	 * from Nanodicom, ie Dumper
	 *
	 *     $dicom_object = Nanodicom::factory($location, 'dumper');
	 *
	 * or from Nanodicom itself
	 *
	 *     $dicom_object = Nanodicom::factory($location);
	 *
	 * for passing 'blobs', use the second parameter as 'blob'
	 *
	 *     $dicom_object = Nanodicom::factory($blob, 'blob');
	 *
	 * @param   mixed      blob or location of the file
	 * @param   string     name of the tool to load
	 * @param   string     type of data passed
	 * @return  Dicom_tool A Tool
	 */
	public static function factory($location, $name = 'simple', $type = 'file')
	{
		// Get the parts from the name
		$parts = explode('_', $name);
		
		$directory = NANODICOMROOT.'tools'.DIRECTORY_SEPARATOR;
		
		// Load all the needed files
		foreach ($parts as $part)
		{
			require_once $directory.strtolower($part).'.php';
			$directory .= strtolower($part).DIRECTORY_SEPARATOR;
		}

		// Add the Dicom prefix
		$class = 'Dicom_'.$name;

		return new $class($location, $name, $type);
	}

	/**
	 * Get the VR mode and endian from a transfer syntax.
	 *
	 * @param   string	 transfer syntax to check
	 * @return  array	 returning the vr mode and endian
	 */
	public static function decode_transfer_syntax($transfer_syntax)
	{
		switch (trim($transfer_syntax))
		{
			case self::IMPLICIT_VR_LITTLE_ENDIAN:
				$vr_mode = self::VR_MODE_IMPLICIT;
				$endian  = self::LITTLE_ENDIAN;
			break;
			case self::EXPLICIT_VR_BIG_ENDIAN:
				$vr_mode = self::VR_MODE_EXPLICIT;
				$endian  = self::BIG_ENDIAN;
			break;
			default:
				$vr_mode = self::VR_MODE_EXPLICIT;
				$endian  = self::LITTLE_ENDIAN;
			break;
		}
		return array($vr_mode, $endian);
	}

	// Define which function to read integers based on size of integer
	protected static $_read_int  = '_read_int_32';
	
	// Define which function to write integers based on size of integer
	protected static $_write_int = '_write_int_32';

	// In case a string was given for vr list, we force to load dictionaries
	protected $_force_load_dictionary = FALSE;
	
	// Array of DICOM elements indexed by group and element index. The dataset
	protected $_dataset = array();
	
	// Flag indicating if file has DICOM preamble or not. TRUE => DICM, FALSE => Anything else (NEMA?)
	public $has_dicom_preamble = FALSE;
	
	// Holds the performance times
	public $profiler = array();

	// Stores the list of warnings
	public $warnings = array();

	// Stores the list of errors
	public $errors = array();

	/**
	 * @var  integer  Denotes status of given file.
	 *  0 => Initial (Not parsed yet),
	 *  1 => Partial (Some tags were read),
	 *  2 => Success (Is it a DICOM file),
	 *  3 => Failure (Not a DICOM file)
	 */
	public $status = self::INITIAL;

	// Flag to know if file has been parsed
	protected $_is_parsed = FALSE;
	
	// Preamble
	protected $_preamble;

	// Location of file or 'blob'
	protected $_location;

	// Metagroup last byte
	protected $_meta_group_last_byte = -1;
	
	// Length of the file or blob
	protected $_file_length;

	// The current pointer in the blob
	protected $_current_pointer = 0;

	// The meta information group length
	protected $_meta_information_group_length = NULL;

	// In case we want to read only certain fields
	protected $_vr_reading_list = array();
	
	// Transfer Syntax. Defaults to Implicit Little Endian
	protected $_transfer_syntax = self::IMPLICIT_VR_LITTLE_ENDIAN;
	
	// Stores the blob
	protected $_blob = '';

	// For extending the class to use other tools
	protected $_children;
	
	// To let the Item know if the data is a Data Set or direct data
	protected $_parent_vr;
	
	// Number of parsed elements
	protected $_counted_elements = 0;

	// Flag to know if Group 8 has been found
	protected $_found_group_8 = FALSE;
	
	// Callback to check if we need to stop after certain tags are read
	protected $_check_list_function = '_dummy';
	
	// Callback to check deflate
	protected $_check_deflate_function = '_check_deflate';

	// Callback to check proper endian
	protected $_check_proper_endian_function = '_check_proper_endian';
	
	// Number of retries to read oversized lenghts
	protected $_oversize_retries = 0;

	/**
	 * Create a new Nanodicom instance. It is usually called from a class extended
	 * from core, ie Dumper
	 *
	 *     $dicom_object = DICOM_Dumper::factory($location);
	 *
	 * @param   mixed      file blob or location of the file
	 * @param   string     the name of the tool created
	 * @param   string     type of first parameter
	 * @return  Nanodicom
	 */
	public function __construct($location, $name, $type)
	{
		// Load necessary files
		require_once NANODICOMCOREPATH.'exception.php';

		// Load the dictionary
		require_once NANODICOMCOREPATH.'dictionary.php';

		self::$_read_int = (PHP_INT_SIZE > 4) ? '_read_int_64' : '_read_int_32';
		self::$_write_int = (PHP_INT_SIZE > 4) ? '_write_int_64' : '_write_int_32';
		
		if ($type == 'file')
		{
			// It is a file
			$this->_location = $location;
		}
		elseif ($type == 'blob')
		{
			// It is a blob
			$this->_location = 'blob';
			$this->_blob	 = $location;
		}

		// To prevent the extension of loaded tool
		$this->_children[$name] = TRUE;
		
		// Determine if we are running in a command line environment
		self::$is_cli = (PHP_SAPI === 'cli');

		// Determine if we are running in a Windows environment
		self::$is_windows = (DIRECTORY_SEPARATOR === '\\');
	}

	/**
	 * Returns the name of the loaded file or 'blob'
	 *
	 * @return  string	name of loaded file or 'blob'
	 */
	final public function __toString()
	{
		return $this->_location;
	}

	/**
	 * Magic method, calls [Nanodicom::value] with the same parameters. Used to get values by name.
	 *
	 *     $transfer_syntax = $dicom_object->transfer_syntax;
	 *
	 * @param   string  tag element name
	 * @return  mixed
	 */
	public function __get($name)
	{
		return $this->value($name);
	}

	/**
	 * Magic method, calls [Nanodicom::value] with the corresponding group and element based on the tag name.
	 *
	 *     $dicom_object->patient_name = 'Anonymous';
	 *
	 * @param   string  tag element name
	 * @param   mixed   new value
	 * @return  this
	 */
	public function __set($name, $value)
	{
		// Get the proper name
		$name = $this->_proper_name($name);
		if (isset(Nanodicom_Dictionary::$dict_by_name[$name]))
		{
			list($group, $element) = Nanodicom_Dictionary::$dict_by_name[$name];
			$this->value($group, $element, $value);
		}
		
		return $this;
	}

	/**
	 * Magic method to unset a tag element. To be used wisely.
	 *
	 *     unset($dicom_object->patient_name);
	 *
	 * @param   string  tag element name
	 * @return  this
	 */
	public function __unset($name)
	{
		// Get the proper name
		$name = $this->_proper_name($name);
		if (isset(Nanodicom_Dictionary::$dict_by_name[$name]))
		{
			list($group, $element) = Nanodicom_Dictionary::$dict_by_name[$name];
			if (isset($this->_dataset[$group][$element]))
			{
				unset($this->_dataset[$group][$element]);
			}
			
			// Update the group length if needed
			$this->_update_group_length($this->_dataset, $group);
		}
		
		return $this;
	}
	
	/**
	 * Magic method to call an undefined method. It will look for methods on children
	 * Performance is better when called directly
	 *
	 * @param   string  tag element name
	 * @return  mixed|false	when the method if found in any children or false in case the method does not exist
	 */
	public function __call($name, $args)
	{
		// Search in children
		foreach ($this->_children as $child_name => $child_class)
		{
			if (is_callable(array($child_class, $name), TRUE) AND method_exists($child_class, $name))
			{
				// Method found.
				return call_user_func_array(array($child_class, $name), $args);
			}
		}
		
		// Nothing found
		return FALSE;
	}
	
	/**
	 * Public method to extend the tool to include other tools.
	 * It is preferable to load the required tool directly. This mechanism is still under
	 * evaluation.
	 *
	 * Unknown results when the object is extended and then manipulated and then extended.
	 *
	 * @param   string  name of the tool to extend
	 * @return  this
	 */
	public function extend($name)
	{
		// Check if children is already set. Does not extend original loaded extension
		if (isset($this->_children[$name])) 
			return $this;
		
		// Attach the instance of the new tool to a child
		$this->_children[$name] = ($this->_location == 'blob')
								? self::factory($this->_blob, $name, 'blob')
								: self::factory($this->_location, $name);
		
		$this->_children[$name]->_force_load_dictionary			= $this->_force_load_dictionary;
		$this->_children[$name]->_dataset						= $this->_dataset;
		$this->_children[$name]->has_dicom_preamble				= $this->has_dicom_preamble;
		$this->_children[$name]->profiler						= $this->profiler;
		$this->_children[$name]->errors							= $this->errors;
		$this->_children[$name]->warnings						= $this->warnings;
		$this->_children[$name]->status							= $this->status;
		$this->_children[$name]->_check_proper_endian_function	= $this->_check_proper_endian_function;
		$this->_children[$name]->_check_deflate_function		= $this->_check_deflate_function;
		$this->_children[$name]->_is_parsed						= $this->_is_parsed;
		$this->_children[$name]->_found_group_8					= $this->_found_group_8;
		$this->_children[$name]->_meta_group_last_byte			= $this->_meta_group_last_byte;
		$this->_children[$name]->_current_pointer				= 0;
		$this->_children[$name]->_meta_information_group_length = $this->_meta_information_group_length;
		$this->_children[$name]->_vr_reading_list				= $this->_vr_reading_list;
		$this->_children[$name]->_transfer_syntax				= $this->_transfer_syntax;
		$this->_children[$name]->_blob							= $this->_blob;
		$this->_children[$name]->_parent_vr						= $this->_parent_vr;
		$this->_children[$name]->_file_length					= $this->_file_length;
		$this->_children[$name]->_preamble						= $this->_preamble;
		
		return $this;
	}

	/**
	 * Public method to show the profiling time for methods. Profiling names MUST be equal to method names.
	 *
	 * @param   string  name of the method
	 * @return  float 	the number of seconds used
	 */
	public function profiler_diff($name, $units = 'ms')
	{
		$diff = 0;
		
		// Get the profiling time is exists in current object
		if (isset($this->profiler[$name]) AND isset($this->profiler[$name]['start']) AND isset($this->profiler[$name]['end']))
		{
			$diff = $this->profiler[$name]['end'] - $this->profiler[$name]['start'];
		}
		else
		{
			// Otherwise, navigate the children to find it.
			foreach ($this->_children as $child_name => $child_class)
			{
				if (method_exists($child_class, $name) AND is_callable(array($child_class, $name), TRUE))
				{
					$diff = $this->_children[$child_name]->profiler[$name]['end'] - $this->_children[$child_name]->profiler[$name]['start'];
				}
			}
		}
		
		switch ($units)
		{
			case 'ms':
				return $diff*1000;
				break;
			default:
				// This is for seconds
				return $diff;
				break;
		}
	}

	/**
	 * Returns the last error found
	 *
	 * @return  mixed  last error found or FALSE otherwise
	 */
	public function last_error()
	{
		return ( ! end($this->errors)) ? end($this->errors) : FALSE;
	}

	/**
	 * Public method to quickly check if file is DICOM. Does a brute force parse of the object and checks the 
	 * returned status.
	 *
	 * @param   boolean  set to TRUE to allow partially read files
	 * @return  boolean	 true if file was parsed (depends on parameter to check partial reads), false otherwise
	 */
	public function is_dicom($allow_partial = FALSE)
	{
		// Parse the file
		$this->parse();
		
		if ($allow_partial)
			// Check for self::PARTIAL as well is allowing partial
			return (in_array($this->status, array(self::SUCCESS, self::PARTIAL)));
			
		// Otherwise, check only for success
		return (self::SUCCESS == $this->status);
	}

	/**
	 * Public method to get the transfer syntax used
	 *
	 * @return  string	 trimmed transfer syntax used
	 */
	public function get_transfer_syntax()
	{
		// Parse the file
		$this->parse();
		
		// Return the transfer syntax used
		return trim($this->_transfer_syntax);
	}

	/**
	 * Public method to flush the object
	 *
	 * @return  this
	 */
	public function flush()
	{
		$this->_force_load_dictionary		  = FALSE;
		$this->_dataset						  = array();
		$this->has_dicom_preamble			  = FALSE;
		$this->profiler						  = array();
		$this->errors						  = array();
		$this->warnings						  = array();
		$this->status						  = self::INITIAL;
		$this->_is_parsed					  = FALSE;
		$this->_meta_group_last_byte		  = -1;
		$this->_current_pointer				  = 0;
		$this->_meta_information_group_length = NULL;
		$this->_vr_reading_list				  = array();
		$this->_transfer_syntax				  = self::EXPLICIT_VR_LITTLE_ENDIAN;
		$this->_blob						  = '';
		$this->_parent_vr					  = '';
		$this->_file_length					  = 0;
		$this->_check_proper_endian_function  = '_check_proper_endian';
		
		return $this;
	}
	
	/**
	 * Public method to get and set values, but only values at top level.
	 *
	 * @param   mixed    either the group or name of the tag
	 * @param   mixed    either the element or value to set of the tag
	 * @param   mixed    either the value to set or the create 
	 * @param   boolean  for creating/updating values. true for binary, false everything els
	 * @return  mixed|false|void found value or false when tag was not found or not enough arguments or void when setting a value successfully
	 */
	public function value($group = NULL, $element = NULL, $new_value = NULL, $binary = FALSE)
	{
		return $this->dataset_value($this->_dataset, $group, $element, $new_value, $binary);
	}

	/**
	 * Public method to delete a value using the group and element values
	 *
	 * @param   mixed    either the group as number or hex string
	 * @param   mixed    either the element as number or hex string
	 * @return  $this
	 */
	public function delete($group, $element)
	{
		$group   = is_string($group) ? hexdec($group) : $group;
		$element = is_string($element) ? hexdec($element) : $element;

		if (isset($this->_dataset[$group][$element]))
		{
			unset($this->_dataset[$group][$element]);
		}
		
		// Update the group length if needed
		$this->_update_group_length($this->_dataset, $group);
		
		return $this;
	}

	/**
	 * Public static method to get the value from an array. If index does not exist, it returns the default.
	 *
	 * @param   array	the array to search
	 * @param	string   the index to look
	 * @param	mixed   the default value in case index not found
	 * @return  mixed	Either the found or the default value
	 */
	public static function array_get($array, $index, $default = '')
	{
		if ( isset($array[$index]))
			return $array[$index];
		
		return $default;
	}
	
	/**
	 * Public method to get the summary of the given file.
	 *
	 * @param   string   how the output is returned. Either as string (ready to be echoed) or array
	 * @return  mixed|false	Either a string, array or FALSE (when file is not DICOM)
	 */
	public function summary($output = 'string')
	{
		// Parse the file
		$this->parse();
		
		$transfer_syntax = trim($this->get(0x0002, 0x0010, 'UN'));
		$transfer_syntax .= ($transfer_syntax == 'UN' OR ! array_key_exists($transfer_syntax, Nanodicom_Dictionary::$transfer_syntaxes))
			? ' - Unknow'
			: ' - Parsed using: '.Nanodicom_Dictionary::$transfer_syntaxes[$transfer_syntax][0];
			//.'. Parsed using: '.Nanodicom_Dictionary::$transfer_syntaxes[$this->_transfer_syntax][0];
		
		if ($transfer_syntax == 'UN - Unknow')
		{
			$transfer_syntax .= ' [Parsed Using: '.$this->_transfer_syntax.' - '
				.Nanodicom_Dictionary::$transfer_syntaxes[$this->_transfer_syntax][0].']';
		}
		
		// Checking for "rows" since that value should be set for images.
		$has_images = ($this->get(0x0028, 0x0010, 'N/A') != 'N/A') ? 'YES' : 'NO';
		
		$statuses = array(
			'Not parsed yet',
			'Partially parsed. Some tags were found',
			'Successfully parsed!',
			'Failed',
		);
		
		$values = array(
			'Filename:          ' => basename($this->_location),
			'Transfer Syntax:   ' => $transfer_syntax,
			'DICOM file?        ' => $statuses[$this->status],
			'Has DCM preamble?  ' => ($this->has_dicom_preamble === TRUE) ? 'YES' : 'NO',
			'Has Metadata?      ' => ($this->get(0x0002, 0x0000, FALSE)) ? 'YES' : 'NO',
			'Modality:          ' => $this->get(0x0008, 0x0060, 'UN'),
			'Patient Name:      ' => $this->get(0x0010, 0x0010, 'N/A'),
			'Images?            ' => $has_images,
		);
		
		$pixel_representation = array(
			'0' => 'Unsigned Integer. Only positive values allowed.',
			'1' => '2\'s complement. Negative and positive allowed.',
			'N/A' => 'Not available',
		);
		
		$planar_configuration = array(
			'0' => 'Color-by-pixel: RGB, RGB, RGB..',
			'1' => 'Color-by-plane: RRR..., GGG..., BBB...',
			'N/A' => 'Not available',
		);

		if ($has_images == 'YES')
		{
			$values = $values + array(
				'Rows:              ' => $this->get(0x0028, 0x0010, 'N/A'),
				'Cols:              ' => $this->get(0x0028, 0x0011, 'N/A'),
				'Samples per pixel: ' => $this->get(0x0028, 0x0002, 'N/A'),
				'Bits Allocated:    ' => $this->get(0x0028, 0x0100, 'N/A'),
				'Bits Stored:       ' => $this->get(0x0028, 0x0101, 'N/A'),
				'High bit:          ' => $this->get(0x0028, 0x0102, 'N/A'),
				'Dose scaling:      ' => $this->get(0x3004, 0x000E, 'N/A'),
				'Window Width:      ' => $this->get(0x0028,0x1051, 'N/A'),
				'Window Center:     ' => $this->get(0x0028,0x1050, 'N/A'),
				'Rescale intercept: ' => $this->get(0x0028,0x1052, 'N/A'),
				'Rescale slope:     ' => $this->get(0x0028,0x1053, 'N/A'),
				'Number of Frames:  ' => $this->get(0x0028,0x0008, 'N/A'),
				'Photometric Inter: ' => $this->get(0x0028,0x0004, 'N/A'),
				'Px Representation: ' => $this->get(0x0028,0x0103, 'N/A').' - '.Nanodicom::array_get($pixel_representation, $this->get(0x0028,0x0103, 'N/A'), 'Wrong'),
				'Planar Config:     ' => $this->get(0x0028,0x0006, 'N/A').' - '.Nanodicom::array_get($planar_configuration, $this->get(0x0028,0x0006, 'N/A'), 'Wrong'),
			);
		}
		
		if ($output == 'string')
		{
			$output = '';
			foreach ($values as $index => $value)
			{
				$output .= $index."\t".$value."\n";
			}
			
			// Set the output back to values
			$values = $output;
		}
		
		return $values;
	}

	/**
	 * Public method to get the value of an element.
	 *
	 * @param   mixed    either the group or name of the tag
	 * @param   mixed    either the element or value to set of the tag
	 * @param   mixed    the default value to return if no value found
	 * @param	mixed	 the dataset to use, if not set, used full dataset from parsing
	 * @return  mixed|false|void found value or default value
	 */
	public function get($group = NULL, $element = NULL, $default = NULL, $dataset = NULL)
	{
		// Determine the dataset to used. Fallbacks to object dataset
		$dataset = ($dataset !== NULL) ? $dataset : $this->_dataset;
		// Get the correspoding value
		$value   = $this->dataset_value($dataset, $group, $element);
		
		// Return the proper value if correctly set, otherwise the default one
		return ($value === FALSE OR (is_array($value) AND empty($value))
			OR (is_string($value) AND trim($value) == '') OR $value === NULL) ? $default : $value;
	}

	/**
	 * Public method to get items from a sequence.
	 *
	 * Gets items from a sequence
	 * @param   array    a dataset
	 */
	public function read_sequence_items( & $dataset)
	{
		$group = 0xFFFE;
		$element = 0xE000;
		
		if (isset($dataset[$group][$element]))
		{
			$total = count($dataset[$group][$element]);
			$results = array();

			for ($i = 0; $i < $total; $i++)
			{
				if ( ! isset($dataset[$group][$element][$i]['done']))
				{
					// Read value from blob
					$this->_read_value_from_blob($dataset[$group][$element][$i], $group, $element);
				}

				$results[] = $dataset[$group][$element][$i]['ds'];
			}

			return $results;
		}

		unset($group, $element);

		return FALSE;
	}

	/**
	 * Public method to get and set values when passing a dataset.
	 *
	 * It supports retrieving a single element or a dataset for reading values
	 * @param   array    a dataset
	 * @param   mixed    either the group or name of the tag
	 * @param   mixed    either the element or value to set of the tag
	 * @param   mixed    either the value to set or the create 
	 * @param	boolean  used for update/create, true for binary, false for anything else
	 * @return  mixed|false|void found value or false when tag was not found or not enough arguments or void when setting a value successfully
	 */
	public function dataset_value( & $dataset, $group = NULL, $element = NULL, $new_value = NULL, $binary = FALSE)
	{
		// No group set. Return FALSE
		if ($group == NULL) return FALSE;

		if (is_string($group))
		{
			// It is a string
			$name = $this->_proper_name($group);

			// Move the other arguments to the next
			$create	   = $new_value;
			$new_value = $element;

			// Check if there is an entry in the dictionary
			if (isset(Nanodicom_Dictionary::$dict_by_name[$name]))
			{
				list($group, $element) = Nanodicom_Dictionary::$dict_by_name[$name];
			}
			else
			{
				// Sorry, no dictionary entry found, cannot read value
				return FALSE;
			}
			
			// Continue with the rest
		}

		if ($new_value === NULL)
		{
			// TODO: Multiplicity values
			// Reading value. It supports returning datasets too
			if (isset($dataset[$group][$element]))
			{
				if ( ! isset($dataset[$group][$element][0]['done']))
				{
					// Read value from blob
					$this->_read_value_from_blob($dataset[$group][$element][0], $group, $element);
				}

				// It is a dataset, then return it, otherwise, just the value
				return (count($dataset[$group][$element][0]['ds']) == 0) ? $dataset[$group][$element][0]['val'] 
																		 : $dataset[$group][$element][0]['ds'];
			}

			return FALSE;
		}
		
		$original_vr = '';

		// Rest of the code is for setting a value (creation or update)
		if (isset($dataset[$group][$element]))
		{
			// Update vr value
			if ( ! isset($dataset[$group][$element][0]['done']))
			{
				// Read value from blob
				$this->_read_value_from_blob($dataset[$group][$element][0], $group, $element);
			}

			// This is the vr read from file. Use it as a fallback
			$original_vr = $dataset[$group][$element][0]['_vr'];
		}

		// Load the dictionary for this group
		Nanodicom_Dictionary::load_dictionary($group, TRUE);

		// Grab the vr
		list($value_representation, $multiplicity, $name) = $this->_decode_vr($group, $element, $original_vr, 0);
		
		if (is_array($new_value))
		{
			// Extract vr and value from array
			$value_representation = $new_value['vr'];
			$new_value = $new_value['value'];
		}

		if (self::$vr_array[$value_representation][2] == 0)
		{
			// Finding right length
			$new_value = (strlen($new_value) % 2 == 0) ? $new_value : $new_value.chr(0);
			$length = sprintf('%u', strlen($new_value));
		}
		else
		{
			$length = self::$vr_array[$value_representation][1];
		}
		
		// Set the Transfer Syntax UID if needed
		if ($group == self::METADATA_GROUP AND $element == 0x0010)
		{
			$this->_transfer_syntax = trim($new_value);
		}
		
		if (isset($dataset[$group][$element]))
		{
			// Update the element
			$dataset[$group][$element][0]['done'] = TRUE;
			$dataset[$group][$element][0]['val']  = $new_value;
			$dataset[$group][$element][0]['len']  = $length;
			$dataset[$group][$element][0]['vr']   = $value_representation;
		}
		else
		{
			// Create a new element
			$value = array(
				  'len'	  => $length,
				  'val'	  => $new_value,
				  'vr'	  => $value_representation,
				  '_vr'	  => $value_representation,
				  'bin'	  => $binary,
				  'off'	  => 0, // We don't know the offset
				  'ds'	  => array(),
				  'done'  => TRUE,
			);

			$dataset[(int) $group][(int) $element][0] = $value;
		}
		
		$this->_update_group_length($dataset, $group);
		// TODO: Update the length of parent element (SQ or IT)
		
		unset($group, $element, $new_value);
	}

	/**
	 * Parses the object.
	 *
	 * If the list of elements has a tag name, dictionaries will be loaded. For performance
	 * is better to pass only arrays of the form:
	 *   array(group, element)  where group and element are numbers (hex or decimal equivalents or any other base).
	 * @param   mixed    array for a list of elements tags to read. parsing stops when all found. Or TRUE to force
	 *                   load dictionaries when parsing. Default is FALSE to avoid reading dictionaries.
	 * @param   boolean  a flag to test if dicom file has DCM header only.
	 * @return	this
	 */
	public function parse($vr_reading_list = FALSE, $check_dicom_preamble = FALSE)
	{
		// If file has been parsed, return right away
		if ($this->_is_parsed) return $this;

		if (is_array($vr_reading_list))
		{
			// Setting the list of elements to look for
			$this->set_vr_reading_list($vr_reading_list);

			// Setting the function to used after reading each element. Dummy improves performance
			$this->_check_list_function = (count($vr_reading_list) == 0)? '_dummy' : '_check_list';
		}
		elseif (is_bool($vr_reading_list))
		{
			$this->load_dictionaries($vr_reading_list);
		}
		
		// Do the parse
		return $this->_parse($check_dicom_preamble);
	}
	
	/**
	 * Writes the file to the specified location
	 *
	 * TODO: Throw exceptions in errors
	 * @param   string    location of the file where the contents will be written
	 * @return	this
	 */
	public function write_file($filename)
	{
		file_put_contents($filename, $this->write());
		return $this;
	}
	
	/**
	 * Force to load dictionaries when parsing when TRUE. Otherwise,
	 * __get calls won't be able to return the right values.
	 * Defaults to FALSE.
	 *
	 * @return	this
	 */
	public function load_dictionaries($value = FALSE)
	{
		$this->_force_load_dictionary = $value;
		return $this;
	}
	
	/**
	 * Returns a blob of the current dataset
	 * This function will do some corrections:
	 *  1. Make the File Meta Information EXPLICIT VR LITTLE ENDIAN
	 *  2. Convert Known tags to their real Tag values
	 *  3. Prepends preamble if not present (forces it)
	 *  4. [probably] Prepend File Meta Information if not present (future versions)
	 *
	 * @return	string	 binary string of contents
	 */
	public function write()
	{
		if (sprintf('%u', strlen($this->_blob)) > 0)
		{
			// Do the parse if not done
			// But only when the blob is larger than 0, otherwise is considered new file
			$this->parse();
		}
		
		// Profile this task
		$this->profiler['write']['start'] = microtime(TRUE);
		
		// Create the preamble
		if ($this->has_dicom_preamble)
		{
			$buffer = $this->_preamble;
		}
		else
		{
			$buffer = '';
			for($i = 0; $i < 128; $i++)
			{
				$buffer .= 0x0;
			}
		}
		
		// Add the DICM.
		$buffer .= 'DICM';
		
		// Sort the keys
		ksort($this->_dataset);
		
		// Iterate through the current elements
		foreach ($this->_dataset as $group => $elements)
		{	
			// Sort the elements
			ksort($elements);
			
			// Through groups
			foreach ($elements as $element => $indexes)
			{
				// Through elements
				foreach ($indexes as $data)
				{
					// Indices. Extra level for multiplicity > 1 (SQ have them a lot!)
					$buffer .= $this->_write($group, $element, $data);
				}
				unset($element, $data);
			}
			unset($group, $elements);
		}
		
		switch (trim($this->_transfer_syntax))
		{
			// deflated DICOM Data Set
			case self::DEFLATE_TRANSFER_SYNTAX:
				$metadata_length = (isset($this->_dataset[self::METADATA_GROUP][self::GROUP_LENGTH])) 
								 // The 12 bytes are for the Metadata Group Length element itself
								 ? $this->_dataset[self::METADATA_GROUP][self::GROUP_LENGTH][0]['off'] 
								   + $this->_dataset[self::METADATA_GROUP][self::GROUP_LENGTH][0]['val'] + 12 
								 : 0;
				$buffer = substr($buffer, 0, $metadata_length).gzdeflate(substr($buffer, $metadata_length));
			break;
		}
		
		// Finish the profiling
		$this->profiler['write']['end'] = microtime(TRUE);
		
		// Return buffer
		return $buffer;
	}

	/**
	 * Public method to set the vrs to read
	 *
	 * @param   array    a list of elements tags to read. Either names or array of (group,element)
	 * @return	this
	 */
	public function set_vr_reading_list($vr_reading_list)
	{
		$list = array();
		foreach ($vr_reading_list as $tag)
		{
			// Acccepts strings and arrays
			if (is_array($tag))
			{
				// This should be an array of group,element. The merged hex values (4 digits) is added to list
				$list[] = sprintf('0x%04X',$tag[0]).'.'.sprintf('0x%04X',$tag[1]);
			}
			else
			{
				// If a string is found we force to load the dictionary and add name to list
				$this->_force_load_dictionary = TRUE;
				$list[] = $tag;
			}
		}
		$this->_vr_reading_list = $list;
		
		return $this;
	}
	
	/**
	 * Dummy function to be used instead of other time consuming functions.
	 *
	 * @param	mixed
	 * @param	mixed
	 * @param	mixed
	 * @param	mixed
	 * @param	mixed
	 * @return	void
	 */
	protected function _dummy($arg1 = NULL, $arg2 = NULL, $arg3 = NULL, $arg4 = NULL, $arg5 = NULL)
	{
	}
	
	/**
	 * Updates the group length value if exists
	 *
	 * @param	integer	 the group
	 * @return	void
	 */
	protected function _update_group_length( & $dataset, $group)
	{
		if ($this->dataset_value($dataset, $group, self::GROUP_LENGTH) !== FALSE)
		{
			// To update the group length value of the group if exists
			$length = 0;
			foreach ($dataset[$group] as $element => $group_elements)
			{
				foreach ($group_elements as $index => $values)
				{
					if ($element == self::GROUP_LENGTH) 
						continue;
					$length += $values['len'] + 8;
				}
			}
			$dataset[$group][self::GROUP_LENGTH][0]['val'] = $length;
		}
	}

	/**
	 * Get the proper name of the tag name. Removes spaces and _, and converts it
	 * to lowercase.
	 *
	 * @param	string	 tag name
	 * @return	string	 the proper name
	 */
	protected function _proper_name($name)
	{
		// Dictionary names are lowercase without _
		return strtolower(str_replace(array('_', ' '), '', $name));
	}

	/**
	 * Checks if the given group and element are part of the list of elements to look for.
	 * Stops after all elements are found.
	 *
	 * @param	integer	 the group
	 * @param	integer	 the element
	 * @return	boolean	 true if all elements have been found (finish parsing), false otherwise
	 */
	protected function _check_list($group, $element)
	{
		// If nothing was passed return to continue parsing.
		if (empty($this->_vr_reading_list))
			return FALSE;
			
		if (in_array(sprintf('0x%04X',$group).'.'.sprintf('0x%04X',$element), $this->_vr_reading_list)
			OR (isset(Nanodicom_Dictionary::$dict[$group][$element]) 
				AND in_array(Nanodicom_Dictionary::$dict[$group][$element][2], $this->_vr_reading_list)))
		{
			// Element is in list
			$this->_counted_elements++;
		}
		
		return ($this->_counted_elements == count($this->_vr_reading_list)) ? TRUE : FALSE;
	}
	
	/**
	 * Check that proper endian is used
	 *
	 * @param	integer	 the group
	 * @param	integer	 the endian mode
	 * @return	array    the proper group and endian
	 */
	protected function _check_proper_endian($group, $endian)
	{
		if ( ! $this->_found_group_8)
		{
			// Group 0x0008 has not been read yet. This is a must!
			if ($group < self::GROUP_8)
				return array($group, $endian);

			// Group 0x0008 found.
			$this->_found_group_8 = TRUE;
			// From now on, call _check_proper_endian_same function instead.
			$this->_check_proper_endian_function = '_check_proper_endian_same';
			
			if ($group > self::GROUP_8)
			{
				// Group is bigger than 8
				// Rewind 2 bytes to re-read the group
				$this->_rewind(-2);
				// Reverse to default transfer syntax
				$this->_transfer_syntax = self::EXPLICIT_VR_LITTLE_ENDIAN;
				// Set the new endian
				$endian = self::LITTLE_ENDIAN;
				// Read correct group value (redoing the read)
				$group = $this->{self::$_read_int}(2, $endian, 2);
			}
			else
			{
				// It is equal to 8
			}
		}
		
		return array($group, $endian);
	}
	
	/**
	 * Returns the same values passed
	 *
	 * @param	integer	 the group
	 * @param	integer	 the endian mode
	 * @return	array    the group and endian passed
	 */
	protected function _check_proper_endian_same($group, $endian)
	{
		return array($group, $endian);
	}

	/**
	 * Decodes the proper vr from the group, element, current vr and length.
	 * The priority order is:
	 *  1) From dictionary
	 *  2) If current vr is a valid vr and not UN or empty, then set as current vr (Explicit mode)
	 *  3) If length is undefined, most likely it is a sequence,
	 *  4) Otherwise is it the default VR ('UN')
	 *
	 * @param	integer	 the group
	 * @param	integer	 the element
	 * @return	boolean	 true if all elements have been found (finish parsing), false otherwise
	 */
	protected function _decode_vr($group, $element, $vr, $length)
	{
		if ( isset(Nanodicom_Dictionary::$dict[$group][$element]))
		{
			// Group and Element are listed.
			// 1) From dictionary
			list($value_representation, $multiplicity, $name) = Nanodicom_Dictionary::$dict[$group][$element];
		}
		else
		{
			// Group and Element do not exist. Possible reasons:
			// - Private Data Element. TODO: Check if it is "odd" group.
			// - New Data Element not updated in Dictionary. Should be in the case of "even" groups.
			list($value_representation, $multiplicity, $name) = self::$default_dictionary;
		
			$value_representation = ( ! in_array($vr, array('', 'UN')) AND array_key_exists($vr, self::$vr_array)) 
				// 2) If current VR is valid VR and not UN or empty, then set as current vr (Explicit mode)
				? $vr
				// 3) If length is undefined, most likely it is a sequence,
				// 4) Otherwise is it the default VR ('UN')
				: (($length == self::UNDEFINED_LENGTH) ? self::SEQUENCE_VR : $value_representation);
		}	
		return array($value_representation, $multiplicity, $name);
	}

	/**
	 * Parsing code
	 *
	 * @param	boolean	 true to check file is dicom, default to false
	 * @return	this	 for chaining
	 */
	protected function _parse($check_preamble_only = FALSE)
	{
		// Profile this task
		$this->profiler['parse']['start'] = microtime(TRUE);
		
		// Instantiate the status to Failure
		$this->status = self::FAILURE;

		if ($check_preamble_only)
		{
			// Try reading only first 128 bytes + 4 of DICM
			try 
			{
				$this->_read_file(0, 132);
			}
			catch (Nanodicom_Exception $e)
			{
				$this->errors[] = $e->getMessage();
				return $this;
			}
		}
		else
		{
			// Try reading whole file
			try 
			{
				$this->_read_file();
			}
			catch (Nanodicom_Exception $e)
			{
				$this->errors[] = $e->getMessage();
				return $this;
			}
		}
		
		// Following 2 calls need to be wrapped in a try/catch to avoid throwing exceptions
		try 
		{
			// Test for NEMA or DICOM file.  
			$this->_preamble  = $this->_read(128);
		}
		catch (Nanodicom_Exception $e)
		{
			$this->errors[] = $e->getMessage();
			return $this;
		}

		try 
		{
			// Test to see if has preamble
			$this->has_dicom_preamble  = (bool) ($this->_read(4) == 'DICM');
		}
		catch (Nanodicom_Exception $e)
		{
			$this->errors[] = $e->getMessage();
			return $this;
		}

		// If checking only for DICOM preamble. Return current object
		if ($check_preamble_only) 
			return $this;

		// Continue with the rest
		if ( ! $this->has_dicom_preamble)
		{
			// Rewinding. No Dicom preamble found
			$this->_rewind();
			$this->_transfer_syntax = self::IMPLICIT_VR_LITTLE_ENDIAN;
		}

		// Read the file
        while ($this->_read())
        {
			// Read a new element with a try/catch block
			try 
			{
				$new_element  = $this->_read_element();
			}
			catch (Nanodicom_Exception $e)
			{
				$this->errors[] = $e->getMessage();
				break;
			}

			// Add element to dataset
			$this->_dataset[$new_element[0]][$new_element[1]][] = $new_element[2];
			// So far partially read at least once
			$this->status = self::PARTIAL;

            // Check if belongs to Metadata Group
			if ($new_element[0] == self::METADATA_GROUP)
			{
				if ($new_element[1] == self::GROUP_LENGTH)
				{
					// Set the meta information group length
					$this->_meta_information_group_length = $new_element[2]['val'];
					if ( ! is_int($new_element[2]['val']))
					{
						$this->errors[] = strtr('Meta info group length not an integer found in file :file',
							array(':file' => $this->_location));
						break; 
					}

					$this->_meta_group_last_byte = $this->_current_pointer + $this->_meta_information_group_length;
				}

				// Check if the element is actually the Transfer Syntax
				if ($new_element[1] == 0x0010)
				{
					// Set the transfer syntax
					$this->_transfer_syntax = trim($new_element[2]['val']);
					if ($this->_transfer_syntax !== self::DEFLATE_TRANSFER_SYNTAX)
					{
						// Deflate has been done, don't check again
						$this->_check_deflate_function = '_dummy';
					}
				}
			}

			// Load dictionary (if necessary)
			Nanodicom_Dictionary::load_dictionary($new_element[0], $this->_force_load_dictionary);

			if ($this->{$this->_check_list_function}($new_element[0], $new_element[1]))
			{
				// All elements found. Done!
				break;
			}
        }
        
		unset($check_dicom_only, $new_element);

		// Instance parsed, don't do it again
		$this->_is_parsed = TRUE;
		
		// Instance successfully read if no errors found
		if (count($this->errors) == 0)
			$this->status = self::SUCCESS;
		
		// Finish the profiling
		$this->profiler['parse']['end'] = microtime(TRUE);
		
		// Return the instance
        return $this;
	}

	/**
	 * Read an element
	 * 
	 * PS 3.10 Page 22 (2009)
	 * Except for the 128 byte preamble and the 4 byte prefix, the File Meta Information shall be encoded using
	 * the Explicit VR Little Endian Transfer Syntax (UID=1.2.840.10008.1.2.1) as defined in DICOM PS 3.5.
	 * Values of each File Meta Element shall be padded when necessary to achieve an even length, as
	 * specified in PS 3.5 by their corresponding Value Representation. The Unknown (UN) Value
	 * Representation shall not be used in the File Meta Information. For compatibility with future versions of this
	 * Standard, any Tag (0002,xxxx) not defined in Table 7.1-1 shall be ignored.
	 *
	 * However, this parser CAN read File Meta Information encoded (wrongly) with Implicit VR Little Endian
	 * TODO: Thow a warning
	 *
	 * This parser handles (incorrectly set) odd lengths as well.
	 *
	 * @return	void
	 * @throws  Nanodicom_Exception
	 */
	protected function _read_element()
	{
		// Setting some general values
		$allow_undefined_length	= TRUE;
		$is_binary				= FALSE;
		$value					= '';
		$vr						= '';
		$items					= array();
		$value_representation	= 'UN';
		$offset					= $this->_tell();
		
		// Get the vr_mode and endian from the Transfer Syntax
		list($vr_mode, $endian) = ($this->_meta_group_last_byte != -1 AND $offset >= $this->_meta_group_last_byte)
			? self::decode_transfer_syntax($this->_transfer_syntax)
			: self::decode_transfer_syntax(self::EXPLICIT_VR_LITTLE_ENDIAN);

		// Reading the group and element value
		$group   = $this->{self::$_read_int}(2, $endian, 2);

		// Rectify endian and transfer syntax if needed
		list($group, $endian) = $this->{$this->_check_proper_endian_function}($group, $endian);
		$element = $this->{self::$_read_int}(2, $endian, 2);

		if ($group == self::ITEMS_GROUP AND in_array($element, self::$items_elements))
			$vr_mode = self::VR_MODE_IMPLICIT;

		// Some VRs accept Undefined Length (0xFFFFFFFF). If they don't they will be changed to FALSE accordingly.
		// DICOM Standard 09. PS 3.6 - Section 7.1: "Data Elements"
		if ($vr_mode == self::VR_MODE_EXPLICIT OR $group == self::METADATA_GROUP)
		{
			// It is explicit. Next value is the VR.
			$vr = $this->_read(2);
			
			// Somehow the VR is not correct. Should we assume it is IMPLICIT?
			if ( ! array_key_exists($vr, self::$vr_array))
			{
				$this->_rewind(-2);
				$vr 	 = '';
				$vr_mode = self::VR_MODE_IMPLICIT;
			}
			else
			{
				// vr exists. This is VR_MODE_EXPLICIT for sure now
				if (in_array($vr, self::$vr_explicit_4bytes))
				{
					// VR is in list. Next 2 bytes should be 0000H (but we don't care)
					$this->_forward(2);
					
					// Length is 32-bit unsigned integer
					$length = $this->{self::$_read_int}(4, $endian, 4);
		
					if ($vr == 'UT')
					{
						// Do not allow undefined length on UT
						$allow_undefined_length = FALSE;
					}
				}
				else
				{
					// Length is next. 16-bit unsigned integer
					$length = $this->{self::$_read_int}(2, $endian, 2);

					// Explicit and not in list of (OB, OW, OF, SQ, UN, UT) should not allow undefined length
					$allow_undefined_length = FALSE;
				}
			}
		}
		
		// Read the length, this is done to allow the fallback to read Implicit when Explicit failed
		if ($vr_mode == self::VR_MODE_IMPLICIT)
		{
			// It is implicit. Next values are length. No guessing
			$length = $this->{self::$_read_int}(4, $endian, 4);
		}

		// Checking for Unexpected Undefined lengths
		if ( ! $allow_undefined_length AND $length == self::UNDEFINED_LENGTH) {
			throw new Nanodicom_Exception('Unexpected Undefined Length found at [:group][:element]',
										  array(':group' => $group, ':element' => $element), 100);
		}
		
		// Odd length. Add to warnings
		if ($length > 0 AND $length % 2 != 0)
			$this->warnings[] = 'Found odd length '.$length.' reading Group '.$group.' and Element '.$element;
		
		// Fast forward if length is set and not Metadata Group
		if ($length >= 0 AND $group != self::METADATA_GROUP)
		{
			// Save the offset to where the value starts
			$_offset = $this->_tell();

			// Add the pointer to corresponding length
			$bytes_forwarded = $this->_forward($length);
			
			if ($bytes_forwarded != $length)
			{
				// Need to rewind
				$this->_rewind(-1*$length);
				$length = $bytes_forwarded;
			}
			
			unset($endian, $vr_mode);
			return array($group, $element, 
				array('len'	  => $length,
					  'val'	  => $value,
					  'vr'	  => $value_representation,
					  '_vr'	  => $vr,
					  'bin'	  => $is_binary,
					  'off'	  => $offset,
					  '_off'  => $_offset,
					  'ds'	  => $items)
				);
		}

		// Decode the vr if we made it to here
		list($value_representation, $multiplicity, $name) = $this->_decode_vr($group, $element, $vr, $length);

		// Read values
		list($value, $value_representation, $is_binary, $items) = $this->_read_value($vr, $value_representation, $length, $vr_mode, $endian);
				
		unset($endian, $vr_mode, $multiplicity, $name, $current_pointer, $new_element);
		return array($group, $element, 
			array('len'	  => $length,
				  'val'	  => $value,
				  'vr'	  => $value_representation,
				  '_vr'	  => $vr,
				  'bin'	  => $is_binary,
				  'off'	  => $offset,
				  'ds'	  => $items,
				  'done'  => TRUE)
			);
	}


	/**
	 * Read the value from the blob
	 *
	 * @param	object	 the element array
	 * @param	integer	 the group
	 * @param	integer	 the element
	 * @return	void
	 */
	protected function _read_value_from_blob( & $elem, $group, $element)
	{
		// Load dictionaries (Forced loading)
		Nanodicom_Dictionary::load_dictionary($group, TRUE);

		// Save current pointer
		$current_pointer = $this->_tell();
		
		// Values have not been read
		$this->_rewind($elem['_off']);

		// Decode the right VR.
		list($elem['vr'], $multiplicity, $name) 
			= $this->_decode_vr($group, $element, $elem['_vr'], $elem['len']);

		// Read the value
		list($elem['val'], $elem['vr'], $elem['bin'], $elem['ds']) 
			= $this->_read_value($elem['_vr'], $elem['vr'], $elem['len'], $this->_transfer_syntax);
		
		// Element has been read. Set to true
		$elem['done'] = TRUE;
		
		// Rewind to previous pointer, we just read and returned everything back to normal
		$this->_rewind($current_pointer);
	}

	/**
	 * Read the value of an Tag element accordingly. No numeric values are interpreted. No reading of PN
	 *
	 * @param	string	 the read VR
	 * @param	string	 the obtained VR
	 * @param	integer	 the number of bytes to read
	 * @param	mixed	 either the vr_mode already or the transfer syntax
	 * @param	mixed	 either NULL (not set so decode from transfer syntax), or the endian
	 * @return	array	 a list of $value, $value_representation, $is_binary, $items
	 */
	protected function _read_value($vr, $value_representation, $length, $vr_mode, $endian = NULL)
	{
		// TODO: Check if values so far correspond to dictionary information (VR, length, data type)
		// TODO: Take care of OF type.

		// Setting some general values
		$is_binary = FALSE;
		$value	   = '';
		$items	   = array();
		
		if ($endian == NULL)
		{
			// vr_mode is then transfer syntax. Get proper vr_mode and endian from the Transfer Syntax
			list($vr_mode, $endian) = self::decode_transfer_syntax($this->_transfer_syntax);
		}

		// Read values accordingly to VR type (From dictionary);
		switch ($value_representation)
		{
			// Decode Attribute Tag
			case 'AT':
				$value = array();
				for ($i = 0; $i < $length; $i = $i + 4)
				{
					$value[] = array($this->{self::$_read_int}(2, $endian, 2), $this->{self::$_read_int}(2, $endian, 2));
				}
			break;
			// Decode numeric values: shorts, longs, floats.
			case 'UL':
				$value = $this->{self::$_read_int}(4, $endian, $length);
			break;
			case 'SL':
				$value = $this->{self::$_read_int}(4, $endian, $length, self::SIGNED);
			break;
			case 'XS':
			case 'SS':
			case 'US':
				// TODO: Check for the right way to find out US or SS
				if ($vr == 'US')
				{
					$value = $this->{self::$_read_int}(2, $endian, $length);
					$value_representation = 'US';
				}
				else
				{
					$value = $this->{self::$_read_int}(2, $endian, $length, self::SIGNED);
					$value_representation = 'SS';
				}
			break;
			case 'FL':
				$value = $this->_read_float(4, $length);
			break;
			case 'FD':
				$value = $this->_read_float(8, $length);
			break;
			case 'OX':
				// Check for the right way to find out OB or OW
				if ($vr_mode == self::VR_MODE_IMPLICIT OR $this->value(0x0028, 0x0100) > 8)
				{
					$value_representation = 'OW';
				}
				else
				{
					$value_representation = 'OB';
				}
			case 'OW':
			case 'OB':
				// Binary data.
				switch ($length)
				{
					case 0:
						$value = '';
					break;
					case self::UNDEFINED_LENGTH:
						// The Element has an undefined length. It is a sequence of fragments
						while ($this->_read())
						{
							// Let's iterate
							// Setting the parent VR as OB, OW or OX, so Items know they should
							// treat value as data not data sets
							$this->_parent_vr = $value_representation;
							
							// Read next element
							$new_element = $this->_read_element();
							$items[$new_element[0]][$new_element[1]][] = $new_element[2];
							// Check for Items Group or Delimeters
							if ($new_element[0] == Nanodicom::ITEMS_GROUP 
								AND in_array($new_element[1], array(Nanodicom::ITEM_DELIMITER, Nanodicom::SEQUENCE_DELIMITER)))  break;
						}
					break;
					default:
						// It is direct binary data.
						$value	   = $this->_read($length);
						$is_binary = TRUE;
					break;
				}
			break;
			// It is a Sequence or Item
			case 'SQ':
			case 'IT':
			case 'DI':
				switch ($length)
				{
					case 0:
						$value = '';
					break;
					case self::UNDEFINED_LENGTH:
						// The Element has an undefined length. Should terminate with a {Sequence|Item} Delimitation Item
						
						while ($this->_read())
						{
							// Let's iterate

							// To let the Item know that value should be treated as Datas Sets
							$this->_parent_vr = $value_representation;

							$new_element = $this->_read_element();
							$items[$new_element[0]][$new_element[1]][] = $new_element[2];
							// Check for Items Group or Delimeters
							if ($new_element[0] == Nanodicom::ITEMS_GROUP 
								AND in_array($new_element[1], array(Nanodicom::ITEM_DELIMITER, Nanodicom::SEQUENCE_DELIMITER)))  break;
						}
					break;
					default:
						// The length is fixed.
						
						// Let's check if parent was a binary VR
						if (in_array($this->_parent_vr, array('OB', 'OW', 'OX')))
						{
							// It is an Item from a binary Sequence. Just read the data
							$value 	  = $this->_read($length);
							$is_binary = TRUE;
						}
						else
						{
							// It is an Item from a Sequence. We should read the embedded Data Sets
							
							// Get current pointer in blob;
							$current_pointer = $this->_tell();
							
							// Iterate while file has contents and current pointer is less than given length
							while ($this->_read() AND ($this->_tell() < $current_pointer + $length))
							{
								// Let's iterate
								$new_element = $this->_read_element();
								$items[$new_element[0]][$new_element[1]][] = $new_element[2];
								unset($new_element);
							}
						}
					break;
				}
			break;
			default: 
				switch ($length)
				{
					case 0:
						$value = '';
					break;
					case self::UNDEFINED_LENGTH:
						// The Element has an undefined length. It is a sequence of fragments
						while ($this->_read())
						{
							// Let's iterate
							
							// Setting the parent VR as OB, OW or OX, so Items know they should
							// treat value as data not data sets
							$this->_parent_vr = $value_representation;
							
							// Read next element
							$new_element = $this->_read_element();
							$items[$new_element[0]][$new_element[1]][] = $new_element[2];
							// Check for Items Group or Delimeters
							if ($new_element[0] == Nanodicom::ITEMS_GROUP 
								AND in_array($new_element[1], array(Nanodicom::ITEM_DELIMITER, Nanodicom::SEQUENCE_DELIMITER)))  break;
						}
					break;
					default:
						// Made it to here: Read bytes verbatim.
						$value	   = $this->_read($length);
					break;
				}
			break;
		}
		return array($value, $value_representation, $is_binary, $items);
	}
	
	/**
	 * Creates a binary string from the current dataset
	 *
	 * @param	integer	 the group
	 * @param	integer	 the element
	 * @param	string	 the data
	 * @return	string	 the binary string
	 */
	protected function _write($group, $element, $data)
	{
		// Empty buffer
		$buffer = '';
		
		// Get the vr_mode (Implicit or Explicit) and the endian (Little or Big)
		list($vr_mode, $endian) = (($group == self::METADATA_GROUP)
								? self::decode_transfer_syntax(self::EXPLICIT_VR_LITTLE_ENDIAN)
								: self::decode_transfer_syntax($this->_transfer_syntax));
		
		// Add the group and element
		$buffer .= $this->{self::$_write_int}($group, 2, $endian, 2);
		$buffer .= $this->{self::$_write_int}($element, 2, $endian, 2);

		// Get the vr_mode for rest
		$vr_mode = ($group == self::ITEMS_GROUP AND in_array($element, self::$items_elements))
				 ? self::VR_MODE_IMPLICIT
				 : $vr_mode;

		// Read data if it has been not done
		if ( ! isset($data['done'])) 
		{
			// Values have not been read
			$this->_read_value_from_blob($data, $group, $element);
		}
		
		$bytes = 4;
		$vr_index = ($data['vr'] != $data['_vr'] AND ! empty($data['_vr'])) ? '_vr' : 'vr';
		
		if ($vr_mode == self::VR_MODE_EXPLICIT OR $group == self::METADATA_GROUP)
		{
			// For Explicit or Metadata Group
			$buffer .= $data[$vr_index];
			if (in_array($data[$vr_index], self::$vr_explicit_4bytes))
			{
				$buffer .= chr(0).chr(0);
			}
			else
			{
				$bytes  = 2;
			}
		}
		
		// Setting the length
		$buffer .= $this->{self::$_write_int}($data['len'], $bytes, $endian, $bytes);
		
		// Setting the value
		// TODO: Encode AT properly
		switch ($data[$vr_index])
		{
			// Decode Attribute Tag
			case 'AT':
				for ($i = 0; $i < $data['len']; $i = $i + 4)
				{
					$index = (int) $i/4;
					$buffer .= $this->{self::$_write_int}($data['val'][$index][0], 2, $endian, 2)
						.$this->{self::$_write_int}($data['val'][$index][1], 2, $endian, 2);
				}
			break;
			// Decode numeric values: shorts, longs, floats.
			case 'UL':
				$buffer .= $this->{self::$_write_int}($data['val'], 4, $endian, $data['len']);
			break;
			case 'US':
				$buffer .= $this->{self::$_write_int}($data['val'], 2, $endian, $data['len']);
			break;
			case 'SL':
				$buffer .= $this->{self::$_write_int}($data['val'], 4, $endian, $data['len'], self::SIGNED);
			break;
			case 'SS':
				$buffer .= $this->{self::$_write_int}($data['val'], 2, $endian, $data['len'], self::SIGNED);
			break;
			case 'FL':
				$buffer .= $this->_write_float($data['val'], 4, $data['len']);
			break;
			case 'FD':
				$buffer .= $this->_write_float($data['val'], 8, $data['len']);
			break;
			case 'OW':
			case 'OB':
			case 'OX':
				// Binary data.
				switch ($data['len'])
				{
					case 0:
						// Nothing to add
					break;
					case self::UNDEFINED_LENGTH:
						// The Element has an undefined length. Let's get the rest from the items

						// Setting the parent VR as OB, OW or OX, so Items know they should
						// treat value as data not data sets
						$this->_parent_vr = $data[$vr_index];

						// Sort the keys
						ksort($data['ds']);
		
						// Iterate through the current elements
						foreach ($data['ds'] as $ds_group => $ds_elements)
						{	
							// Sort the elements
							ksort($ds_elements);
							
							// Through groups
							foreach ($ds_elements as $ds_element => $ds_indexes)
							{
								// Through elements
								foreach ($ds_indexes as $ds_data)
								{
									// Through indexes
									$buffer .= $this->_write($ds_group, $ds_element, $ds_data);
									unset($ds_data);
								}
								unset($ds_element, $ds_indexes);
							}
							unset($ds_group, $ds_elements);
						}
					break;
					default:
						// It is direct binary data.
						$buffer .= $data['val'];
					break;
				}
			break;
			// It is a Sequence or Item
			case 'SQ':
			case 'IT':
			case 'DI':
				switch ($data['len'])
				{
					case 0:
						// Nothing to add
					break;
					case self::UNDEFINED_LENGTH:
						// The Element has an undefined length. Let's get the rest from the items

						// To let the Item know that value should be treated as Datas Sets
						$this->_parent_vr = $data[$vr_index];

						// Sort the keys
						ksort($data['ds']);

						// Iterate through the current elements
						foreach ($data['ds'] as $ds_group => $ds_elements)
						{	
							// Sort the elements
							ksort($ds_elements);

							// Through groups
							foreach ($ds_elements as $ds_element => $ds_indexes)
							{
								// Through elements
								foreach ($ds_indexes as $ds_data)
								{
									// Through indexes
									$buffer .= $this->_write($ds_group, $ds_element, $ds_data);
									unset($ds_data);
								}
								unset($ds_element, $ds_indexes);
							}
							unset($ds_group, $ds_elements);
						}
					break;
					default:
						// The length is fixed.

						// Let's check if parent was a binary VR
						if (count($data['ds']) == 0)
						{
							// It is an Item from a binary Sequence. Just write the data
							$buffer .= $data['val'];
						}
						else
						{
							// It is an Item from a Sequence. We should read the embedded Data Sets
							$new_length = 0;

							// Sort the keys
							ksort($data['ds']);

							// Iterate through the current elements
							foreach ($data['ds'] as $ds_group => $ds_elements)
							{	
								// Sort the elements
								ksort($ds_elements);

								// Through groups
								foreach ($ds_elements as $ds_element => $ds_indexes)
								{
									// Through elements
									foreach ($ds_indexes as $ds_data)
									{
										// Through indexes
										$new_buffer = $this->_write($ds_group, $ds_element, $ds_data);
										$new_length += strlen($new_buffer);
										$buffer .= $new_buffer;
										unset($ds_data, $new_buffer);
									}
									unset($ds_element, $ds_indexes);
								}
								unset($ds_group, $ds_elements);
							}

							// Update the length based on data just stored. Calculate length first
							$length = $this->{self::$_write_int}($new_length, $bytes, $endian, $bytes);
							// Replace length with new value. Sweet!
							$buffer = substr($buffer, 0, -1 * $new_length - $bytes).$length.substr($buffer, -1 * $new_length);
						}

					break;
				}
			break;
			default: // Made it to here: Write bytes verbatim.
				$buffer .= $data['val'];
			break;
		}
		
		return $buffer;
	}

	/**
	 * Reads an integer for 64-bit machines
	 *
	 * @param	integer	 the bytes needed per integer
	 * @param	integer	 the endian mode: Little or Big Endian
	 * @param	integer	 the number of bytes to read
	 * @param	integer	 the sign
	 * @param	string	 if present, a binary string, otherwise, read from file
	 * @return	mixed	 a single value or an array
	 */
	protected function _read_int_64($bytes, $endian, $length, $sign = self::UNSIGNED, $data = NULL)
	{
		// Do actual reading at 32 bits
		$values = $this->_read_int_32($bytes, $endian, $length, $sign, $data);

		if ( ! is_array($values))
		{
			// It is a single value. Check and return. 2147483647 = 2^31 - 1;
			return ($values > 2147483647) ? -1 : $values;
		}
		
		// Is array, check its values and change accordingly
		for($i = 1, $count = count($values); $i <= $count; $i++)
		{
			$values['val'.$i] = ($values['val'.$i] > 2147483647) ? -1 : $values['val'.$i];			
		}
		
		return $values;
	}

	/**
	 * Reads integers
	 *
	 * @param	integer	 the bytes needed per integer
	 * @param	integer	 the endian mode: Little or Big Endian
	 * @param	integer	 the number of bytes to read
	 * @param	integer	 the sign
	 * @param	string	 if present, a binary string, otherwise, read from file
	 * @return	mixed	 a single value or an array
	 */
	protected function _read_int_32($bytes, $endian, $length, $sign = self::UNSIGNED, $data = NULL)
	{
		// In case the file said 0 for the length?
		// TODO: Raise a warning
		
		// Get the right format
		$format = ($sign == self::SIGNED)
				? (($bytes == 2) ? 's' : (($bytes == 4) ? 'l' : 'c'))
				: (($bytes == 2) ? (($endian == self::BIG_ENDIAN) ? 'n' : 'v' )
								 : (($bytes == 4) ? (($endian == self::BIG_ENDIAN) ? 'N' : 'V') : 'C'));

		// TODO: Check for buffer size (avoid overflow)
		$buffer = ($data == NULL) ? $this->_read($length) : $data;
		$format = $format.($length/$bytes).'val';
		$values = unpack($format, $buffer);

		unset ($format, $buffer);

		// Return either a value or an array
		return ($length == $bytes) ? $values['val'] : $values;
	}
	
	/**
	 * Writes an integer for 64-bit machines. Uses 32-bit function
	 *
	 * @param	integer	 the new value
	 * @param	integer	 the bytes needed per integer
	 * @param	integer	 the endian mode: Little or Big Endian
	 * @param	integer	 the number of bytes to read
	 * @param	integer	 the sign
	 * @return	string	 the binary value
	 */
	protected function _write_int_64($value, $bytes, $endian, $length, $sign = self::UNSIGNED)
	{
		if ($value == -1)
		{
			return ($bytes == 2) ? chr(0xFF).chr(0xFF) : chr(0xFF).chr(0xFF).chr(0xFF).chr(0xFF);
		}
		
		return $this->_write_int_32($value, $bytes, $endian, $length, $sign);
	}
	
	/**
	 * Writes an integer for 32-bit machines.
	 *
	 * @param	integer	 the new value
	 * @param	integer	 the bytes needed per integer
	 * @param	integer	 the endian mode: Little or Big Endian
	 * @param	integer	 the number of bytes to read
	 * @param	integer	 the sign
	 * @return	string	 the binary value
	 */
	protected function _write_int_32($value, $bytes, $endian, $length, $sign = self::UNSIGNED)
	{
		if ($length == 0) return '';
		
		$format = ($sign == self::SIGNED)
				? (($bytes == 2) ? 's' : 'l')
				: (($bytes == 2) ? (($endian == self::BIG_ENDIAN) ? 'n' : 'v' ) : (($endian == self::BIG_ENDIAN) ? 'N' : 'V'));

		if (is_array($value))
		{
			$result = '';
			foreach ($value as $val)
			{
				$result .= pack($format, $val);
			}
			return $result;
		}
		else
		{
			return pack($format, $value);
		}
	}
	
	/**
	 * Reads a float
	 *
	 * @param	integer	 number of bytes to read per float
	 * @param	integer	 total length to read
	 * @param	integer	 the sign
	 * @return	mixed	 a float or an array of floats
	 */
	protected function _read_float($bytes, $length)
	{
		// In case the file said 0 for the length?

		$format = ($bytes == 4) ? 'f' : 'd';

		// TODO: Check for buffer size (avoid overflow)
		$buffer = $this->_read($length);
		$format = $format.($length / $bytes).'val';
		$values = unpack($format, $buffer);

		unset ($format, $buffer);
		
		return ($length == $bytes) ? $values['val'] : $values;
	}

	/**
	 * Writes a float
	 *
	 * @param	integer	 the new value
	 * @param	integer	 the bytes needed per integer
	 * @param	integer	 the number of bytes to read
	 * @return	string	 the binary value
	 */
	protected function _write_float($value, $bytes, $length)
	{
		if ($length == 0) return '';

		$format = ($bytes == 4) ? 'f' : 'd';

		if (is_array($value))
		{
			// Multiple values
			$result = '';
			foreach ($value as $val)
			{
				$result .= pack($format, $val);
			}
			return $result;
		}
		else
		{
			// Single value
			return pack($format, $value);
		}
	}

	/**
	 * Set the current_pointer to a given value
	 *
	 * @param	integer	 the new position, defaults to beginning of file
	 * @return	void
	 */
	protected function _rewind($position = 0)
	{
		if ($position < 0)
		{
			// If negative substract from current position (rewind)
			$this->_current_pointer += $position;
		}
		else
		{
			// If positive set to that position
			$this->_current_pointer = $position;
		}
	}

	/**
	 * Moves the current_pointer forward
	 *
	 * @param	integer	 number of bytes to move forward
	 * @return	void
	 */
	protected function _forward($offset)
	{
		$increment = $offset;
		$offset = $this->_current_pointer + $offset;

		// Check if after forwarding with offset still within limits of DICOM object
		if ($offset > $this->_file_length)
		{
			if ($this->_oversize_retries > 0)
			{
				$missing_bytes = $offset - $this->_file_length;
				throw new Nanodicom_Exception('End of file :file has been reached. File size is :filesize, failed to allocate :missing bytes at byte :byte'
										  , array(':file' => $this->_location, ':filesize' => $this->_file_length, 
												  ':missing' => $missing_bytes, ':byte' => sprintf('0x%04X',$this->_current_pointer)), 3);
			}
			else
			{
				// Blew up first time
				$this->warnings[] = 'Retry file overflow while forwarding file pointer';
				$this->_oversize_retries++;
				$increment = 0;
			}	
		}
	
		// Otherwise is fine to add the offest to current_pointer
		$this->_current_pointer = $offset;
		return $increment;
	}

	/**
	 * Finds current position of pointer
	 *
	 * @return	integer	 current position of pointer
	 */
	protected function _tell()
	{
		return $this->_current_pointer;
	}
	
	/**
	 * Read file or blob accordingly
	 *
	 * @param	integer	 starting byte for reading
	 * @param	mixed	 how many bytes to read
	 * @return	void
	 * @throws  Nanodicom_Exception
	 */
	protected function _read_file($starting_byte = 0, $length = NULL)
	{
		// Read contents
		if ($this->_location == 'blob')
		{
			// There is no filename, it is a blob
			
			// Read the lenght of the blob
			$this->_file_length = sprintf('%u', strlen($this->_blob));

			// Define the number of bytes to read
			$length = ($length === NULL) ? $this->_file_length : $length;
			
			// Read the whole file
			$this->_blob = substr($this->_blob, $starting_byte, $length);

			unset($length, $starting_byte);
		}
		else
		{
			// It is a file
			
			// Checking if file exists
			if ( ! (file_exists($this->_location) AND is_file($this->_location))) 
				throw new Nanodicom_Exception('File :file does not exist', array(':file' => $this->_location), 0);

			// Opening handler for reading
			$file_handle = fopen($this->_location, 'rb');

			// Checking if file can be opened
			if ( ! $file_handle)
				throw new Nanodicom_Exception('File :file cannot be opened', array(':file' => $this->_location), 1);
			
			// Safely read long file values
			$this->_file_length = sprintf('%u', filesize($this->_location));

			// Set the file position if needed
			if ($starting_byte != 0)
				fseek($file_handle, $starting_byte);
			
			// Define the number of bytes to read
			$length = ($length === NULL) ? $this->_file_length : $length;
			
			if ($length <= 0)
				throw new Nanodicom_Exception('Length :length found at file :file at byte :byte',
					array(':length' => $length, ':file' => $this->_location, ':byte' => sprintf('0x%04X',$starting_byte)), 2);

			// Read the specified number of bytes
			try
			{
				$this->_blob = fread($file_handle, $length);
			}
			catch (Exception $e)
			{
				throw new Nanodicom_Exception('Error occured. Reading :length from file :file at byte :byte got an error',
					array(':length' => $length, ':file' => $this->_location, ':byte' => sprintf('0x%04X',$starting_byte)), 3);
			}

			// Close the file
			fclose($file_handle);

			unset($file_handle, $length, $starting_byte);
		}
	}
	
	/**
	 * Reads specified number of bytes from blob, or checks if there is still data
	 * left to be read
	 *
	 * @param	integer	 number of bytes to read or NULL
	 * @return 	boolean|string boolean when checking if there is still data or a binary string otherwise
	 * @throws  Nanodicom_Exception
	 */
	protected function _read($length = NULL)
	{
		if ($length === NULL)
		{
			// A quick way to check if file has reached its end or not.
			return ($this->_current_pointer >= $this->_file_length) ? FALSE : TRUE;
		}

		// Inflating a deflated DICOM Data Set
		$this->{$this->_check_deflate_function}();
		
		// Save the current pointer location as starting byte
		$starting_byte = $this->_current_pointer;
		// Increase the reading pointer
		$this->_current_pointer += $length;
		
		if ($this->_current_pointer > $this->_file_length)
		{
			$missing_bytes	  = $this->_current_pointer - $this->_file_length;
			throw new Nanodicom_Exception('End of file :file has been reached. File size is :filesize, failed to allocate :missing bytes at byte :byte'
									  , array(':file' => $this->_location, ':filesize' => $this->_file_length, 
											  ':missing' => $missing_bytes, ':byte' => sprintf('0x%04X',$starting_byte)), 3);
		}
		
		if ($this->_current_pointer < 0)
			throw new Nanodicom_Exception('Trying to read negative bytes on file :file', array(':file' => $this->_location), 4);
		
		// Return the bytes requested
		return substr($this->_blob, $starting_byte, $length);
	}

	protected function _check_deflate()
	{
		if ($this->_meta_information_group_length !== NULL AND $this->_current_pointer == $this->_meta_group_last_byte
			AND $this->_transfer_syntax == self::DEFLATE_TRANSFER_SYNTAX)
		{
			$this->_original_blob = $this->_blob;
			$uncompressed 		  = gzinflate(substr($this->_blob, $this->_current_pointer, $this->_file_length - $this->_current_pointer));
			$this->_file_length   = $this->_current_pointer + strlen($uncompressed);
			$this->_blob		  = substr($this->_blob, 0, $this->_current_pointer).$uncompressed;
			$this->_check_deflate_function = '_dummy';
		}
	}
	
} // End Nanodicom
