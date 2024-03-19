<?php
/**
 * tools/pixeler.php file
 *
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */

/**
 * Dicom_Pixeler class.
 *
 * Extends Nanodicom. Pixel data reader. 
 * Currently support:
 * - Only uncompressed pixel data.
 * - Photometric Representations of: Monochrome1, Monochrome2 and RGB (color-by-plane and color-by-pixel)
 * - Big endian and little endian, explicit and implicit
 * - Pixel Representation: Unsigned Integer and 2's complement
 *
 * @package    Nanodicom
 * @category   Tools
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */
class Dicom_Pixeler extends Nanodicom {

	/**
	 * @var string driver to be used: GD (gd), ImageMagick (imagick), GraphicsMagick (gmagick)
	 */
	public static $driver = 'gd';
	
	protected $_rows;
	protected $_cols;
	protected $_endian;
	protected $_vr_mode;
	protected $_dose_scaling;
	protected $_rescale_slope;
	protected $_rescale_intercept;
	protected $_samples_per_pixel;
	protected $_pixel_representation;
	
	/**
	* Supported Image Transfer Syntaxes for reading image data
	* indexed by Value of the Transfer Syntax
	* each array contains:  Name.
	* @var array
	*/
	public static $reading_image_transfer_syntaxes = array(
		// Implicit VR Little Endian "1.2.840.10008.1.2"
		Nanodicom::IMPLICIT_VR_LITTLE_ENDIAN => array(
			'name' => 'Implicit VR Little Endian'
		),
		// Explicit VR Little Endian "1.2.840.10008.1.2.1"
		Nanodicom::EXPLICIT_VR_LITTLE_ENDIAN => array(
			'name' => 'Explicit VR Little Endian'
		),
		// Explicit VT Big Endian "1.2.840.10008.1.2.2"
		Nanodicom::EXPLICIT_VR_BIG_ENDIAN => array(
			'name' => 'Explicit VR Big Endian'
		),
		// DICOM Deflated Little Endian (Explicit VR)
		'1.2.840.10008.1.2.1.99' => array(
			'name' => 'DICOM Deflated Little Endian (Explicit VR)'
		),
		// Jpeg Lossy Baseline (1) - 8 bits
		'1.2.840.10008.1.2.4.50' => array(
			'name' => 'Jpeg Lossy Baseline (1) - 8 bits'
		),
		// RLE - Run Length Encoding, Lossless
		'1.2.840.10008.1.2.5' => array(
			'name' => 'RLE - Run Length Encoding, Lossless'
		),
	);

	/**
	 * Public method to set the driver to be used
	 *
	 * @param string  name of the driver
	 * @return object the instance to allow chaining
	 */
	public function set_driver($driver)
	{
		self::$driver = $driver;
		return $this;
	}
	
	/**
	 * Public method to get the driver currently set
	 *
	 * @return string the current driver set
	 */
	public function get_driver()
	{
		return self::$driver;
	}

