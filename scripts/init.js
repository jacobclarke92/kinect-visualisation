requirejs(
	[
		'jquery', 
		'underscore',
		'marchingsquares',
		'connections',
		'mappings',
		'audio',
		'cookies',
		'colours',
		'pixi_functions',
		'/node_modules/event-source-polyfill/eventsource.js'
	], function ($) {
  
	console.info('all dependencies loaded');
	openControls();

	getTopColours();

	setTimeout(function() {
		initPIXI();
		startPage('depth_image');
	},500);
	

});
