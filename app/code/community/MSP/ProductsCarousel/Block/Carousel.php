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

class MSP_ProductsCarousel_Block_Carousel extends MSP_ProductsCarousel_Block_Abstract implements Mage_Widget_Block_Interface
{
	protected $_template = 'ig_productscarousel/carousel.phtml';
	
	public function getCarouselParams()
	{
		$options = parent::getCarouselParams();
		return array_merge($options, array(
			'dots-activation' => $this->getData('dotsactivation'),
			'dots-position' => $this->getData('dotsposition'),
			'dots-style' => $this->getData('dotsstyle'),
			'commands-activation' => $this->getData('commandsactivation'),
		));
	}
}
