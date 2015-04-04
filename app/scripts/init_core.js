requirejs(
	[
		'/app/libs/jquery.js',
		'/app/libs/underscore.js',

		'/settings.js',
		'/app/scripts/effects_list.js',

		'/app/scripts/helpers/polyfills.js',
		'/app/scripts/helpers/marchingsquares.js',
		'/app/scripts/helpers/polygon_math.js',

		'/app/scripts/core/connections_built.js',
		'/app/scripts/core/mappings.js',
		'/app/scripts/core/ui.js',
		'/app/scripts/core/audio.js',
		'/app/scripts/core/cookies.js',
		'/app/scripts/core/colours.js',
		'/app/scripts/core/pixi_functions.js'
	], 
	function ($) {
  
		console.info('all dependencies loaded');
		openControls();

		getTopColours();

		setTimeout(function() {
			initPIXI();
			startPage('depth_image');
		},500);
	}
);
