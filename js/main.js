/* ------------------------------------------------------------------------ *
 * JavaScript
 * ------------------------------------------------------------------------ */

var initPhotoSwipeFromDOM = function(gallerySelector) {

    /**
     * Loop through thumbnails and return items object.
     *
     * @return obj items
     */
    var parseThumbnailElements = function(el)
    {

        var thumbElements = el.getElementsByTagName('a'),
            numNodes = thumbElements.length,
            items = [],
            divEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            /*
             * <div> wrapper around each thumbnial.
             */
            divEl = thumbElements[i].parentNode;

            /*
             * Include only element nodes.
             */
            if(divEl.nodeType !== 1) {
                continue;
            }

            /*
             * <a> containing link to large image and data-image-size-large.
             * Optional data-image-medium and data-image-size-medium.
             */
            linkEl = divEl.children[0];

            size = linkEl.getAttribute('data-image-size-large').split('x');

            /*
             * Create slide items object.
             */
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };

            /*
             * Get thumbnail url for loading before large image
             */
            if(linkEl.children.length > 0) {
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            /*
             * Create medium slide items object if data exists.
             */
            var mediumSrc = linkEl.getAttribute('data-image-medium');
            if(mediumSrc) {
                size = linkEl.getAttribute('data-image-size-medium').split('x');
                /*
                 * Medium image.
                 */
                item.m = {
                    src: mediumSrc,
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };
            }
            /*
             * Original image.
             */
            item.o = {
                src: item.src,
                w: item.w,
                h: item.h
            };

            /*
             * Save for getThumbBoundsFn.
             */
            item.el = divEl;
            items.push(item);
        }

        return items;

    };


    /**
     * Find nearest parent element.
     *
     * @return element
     */
    var closest = function closest(el, fn)
    {

        return el && ( fn(el) ? el : closest(el.parentNode, fn) );

    };


    /**
     * Trigger when a thumbnail is clicked.
     *
     * @return void
     */
    var onThumbnailsClick = function(e)
    {

        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        /*
         * Find root element of clicked slide which is a div.
         */
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'DIV');
        });

        if(!clickedListItem) {
            return;
        }

        /*
         * Get clicked gallery nodes.
         */
        var clickedGallery = document.querySelector(gallerySelector),
            index;

        /*
         * Save index of the clicked thumbnail.
         */
        index = parseInt(clickedListItem.getAttribute('data-image-index'));

        /*
         * Open PhotoSwipe if valid index found.
         */
        if(index >= 0) {
            openPhotoSwipe( index, clickedGallery );
        }

        return false;

    };


    /**
     * Create Photoswipe instance.
     *
     * @return void
     */
    var openPhotoSwipe = function(index, galleryElement, disableAnimation)
    {

        /*
         * Append HTML to the body.
         */
        jQuery('body').append(galleryHtml);
        
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        /*
         * Loop through thumbnails and return items object.
         */
        items = parseThumbnailElements(galleryElement);

        /*
         * Define options.
         */
        options = {
            index: index,
            history: false,
            closeOnScroll: false,
            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                //return {x:0, y:0, w:rect.width};
            }
        };

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }


        /*
         * Pass data to PhotoSwipe. Don't initialize yet as need to set up responsive image swaps.
         */
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);


        /*
         * Reponsive image swapping
         * http://photoswipe.com/documentation/responsive-images.html
         */
        var realViewportWidth,
            useLargeImages = false,
            firstResize = true,
            imageSrcWillChange;

        gallery.listen('beforeResize', function() {

            var dpiRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
            dpiRatio = Math.min(dpiRatio, 2.5);
            realViewportWidth = gallery.viewportSize.x * dpiRatio;

            /*
             * First condition is for retina mobiles, potentially 2 pixel density 600px wide so 1200px.
             * Other conditions pretty much show large images on computer size screens.
             * May require some tweaking.
             */
            if(realViewportWidth >= 1200 || (!gallery.likelyTouchDevice && realViewportWidth > 800) || screen.width > 1200 ) {
                if(!useLargeImages) {
                    useLargeImages = true;
                    imageSrcWillChange = true;
                }
                
            } else {
                if(useLargeImages) {
                    useLargeImages = false;
                    imageSrcWillChange = true;
                }
            }

            /*
             * imageSrcWillChange needs to be true.
             * firstResize needs to be false.
             */
            if(imageSrcWillChange && !firstResize) {
                gallery.invalidateCurrItems();
            }

            if(firstResize) {
                firstResize = false;
            }

            imageSrcWillChange = false;

        });

        gallery.listen('gettingData', function(index, item) {
            if( useLargeImages ) {
                item.src = item.o.src;
                item.w = item.o.w;
                item.h = item.o.h;
            } else {
                item.src = item.m.src;
                item.w = item.m.w;
                item.h = item.m.h;
            }
        });


        /*
         * Initialize Photoswipe.
         */        
        gallery.init();


        /*
         * Debug responsive.
         */
        //console.log(window.devicePixelRatio);
        //console.log('realViewportWidth ' + gallery.viewportSize.x * Math.min(window.devicePixelRatio, 2.5));

    };


    /*
     * Loop through all thumbnails and bind events.
     */
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }


    /*
     * The block of HTML to add in openPhotoSwipe function.
     */
     var galleryHtml = '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"><div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button><button class="pswp__button pswp__button--share" title="Share"></button><button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button><button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div> </div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button><button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div></div>';

};

/*
 * Execute Photoswipe function.
 */
initPhotoSwipeFromDOM('.malinky-gallery-slider');


/* ------------------------------------------------------------------------ *
 * jQuery
 * ------------------------------------------------------------------------ */

