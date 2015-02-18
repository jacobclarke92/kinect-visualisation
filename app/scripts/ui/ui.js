


function linkMappableElements() {
	$('[data-midi-mappable]').unbind('click',midiMappableElementClicked);
	$('[data-midi-mappable]').bind('click',midiMappableElementClicked);
}
function midiMappableElementClicked(e) {
	console.log('mappablenp item clicked ',e.target);
	if($('body').hasClass('mapping')) {

		e.preventDefault();

		$('[data-midi-mappable].waiting').removeClass('waiting');
		$(this).addClass('waiting');
		
		e.preventDefault();
		console.log('mapping ',e.target);
		
	}else{

		if($(this).hasClass('file')) {
			w.changeScript($(this).attr('data-name'));
		}

	}
}


// this will be triggered from core midi listener only if ui's body class is 'mapping' and 'waiting'
function receiveMappingData(midiData) {

	var mappedElement = $('[data-midi-mappable].waiting');

	var midiType = false;
	if(midiData[0] >= 176 && midiData[0] <= 191) midiType = 'pot';
	else if(midiData[0] >= 144 && midiData[0] <= 159) midiType = 'key';

	if(mappedElement.attr('data-midi-type') == midiType) {

		console.log('compatible control type to match midi type!');

		w.mappings[w.hash][mappedElement.attr('data-name')] = {
			type: 'midi',
			value: midiData[2],
			cc: midiData[1]
		};
		w.saveCookie();


		//if(mappedElement.hasClass('dial')) mappedElement.trigger('configure', {'fgColor':'#f9d423'}); 
		//use this for audio mapping

		mappedElement.removeClass('waiting').attr('data-midi-linked','');
		$('body').removeClass('waiting mapping');

		console.log('Mapping made!',mappedElement,midiData);

	}else{
		console.log('incompatible control type to midi type!');
	}

	
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
