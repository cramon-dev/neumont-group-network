$(document).ready(function() {
	$('#messager').click(
	    function(e) {
	    	console.log('Collapsed click');

	        // e.preventDefault(); // prevent the default action
	        // e.stopPropagation(); // stop the click from bubbling
	        // $(this).closest('section').find('.messager-section-collapsed').removeClass('messager-section-collapsed');
	        // $(this).parent().addClass('messager-section');
	    }
	);
});