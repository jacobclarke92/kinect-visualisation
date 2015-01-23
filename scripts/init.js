requirejs(['jquery', 'underscore', 'marchingsquares', 'connections','mappings','audio','cookies','colours','pixi_functions'],
function   ($, underscore, marchingsquares, connections, midi) {
  
	console.info('all dependencies loaded');
	openControls();

	getTopColours();

	setTimeout(function() {
		initPIXI();
	},500);
	

});
