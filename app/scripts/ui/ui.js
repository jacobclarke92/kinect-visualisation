


//reset all mappable elements' click bindings
function linkMappableElements() {
	$('[data-midi-mappable]').unbind('click',midiMappableElementClicked);
	$('[data-midi-mappable]').bind('click',midiMappableElementClicked);
}

//a midi-mappable element has been clicked
function midiMappableElementClicked(e) {
	console.log('mappablenp item clicked ',e.target);

	//is waiting for an element to be selected
	if($('body').hasClass('mapping')) {

		e.preventDefault();

		//assign 'waiting for midi' state to selected element
		$('[data-midi-mappable].waiting').removeClass('waiting');
		$(this).addClass('waiting');
		$('body').addClass('waiting');
		
		e.preventDefault();
		console.log('Now waiting for midi info for ',e.target);
	
	}else{

		//handle all relevant click functions that aren't already being handled for mappable elements
		//in this instance if a file element is selected it changes the effect script
		if($(this).hasClass('file')) {
			console.log('loading script ',$(this).attr('data-name'));
			
			w.changeScript($(this).attr('data-name'));
		}

	}
}


// this will be triggered from body class is 'mapping' and 'waiting'
function receiveMappingData(midiData) {

	//this should refer to only 1 element - the on waiting to be mapped
	var mappedElement = $('[data-midi-mappable].waiting');
	if(!mappedElement) {
		console.log('no midi mappable element waiting to be mapped ????');
		return;
	}
	var paramName = (mappedElement.attr('name')) ? mappedElement.attr('name') : mappedElement.attr('data-name');

	//detect whether a key or potentiometer was touched
	var midiType = false;
	if(midiData[0] >= 176 && midiData[0] <= 191) midiType = 'pot';
	else if(midiData[0] >= 144 && midiData[0] <= 159) midiType = 'key';

	//if the midi message type matches the elements allowed midi type then proceed
	if(mappedElement.attr('data-midi-type') == midiType) {

		console.log('compatible control type to match midi type!');

		var mapping;
		//update the mapping details for the parameter
		if(!isset( w.mappings[w.hash][paramName])) mapping = {
			label: paramName.readable(), 
			name: paramName, 
			type: 'midi', 
			min: parseFloat(mappedElement.attr('data-min')),
			max: parseFloat(mappedElement.attr('data-max')),
			range: false, threshold: false, initValue: 0, value: 0};
		else mapping = w.mappings[w.hash][paramName];
		// if(!isset(mapping)) console.log(isset( w.mappings[w.hash][paramName]), paramName, mapping);
		mapping.type = 'midi';
		mapping.value = midiData[2];
		mapping.cc = midiData[1];

		w.mappings[w.hash][paramName] = mapping;

		//store these changes
		w.saveCookie();


		//if(mappedElement.hasClass('dial')) mappedElement.trigger('configure', {'fgColor':'#f9d423'}); 
		//use this for audio mapping

		//remove all mapping waiting states 
		mappedElement.removeClass('waiting').attr('data-midi-linked','');
		$('body').removeClass('waiting');

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

//grab colour palette data loaded in core and make palette elements
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

	//bind colour palette clicks
	$('[data-palette]').click(function() {
		w.paletteChange($(this).attr('data-id'));
		$('[data-palette]').removeClass('active');
		$(this).addClass('active');
	})

}

function paramElementChanged(elem, value) {

	if(!$(elem).hasClass('.noUi-handle')) elem = $('.noUi-handle',elem);
	else elem = $(elem);

	// console.log(elem);
	if(typeof value == 'string' && !isNaN(parseFloat(value))) value = parseFloat(value);
	var paramName = elem.attr('data-name');

	if(!isset(w.mappings[w.hash][paramName])) {
		w.mappings[w.hash][paramName] = {
			label: paramName.readable(), 
			name: paramName, 
			type: 'midi', 
			min: parseFloat(elem.attr('data-min')),
			max: parseFloat(elem.attr('data-max')),
			range: false, threshold: false, initValue: 0, value: value
		};
	}
	w.mappings[w.hash][paramName].value = value;
	w[paramName] = value;

	if(paramName.indexOf('calibration_') != -1) w.updateCanvas();

}

//called on midi input if paramID has been confirmed
function setElementValue(paramID, value) {
	var elem = $('#'+paramID);

	if(elem && elem.length != 0) {

		//it's a slider!
		if(elem.hasClass('noUi-handle')) {

			// console.log('setting slider value .. supposedly');
			$('#'+paramID+'_text').val(value);
			$(elem).closest('.range').val(value);

		//it's a pot!
		}else if(elem.hasClass('dial')) {

			// console.log('setting dial value .. supposedly');
			elem.val(value).trigger('change');
		}

	}else{
		console.log("can't find the element for param ",paramID);
	}
}