jQuery(document).ready(function($){

    function mgsShowLoading()
    {
        $('.malinky-gallery-slider-loading').show();
    }

    var mgsLoadingTimer = setTimeout(mgsShowLoading, 750);

    /**
     * Slider used generally on sport pages, projects and groundcare machinery
     */
    $('.malinky-gallery-slider').imagesLoaded(function(instance) {

        //If not mobile.
        if (!malinky_gallery_slider_mobile_detect.malinky_is_phone) {
            
            //Slider set up.
            slider = $('.malinky-gallery-slider').bxSlider({
                pager: false,
                slideMargin: 24,
                infiniteLoop: false,
                easing: 'linear',
                hideControlOnEnd: true,
                controls: true,
                nextText: '',
                prevText: '',
                adaptiveHeight: false,
                onSliderLoad: function($slider,activeIndex) {
                    $('.malinky-gallery-slider-wrapper').addClass('malinky-gallery-slider-wrapper-show');
                    clearTimeout(mgsLoadingTimer);
                    $('.malinky-gallery-slider-loading').hide();
                    /*
                     * Once slider is loaded then load next slide as only first is loaded initially.
                     * This means images are there when next slide is loaded then onSlideBefore callback kicks in.
                     */
                    var imagesPerSlide = $slider.children.find('img').attr('data-imageps').slice(0,1);
                    var $lazyNextImg = $slider.children.find('.lazy').slice(0,imagesPerSlide);
                    $.each($lazyNextImg, function( index, value ) {
                        var loadImg = $(value).attr('data-src');
                        $(value).attr('src', loadImg);
                        $(value).removeClass('lazy');
                    });

                },
                onSlideBefore: function($slideElement, oldIndex, newIndex) {
                    /*
                     * Find number of images per slide.
                     * Get that number of images with class lazy.
                     * Then loop through swapping out the data-src into the actual src ready for next slide.
                     * Loads the next slides worth of images.
                     */
                    var imagesPerSlide = slider.find('img').attr('data-imageps').slice(0,1);
                    var $lazyNextImg = slider.find('.lazy').slice(0,imagesPerSlide);
                    $.each($lazyNextImg, function( index, value ) {
                        var loadImg = $(value).attr('data-src');
                        $(value).attr('src', loadImg);
                        $(value).removeClass('lazy');
                    });
                }
            });

        //Mobile.
        } else {
            
            /*
             * Slider set up object for both initial and resized.
             */
            var malinkySliderSetup = {
                pager: false,
                slideMargin: 10,
                infiniteLoop: false,
                easing: 'linear',
                hideControlOnEnd: true,
                controls: true,
                nextText: '',
                prevText: '',
                adaptiveHeight: true,
                onSliderLoad: function() {
                    $('.malinky-gallery-slider-wrapper').addClass('malinky-gallery-slider-wrapper-show');
                    clearTimeout(mgsLoadingTimer);                        
                    $('.malinky-gallery-slider-loading').hide();
                    $('.malinky-gallery-slider li').css('width', malinkySliderSlideWidth());
                    $('.malinky-gallery-slider-image').css({'position': 'relative', 'left': '50px'});
                    $('.malinky-gallery-slider').parent().height($('.malinky-gallery-slider li').height());
                },
                onSlideBefore: function($slideElement, oldIndex, newIndex) {
                    /*
                     * Find next image in whole slider object.
                     * Then swap out the data-src into the actual src ready of next slide.
                     * Loads the next image on mobile so the next is partially visible.
                     */
                    var $lazyNextImg = mobileSlider.find('.lazy').slice(0,1);
                    $.each($lazyNextImg, function(index, value) {
                        var loadImg = $(value).attr('data-src');
                        $(value).attr('src', loadImg);
                        $(value).removeClass('lazy');
                    });
                }
            }

            
            /*
             * Set up the slide width.
             * Uses the original image width and compares against the width of the containing li.
             * This generally determines image width between portrait and landscapes and cases where
             * the original image is not as wide as the containing li.
             */
            function malinkySliderSlideWidth () {
                var originalImageWidth = document.querySelector('.malinky-gallery-slider li img').naturalWidth;
                if (originalImageWidth + 100 < $('.malinky-gallery-slider li').width()) {
                    //Generally in landscape.
                    slideWidth = originalImageWidth;
                } else {
                    //Generally in portrait.
                    slideWidth = $('.malinky-gallery-slider li').width() - 100;
                }
                return slideWidth;
            }
            

            //Set global malinkySliderCurrentWidth.
            var malinkySliderCurrentWidth = $(window).width();

            
            /**
             * After a resize which is an orientation switch reload BX Slider so new thumbnail sizes are generated.
             */
            var malinkySliderResize = debounce(function() {
                if (malinkySliderCurrentWidth != $(window).width()) {
                    $('.malinky-gallery-slider-wrapper').removeClass('malinky-gallery-slider-wrapper-show');
                    $('.malinky-gallery-slider-loading').show();
                    mobileSlider.reloadSlider(malinkySliderSetup);
                    //Resave new width into global malinkySliderCurrentWidth
                    malinkySliderCurrentWidth = $(window).width();
                }
            }, 250);


            /*
             * On resize, run the function expression mgsResize.
             * resize event is namespaced with mgs.
             */
            $(window).bind('resize.mgs', malinkySliderResize)


            /**
             * Returns a function, that, as long as it continues to be invoked, will not
             * be triggered. The function will be called after it stops being called for
             * N milliseconds. If `immediate` is passed, trigger the function on the
             * leading edge, instead of the trailing.
             */
            function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            };


            /*
             * Launch mobile slider.
             */
            var mobileSlider = $('.malinky-gallery-slider').bxSlider(malinkySliderSetup);

        }

    });

});