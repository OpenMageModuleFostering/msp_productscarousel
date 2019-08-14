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

abstract class MSP_ProductsCarousel_Block_Abstract extends Mage_Core_Block_Template implements Mage_Widget_Block_Interface
{
	protected $_carouselId = null;
	protected $_collection = null;
	
	/**
	 * Get category's id
	 * 
	 * @return int
	 */
	public function getCategoryId()
	{
		$p = explode('/', $this->getData('id_path'));
		return (int) $p[1];
	}
	
	/**
	 * Get unique id for current carousel
	 * 
	 * @return string
	 */
	public function getCarouselId()
	{
		if (!$this->_carouselId)
			$this->_carouselId = uniqid('carousel_');
		
		return $this->_carouselId;
	}
	
	/**
	 * Return slider parameters
	 * 
	 * @return array
	 */
	public function getCarouselParams()
	{
		return array(
			'id' => $this->getCarouselId(),
			'items' => intval($this->getData('cols')),
			'singleItem' => $this->getData('single_step') ? true : false,
			'slideSpeed' => intval($this->getData('speed')),
			'autoPlay' => $this->getData('autoplay') ? true : false,
			'stopOnHover' => $this->getData('stophover') ? true : false,
			'navigation' => $this->getData('navigation') ? true : false,
			'responsive' => $this->getData('responsive') ? true : false,
			'paginationNumbers' =>$this->getData('paginationNumbers') ? true : false,
			'pagination' => $this->getData('pagination') ? true : false,
			'scrollPerPage' => $this->getData('single_step') ? true : false,
			'baseClass' => $this->getData('customcssclass'),
		);
	}
	
	/**
	 * Get JS params
	 * 
	 * @return string
	 */
	public function getJsCarouselParams()
	{
		return Mage::helper('core')->jsonEncode($this->getCarouselParams());
	}
	
	/**
	 * Get product's collection
	 * 
	 * @return Mage_Catalog_Model_Product_Collection 
	 */
	public function getCollection()
	{
		$categoryId = $this->getCategoryId();
		if (!$categoryId)
			return null;
		
		if (is_null($this->_collection))
		{
			$category = Mage::getModel('catalog/category')->load($categoryId);
			
			if (!$category->getId())
				return null;
			
			$rows = intval($this->getData('rows'));
			$cols = intval($this->getData('cols'));
			$slides = intval($this->getData('max_slides'));
			
			$store = Mage::app()->getStore();

			$visibility = array(
				Mage_Catalog_Model_Product_Visibility::VISIBILITY_BOTH,
				Mage_Catalog_Model_Product_Visibility::VISIBILITY_IN_CATALOG
			);
	
			$this->_collection = Mage::getModel('catalog/product')->getCollection();
			$this->_collection
				->addAttributeToSelect('*')
				->addStoreFilter($store->getStoreId())
				->addWebsiteFilter($store->getWebsite())
				->addPriceData(0, $store->getWebsiteId())
				->joinAttribute('custom_name', 'catalog_product/name', 'entity_id', null, 'inner', $store->getId())
				->joinAttribute('status', 'catalog_product/status', 'entity_id', null, 'inner', $store->getId())
				->joinAttribute('visibility', 'catalog_product/visibility', 'entity_id', null, 'inner', $store->getId())
				->addAttributeToFilter('visibility', $visibility)
				->setPage(1, $rows*$cols*$slides)
				->addCategoryFilter($category);
			
			if ($this->getData('randomize_order'))
			{
				$this->_collection->getSelect()->order(new Zend_Db_Expr('RAND()'));
			}
		}
		
		return $this->_collection;
	}
	
	/**
	 * Return product's list in HTML format
	 * 
	 * @return string
	 */
	public function getProductsListHtml()
	{
		$collection = $this->getCollection();
		$return = array();		
		$limit=$this->getData('max_slides');
		$count=0;

		foreach ($collection as $p)
		{
			
			$return[] = '<div class="item">';
			$return[] = $this->getLayout()->createBlock('msp_productscarousel/product')
				->setParentBlock($this)
				->setProduct($p)
				->toHtml();
			$count++;
			if($count==$limit){
				$return[] = '</div>';
				break;
			}
			$return[] = '</div>';
		}
		
		return implode("\n", $return);
	}
}
