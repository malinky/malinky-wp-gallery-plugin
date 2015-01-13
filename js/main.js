jQuery(document).ready(function($){

    /*
     * Slider used generally on sport page.
     */
    $('.malinky-gallery-slider').imagesLoaded(function(instance) {

        $('.malinky-gallery-slider').bxSlider({
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

    });

});