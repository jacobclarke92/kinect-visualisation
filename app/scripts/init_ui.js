
requirejs(
	[
		'/app/scripts/helpers/polyfills.js',

		'/settings.js',
		'/app/scripts/effects_list.js',
		'/app/scripts/displacement_image_list.js',
		'/app/scripts/demo_effects.js',

		'/app/scripts/ui/ui.js',
		'/app/scripts/ui/midi.js',
		'/app/scripts/ui/templates.js',
		'/app/scripts/ui/window_events.js',
		'/app/scripts/ui/ui_messages.js'
	],
	function($) {

		console.info('Control window script loaded!');
		loaded();
		updateEffectMappings();
		updatePalettes();
	}
);

