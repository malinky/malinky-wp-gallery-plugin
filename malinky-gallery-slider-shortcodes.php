<?php

add_shortcode( 'malinky-gallery-slider', 'malinky_gallery_slider' );

/**
* Output the gallery and thumbnails
*
* @param 	str  		$taxonomy_name 		Name of the taxonomy to fetch images from.
* @param 	str  		$taxonomy_term 		Taxonomy term slug.
* @param 	str  		$images_per_slide	Number of images to display per slide.
* @param 	str  		$total_images 		Total number of images to display.
* @param 	str			$orderby 			Order of images.
* @return 	str
*/

/**
 * Shortcode Usage
 *
 * [malinky-gallery-slider 
 * taxonomy_name 	= malinky_gallery_slider_sports (default) || malinky_gallery_slider_machines
 * taxonomy_term 	= A taxonomy term likes bowls.
 * images_per_slide = Number of images per slide (default 8).
 * total_images 	= Any number (default -1) which displays all.
 * orderby 			= WP_Query orberby (default date) otherwise rand is useful.
 * ]
 */
function malinky_gallery_slider( $atts )
{

	global $gallery_slider_wp_query;

	$atts = shortcode_atts(
		array(
	        'taxonomy_name' 	=> 'malinky_gallery_slider_sports',
	        'taxonomy_term' 	=> '',
	        'images_per_slide' 	=> 8,
	        'total_images' 		=> -1,
	        'orderby' 			=> 'date'
    	),
		$atts,
		'malinky-gallery-slider'
	);

	/**
	 * Fix for -ve image_per_slide.
	 * Will also set image_per_slide to 0 if not an integer.
	 * If it is 0 set to default so shortcode still works.
	 * Fix for the modulus calcuation below if image_per_slide is 1.
	 */
	$atts['images_per_slide'] = absint( $atts['images_per_slide'] );
	$atts['images_per_slide'] = $atts['images_per_slide'] != 0 ? $atts['images_per_slide'] : 8;
	$atts['images_modulus'] = $atts['images_per_slide'] != 1 ? 1 : 0;
	
	/**
	 * Main WP_Query.
	 */
	$gallery_slider_wp_query = malinky_gallery_slider_wp_query( $atts['taxonomy_name'], $atts['taxonomy_term'], $atts['total_images'], $atts['orderby'] );

	/**
	 * If total_images is not set then use WP_Query post_count property otherwise use total_images.
	 */
	$gallery_slider_post_count = $atts['total_images'] == -1 ? $gallery_slider_wp_query->post_count : $atts['total_images'];

	/**
	 * It's possible total_images in the shortcode has been set to more images than exist. Therefore check if $gallery_slider_post_count set above
	 * is greater than the total number of found posts, if so then use found posts to avoid any errors.
	 */
	$gallery_slider_post_count = $gallery_slider_post_count > $gallery_slider_wp_query->found_posts ? $gallery_slider_wp_query->found_posts : $gallery_slider_post_count;

	while ( $gallery_slider_wp_query->have_posts() ) : $gallery_slider_wp_query->the_post();
	
		/*
		 * Get image url, width and height array.
		 */
		$image_meta_thumbnail 	= wp_get_attachment_image_src( get_the_ID(), 'malinky_thumbnail' );
		$image_meta_medium 		= wp_get_attachment_image_src( get_the_ID(), 'malinky_medium' );
		$image_meta_large 		= wp_get_attachment_image_src( get_the_ID(), 'malinky_large' );

		if ( $gallery_slider_wp_query->current_post == 0 ) { ?>
		<div class="col-item col-item-full col-item--margin-bottom-20">
			<h3 class="grey-underline">Photos</h3>
			<div class="malinky-gallery-slider-loading"></div>
			<div class="malinky-gallery-slider-wrapper">
				<ul class="malinky-gallery-slider"  itemscope itemtype="http://schema.org/ImageGallery">
		<?php }

				if ( malinky_is_computer() ) { 
				
					if ( ($gallery_slider_wp_query->current_post + 1) % $atts['images_per_slide'] == $atts['images_modulus'] ) { ?>
					<li>
						<div class="col">
					<?php } ?><div class="col-item col-item-half col-item-quarter--medium col-item-half--small">
								<div class="malinky-gallery-slider-image" itemscope itemtype="http://schema.org/ImageObject" data-image-index="<?php echo $gallery_slider_wp_query->current_post; ?>">
									<a href="<?php echo esc_url( $image_meta_large[0] ); ?>" itemprop="contentUrl" data-image-size-large="<?php echo esc_attr( $image_meta_large[1] ); ?>x<?php echo esc_attr( $image_meta_large[2] ); ?>" data-image-medium="<?php echo esc_url( $image_meta_medium[0] ); ?>" data-image-size-medium="<?php echo esc_attr( $image_meta_medium[1] ); ?>x<?php echo esc_attr( $image_meta_medium[2] ); ?>">
										<img src="<?php echo esc_url( $image_meta_thumbnail[0] ); ?>" />
									</a>
								</div>
							</div><?php if ( ($gallery_slider_wp_query->current_post + 1) % $atts['images_per_slide'] == 0 ) { ?>
						</div><!-- .col nested -->
					</li>
					<?php }

				}

				if ( malinky_is_phone_tablet() ) { ?>

					<li>
						<div class="malinky-gallery-slider-image" itemscope itemtype="http://schema.org/ImageObject" data-image-index="<?php echo $gallery_slider_wp_query->current_post; ?>">
							<a href="<?php echo esc_url( $image_meta_large[0] ); ?>" itemprop="contentUrl" data-image-size-large="<?php echo esc_attr( $image_meta_large[1] ); ?>x<?php echo esc_attr( $image_meta_large[2] ); ?>" data-image-medium="<?php echo esc_url( $image_meta_medium[0] ); ?>" data-image-size-medium="<?php echo esc_attr( $image_meta_medium[1] ); ?>x<?php echo esc_attr( $image_meta_medium[2] ); ?>">
								<img src="<?php echo esc_url( $image_meta_thumbnail[0] ); ?>" />
							</a>
						</div>
					</li>

				<?php }

		if ( ($gallery_slider_wp_query->current_post + 1) == $gallery_slider_post_count ) { ?>				
				</ul>
			</div>
		</div>
		<?php }

	endwhile;

	/**
	 * Reset postdata back to original page.
	 */
	wp_reset_postdata();

}


