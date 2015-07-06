<?php

add_shortcode( 'malinky-gallery-slider', 'malinky_gallery_slider' );

/**
* Output a gallery and sliders and thumbnails added to a post or page with an ACF gallery field.
* Shortcode should be used in a template. Generally set with flexible content field.
*/

/**
 * Shortcode Usage
 *
 * [malinky-gallery 
 * malinky_field_label = The acf field label (default malinky_gallery).
 * malinky_header = Whether to display a heading. Enter the heading text.
 * malinky_header_underline = Whether to add a green underline to heading. Use true.
 * ]
 */
function malinky_gallery_slider( $atts )
{

	global $malinky_slider_count;

	$atts = shortcode_atts(
		array(
	        'malinky_field_label' 		=> 'malinky_gallery',
	        'malinky_header'			=> '',
	        'malinky_header_underline'	=> false,
    	),
		$atts,
		'malinky-gallery-slider'
	);

	/**
	 * Main gallery query using ACF.
	 */
	$image_meta = get_field( $atts['malinky_field_label'] );

	if ( ! $image_meta ) $image_meta = get_sub_field( $atts['malinky_field_label'] );

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
				if ( $atts['malinky_header'] != '' ) { ?>
					<h3<?php echo (bool) $atts['malinky_header_underline'] ? ' class="green-underline"' : ''; ?>><?php echo esc_html( $atts['malinky_header'] ); ?></h3>
				<?php } ?>
				<noscript><p class="box error-permanent">Please turn JavaScript on in your browser to view all photos.</p></noscript>
				<div class="malinky-gallery-loading"></div>
				<div class="malinky-gallery-wrapper" itemscope itemtype="http://schema.org/ImageGallery">
					<meta itemprop="about" content="<?php echo esc_attr( get_the_title() ); ?> Photos" />
					<div id="malinky-gallery-<?php echo $malinky_slider_count; ?>" class="malinky-gallery-slider">
		<?php } ?>
						<div class="malinky-gallery-cell" itemscope itemtype="http://schema.org/ImageObject" data-image-index="<?php echo $current_image; ?>">
							<a href="<?php echo esc_url( $image['sizes']['malinky_large'] ); ?>" itemprop="contentUrl image" data-image-size-large="<?php echo esc_attr( $image['sizes']['malinky_large-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_large-height'] ); ?>" data-image-medium="<?php echo esc_url( $image['sizes']['malinky_medium'] ); ?>" data-image-size-medium="<?php echo esc_attr( $image['sizes']['malinky_medium-width'] ); ?>x<?php echo esc_attr( $image['sizes']['malinky_medium-height'] ); ?>">
								<img data-flickity-lazyload="<?php echo esc_url( $image['sizes']['malinky_mini_thumbnail'] ); ?>" itemprop="thumbnail" class="malinky-gallery-cell-image" />
							</a>
						</div>

		<?php if ( ($current_image + 1) == $total_images ) { ?>				
					</div>
				</div>
			</div>

		<?php }

    }

    $malinky_slider_count++;

}
