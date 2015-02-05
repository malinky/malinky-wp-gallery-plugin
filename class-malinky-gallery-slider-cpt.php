<?php

class Malinky_Gallery_Slider_CPT
{

	public function __construct()
	{

		add_action('init', array($this, 'malinky_gallery_slider_cpt'));

	}

	public function malinky_gallery_slider_cpt()
	{

		/**
		 * Taxonomy - Sport (Gallery/Attachment)
		 */
		$singular  = 'Sport';
		$plural    = 'Sports';

		$rewrite     = array(
			'slug'       	=> 'sport-photos',
			'with_front' 	=> false,
			'hierarchical'	=> false
		);

		$args = array(
			'label'		=> $plural,
		    'labels' 	=> array(
		        'name' 							=> $plural,
		        'singular_name' 				=> $singular,
		        'menu_name'						=> 'Sports',
		       	'all_items' 					=> sprintf('All %s', $plural),
		        'edit_item' 					=> sprintf('Edit %s', $singular),
				'view_item' 					=> sprintf('View %s', $singular),	
		        'update_item' 					=> sprintf('Update %s', $singular),				           	
		        'add_new_item' 					=> sprintf('Add New %s', $singular),
		        'new_item_name' 				=> sprintf('New %s Name',  $singular),
				'parent_item' 					=> sprintf('Parent %s', $singular),
		        'parent_item_colon' 			=> sprintf('Parent %s:', $singular),
		        'search_items' 					=> sprintf('Search %s', $plural),
		        'popular_items' 				=> sprintf('Popular %s', $plural),
		        'separate_items_with_commas' 	=> sprintf('Seperate %s with commas', $plural),
		        'add_or_remove_items' 			=> sprintf('Add or remove %s', $plural),
		        'add_or_remove_items' 			=> sprintf('Choose from the most used %s', $plural),
		        'no_found' 						=> sprintf('No %s found', $plural),   
			),
			'public'				=> true,
		    'show_ui' 				=> true,
			'show_in_nav_menus' 	=> false,
			'show_admin_column' 	=> true,  	        			
		    'hierarchical' 			=> true,
		    'update_count_callback' => '_update_generic_term_count',
		    'query_var' 			=> true,	        
		    'rewrite' 				=> $rewrite,
		    'capabilities'			=> array(
		    	'manage_terms' 		=> 'manage_categories',
		    	'edit_terms' 		=> 'manage_categories',
		    	'delete_terms' 		=> 'manage_categories',
		    	'assign_terms' 		=> 'edit_posts',
		   ) 
		);

		register_taxonomy('malinky_gallery_slider_sports', 'attachment', $args);

	}

}