add_shortcode( 'malinky-post-slider', 'malinky_post_slider' );

/**
* Output the a gallery and thumbnails added to a post with ACF.
*
* @param 	str  		$images_per_slide	Number of images to display per slide.
* @return 	str
*/

/**
 * Shortcode Usage
 *
 * [malinky-post-slider 
 * images_per_slide = Number of images per slide (default 8).
 * ]
 */
function malinky_post_slider( $atts )
{

	$atts = shortcode_atts(
		array(
	        'images_per_slide' 	=> 8
    	),
		$atts,
		'malinky-post-slider'
	);

	/**
	 * Fix for -ve image_per_slide.
	 * Will also set image_per_slide to 0 if not an integer.
	 * If it is 0 set to default so shortcode still works.
	 * Fix for the modulus calcuation below if image_per_slide is 1.
	 */
	$atts['images_per_slide'] = absint( $atts['images_per_slide'] );
	$atts['images_per_slide'] = $atts['images_per_slide'] != 0 ? $atts['images_per_slide'] : 8;
	$atts['images_modulus'] = $atts['images_per_slide'] != 1 ? 1 : 0;

	/**
	 * Main gallery query using ACF.
	 */
	$image_meta = get_field( 'post_gallery' );

	if ( ! $image_meta ) return;

	$total_images = count( $image_meta );

	/**
	 * $current_image used in a similar way to post count. Actual array keys starting at 0.
	 */
    foreach ( $image_meta as $current_image => $image ) {

		if ( $current_image == 0 ) { ?>
		<div class="col-item col-item-full">
			<h5>Photos</h5>
			<div class="malinky-gallery-slider-loading"></div>
			<div class="malinky-gallery-slider-wrapper">
				<ul class="malinky-gallery-slider"  itemscope itemtype="http://schema.org/ImageGallery">
		<?php }

				if ( malinky_is_computer() ) {
				
					if ( ($current_image + 1) % $atts['images_per_slide'] == $atts['images_modulus'] ) { ?>
					<li>
						<div class="col">
					<?php } ?><div class="col-item col-item-quarter col-item-half--small">
								<div class="malinky-gallery-slider-image" itemscope itemtype="http://schema.org/ImageObject" data-image-index="<?php echo $current_image; ?>">
									<a href="<?php echo esc_url( $image['sizes']['malinky_large'] ); ?>" itemprop="contentUrl" data-image-size-large="<?php echo esc_attr( $image['sizes']['malinky_large-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_large-height'] ); ?>" data-image-medium="<?php echo esc_url( $image['sizes']['malinky_medium'] ); ?>" data-image-size-medium="<?php echo esc_attr( $image['sizes']['malinky_medium-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_medium-height'] ); ?>">
										<img src="<?php echo esc_url( $image['sizes']['malinky_thumbnail'] ); ?>" />
									</a>
								</div>
							</div><?php if ( ($current_image + 1) % $atts['images_per_slide'] == 0 ) { ?>
						</div><!-- .col nested -->
					</li>
					<?php }

				}

				if ( malinky_is_phone_tablet() ) { ?>

					<li>
						<div class="malinky-gallery-slider-image" itemscope itemtype="http://schema.org/ImageObject" data-image-index="<?php echo $current_image; ?>">
							<a href="<?php echo esc_url( $image['sizes']['malinky_large'] ); ?>" itemprop="contentUrl" data-image-size-large="<?php echo esc_attr( $image['sizes']['malinky_large-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_large-height'] ); ?>" data-image-medium="<?php echo esc_url( $image['sizes']['malinky_medium'] ); ?>" data-image-size-medium="<?php echo esc_attr( $image['sizes']['malinky_medium-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_medium-height'] ); ?>">
								<img src="<?php echo esc_url( $image['sizes']['malinky_thumbnail'] ); ?>" />
							</a>
						</div>
					</li>

				<?php }

		if ( ($current_image + 1) == $total_images ) { ?>				
				</ul>
			</div>
		</div>

		<?php }

    }

}