<?php

add_shortcode( 'malinky-slider', 'malinky_gallery' );

/**
* Output a gallery and thumbnails added to a post or page with an ACF gallery field.
* Shortcode should be used in a template. Generally set with flexible content field.
*
* @param 	str 	$images_per_slide	Number of images to display per slide.
* @return 	str
*/

/**
 * Shortcode Usage
 *
 * [malinky-slider 
 * images_per_slide = Number of images per slide (default 8).
 * field_label 		= The acf field label (default malinky_gallery).
 * ]
 */
function malinky_gallery( $atts )
{

	$atts = shortcode_atts(
		array(
	        'images_per_slide' 	=> 8,
	        'field_label' 		=> 'malinky_gallery'
    	),
		$atts,
		'malinky-slider'
	);

	/**
	 * Fix for -ve image_per_slide.
	 * Will also set image_per_slide to 0 if not an integer.
	 * If it is 0 set to default so shortcode still works.
	 * Fix for the modulus calcuation below if image_per_slide is 1.
	 */
	$atts['images_per_slide'] 	= absint( $atts['images_per_slide'] );
	$atts['images_per_slide'] 	= $atts['images_per_slide'] != 0 ? $atts['images_per_slide'] : 8;
	$atts['images_modulus'] 	= $atts['images_per_slide'] != 1 ? 1 : 0;

	/**
	 * Main gallery query using ACF.
	 */
	$image_meta = get_field( $atts['field_label'] );

	if ( ! $image_meta ) $image_meta = get_sub_field( $atts['field_label'] );

	if ( ! $image_meta ) return;

	$total_images = count( $image_meta );

	/**
	 * $current_image used in a similar way to post count. Actual array keys starting at 0.
	 */
    foreach ( $image_meta as $current_image => $image ) {

		$atts['alt_tag'] = get_the_title() . ' Photos ' . ($current_image + 1);

		if ( $current_image == 0 ) { ?>
		<div class="col-item col-item-full">
			<?php
			//Generally if not used as a flexible content block. For example an ACF field called malinky_gallery in a posttype post.
			if ( ! get_sub_field( 'malinky_gallery' ) ) { ?>
				<h3>Photos</h3>
			<?php } ?>
			<noscript><p class="box error-permanent">Please turn JavaScript on in your browser to view all photos.</p></noscript>
			<div class="malinky-gallery-slider-loading"></div>
			<div class="malinky-gallery-slider-wrapper" itemscope itemtype="http://schema.org/ImageGallery">
				<meta itemprop="about" content="<?php echo esc_attr( get_the_title() ); ?> Photos" />
				<ul class="malinky-gallery-slider">
		<?php }

				if ( malinky_is_tablet_computer() ) {
				
					if ( ($current_image + 1) % $atts['images_per_slide'] == $atts['images_modulus'] ) { ?>
					<li>
						<div class="col">
					<?php } ?><div class="col-item col-item-quarter col-item-half--small">
								<div class="malinky-gallery-slider-image" itemscope itemtype="http://schema.org/ImageObject" data-image-index="<?php echo $current_image; ?>">
									<a href="<?php echo esc_url( $image['sizes']['malinky_large'] ); ?>" itemprop="contentUrl image" data-image-size-large="<?php echo esc_attr( $image['sizes']['malinky_large-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_large-height'] ); ?>" data-image-medium="<?php echo esc_url( $image['sizes']['malinky_medium'] ); ?>" data-image-size-medium="<?php echo esc_attr( $image['sizes']['malinky_medium-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_medium-height'] ); ?>">
										<?php
										//Images displayed on first load.
										if ( $current_image < ( $atts['images_per_slide'] ) ) { ?>

											<?php if ( malinky_is_tablet() ) { ?>
												<img src="<?php echo esc_url( $image['sizes']['malinky_thumbnail'] ); ?>" data-imageps="<?php echo esc_attr( $atts['images_per_slide'] ); ?>" alt="<?php echo esc_attr( $atts['alt_tag'] ); ?>" itemprop="thumbnail" />
											<?php } else { ?>
												<img src="<?php echo esc_url( $image['sizes']['malinky_mini_thumbnail'] ); ?>" data-imageps="<?php echo esc_attr( $atts['images_per_slide'] ); ?>" alt="<?php echo esc_attr( $atts['alt_tag'] ); ?>" itemprop="thumbnail" />
											<?php } ?>

										<?php } else {
										//Images to be lazy loaded. ?>

											<?php if ( malinky_is_tablet() ) { ?>
												<img data-src="<?php echo esc_url( $image['sizes']['malinky_thumbnail'] ); ?>" class="lazy" data-imageps="<?php echo esc_attr( $atts['images_per_slide'] ); ?>" alt="<?php echo esc_attr( $atts['alt_tag'] ); ?>" itemprop="thumbnail" />
											<?php } else { ?>
												<img data-src="<?php echo esc_url( $image['sizes']['malinky_mini_thumbnail'] ); ?>" class="lazy" data-imageps="<?php echo esc_attr( $atts['	images_per_slide'] ); ?>" alt="<?php echo esc_attr( $atts['alt_tag'] ); ?>" itemprop="thumbnail" />
											<?php } ?>
										
										<?php } ?>
									</a>
								</div>
							</div><?php if ( ($current_image + 1) % $atts['images_per_slide'] == 0 ) { ?>
						</div><!-- .col nested -->
					</li>
					<?php }

				}

				if ( malinky_is_phone() ) { ?>

					<li>
						<div class="malinky-gallery-slider-image" itemscope itemtype="http://schema.org/ImageObject" data-image-index="<?php echo $current_image; ?>">
							<a href="<?php echo esc_url( $image['sizes']['malinky_large'] ); ?>" itemprop="contentUrl image" data-image-size-large="<?php echo esc_attr( $image['sizes']['malinky_large-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_large-height'] ); ?>" data-image-medium="<?php echo esc_url( $image['sizes']['malinky_medium'] ); ?>" data-image-size-medium="<?php echo esc_attr( $image['sizes']['malinky_medium-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_medium-height'] ); ?>">
								<?php
								//Images displayed on first load.
								if ( $current_image < 2 ) { ?>
									<img src="<?php echo esc_url( $image['sizes']['malinky_mini_thumbnail'] ); ?>" alt="<?php echo esc_attr( $atts['alt_tag'] ); ?>" itemprop="thumbnail" />
								<?php } else {
								//Images to be lazy loaded. ?>
									<img data-src="<?php echo esc_url( $image['sizes']['malinky_mini_thumbnail'] ); ?>" class="lazy" alt="<?php echo esc_attr( $atts['alt_tag'] ); ?>" itemprop="thumbnail" />
								<?php } ?>
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