	/**
	 * Public method to add a jpeg lossy 8 bits image
	 * Still under development.
	 *
	 * @return string the name of the jpeg file
	 */
	public function add_lossy_jpeg8($filename)
	{
		$dataset = array();
		
		// Get the data blob
		$blob = file_get_contents($filename);

		// Create first item
		$value = array(
			  'len'	  => 0,
			  'val'	  => '',
			  'vr'	  => 'IT',
			  '_vr'	  => 'IT',
			  'bin'	  => FALSE,
			  'off'	  => 0, // We don't know the offset
			  'ds'	  => array(),
			  'done'  => TRUE,
		);

		$dataset[0xFFFE][0xE000][] = $value;
	
		// Attach jpeg
		$value = array(
			  'len'	  => sprintf('%u', strlen($blob)),
			  'val'	  => $blob,
			  'vr'	  => 'IT',
			  '_vr'	  => 'IT',
			  'bin'	  => TRUE,
			  'off'	  => 0, // We don't know the offset
			  'ds'	  => array(),
			  'done'  => TRUE,
		);

		$dataset[0xFFFE][0xE000][] = $value;
		
		// Pixel Data element
		$value = array(
			  'len'	  => -1,
			  'val'	  => '',
			  'vr'	  => 'OB',
			  '_vr'	  => 'OB',
			  'bin'	  => FALSE,
			  'off'	  => 0, // We don't know the offset
			  'ds'	  => $dataset,
			  'done'  => TRUE,
		);
		
		$this->_dataset[0x7FE0][0x0010][0] = $value;

		// Delimeter
		$value = array(
			  'len'	  => 0,
			  'val'	  => '',
			  'vr'	  => 'DI',
			  '_vr'	  => 'DI',
			  'bin'	  => FALSE,
			  'off'	  => 0, // We don't know the offset
			  'ds'	  => array(),
			  'done'  => TRUE,
		);
		
		$this->_dataset[0xFFFE][0xE0DD][0] = $value;
		
		$info = getimagesize($filename);
		
		// Set the rows (height of image)
		$this->value(0x0028, 0x0010, (int) $info[1]);

		// Set the columns (width of image)
		$this->value(0x0028, 0x0011, (int) $info[0]);

		// Set the bits allocated
		$this->value(0x0028, 0x0100, 8);

		// Set the bits stored
		$this->value(0x0028, 0x0101, 8);

		// Set the high bit
		$this->value(0x0028, 0x0102, 7);

		// Set the samples per pixel
		$this->value(0x0028, 0x0002, 1);

		// Set the Photometric Interpretation
		$this->value(0x0028, 0x0004, 'MONOCHROME2');

		// TransferSyntaxUID. JPEG Lossy Baseline (1) - 8 bits
		$this->value(0x0002, 0x0010, '1.2.840.10008.1.2.4.50');
		
		return $this;
	}
	
