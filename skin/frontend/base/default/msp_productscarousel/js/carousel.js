/**
 * IDEALIAGroup srl
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the EULA
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.idealiagroup.com/magento-ext-license.html
 *
 * @category   IG
 * @package    IG_ProductsCarousel
 * @copyright  Copyright (c) 2012-2013 IDEALIAGroup srl (http://www.idealiagroup.com)
 * @license    http://www.idealiagroup.com/magento-ext-license.html
 */

function igCarouselLoadScript(url, callback)
{
	var script = document.createElement("script")
	script.type = "text/javascript";

	if (script.readyState)
	{
		script.onreadystatechange = function () {
	    	if (script.readyState == "loaded" || script.readyState == "complete")
	    	{
				script.onreadystatechange = null;
				callback();
			}
		};
	}
	else
	{
		script.onload = function () {
        	callback();
    	};
   	}
   
   	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

function igCarouselLoadJQuery(callback)
{
	if (typeof(jQuery) == 'undefined')
	{
		igCarouselLoadScript('https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js', function () {
			igCarouselLoadScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js', function () {
				callback();
			});
		});
	}
	else if (typeof(jQuery.ui) == 'undefined')
	{
		igCarouselLoadScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js', function () {
			callback();
		});
	}
	else
	{
		callback();
	}
}
    
