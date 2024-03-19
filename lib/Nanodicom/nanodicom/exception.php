<?php
/**
 * nanodicom/exception.php file
 *
 * @package    Nanodicom
 * @category   Base
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */

/**
 * Nanodicom_Extension class.
 *
 * Own class for exception. Many lines of code taken from the {http://www.kohanaframework.org
 * Kohana framework}
 * @package    Nanodicom
 * @category   Base
 * @author     Nano Documet <nanodocumet@gmail.com>
 * @version	   1.3.1
 * @copyright  (c) 2010-2011
 * @license    http://www.opensource.org/licenses/mit-license.php MIT-license
 */
class Nanodicom_Exception extends Exception {

	/**
	 * Creates a new translated exception.
	 *
	 *     throw new Nanodicom_Exception('Something went terrible wrong, :user',
	 *         array(':user' => $user));
	 *
	 * @param   string     error message
	 * @param   array      translation variables
	 * @param   integer    the exception code
	 * @return  void
	 */
	public function __construct($message, array $variables = NULL, $code = 0)
	{
		// Set the message
		$message = empty($variables) ? $message : strtr($message, $variables);

		// Pass the message to the parent
		parent::__construct($message, $code);
	}

	/**
	 * Magic object-to-string method.
	 *
	 * Get a single line of text representing the exception:
	 *     echo $exception;
	 * Error [ Code ]: Message
	 *
	 * @return  string
	 */
	public function __toString()
	{
		return sprintf('%s [ %s ]: %s',
			get_class($this), $this->getCode(), strip_tags($this->getMessage()));
	}

} // End Nanodicom_Exception
