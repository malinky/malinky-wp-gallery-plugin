<?php

/**
* Generate WP_Query object based on taxonomy and taxonomy term.
*
* @param 	str  	$taxonomy 			Name of the taxonomy to fetch images from.
* @param 	str  	$taxonomy_term 		Term from the taxonomy.
* @param 	int  	$total_images 		Total number of images to display.
* @return 	object
*/
function malinky_gallery_slider_wp_query( $taxonomy, $taxonomy_term, $total_images = -1, $orderby = 'date')
{

	$args = array(
		'post_type' 		=> 'attachment',
		'post_status'		=> 'inherit',
		'posts_per_page'	=> $total_images,
		'tax_query' 		=> array(
			array(
				'taxonomy' 	=> $taxonomy,
				'field'    	=> 'slug',
				'terms'    	=> $taxonomy_term
			)
		),
		'orderby'			=> $orderby
	);
	
	return new WP_Query($args);

}