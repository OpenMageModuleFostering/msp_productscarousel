 <?php
/**
 * IDEALIAGroup srl
 *
* NOTICE OF LICENSE
*
* This source file is subject to the Open Software License (OSL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/osl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to info@idealiagroup.com so we can send you a copy immediately.
 *
 * @category   MSP
 * @package    MSP_ProductsCarousel
 * @copyright  Copyright (c) 2012-2014 IDEALIAGroup srl (http://www.idealiagroup.com)
 * @license    http://www.idealiagroup.com/magento-ext-license.html
 */
 
class MSP_ProductsCarousel_Model_Source_Effect
{
	public function toOptionArray()
	{
		return array(
			array(
				'label'	=> Mage::helper('msp_productscarousel')->__('None'),
				'value' => 'none',
			),
			array(
				'label'	=> Mage::helper('msp_productscarousel')->__('Slide'),
				'value' => 'slide',
			),
			array(
				'label'	=> Mage::helper('msp_productscarousel')->__('Fade'),
				'value' => 'fade',
			),
		);
	}
}