	/**
	 * Public method to get the images from the dicom object
	 *
	 * @param integer  a default window width
	 * @param integer  a default window center
	 * @return mixed false if something is missing or not image data found, otherwise an
	 * array of GD objects
	 */
	public function get_images($width = NULL, $center = NULL) 
	{
		// Parse the object if not parsed yet
		$this->parse();

		// Set the profiler
		$this->profiler['pixel']['start'] = microtime(TRUE);

		$return = $this->_check_driver();

		// If FALSE, driver not found
		if ( ! $return)
			return FALSE;

		// Supported transfer syntaxes
		if ( ! array_key_exists(trim($this->_transfer_syntax), self::$reading_image_transfer_syntaxes)) 
		{
			// Not supported transfer syntax found
			throw new Nanodicom_Exception('Transfer syntax ":syntax" not supported', 
				array(':syntax' => $this->_transfer_syntax), 300);
		}

		// Let's read some values from DICOM file
		$rows              = $this->get(0x0028, 0x0010);
		$cols              = $this->get(0x0028, 0x0011);

		if ($rows == NULL OR $cols === NULL)
		{
			// There is no rows, no samples per pixel, no pixel data or malformed dicom file
			throw new Nanodicom_Exception('There is no rows, no samples per pixel, no pixel data or malformed dicom file', NULL, 301);
		}
		
		$samples_per_pixel = $this->get(0x0028, 0x0002, 1);
		$bits_allocated    = $this->get(0x0028, 0x0100);
		$bits_stored       = $this->get(0x0028, 0x0101);
		$high_bit          = $this->get(0x0028, 0x0102);
		$dose_scaling      = $this->get(0x3004, 0x000E, 1);
		$window_width      = ($width == NULL)  ? $this->get(0x0028,0x1051, 0) : $width;
		$window_center     = ($center == NULL) ? $this->get(0x0028,0x1050, 0) : $center;
		$rescale_intercept = $this->get(0x0028,0x1052, 0);
		$rescale_slope     = $this->get(0x0028,0x1053, 1);
		$number_of_frames  = (int) $this->get(0x0028,0x0008, 1);
		$pixel_representation       = $this->get(0x0028,0x0103);
		$photometric_interpretation = trim($this->get(0x0028,0x0004, 'NONE'));
		$planar_configuration 		= $this->get(0x0028,0x0006, 0);
		$transfer_syntax_uid        = trim($this->get(0x0002,0x0010));
		$blob			            = $this->get(0x7FE0,0x0010);

		// Save some values for internal use
		// TODO: improve this, probably using $this->pixeler[]?
		$this->_rows				 = $rows;
		$this->_cols				 = $cols;
		$this->_dose_scaling		 = $dose_scaling;
		$this->_rescale_slope		 = $rescale_slope;
		$this->_rescale_intercept	 = $rescale_intercept;
		$this->_samples_per_pixel	 = $samples_per_pixel;
        $this->_pixel_representation = $pixel_representation;
		
		// Window Center and Width can have multiple values. By now, just reading the first one.
		// It assumes the delimiter is the "\" 
		if ( ! (strpos($window_center, "\\") === FALSE))
		{
			$temp          = explode("\\", $window_center);
			$window_center = (int) $temp[0];
		}
		
		if ( ! (strpos($window_width, "\\") === FALSE))
		{
			$temp          = explode("\\", $window_width);
			$window_width = (int) $temp[0];
		}

		// Setting some values
		$images  = array();
		$max     = array();
		$min     = array();
		
		$current_position		= $starting_position = 0;
		$current_image			= 0;
		$bytes_to_read			= (int) $bits_allocated/8;
		$image_size				= $cols*$rows*$samples_per_pixel*$bytes_to_read;
		list($vr_mode, $endian) = Nanodicom::decode_transfer_syntax($transfer_syntax_uid);
		$this->_vr_mode 		= $vr_mode;
		$this->_endian  		= $endian;

		if ($transfer_syntax_uid == '1.2.840.10008.1.2.4.50')
		{
			// This is jpeg lossy 8-bits. Just get the data.
			$images = array();
			$counter = 0;
			
			foreach ($blob as $group => $elements)
			{
				foreach ($elements as $element => $indexes)
				{
					if ($element == Nanodicom::SEQUENCE_DELIMITER)
						continue;
						
					foreach ($indexes as $values)
					{
						$data      = $values;

						if ($counter == 0)
						{
							// Read Basic Offset Table
						}
						else
						{
							// It is a real Item

							if ( ! isset($data['done'])) 
							{
								// Read value if not read yet
								$this->_read_value_from_blob($data, $group, $element);
							}

							$images[] = $this->_read_image_blob($data['val']);
						}
						$counter++;
					}
				}
			}
			
			return $images;
		}
		
		if ($transfer_syntax_uid == '1.2.840.10008.1.2.5')
		{
			// It is "RLE - Run Length Encoding, Lossless"
			$counter = 0;
			$temp = array();
			foreach ($blob as $group => $elements)
			{
				foreach ($elements as $element => $indexes)
				{
					if ($element == Nanodicom::SEQUENCE_DELIMITER)
						continue;
						
					foreach ($indexes as $values)
					{
						$data      = $values;
						$data['g'] = $group;
						$data['e'] = $element;

						if ($counter == 0)
						{
							// Read Basic Offset Table
						}
						else
						{
							// It is a real Item
							$dir = realpath(dirname($this->_location)).DIRECTORY_SEPARATOR;
							$file = basename($this->_location);

							if ( ! isset($data['done'])) 
							{
								// Read value if not read yet
								$this->_read_value_from_blob($data, $group, $element);
							}
							
							// This is the item data
							$item = $data['val'];
							
							// Save the header
							$header = array();
							// 16 Unsigned Long values
							for ($i = 0; $i <= 16; $i++)
							{
								$chunk = substr($item, 4*$i, 4);
								$header[] = $this->{Nanodicom::$_read_int}(4, Nanodicom::LITTLE_ENDIAN, 4, Nanodicom::UNSIGNED, $chunk);
							}
							
							$total_segments = array_shift($header);

							$segment_index = 0;

							foreach ($header as $starting_byte_of_segment)
							{
								// This is a segment, do the uncompression
								if ($starting_byte_of_segment == 0)
									// Only process if the segment has a positive starting value
									break;
								
								$size_of_segment = ($header[$segment_index + 1] == 0)
									? strlen($item) - $starting_byte_of_segment
									: $header[$segment_index + 1] - $starting_byte_of_segment;
								
								$temp[$counter - 1][$segment_index] = '';
								$expected_segment_size = $cols*$rows*$bytes_to_read/$total_segments;
								$bytes_count = $current_segment_size = 0;

								while ($bytes_count < $size_of_segment)
								{
									$tmp = $starting_byte_of_segment + $bytes_count;
									// Read "n"
									$n = substr($item, $starting_byte_of_segment + $bytes_count, 1);
									$n = $this->{Nanodicom::$_read_int}(1, Nanodicom::LITTLE_ENDIAN, 1, Nanodicom::SIGNED, $n);
									// Add 1
									$bytes_count++;

									if ($n >= 0 AND $n <= 127)
									{
										$temp[$counter - 1][$segment_index] .= substr($item, $starting_byte_of_segment + $bytes_count, $n + 1);
										$bytes_count = $bytes_count + $n + 1;
										$current_segment_size = $current_segment_size + $n + 1;
									}
									elseif ($n <= -1 AND $n >= -127)
									{
										$byte = substr($item, $starting_byte_of_segment + $bytes_count, 1);
										$temp[$counter - 1][$segment_index] .= str_repeat($byte, -$n + 1);
										$bytes_count++;
										$current_segment_size = $current_segment_size - $n + 1;
									}
									else
									{
										// Do nothing
									}
								}
								$segment_index++;
							}
						}
						// Increment counter
						$counter++;
					}
				}
			}
			$counter--;
			$blob = '';

			for ($count = 0; $count < $counter; $count++)
			{
				if ($photometric_interpretation == 'RGB')
				{
					if ($planar_configuration == 1)
					{
						// Color-by-plane: RRR..., GGG..., BBB...
						$blob .= implode('', $temp[$count]);
					}
					else
					{
						// Color-by-pixel: RGB, RGB, RGB..
					}
				}
				else
				{
					$dimension = $cols*$rows;
					
					for ($i = 0; $i < $dimension; $i++)
					{
						$part = '';
						foreach ($temp[$count] as $segment)
						{
							$part = substr($segment, $i, 1) . $part;
						}
						$blob .= $part;
					}
				}
			}
		}
		
		// Blob here has "uncompressed" data (from raw or RLE)

		if ($photometric_interpretation == 'PALETTE COLOR')
		{
			$this->_samples_per_pixel = 3;
			
			$palettes = array();
			$palettes['R'] = array($this->get(0x0028,0x1101), $this->get(0x0028,0x1201));
			$palettes['G'] = array($this->get(0x0028,0x1102), $this->get(0x0028,0x1202));
			$palettes['B'] = array($this->get(0x0028,0x1103), $this->get(0x0028,0x1203));
			$palettes['A'] = array($this->get(0x0028,0x1104), $this->get(0x0028,0x1204));

			$entries = (int) $palettes['R'][0]['val1'];
			$entries = ($entries == 0) ? pow(2, 16) : $entries;
			$first   = $palettes['R'][0]['val2'];
			$size    = $palettes['R'][0]['val3'];

			$palette_byte_size = (int) $size/8;
			$offset = 8;
			
			$current_position = 0;
			$colors = array('R', 'G', 'B');

			// Now let's create the right values for the images
			for ($index = 0; $index < $number_of_frames; $index++) 
			{
				// Create the image object
				$image = self::create_image($cols, $rows);
				for($y = 0; $y < $rows; $y++) 
				{
					for ($x = 0; $x < $cols; $x++)
					{
						$rgb = array();
						$value = $this->_read_gray($blob, $current_position, $bytes_to_read);

						$palette_index = ($value <= $first)
							? $first
							: (($value > $first + $entries) ? $first + $entries - 1 : $value);

						$current_position += $bytes_to_read;
						
						for ($sample = 0; $sample < 3; $sample++)
						{
							
							$tmp = $this->_read_gray($palettes[$colors[$sample]][1]
									, $palette_byte_size*$palette_index, $palette_byte_size);
							
							$rgb[$sample] = $tmp >> 8;
						}

						
						// Set the color
						$color = $this->_allocate_color_rgb($image, $rgb);
						$rgb = NULL;

						// Set the pixel value
						$this->_set_pixel($image, $x, $y, $color);
						$color = NULL;
					}
				}
				
				// Append the current image
				$images[] = $image;
				$image = NULL;
			}
			
			return $images;
		}
		else
		{
			// Do this if no window center and window width are set and when samples per pixel is 1 (gray images).
			if (($window_center == 0 OR $window_width == 0) AND $samples_per_pixel == 1)
			{
				$length	= strlen($blob);

				// This is costly performance wise! :(
				while ($current_position < $starting_position + $length)
				{
					if ($current_position == $starting_position + $current_image*$image_size) 
					{
						// A new image has been found
						$x   = 0;
						$y   = 0;
						
						$max[$current_image] = -200000; // Small enough so it will be properly calculated
						$min[$current_image] = 200000;  // Large enough so it wil be properly calculated

						$current_image++;
					}

					$gray = $this->_read_gray($blob, $current_position, $bytes_to_read);
					$current_position += $bytes_to_read;
					
					// Getting the max
					if ($gray > $max[$current_image - 1])
					{
						// max
						$max[$current_image - 1] = $gray;
					}

					// Getting the min
					if ($gray < $min[$current_image - 1]) 
					{
						// min
						$min[$current_image - 1] = $gray;
					}
					$y++;

					if ($y == $cols)
					{ 
						// Next row
						$x++;
						$y = 0;
					}
				}
			}
		}

		$current_position = $starting_position = 0;

		// Now let's create the right values for the images
		for ($index = 0; $index < $number_of_frames; $index++) 
		{
			if ($samples_per_pixel == 1)
			{
				// Real max and min according to window center & width (if set)
				$maximum = ($window_center != 0 AND $window_width != 0)
					? round($window_center + $window_width/2)
					: $max[$index];
					
				$minimum = ($window_center != 0 AND $window_width != 0)
					? round($window_center - $window_width/2)
					: $min[$index];

				// Check if window and level are sent
				$maximum = ( ! empty($window) AND ! empty($level))
					? round($level + $window/2)
					: $maximum;
				$minimum = ( ! empty($window) AND ! empty($level))
					? round($level - $window/2)
					: $minimum;

				if ($maximum == $minimum) 
				{ 
					// Something wrong. Avoid having a zero division
					throw new Nanodicom_Exception('Division by zero', NULL, 302);
				}
			}

			// Create the image object
			$image = self::create_image($cols, $rows);
			$pixels = array();
			for($y = 0; $y < $rows; $y++) 
			{
				for ($x = 0; $x < $cols; $x++)
				{
					switch ($samples_per_pixel)
					{
						case 1:
							$gray = $this->_read_gray($blob, $current_position, $bytes_to_read);
							$current_position += $bytes_to_read;

							// truncating pixel values over max and below min
							$gray = ($gray > $maximum) ? $maximum : $gray;
							$gray = ($gray < $minimum) ? $minimum : $gray;

							// Converting to gray value
							$gray = ($gray - $minimum)/($maximum - $minimum)*255;

							// For MONOCHROME1 we have to invert the pixel values.
							if ($photometric_interpretation == 'MONOCHROME1') 
							{
								$gray = 255 - $gray;
							}
							// Set the (gray) color
							$color = $this->_allocate_color_gray($image, $gray);
							$gray = NULL;
						break;
						case 3:
							// It has 3 colors
							$rgb = array();
							for ($sample = 0; $sample < $samples_per_pixel; $sample++)
							{
								$current_position = ($planar_configuration == 0)
									? $current_position
									: $sample * ($rows * $cols) + ($y*$cols + $x);
								$rgb[$sample] = $this->_read_gray($blob, $current_position, $bytes_to_read);
								$current_position += $bytes_to_read;
							}
		
							// Set the color
							$color = $this->_allocate_color_rgb($image, $rgb);
							
							$rgb = NULL;
						break;
						default:
						break;
					}

					// Set the pixel value
					$this->_set_pixel($image, $x, $y, $color);
					$color = NULL;
				}
			}

			// Append the current image
			$images[] = $image;
			$image = NULL;
		}

		// Collect the ending time for the profiler
		$this->profiler['pixel']['end'] = microtime(TRUE);
        return $images;
    }

