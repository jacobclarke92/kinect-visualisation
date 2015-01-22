requirejs(['jquery', 'underscore', 'marchingsquares', 'connections','mappings','audio','cookies','colours','box2dweb','easl','physicstest','pixi_functions'],
function   ($, underscore, marchingsquares, connections, midi) {
  
	console.info('all dependencies loaded');
	openControls();

	getTopColours();

	setTimeout(function() {
		initPIXI();
	},500);
	

});
