<?php
/**
 * Plugin Name: Malinky Gallery Plugin
 * Plugin URI: https://github.com/malinky/malinky-wp-gallery-slider-plugin
 * Description: Display gallery slider from an ACF gallery.
 * Version: 1.1
 * Author: Malinky
 * Author URI: https://github.com/malinky
 * License: GPL2
 *
 * Dependencies: Photoswipe, Flickity and ACF.
 * http://photoswipe.com/
 * http://flickity.metafizzy.co/
 * http://www.advancedcustomfields.com/
 *
 * Uses theme grid system.
 * Requires an ACF field label of malinky_gallery as a standalone field or a repeater field.
 * Also uses the following thumbnails as set in functions.php.
 * add_image_size( 'malinky_mini_thumbnail', 300 );
 * add_image_size( 'malinky_thumbnail', 600 );
 * add_image_size( 'malinky_medium', 1024 );
 * add_image_size( 'malinky_large', 1600 );
 */

class Malinky_Gallery
{

	public function __construct()
	{

		//Trailing Slash
		define( 'MALINKY_GALLERY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
		//No Trailing Slash
		define( 'MALINKY_GALLERY_PLUGIN_URL', plugins_url( basename( plugin_dir_path( __FILE__ ) ) ) );


	   	/* ------------------------------------------------------------------------ *
	     * Enqueue styles and scripts
	     * ------------------------------------------------------------------------ */
	   	add_action( 'wp_enqueue_scripts', array( $this, 'malinky_gallery_styles' ), 99 );
	   	add_action( 'wp_enqueue_scripts', array( $this, 'malinky_gallery_scripts' ), 99 );


	   	/* ------------------------------------------------------------------------ *
	     * Includes
	     * ------------------------------------------------------------------------ */
		include( 'malinky-gallery-shortcodes.php' );

		/*
		 * Set the global variable to count the sliders.
		 * Used when there are multiple instances on the same page.
		 */
		global $malinky_gallery_count;
		$malinky_gallery_count = 1;

	}

	public function malinky_gallery_styles()
	{

		/*
		 * Plugin styles combined into theme styles.css during gulp build process for production.
		 */
		if ( WP_ENV != 'prod' ) {

			/**
			 * Style.
			 */		
			wp_register_style( 'malinky-gallery-style', 
								MALINKY_GALLERY_PLUGIN_URL . '/css/style.css', 
								false, 
								NULL
			);
			wp_enqueue_style( 'malinky-gallery-style' );

		}
		
	}


	public function malinky_gallery_scripts()
	{

		if ( WP_ENV == 'local' ) {

		/* -------------------------------- *
		 * Local
		 * -------------------------------- */

			/**
			 * Flickity.
			 *
			 * @link http://flickity.metafizzy.co
			 */
			wp_register_script( 'malinky-gallery-flickity-js', 
								MALINKY_GALLERY_PLUGIN_URL . '/bower_components/flickity/dist/flickity.pkgd.js', 
								array( 'jquery' ), 
								NULL, 
								true
			);
			wp_enqueue_script( 'malinky-gallery-flickity-js' );


			/**
			 * Photoswipe.
			 *
			 * @link http://photoswipe.com/
			 */
			wp_register_script( 'malinky-gallery-photoswipe-js',
								MALINKY_GALLERY_PLUGIN_URL . '/js/photoswipe.js',
								false,
								NULL,
								true
			);
			wp_enqueue_script( 'malinky-gallery-photoswipe-js' );	


			/**
			 * Photoswipe UI.
			 *
			 * @link http://photoswipe.com/
			 */
			wp_register_script( 'malinky-gallery-photoswipe-ui-js',
								MALINKY_GALLERY_PLUGIN_URL . '/js/photoswipe-ui.js',
								false,
								NULL,
								true
			);
			wp_enqueue_script( 'malinky-gallery-photoswipe-ui-js' );		


			/*
			 * Inititate Flickity and Photoswipe.
			 */
			wp_register_script( 'malinky-gallery-main-js', 
								MALINKY_GALLERY_PLUGIN_URL . '/js/main.js', 
								array( 'jquery' ), 
								NULL, 
								true
			);
			wp_enqueue_script( 'malinky-gallery-main-js' );

		}

		
		if ( WP_ENV == 'dev' || WP_ENV == 'prod' ) {

			/* -------------------------------- *
			 * Dev && Prod
			 * -------------------------------- */

			/*
			 * flickity.pkgd.js, photoswipe.js, photoswipe-ui.js, main.js
			 */
			wp_register_script( 'malinky-gallery-scripts-min-js',
								MALINKY_GALLERY_PLUGIN_URL . '/js/scripts.min.js',
								array( 'jquery' ),
								NULL,
								true
			);


			wp_enqueue_script( 'malinky-gallery-scripts-min-js' );

		}
		
	}

}


$malinky_slider = new Malinky_Gallery();