	/**
	 * Public method to write images based on library used and format
	 *
	 * @param resource the image object instance
	 * @param string the format to be saved. defaults to jpeg
	 * @return boolean true on success, false on failure
	 */
	public function write_image($image, $location, $format = 'jpg')
	{
		switch (self::$driver)
		{
			case 'gd' :
				switch ($format)
				{
					case 'png': imagepng($image, $location.'.png');
					break;
					case 'gif': imagegif($image, $location.'.gif');
					break;
					case 'jpg':
					default:
						imagejpeg($image, $location.'.jpg');
					break;
				}
			break;
			case 'gmagick' :
			case 'imagick' :
				switch ($format)
				{
					case 'png': $format = 'png';
					break;
					case 'gif': $format = 'gif';
					break;
					default: $format = 'jpg';
					break;
				}
				$image->writeImage($location.'.'.$format);
			break;
		}
		
		return TRUE;
	}

	/**
	 * Internal method to read image from blob (string)
	 *
	 * @param string  the binary data to be read
	 * @return mixed an instance of the image based on library (driver), false on failure
	 */
	protected function _read_image_blob($string)
	{
		switch (self::$driver)
		{
			case 'gd' : return imagecreatefromstring($string);
			case 'gmagick' :
			case 'imagick' :
				$image = new imagick();
				$image->readImageBlob($string);
				return $image;
		}
		
		return FALSE;
	}

