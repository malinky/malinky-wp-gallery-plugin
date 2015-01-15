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
             * <a> containing link to large image and data-image-size.
             */
            linkEl = divEl.children[0];

            size = linkEl.getAttribute('data-image-size').split('x');

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
         * Initialize Photoswipe.
         */        
        gallery.init();

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

    /*
     * Slider used generally on sport page.
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
                adaptiveHeight: true,
                onSliderLoad: function() {
                    $('.malinky-gallery-slider-wrapper').addClass('malinky-gallery-slider-wrapper-show');
                    $('.malinky-gallery-slider-loading').hide();
                }
            });

        } else {
            
            malinky_gallery_slider_slide_width = $('.malinky-gallery-slider li').width() - 60;

            mobile_slider = $('.malinky-gallery-slider').bxSlider({
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
                    $('.malinky-gallery-slider-loading').hide();
                    $('.malinky-gallery-slider li').css('width', malinky_gallery_slider_slide_width);
                    $('.malinky-gallery-slider-image').css({'position': 'relative', 'left': '30px'});
                    $('.malinky-gallery-slider').parent().height($('.malinky-gallery-slider li').height());
                }
            });

            /*
             * Set resizeTimer to empty so it resets on page load.
             */
            var resizeTimer;

            /*
             * After a resize, orientation switch reload BX Slider so new thumbnail sizes are generated.
             */
            function resizeFunction() {

                $('.malinky-gallery-slider-wrapper').removeClass('malinky-gallery-slider-wrapper-show');
                $('.malinky-gallery-slider-loading').show();

                malinky_gallery_slider_slide_width = $('.malinky-gallery-slider li').width() - 60;

                mobile_slider.reloadSlider({
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
                        $('.malinky-gallery-slider-loading').hide();
                        $('.malinky-gallery-slider li').css('width', malinky_gallery_slider_slide_width);
                        $('.malinky-gallery-slider-image').css({'position': 'relative', 'left': '30px'});
                        $('.malinky-gallery-slider').parent().height($('.malinky-gallery-slider li').height());
                    }
                });
            };

            // On resize, run the function and reset the timeout
            // 250 is the delay in milliseconds. Change as you see fit.
            $(window).resize(function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resizeFunction, 250);
            });
            
        }

    });

});