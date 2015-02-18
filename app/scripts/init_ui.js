
requirejs(
	[
		'/app/scripts/helpers/polyfills.js',

		'/app/scripts/effects_list.js',

		'/app/scripts/ui/ui.js',
		'/app/scripts/ui/midi.js',
		'/app/scripts/ui/templates.js',
		'/app/scripts/ui/window_events.js'
	],
	function($) {

		console.info('Control window script loaded!');
		loaded();
		updateEffectMappings();
		updatePalettes();
	}
);