	/**
	 * Internal method to allocate the color for image instance (color)
	 *
	 * @param resource the image object instance
	 * @param integer the color value
	 * @return mixed color value or class, false on failure
	 */
	protected function _allocate_color_rgb($image, $rgb)
	{
		switch (self::$driver)
		{
			case 'gd': return imagecolorallocate($image, $rgb[0], $rgb[1], $rgb[2]);
			case 'gmagick': return new GmagickPixel('rgb('.$rgb[0].','.$rgb[1].','.$rgb[2].')');
			case 'imagick': return new ImagickPixel('rgb('.$rgb[0].','.$rgb[1].','.$rgb[2].')');
		}
		
		return FALSE;
	}
	
	/**
	 * Internal method to allocate the color for image instance (gray)
	 *
	 * @param resource the image object instance
	 * @param integer the gray value
	 * @return mixed color value or class, false on failure
	 */
	protected function _allocate_color_gray($image, $gray)
	{
		switch (self::$driver)
		{
			case 'gd': return imagecolorallocate($image, $gray, $gray, $gray);
			case 'gmagick': return new GmagickPixel('rgb('.$gray.','.$gray.','.$gray.')');
			case 'imagick': return new ImagickPixel('rgb('.$gray.','.$gray.','.$gray.')');
		}
		
		return FALSE;
	}

