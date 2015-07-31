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
             * Set the caption if it has one.
             * HTML should be <meta itemprop="caption description" value="" />
             */
            if (linkEl.children[1]) {
                if (linkEl.children[1].hasAttribute('value')) {
                    item.title = linkEl.children[1].getAttribute('value');    
                }
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

/**
 * Using the class .malinky-gallery-slider triggers a sliding gallery that uses bxslider.
 * Using the class .malinky-gallery just triggers any images within that div to use photoswipe.
 * Both holding divs should hold the equivalent #malinky-gallery-slider-x or #malinky-gallery-x (where x is a number).
 */

/*
 * Get all gallery sliders on the page.
 */
var malinkyGallerySliders = document.querySelectorAll('.malinky-gallery-slider');

/*
 * Execute Photoswipe function for each gallery slider.
 * Fetches the id which start at #malinky-gallery-1.
 */
for (x = 0; x < malinkyGallerySliders.length; x++) {
    initPhotoSwipeFromDOM('#' + malinkyGallerySliders[x].id);
}

/*
 * Get all galleries.
 */
var malinkyGallery = document.querySelectorAll('.malinky-gallery');

/*
 * Execute Photoswipe function for each gallery.
 */
for (x = 0; x < malinkyGallery.length; x++) {
    initPhotoSwipeFromDOM('#' + malinkyGallery[x].id);
}


/* ------------------------------------------------------------------------ *
 * jQuery
 * ------------------------------------------------------------------------ */

jQuery(document).ready(function($){

    /**
     * Use a key parameter to determine the closest loading div to show.
     */
    function malinkyShowLoading(key)
    {   
        if (key) {
            $('#malinky-gallery-' + (key + 1)).parents('.malinky-gallery-slider-wrapper').prev('.malinky-gallery-slider-loading').show();
        } else {
            $('.malinky-gallery-slider-loading').show();
        }
    }

    var malinkyLoadingTimer = [];

    /**
     * Create timer for each gallery slider.
     */
    $.each(malinkyGallerySliders, function(key, value) {
        malinkyLoadingTimer[key] = setTimeout(function() {
            malinkyShowLoading(key);
        });
    });
    
    //Used to assign unique sliders to a slider array.
    var slider = [],
        cellCount = '';

    //Create a flickity for each gallery slider.
    $.each(malinkyGallerySliders, function(key, value) {

        $malinkyGalleryWrapper = $('#' + value.id).parents('.malinky-gallery-slider-wrapper');
        $malinkyGalleryLoading = $('#' + value.id).parents('.malinky-gallery-slider-wrapper').prev('.malinky-gallery-slider-loading');

        slider[key] = $('#' + value.id).flickity({
              cellSelector: '.malinky-gallery-slider-cell',
              imagesLoaded: true,
              lazyLoad: 3,
              contain: true,
              freeScroll: true,
              pageDots: false
        });

        /*
         * Advance to next cell on load so a double click isn't needed to get to the second.
         * This is due to the use of contain.
         */
        slider[key].flickity('next');

        /*
         * 3 images are always shown.
         * If 3 then hide next/prev to avoid annoyance of them being clickable not scrolling.
         * This is due to the use of contain.
         */
        cellCount = slider[key].data('flickity').cells.length;

        if (cellCount == 3) {
            $('.flickity-prev-next-button').css('display', 'none');
        }

        $malinkyGalleryWrapper.addClass('malinky-gallery-slider-wrapper-show');
        clearTimeout(malinkyLoadingTimer[key]);
        $malinkyGalleryLoading.hide();

    });

});