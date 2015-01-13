jQuery(document).ready(function($){

    /*
     * Slider used generally on sport page.
     */
    $('.malinky-gallery-slider').imagesLoaded(function(instance) {

        if ($(window).width() > 480) {

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

        } else {

            malinky_gallery_slider_slide_width = $('.malinky-gallery-slider li').width() - 40;

            $('.malinky-gallery-slider').bxSlider({
                pager: false,
                slideMargin: 10,
                infiniteLoop: true,
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
                    $('.malinky-gallery-slider').parent().height(($('.malinky-gallery-slider').parent().height() - 40));
                    $('.malinky-gallery-slider').css('left', '20px');
                }
            });
            
        }

    });




    
});