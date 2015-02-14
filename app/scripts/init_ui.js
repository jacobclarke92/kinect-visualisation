
requirejs(
	[
		'/app/libs/jquery.js',
		'/app/libs/jquery.nouislider.all.js',
		'/app/libs/jquery.tabslet.js',
		'/app/libs/jquery.knob.js',
		'/app/libs/webix_debug.js',
		'/app/scripts/helpers/polyfills.js',

		'/app/scripts/ui/window_events.js',
		'/app/scripts/ui/ui.js'
	],
	function($) {

		console.info('Control window script loaded!');
		loaded();
		updateEffectMappings();
		updatePalettes();
	}
);

