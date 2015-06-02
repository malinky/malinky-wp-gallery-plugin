<?php
/**
 * Plugin Name: Malinky Gallery Slider Plugin
 * Plugin URI: https://github.com/malinky/malinky-wp-gallery-slider-plugin
 * Description: Display gallery slider from an ACF gallery.
 * Version: 1.1
 * Author: Malinky
 * Author URI: https://github.com/malinky
 * License: GPL2
 *
 * Dependencies: Photoswipe, Mobile Detect, BX Slider and ACF.
 * http://photoswipe.com/
 * http://bxslider.com/
 * http://www.advancedcustomfields.com/
 * https://wordpress.org/plugins/wp-mobile-detect/
 *
 * Uses theme grid system.
 * Requires an ACF field label of malinky_gallery as a standalone field or a repeater field.
 * Also uses the following thumbnails as set in functions.php.
 * add_image_size( 'malinky_mini_thumbnail', 300 );
 * add_image_size( 'malinky_thumbnail', 600 );
 * add_image_size( 'malinky_medium', 1024 );
 * add_image_size( 'malinky_large', 1600 );
 */

class Malinky_Gallery_Slider
{

	public function __construct()
	{

		//Trailing Slash
		define( 'MALINKY_GALLERY_SLIDER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
		//No Trailing Slash
		define( 'MALINKY_GALLERY_SLIDER_PLUGIN_URL', plugins_url( basename( plugin_dir_path( __FILE__ ) ) ) );


	   	/* ------------------------------------------------------------------------ *
	     * Enqueue styles and scripts
	     * ------------------------------------------------------------------------ */
	   	add_action( 'wp_enqueue_scripts', array( $this, 'malinky_gallery_slider_styles' ), 99 );
	   	add_action( 'wp_enqueue_scripts', array( $this, 'malinky_gallery_slider_scripts' ), 99 );


	   	/* ------------------------------------------------------------------------ *
	     * Includes
	     * ------------------------------------------------------------------------ */
		include( 'malinky-gallery-slider-shortcodes.php' );

	}


	public function malinky_gallery_slider_mobile_detect() {

		/**
		 * Include server side device detection if not already.
		 *
		 * @link http://mobiledetect.net/
		 * @link https://github.com/serbanghita/Mobile-Detect/
		 */
		if ( ! is_admin() ) {

			if ( WP_ENV == 'local' ) {

			    require_once(ABSPATH . '../malinky-includes/Mobile_Detect.php');

			} elseif ( WP_ENV == 'dev' ) {

			    require_once(ABSPATH . '../../../malinky-includes/Mobile_Detect.php');    

			} else {

			    require_once(ABSPATH . '../../malinky-includes/Mobile_Detect.php');

			}

			if ( ! array_key_exists( 'malinky_mobile_detect', $GLOBALS) ) {
				global $malinky_mobile_detect;
				$malinky_mobile_detect = new Mobile_Detect();
			}

			if ( ! function_exists( 'malinky_is_phone' ) ) {

				function malinky_is_phone()
				{
					global $malinky_mobile_detect;
					if ( $malinky_mobile_detect->isMobile() && ! $malinky_mobile_detect->isTablet() )
						return true;
				}

 			}

			if ( ! function_exists( 'malinky_is_phone_tablet' ) ) {

				function malinky_is_phone_tablet()
				{
					global $malinky_mobile_detect;
					if ( $malinky_mobile_detect->isMobile() || $malinky_mobile_detect->isTablet() )
						return true;
				}	

			}

			if ( ! function_exists( 'malinky_is_phone_computer' ) ) {

				function malinky_is_phone_computer()
				{
					global $malinky_mobile_detect;
					if ( ! $malinky_mobile_detect->isTablet() )
						return true;
				}						

			}

			if ( ! function_exists( 'malinky_is_tablet' ) ) {

				function malinky_is_tablet()
				{
					global $malinky_mobile_detect;
					if ( $malinky_mobile_detect->isTablet() )
						return true;
				}

			}

			if ( ! function_exists( 'malinky_is_tablet_computer' ) ) {

				function malinky_is_tablet_computer()
				{
					global $malinky_mobile_detect;
					if ( $malinky_mobile_detect->isTablet() || ! $malinky_mobile_detect->isMobile() )
						return true;
				}	

			}		

			if ( ! function_exists( 'malinky_is_computer' ) ) {

				function malinky_is_computer()
				{
					global $malinky_mobile_detect;
					if ( ! $malinky_mobile_detect->isMobile() && ! $malinky_mobile_detect->isTablet() )
						return true;
				}	

			}

		}

	}


	public function malinky_gallery_slider_styles()
	{

		//Plugin styles combined into theme styles.css during gulp build process.
		if ( WP_ENV != 'dev' && WP_ENV != 'prod' ) {

			/**
			 * BX Slider Style.
			 *
			 * @link http://bxslider.com/
			 */		
			wp_register_style( 'malinky-gallery-slider-bxslider', 
								MALINKY_GALLERY_SLIDER_PLUGIN_URL . '/css/style.css', 
								false, 
								NULL
			);
			wp_enqueue_style( 'malinky-gallery-slider-bxslider' );

		}
		
	}


	public function malinky_gallery_slider_scripts()
	{

		if ( WP_ENV == 'local' ) {

		/* -------------------------------- *
		 * Local
		 * -------------------------------- */

			/**
			 * Imagesloaded.
			 *
			 * @link https://github.com/desandro/imagesloaded
			 */
			wp_register_script( 'malinky-gallery-slider-imagesloaded-js', 
								MALINKY_GALLERY_SLIDER_PLUGIN_URL . '/js/imagesloaded.js', 
								array( 'jquery' ), 
								NULL, 
								true
			);
			wp_enqueue_script( 'malinky-gallery-slider-imagesloaded-js' );


			/**
			 * BX Slider.
			 *
			 * @link http://bxslider.com/
			 */
			wp_register_script( 'malinky-gallery-slider-bxslider-js', 
								MALINKY_GALLERY_SLIDER_PLUGIN_URL . '/js/jquery.bxslider.js', 
								array( 'jquery' ), 
								NULL, 
								true
			);
			wp_enqueue_script( 'malinky-gallery-slider-bxslider-js' );


			/*
			 * Inititate Imagesloaded and BX Slider.
			 */
			wp_register_script( 'malinky-gallery-slider-main-js', 
								MALINKY_GALLERY_SLIDER_PLUGIN_URL . '/js/main.js', 
								array( 'jquery' ), 
								NULL, 
								true
			);


			/**
			 * Photoswipe.
			 *
			 * @link http://photoswipe.com/
			 */
			wp_register_script( 'malinky-gallery-slider-photoswipe-js',
								MALINKY_GALLERY_SLIDER_PLUGIN_URL . '/js/photoswipe.js',
								false,
								NULL,
								true
			);
			wp_enqueue_script( 'malinky-gallery-slider-photoswipe-js' );	


			/**
			 * Photoswipe UI.
			 *
			 * @link http://photoswipe.com/
			 */
			wp_register_script( 'malinky-gallery-slider-photoswipe-ui-js',
								MALINKY_GALLERY_SLIDER_PLUGIN_URL . '/js/photoswipe-ui.js',
								false,
								NULL,
								true
			);
			wp_enqueue_script( 'malinky-gallery-slider-photoswipe-ui-js' );		

			//global $malinky_mobile_detect;
			if ( malinky_is_phone() ) {
				$malinky_gallery_slider_mobile_detect['malinky_is_phone'] = true;
			} else {
				$malinky_gallery_slider_mobile_detect['malinky_is_phone'] = false;
			}

			//Pass malinky_gallery_slider_mobile_detect to malinky-gallery-slider-main-js script.
			wp_localize_script( 'malinky-gallery-slider-main-js', 
								'malinky_gallery_slider_mobile_detect', 
								$malinky_gallery_slider_mobile_detect
							);
			wp_enqueue_script( 'malinky-gallery-slider-main-js' );

		}

		
		if ( WP_ENV == 'dev' || WP_ENV == 'prod' ) {

			/* -------------------------------- *
			 * Dev && Prod
			 * -------------------------------- */

			/*
			 * imagesloaded.js, jquery.bxslider.js, main.js, photoswipe.js, photoswipe-ui.js
			 */
			wp_register_script( 'malinky-gallery-slider-scripts-min-js',
								MALINKY_GALLERY_SLIDER_PLUGIN_URL . '/js/scripts.min.js',
								array( 'jquery' ),
								NULL,
								true
			);

			//global $malinky_mobile_detect;
			if ( malinky_is_phone() ) {
				$malinky_gallery_slider_mobile_detect['malinky_is_phone'] = true;
			} else {
				$malinky_gallery_slider_mobile_detect['malinky_is_phone'] = false;
			}

			//Pass malinky_gallery_slider_mobile_detect to malinky-scripts-min-js script.
			wp_localize_script( 'malinky-gallery-slider-scripts-min-js', 
								'malinky_gallery_slider_mobile_detect', 
								$malinky_gallery_slider_mobile_detect
							);

			wp_enqueue_script( 'malinky-gallery-slider-scripts-min-js' );

		}
		
	}

}


$malinky_gallery_slider = new Malinky_Gallery_Slider();
$malinky_gallery_slider->malinky_gallery_slider_mobile_detect();