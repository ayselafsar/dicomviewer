<?php
/**
 * tools/dumper.php file
 *
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */

/**
 * Dicom_Dumper class.
 *
 * Extends Nanodicom. Dumps the dataset. Currently supports normal echo output and formatted
 * html output. Fully extensible, ie. an xml output can be created as well.
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */
class Dicom_Dumper extends Nanodicom {

	// Default html output
	protected $_output_html = array(
		'dataset_begin'	=> '<ul>',
		'dataset_end'	=> '</ul>',
		'item_begin'	=> '<li>',
		'item_end'		=> '</li>',
		'spacer'		=> '',
		'text_begin'	=> '<pre>',
		'text_end'		=> '</pre>',
		'columns'		=> array(
			'off'		=> array('%05X', ' '),
			'g'			=> array('0x%04X', ':'),
			'e'			=> array('0x%04X', ' '),
			'name'		=> array('%-30.30s', ' '),
			'vr'		=> array('%2s', ' '),
			'len'		=> array('%-3d', ' '),
			'val'		=> array('[%s]', ''),
		),
	);
	
	// Default echo output
	protected $_output_echo = array(
		'dataset_begin'	=> '',
		'dataset_end'	=> '',
		'item_begin'	=> '',
		'item_end'		=> "\n",
		'spacer'		=> ' ',
		'text_begin'	=> '',
		'text_end'		=> '',
		'columns'		=> array(
			'off'		=> array('%05X', ' '),
			'g'			=> array('%04X', ':'),
			'e'			=> array('%04X', ' '),
			'name'		=> array('%-30.30s', ' '),
			'vr'		=> array('%2s', ' '),
			'len'		=> array('%-3d', ' '),
			'val'		=> array('[%s]', ''),
		),
	);
	
	// For formatting
	protected $output = array();
	
	// The output
	protected $_out = '';

	/**
	 * Public method for dump
	 *
	 * @param	mixed	 for formatting
	 * @return	string	 the dumped full dataset
	 */
	public function dump($output = 'echo')
	{
		$this->parse();
		
		// TODO:
		// - Check if $output exists.
		// - Max number of nested datasets
		// - Show binary in hexdump format
		$this->profiler['dump']['start'] = microtime(TRUE);

		if (is_array($output))
		{
			// Merge arrays from default and given
			$this->output = array_merge($this->_output_echo, $output);
		}
		else
		{
			$output	 = '_output_'.$output;
			foreach ($this->$output as $var => $value)
			{
				// Load the output
				$this->output[$var] = $value;
			}
		}
		$dump = $this->_dump($this->_dataset);
		$this->profiler['dump']['end'] = microtime(TRUE);
		return $dump;
	}

	/**
	 * Internal method for dumping
	 *
	 * @param	object	 the dataset
	 * @param	string	 the spacer
	 * @return	string	 the dumped dataset
	 */
	protected function _dump($dataset, $spacer = '')
	{
		$out = '';
		foreach ($dataset as $group => $elements)
		{
			// Load dictionaries (Forced loading)
			Nanodicom_Dictionary::load_dictionary($group, TRUE);
			foreach ($elements as $element => $indexes)
			{
				foreach ($indexes as $values)
				{
					$elem      = $values;
					$elem['g'] = $group;
					$elem['e'] = $element;

					if ( ! isset($elem['done'])) 
					{
						// Read value if not read yet
						$this->_read_value_from_blob($elem, $group, $element);
					}
					
					// Indent back when a delimiter was found. Must be done before dumping.
					if ($group == Nanodicom::ITEMS_GROUP AND in_array($element, array(Nanodicom::ITEM_DELIMITER, Nanodicom::SEQUENCE_DELIMITER)))
					{
						$spacer = substr($spacer, 0, -1*strlen($this->output['spacer']));
					}

					// Start the dataset and dump the current element
					$out .= $this->output['dataset_begin'].$this->_dump_element($elem, $spacer);

					if (count($elem['ds']) > 0)
					{
						// Take care of items
						$out .= $this->_dump($elem['ds'], $spacer.$this->output['spacer']);
					}
					
					// Close the dataset
					$out .= $this->output['dataset_end'];
				}
				unset($values);
			}
			unset($element, $indexes);
		}
		unset($group, $elements);
		return $out;
	}
	
	/**
	 * Dumps an element
	 *
	 * @param	object	 the element
	 * @param	string	 the spacer
	 * @return	string	 the full dumped element
	 */
	protected function _dump_element($element, $space = '')
	{
		$row = $this->_print_element($element);
		return $this->output['item_begin'].$this->output['text_begin'].$space.$row.$this->output['text_end'].$this->output['item_end'];
	}

	/**
	 * Prints an element
	 *
	 * @param	object	 the element
	 * @return	string	 the basic dumped element
	 */
	protected function _print_element($element)
	{
		$out = '';

		foreach ($this->output['columns'] as $column => $values)
		{
			switch ($column)
			{
				case 'name' : $string = isset(Nanodicom_Dictionary::$dict[$element['g']][$element['e']]) 
									  ? Nanodicom_Dictionary::$dict[$element['g']][$element['e']][2] 
									  : 'NA';
				break;
				case 'val'  : 
					if ($element['vr'] == 'AT')
					{
						// AT (Attribute Tags) look "nicer" being displayed in Hex to match Group, Elements format
						$elements = array();
						for($i = 0; $i < count($element['val']); $i++)
						{
							$elements[] = '['.sprintf("0x%04X", $element['val'][$i][0]).','.sprintf("0x%04X", $element['val'][$i][1]).']';
						}
						$element['val'] = $elements;
					}

					$string = ($element['bin']) 
						? 'BINARY. Element starts at '.$element['off']
						: ((is_array($element['val']))
							? implode(',', $element['val'])
							: (isset(Nanodicom_Dictionary::$dict[$element['g']][$element['e']])
								? trim($element['val'])
								: 'UNKNOWN'));
				break;
				case 'vr' :
					$vr_index = ($element['vr'] != $element['_vr'] AND ! empty($element['_vr'])) ? '_vr' : 'vr';
					$string = trim($element[$vr_index]);
				break;
				default		: $string = trim($element[$column]);
				break;
			}
			$out .= sprintf($values[0], $string).$values[1];
		}
		return $out;
	}
	
} // End Dicom_Dumper
