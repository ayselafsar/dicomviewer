<?php
/**
 * nanodicom.php file
 *
 * @package    Nanodicom
 * @category   Base
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */

// Set the full path to the current folder
define('NANODICOMROOT', realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR);
define('NANODICOMCOREPATH', realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR.'nanodicom'.DIRECTORY_SEPARATOR);

// Require the core class
require_once NANODICOMCOREPATH.'core.php';

/**
 * abstract Nanodicom class.
 *
 * All tools extend this class. Simple wrapper for Core class.
 * @package    Nanodicom
 * @category   Base
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */
abstract class Nanodicom extends Nanodicom_Core {}
