<?php

require_once 'nanodicom.php';

class NanodicomCoreTest extends PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider provider
     */
	 public function testSummary($output, $expected)
    {
		$this->assertEquals($output, $expected);
    }
 
    /**
     */
    public function provider()
    {

		$samples_dir = realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR.'samples'.DIRECTORY_SEPARATOR;
		$output_dir  = realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR.'tests'.DIRECTORY_SEPARATOR;

		$files = array();
		if ($handle = opendir($samples_dir))
		{
			while (false !== ($file = readdir($handle))) 
			{
				if ($file != "." && $file != ".." && is_file($samples_dir.$file)) 
				{
					$files[] = $file;
				}
			}
			closedir($handle);
		}

		$data = array();
		foreach ($files as $file)
		{
			$filename = $samples_dir.$file;
			$dicom  = Nanodicom::factory($filename);
			$data[] = array(
				$dicom->summary(),
				file_get_contents($output_dir.$file.'.summary.txt'),
			);
			unset($dicom);
		}
		
		return $data;
	}
		
}
