<?php
/**
 * Plugin Name: Malinky Gallery Slider Plugin
 * Plugin URI: https://github.com/malinky/malinky-wp-gallery-slider-plugin
 * Description: Display gallery slider using attachment custom post type and BX Slider.
 * Version: 1.0
 * Author: Malinky
 * Author URI: https://github.com/malinky
 * License: GPL2
 *
 * Dependencies: Photoswipe (installed in theme), Mobile Detect and ACF.
 *
 * @todo Look at implmentation of shortcode, limit <div col> etc to calling in template not in shortcode.
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
	     * Call Methods - LOADED LAST TO ENSURE CSS CASCADES.
	     * ------------------------------------------------------------------------ */
	   	add_action( 'wp_enqueue_scripts', array( $this, 'malinky_gallery_slider_styles' ), 99 );
	   	add_action( 'wp_enqueue_scripts', array( $this, 'malinky_gallery_slider_scripts' ), 99 );


	   	/* ------------------------------------------------------------------------ *
	     * Includes
	     * ------------------------------------------------------------------------ */
		include( 'malinky-gallery-slider-shortcodes.php' );
		include( 'malinky-gallery-slider-functions.php' );


	   	/* ------------------------------------------------------------------------ *
	     * Include Classes
	     * ------------------------------------------------------------------------ */
		include( 'class-malinky-gallery-slider-cpt.php' );
			

	   	/* ------------------------------------------------------------------------ *
	     * Instantiate Classes
	     * ------------------------------------------------------------------------ */
		$malinky_gallery_slider_cpt = new Malinky_Gallery_Slider_CPT();

	}


	public function malinky_gallery_slider_styles()
	{

		//if ( WP_ENV != 'dev' && WP_ENV != 'prod' ) {

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

		//}
		
	}


	public function malinky_gallery_slider_scripts()
	{

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

		//global $malinky_mobile_detect;
		if ( malinky_is_phone() ) {
			$malinky_gallery_slider_mobile_detect['malinky_is_phone'] = true;
		} else {
			$malinky_gallery_slider_mobile_detect['malinky_is_phone'] = false;
		}

		wp_localize_script( 'malinky-gallery-slider-main-js', 'malinky_gallery_slider_mobile_detect', $malinky_gallery_slider_mobile_detect );
		wp_enqueue_script( 'malinky-gallery-slider-main-js' );

	}

}


$malinky_gallery_slider = new Malinky_Gallery_Slider();