	/**
	 * Internal method to set a pixel into the existing image object instance
	 *
	 * @param resource the image object instance
	 * @param integer the x position
	 * @param integer the y position
	 * @param integer the color to be set
	 * @return boolean true on success, false on failure
	 */
	protected function _set_pixel( & $image, $x, $y, $color)
	{
		switch (self::$driver)
		{
			case 'gd': imagesetpixel($image, $x, $y, $color);
				return TRUE;
			case 'gmagick': $draw = new GmagickDraw();
				$draw->setFillColor($color);
				$draw->point($x, $y);
				$image->drawImage($draw);
				return TRUE;
			case 'imagick': $draw = new ImagickDraw();
				$draw->setFillColor($color);
				$draw->point($x, $y);
				$image->drawImage($draw);
				return TRUE;
		}
		
		return FALSE;
	}

	/**
	 * Public static method to create an instance of the image
	 *
	 * @param integer the number of columns
	 * @param integet the number of rows
	 * @return mixed  the corresponding object from the set driver or false on failure
	 */
	public static function create_image($cols, $rows)
	{
		switch (self::$driver)
		{
			case 'gd': return imagecreatetruecolor($cols, $rows);
			case 'gmagick':  $image = new Gmagick();
				$image->newImage($cols, $rows, 'none');
				return $image;
			case 'imagick': $image = new Imagick();
				$image->newImage($cols, $rows, 'none');
				return $image;
		}
		
		return FALSE;
	}
	
