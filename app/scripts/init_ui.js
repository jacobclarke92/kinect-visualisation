
requirejs(
	[
		'/app/libs/webix_debug.js',
		'/app/scripts/helpers/polyfills.js',

		'/app/scripts/effects_list.js',

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

