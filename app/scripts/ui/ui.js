

function linkMappableElements() {
	$('[data-mappable').unbind('click');
	$('[data-mappable').bind('click',mappableElementClicked);
}
function mappableElementClicked(e) {
	console.log('mappablenp item clicked ',e.target);
	if($('body').hasClass('mapping')) {
		e.preventDefault();
		console.log('mapping ',e.target);
		$('body').removeClass('mapping');
	}
}

function effectSelected() {
	var script = this._item_clicked || $(this).data('name');

	if(script != 'all_effects') w.changeScript(script);
}


var effectUI_data = [];

//called from createControls function in mappings.js
function updateEffectMappings() {
	generateEffectParams();
}

function updatePalettes() {
	if(typeof w.palettes != 'object') return;

	$('#paletteZone').html('');

	for(var i=0; i<w.palettes.length; i++) {
		var palette = w.palettes[i];
		var template = $('#templates #paletteTemplate').children().clone();
		template.attr('data-id',palette.id);

		$.each(palette.colors, function(index, value) {
			$('.col'+index,template).css('background-color','#'+value.hex);
		});

		$('#paletteZone').append(template);

	}
	$('[data-palette]').click(function() {
		w.paletteChange($(this).attr('data-id'));
		$('[data-palette]').removeClass('active');
		$(this).addClass('active');
	})

}
