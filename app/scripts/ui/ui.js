

function linkMappableElements() {
	$('[data-mappable').unbind('click');
	$('[data-mappable').bind('click',mappableElementClicked);
}
function mappableElementClicked(e) {
	console.log('mappablenp item clicked ',e.target);
	if($('body').hasClass('mapping')) {

		$('[data-mappable].waiting').removeClass('waiting');
		$(this).addClass('waiting');
		$('body').addClass('waiting');
		
		e.preventDefault();
		console.log('mapping ',e.target);
		
	}
}
// this will be triggered from core midi listener only if ui's body class is 'mapping' and 'waiting'
function receiveMappingData(midiData) {

	var mappedElement = $('[data-mappable].waiting');

	var midiType = false;
	if(midiData[0] >= 176 && midiData[0] <= 191) midiType = 'pot';
	else if(midiData[0] >= 144 && midiData[0] <= 159) midiType = 'key';

	if(mappedElement.attr('data-midi-type') == midiType) {
		
		console.log('compatible control type to match midi type!');


		mappedElement.removeClass('waiting').attr('data-midi-linked','');
		$('body').removeClass('waiting mapping');

		console.log('Mapping made!',mappedElement,midiData);

	}else{
		console.log('incompatible control type to midi type!');
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