igCarouselLoadJQuery(function () {

	jQuery.fn.igCarousel = function(options) {
		var that = this;
		
		this.$me = jQuery(that);
		var myId = this.$me.attr('id');
		
		// Locate productscarousel items
		this.$inner = this.$me.find('> .ig-productscarousel-inner');
		this.$ul = this.$inner.find('> ul');
		this.$items = this.$me.find('.ig-productscarousel-item');

		// Reset items
		this.$commands = null;
		this.$commandNext = null;
		this.$commandPrev = null;
		this.$dots = null;
		this.$loader = null;
		this.itemsPerSlide = (options['rows'] * options['cols']);
		this.slideStep = 0;

		this.options = options;

		// Compute items height		
		that.options['height'] = 0;
		this.$items.each(function() {
    		var h = jQuery(this).outerHeight(); 
    		that.options['height'] = h > that.options['height'] ? h : that.options['height'];
		});
		
		that.options['height']*=options['rows'];
		
		// Initialize slider values
		this.currentSlide = 0;
		this.timerSlide = 0;
		this.isPlaying = options['autoplay'];
		this.itemWidth = Math.floor(this.options['width']/this.options['cols']);
		this.itemHeight = Math.floor(this.options['height']/this.options['rows']);
		
		// Slide step setting
		if (options['single_step'])
		{
			this.slides = Math.ceil(this.$items.length / options['rows']) + ((this.$items.length % options['rows']) ? 1 : 0);
			this.slideStep = this.itemWidth;
		}
		else
		{
			this.slides = Math.ceil(this.$items.length / this.itemsPerSlide) + ((this.$items.length % this.itemsPerSlide) ? 1 : 0);
			this.slideStep = options['cols'] * this.itemWidth;
		}
		
		this.slides--;
		
		this.init = function () {
			this.$me
				.addClass(this.options['customcssclass'])
				.css('position', 'relative')
				.css('width', this.options['width']+'px')
				.css('height', this.options['height']+'px')
				.css('clip', 'rect(0px,'+this.options['width']+'px,'+this.options['height']+'px,0px)');
				
			this.$inner
				.css('position', 'absolute')
				.css('width', this.options['width']+'px')
				.css('height', this.options['height']+'px')
				.css('clip', 'rect(0px,'+this.options['width']+'px,'+this.options['height']+'px,0px)');

			this.$ul
				.css('position', 'absolute');

			this.$ul
				.css('display', 'block');

			this.$items
				.css('position', 'absolute')
				.css('width', this.itemWidth+'px')
				.css('height', this.itemHeight+'px');
			
			// Set items position
			for (var i=0; i<this.$items.length; i++)
			{
				var left = this.itemWidth*Math.floor(i / this.options['rows']);
				var top = this.itemHeight*(i % this.options['rows']);
				
				jQuery(this.$items[i])
					.css('top', top+'px')
					.css('left', left+'px');
			}
			
			this.initCommands();
			this.initDots();
			this.initLoader();

			this.$items
				.css('display', 'block');
			
			if (this.isPlaying)
				this.play();
				
			this.$me.hover(function () {
				that.stop();
			}, function () {
				that.play();
			});
		};
		
		this.initCommands = function () {
			if (this.options['commands-activation'] == 'none')
				return;
				
			this.$commands = jQuery('<div></div>')
				.addClass('ig-productscarousel-commands')
				.addClass('ig-productscarousel-carousel')
				.attr('id', myId+'-commands')
				.css('height', this.options['height']+'px')
				.css('z-index', 300);
			
			this.$commandNext = jQuery('<div><a></a></div>')
				.addClass('ig-productscarousel-command')
				.addClass('ig-productscarousel-command-next')
				.addClass('ig-productscarousel-carousel')
				.attr('id', myId+'-command-next')
				.css('position', 'absolute')
				.css('height', this.options['height']+'px')
				.css('z-index', 300);
				
			this.$commandPrev = jQuery('<div><a></a></div>')
				.addClass('ig-productscarousel-command')
				.addClass('ig-productscarousel-command-prev')
				.addClass('ig-productscarousel-carousel')
				.attr('id', myId+'-command-prev')
				.css('position', 'absolute')
				.css('height', this.options['height']+'px')
				.css('z-index', 300);
				
			this.$commands.append(this.$commandNext);
			this.$commands.append(this.$commandPrev);
				
			this.$me.append(this.$commands);
			
			this.$commandNext.click(function () {
				that.moveNext();
			});
			
			this.$commandPrev.click(function () {
				that.movePrev();
			});
			
			if (this.options['commands-activation'] == 'onmouseover')
			{
				this.$commandNext.css('opacity', 0);
				this.$commandPrev.css('opacity', 0);
				
				this.$me.hover(function () {
					that.$commandNext.animate({'opacity': 1});
					that.$commandPrev.animate({'opacity': 1});
				}, function () {
					that.$commandNext.animate({'opacity': 0});
					that.$commandPrev.animate({'opacity': 0});
				});
			}
		};
		
		this.initDots = function () {
			if (this.options['dots-activation'] == 'none')
				return;
				
			this.$dots = jQuery('<div></div>')
				.addClass('ig-productscarousel-dots')
				.addClass('ig-productscarousel-carousel')
				.attr('id', myId+'-dots')
				.css('position', 'absolute')
				.css('z-index', 301);
				
			var position = this.options['dots-position'];
			var r = position.match(/^(\w+)\,(\w+)$/);
			if (r)
			{
				hposition = ""+r[1];
				vposition = ""+r[2];
			}
							
			$ul = jQuery('<ul></ul>');
			for (var i=0; i<this.slides; i++)
			{
				var $li = jQuery('<li></li>');
				$li
					.attr('rel', i)
					.addClass('ig-productscarousel-dot')
					.addClass('ig-productscarousel-carousel');
				
				if (i==0) $li.addClass('active');
				
				$li.click(function () {
					that.slide(parseInt(jQuery(this).attr('rel')));
				});
				
				if (this.options['dots-style'] == 'numeric')
				{
					$li
						.addClass('ig-productscarousel-dot-numeric')
						.html('<span>'+(i+1)+'</span>');
				}
				else
				{
					$li
						.addClass('ig-productscarousel-dot-dot')
				}
					
				$ul.append($li);
			}
			
			this.$dots.append($ul);
			this.$me.append(this.$dots);
			
			switch (hposition)
			{
				case 'left':
					this.$dots.css('left', '0px');
					break;
					
				case 'right':
					this.$dots.css('right', '0px');
					break;
					
				case 'center':
					this.$dots
						.css('left', '50%')
						.css('margin-left', -(this.$dots.outerWidth()/2)+'px');
					break;
			}
			
			switch (vposition)
			{
				case 'top':
					this.$dots.css('top', '0px');
					break;
					
				case 'bottom':
					this.$dots.css('bottom', '0px');
					break;
			}
			
			if (this.options['dots-activation'] == 'onmouseover')
			{
				this.$dots.css('opacity', 0);
				
				this.$me.hover(function () {
					that.$dots.animate({'opacity': 1});
				}, function () {
					that.$dots.animate({'opacity': 0});
				});
			}
		};
		
		this.initLoader = function () {
			if (this.options['loader-position'] == 'none')
				return;
				
			var $innerBar = jQuery('<div class="ig-productscarousel-loader-innerbar ig-productscarousel-carousel"></div>');
			var $outerBar = jQuery('<div class="ig-productscarousel-loader-outerbar ig-productscarousel-carousel"></div>');
			this.$loader = jQuery('<div class="ig-productscarousel-loader ig-productscarousel-carousel"></div>');
	
			this.$loader
				.css('z-index', 300)
				.css('position', 'absolute');
			
			switch (this.options['loader-position'])
			{
				case 'top':
					this.$loader
						.css('top', 0)
						.css('left', 0)
						.css('width', this.options['width']+'px');
					break;
					
				case 'bottom':
					this.$loader
						.css('bottom', 0)
						.css('left', 0)
						.css('width', this.options['width']+'px');
					break;
			}
				
			$innerBar
				.css('width', 0);
			
			$outerBar.append($innerBar);
			this.$loader.append($outerBar);
			
			this.$me.append(this.$loader);
		};
		
		this.play = function () {
			this.isPlaying = true;
			
			if (this.$loader) this.$loader.css('display', 'block');
			
			that.startLoader();
			this.timerSlide = window.setTimeout(function () {
				that.slide(that.currentSlide + 1);
			}, this.options['delay']);
		};
		
		this.moveNext = function () {
			this.slide(this.currentSlide + 1);
		};
		
		this.movePrev = function () {
			this.slide(this.currentSlide - 1);
		};
		
		this.stop = function () {
			if (this.$loader) this.$loader.css('display', 'none');
			
			this.isPlaying = false;
			this.pause();
		};
		
		this.startLoader = function () {
			if (!this.$loader || !this.isPlaying)
				return;
			
			this.$loader.find('.ig-productscarousel-loader-innerbar')
				.stop(true)
				.css('width', '0px');
			this.$loader.find('.ig-productscarousel-loader-innerbar').animate({
				width: this.options['width']+'px'
			}, this.options['delay'], 'linear', function () {
				that.$loader.find('.ig-productscarousel-loader-innerbar').css('width', '0px');
			});
		};
		
		this.pause = function () {
			if (this.timerSlide)
			{
				window.clearTimeout(this.timerSlide);
				this.timerSlide = 0;
			}
			
			if (this.timerText)
			{
				window.clearTimeout(this.timerText);
				this.timerText = 0;
			}
		};
		
		this.slide = function(slideN) {
			if (this.slides < 2)
				return;
			
			this.pause();
			
			var effect = this.options['effect'];
			var easing = this.options['easing'];
			
			if (slideN < 0) slideN = this.slides-1;
			slideN = slideN % this.slides;
			
			this.currentSlide = slideN;
			
			this.$me.find('.ig-productscarousel-dots li').removeClass('active');
			this.$me.find('.ig-productscarousel-dots li[rel='+slideN+']').addClass('active');
			
			this.$commandPrev.css('display', (slideN == 0) ? 'none' : 'block');
			this.$commandNext.css('display', (slideN == this.slides-1) ? 'none' : 'block');
			
			var effectCss = new Array();
			
			function animationCallBack()
			{
				if (that.isPlaying)
				{
					that.startLoader();
					that.timerSlide = window.setTimeout(function () {
						that.slide(slideN + 1);
					}, that.options['delay']);
				}
			}
			
			var deltaLeft = slideN * this.slideStep;
			
			switch (effect)
			{
				case 'slide':
					this.$ul.animate({
						left: -deltaLeft + 'px'
					}, this.options['speed'], this.options['easing'], animationCallBack);
					break;
					
				case 'fade':
					this.$ul.animate({
						opacity: 0,
					}, this.options['speed']/2, this.options['easing'], function () {
						
						that.$ul.css('left', -deltaLeft + 'px');
						
						that.$ul.animate({
							opacity: 1
						}, that.options['speed']/2, that.options['easing'], animationCallBack);
					});
					break;
					
				case 'none':
					that.$ul.css('left', -deltaLeft + 'px');
					animationCallBack();
					break;
			}
	};
		
		this.init();
	};
});