	/**
	 * Internal method to check if drivers are installed
	 *
	 * @return  bool true if driver is installed, false otherwise
	 */
	protected function _check_driver()
	{
		switch (self::$driver)
		{
			case 'gd': return function_exists('imagecreatetruecolor');
			case 'gmagick': return class_exists('Gmagick');
			//case 'imagick': return (class_exists('Imagick') AND method_exists('Imagick', 'importImagePixels'));
			case 'imagick': return class_exists('Imagick');
		}
		
		return FALSE;
	}
	
	/**
	 * Internal method to read a 'gray' value.
	 *
	 * @param string the blob that holds the pixel data
	 * @param integer the current position in the string to read
	 * @param integet the number of bytes to read
	 * @return integer the gray or color value at the given location
	 */
	protected function _read_gray($blob, $current_position, $bytes_to_read)
	{
		if ($this->_samples_per_pixel == 1)
		{
			$chunk = substr($blob, $current_position, $bytes_to_read);
			$gray = $this->{Nanodicom::$_read_int}($bytes_to_read, $this->_endian, $bytes_to_read, Nanodicom::UNSIGNED, $chunk);
			$chunk = NULL;
			
			// Checking if 2's complement
			$gray = ($this->_pixel_representation)
				? self::complement2($gray, $this->_high_bit)
				: $gray;
			// Getting the right value according to slope and intercept 
			$gray = $gray*$this->_rescale_slope + $this->_rescale_intercept;
			// Multiplying for dose_grid_scaling
			return $gray*$this->_dose_scaling;
		}
		else
		{
			// Read current position, it is 3 samples
			$chunk = substr($blob, $current_position, $bytes_to_read);
			return $this->{Nanodicom::$_read_int}($bytes_to_read, $this->_endian, $bytes_to_read, Nanodicom::UNSIGNED, $chunk);
		}
	}

	/**
	 * Static method to find the complement of 2, returns an integer.
	 *
     * @param integer  the integer number to convert
     * @param integer  the high bit for the value. By default 15 (assumes 2 bytes)
     * @return integer the number after complement's 2 applied 
	 */
    public static function complement2($number, $high_bit = 15) 
    {
        $sign = $number >> $high_bit;
        if ($sign) 
		{ 
			// Negative
            $number = -pow(2, $high_bit + 1) - $number;
        }
        return $number;
    }
}
