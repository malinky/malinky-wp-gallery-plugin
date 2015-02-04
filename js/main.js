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
        console.log(window.devicePixelRatio);
        console.log('realViewportWidth ' + gallery.viewportSize.x * Math.min(window.devicePixelRatio, 2.5));

    };


    /*
     * Loop through all thumbnails and bind events.
     */
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

};

/*
 * Execute Photoswipe function.
 */
initPhotoSwipeFromDOM('.malinky-gallery-slider');


/* ------------------------------------------------------------------------ *
 * jQuery
 * ------------------------------------------------------------------------ */

jQuery(document).ready(function($){

    function show_loading()
    {
        $('.malinky-gallery-slider-loading').show();
    }

    var loading_timer = setTimeout(show_loading, 750);

    /**
     * Slider used generally on sport pages, projects and groundcare machinery
     */
    $('.malinky-gallery-slider').imagesLoaded(function(instance) {

        if (!malinky_gallery_slider_mobile_detect.malinky_is_phone_tablet) {
            
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
                onSliderLoad: function() {
                    $('.malinky-gallery-slider-wrapper').addClass('malinky-gallery-slider-wrapper-show');
                    clearTimeout(loading_timer);
                    $('.malinky-gallery-slider-loading').hide();
                },
                onSlideBefore: function($slideElement, oldIndex, newIndex) {
                    /*
                     * Find next two images in whole slider object.
                     * Then loop through swapping out the data-src into the actual src ready of next slide.
                     * Loads two at once on mobile so the next is partially visible.
                     */
                    var imagesPerSlide = slider.find('img').attr('data-imageps').slice(0,1);   
                    var $lazyNextImg = slider.find('.lazy').slice(0,imagesPerSlide);
                    $.each($lazyNextImg, function( index, value ) {
                        var loadimg = $(value).attr('data-src');
                        console.log(loadimg);
                        $(value).attr('src', loadimg);
                        $(value).removeClass('lazy');
                    });
                }
            });

        } else {
            
            malinky_gallery_slider_slide_width = $('.malinky-gallery-slider li').width() - 100;

            malinky_gallery_slider_mobile_slider = $('.malinky-gallery-slider').bxSlider({
                pager: false,
                slideMargin: 10,
                infiniteLoop: false,
                easing: 'linear',
                hideControlOnEnd: true,
                controls: true,
                nextText: '',
                prevText: '',
                adaptiveHeight: false,
                onSliderLoad: function() {
                    $('.malinky-gallery-slider-wrapper').addClass('malinky-gallery-slider-wrapper-show');
                    clearTimeout(loading_timer);
                    $('.malinky-gallery-slider-loading').hide();
                    $('.malinky-gallery-slider li').css('width', malinky_gallery_slider_slide_width);
                    $('.malinky-gallery-slider-image').css({'position': 'relative', 'left': '50px'});
                    $('.malinky-gallery-slider').parent().height($('.malinky-gallery-slider li').height());
                },
                onSlideBefore: function($slideElement, oldIndex, newIndex) {
                    /*
                     * Find next two images in whole slider object.
                     * Then loop through swapping out the data-src into the actual src ready of next slide.
                     * Loads the next image on mobile so the next is partially visible.
                     */
                    var $lazyNextImg = malinky_gallery_slider_mobile_slider.find('.lazy').slice(0,1);
                    console.log($lazyNextImg);
                    $.each($lazyNextImg, function(index, value) {
                        var loadimg = $(value).attr('data-src');
                        $(value).attr('src', loadimg);
                        $(value).removeClass('lazy');
                    });
                }
            });

            /*
             * Set resizeTimer to empty so it resets on page load.
             */
            var resizeTimer;

            /**
             * After a resize, orientation switch reload BX Slider so new thumbnail sizes are generated.
             */
            function resizeFunction() {

                $('.malinky-gallery-slider-wrapper').removeClass('malinky-gallery-slider-wrapper-show');
                $('.malinky-gallery-slider-loading').show();

                malinky_gallery_slider_slide_width = $('.malinky-gallery-slider li').width() - 100;

                malinky_gallery_slider_mobile_slider.reloadSlider({
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
                        clearTimeout(loading_timer);                        
                        $('.malinky-gallery-slider-loading').hide();
                        $('.malinky-gallery-slider li').css('width', malinky_gallery_slider_slide_width);
                        $('.malinky-gallery-slider-image').css({'position': 'relative', 'left': '50px'});
                        $('.malinky-gallery-slider').parent().height($('.malinky-gallery-slider li').height());
                    }
                });
            };

            /*
             * On resize, run the function and reset the timeout.
             */
            $(window).resize(function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resizeFunction, 250);
            });
            
        }

    });

});