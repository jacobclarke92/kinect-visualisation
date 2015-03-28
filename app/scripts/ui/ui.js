


//reset all mappable elements' click bindings
function linkMappableElements() {
	var counter = 0;

	$('[data-midi-mappable]').each(function() {
		counter ++;
	});
	console.log('MIDI MAPPABLE ELEMENTS: ',counter);
	$('[data-midi-mappable]').unbind('click',midiMappableElementClicked).bind('click',midiMappableElementClicked);

	counter = 0;
	$('[data-audio-mappable]').each(function() {
		counter ++;
	});
	console.log('AUDIO MAPPABLE ELEMENTS: ',counter);
	$('[data-audio-mappable]').unbind('click',audioMappableElementClicked).bind('click',audioMappableElementClicked);

}

//a midi-mappable element has been clicked
function midiMappableElementClicked(e) {
	console.log('midi mappable item clicked ');//,e.target);

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

//a audio-mappable element has been clicked
function audioMappableElementClicked(e) {
	console.log('audio mappable item clicked ');//,e.target);
	if($('body').hasClass('mappingAudio')) {

		e.preventDefault();

		//assign 'waiting for midi' state to selected element
		$('[data-audio-mappable].waitingAudio').removeClass('waiting');
		$(this).addClass('waitingAudio');
		$('body').addClass('waitingAudio');

		w.currentlyMappingAudio = true;
		
		e.preventDefault();
		console.log('Now waiting for midi info for ',e.target);
	
	}
}

//mapping audio done button pressed
function mappingAudioDone(e) {
	if($('body').hasClass('mappingAudio waitingAudio')) {
		console.log('confirming audio mapping');
		var elem = $('[data-audio-mappable].waitingAudio');
		if(elem) {

			$('body').addClass('disabled');
			showAlert({
				title: 'Audio mapping behavior',
				message: 'Average is good for broader ranges whereas trigger is good for small ranges, e.g. a kick.',
				buttons: [
					{label: 'Cancel', callback: function() { 
						$('body').removeClass('disabled');
					}},
					{label: 'Average', callback: function() { saveAudioMapping('average', elem) }},
					{label: 'Trigger', callback: function() { saveAudioMapping('trigger', elem) }}
				]
			});

		}else{
			console.log('no audio mappable element selected??');
		}

	}else{
		console.log("body doesn't have classes: mappingAudio waitingAudio");
	}
}

function saveAudioMapping(mappingType, elem) {

	if(!mappingType || !elem) return;

	console.log('saving audio '+mappingType+' mapping, elem: ',elem);
	var paramName = (elem.attr('name')) ? elem.attr('name') : elem.attr('data-name');

	if(!isset( w.mappings[w.hash][paramName])) mapping = {
		label: paramName.readable(), 
		name: paramName, 
		audio: false,
		midi: {
			min: -100,
			max: 100,
			initValue: 0, 
			postValue: 0,
			value: 0,
			cc: -1
		},
		audio: {}
	};
	else mapping = w.mappings[w.hash][paramName];
	// if(!isset(mapping)) console.log(isset( w.mappings[w.hash][paramName]), paramName, mapping);
	if(!mapping.audio) {
		console.log('audio object for mapping ',elem,' was undefined');
		mapping.audio = {};
	}
	mapping.audio.range = w.soundRange;
	mapping.audio.soundThresh = w.soundThresh;
	mapping.audio.type = mappingType;
	mapping.audio.coolOff = 0;
	mapping.audio.triggerValue = 0;
	mapping.audio.lastAverageLevel = 0;

	w.mappings[w.hash][paramName] = mapping;
	
	w.saveCookie();

	elem.attr('data-audio-linked','');
	elem.removeClass('waitingAudio');
	$('body').removeClass('waitingAudio');


	refreshAudioMappings();

}

function refreshAudioMappings() {
	w.audioMappings = [];
	if(!isset(w.mappings[w.hash])) {
		console.log('mappings for hash not set yet, cant refresh audio mappings');
		return false;
	}
	// $.each(w.mappings[w.hash],function(keyGroup, mappingGroup) {
		$.each(w.mappings[w.hash],function(key,mapping) {
			if(mapping.audio) {
				w.audioMappings.push(mapping);
			}
		});
	// });
	console.log(w.audioMappings);
	//sort audio mappings by their starting range point
	w.audioMappings.sort(function(a,b) {
		if (a.audio.range[0] < b.audio.range[0]) return -1;
		if (a.audio.range[1] > b.audio.range[0]) return 1;
		return 0;
	});
	console.log(w.audioMappings);
}
function compare(a,b) {
 
}

function isMappingSetForCC(cc, paramType) {
	var results = [];
	var searchArr;
	if(paramType == 'pot') searchArr = w.mappings[w.hash];
	else if(paramType == 'key') searchArr = w.mappings['midiButtons'];
	else return false;
	if(typeof searchArr == 'undefined') return false;
	
	$.each(searchArr,function(key,mapping) {
		if(mapping.cc !== false && mapping.cc != -1 && mapping.cc == cc) results.push(mapping.name);
	});

	return (results.length > 0) ? results : false;
}
function removeMappingsByCC(cc) {
	if(isset(w.mappings[w.hash])) $.each(w.mappings[w.hash],function(key,mapping) {
		if(mapping.cc === cc) {
			$('#'+mapping.name).removeAttr('data-midi-linked');
			delete w.mappings[w.hash][key];
		}
	});
	if(isset(w.mappings['midiButtons'])) $.each(w.mappings['midiButtons'],function(key,mapping) {
		if(mapping.cc === cc) {
			$('#'+mapping.name).removeAttr('data-midi-linked');
			delete w.mappings['midiButtons'][key];
		}
	});
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
		template.attr('data-name','palette_'+palette.id);
		template.attr('id','palette_'+palette.id);

		$.each(palette.colors, function(index, value) {
			$('.col'+index,template).css('background-color','#'+value.hex);
		});

		$('#paletteZone').append(template);

	}

	//bind colour palette clicks
	$('[data-palette]').bind('click',function() {
		w.paletteChange($(this).attr('data-name'));
		$('[data-palette]').removeClass('active');
		$(this).addClass('active');
	});

}

function paramElementChanged(elem, value) {

	if(elem.$) {
		// is a knob
		elem = elem.$; 
	}else if(!$(elem).hasClass('.noUi-handle')) {
		// is a slider input field
		elem = $(elem);
	}else if($(elem).hasClass('.noUi-target')) {
		// is an actual slider
		elem = $('.noUi-handle', elem);
	}else{
		console.log('unknown element value changed');
		elem = $(elem); //or otherwise...
	}

	console.log(elem);
	if(typeof value == 'string' && !isNaN(parseFloat(value))) value = parseFloat(value);
	var paramName = elem.attr('data-name') || elem.attr('id');
	if(!isset(paramName)) {
		console.log('paramName is unknown for ',elem);
		paramName = 'unknownParamName';
	}

	if(!isset(w.mappings[w.hash][paramName])) {
		w.mappings[w.hash][paramName] = {
			label: paramName.readable(), 
			name: paramName, 
			type: 'midi', 
			midi: {
				min: parseFloat(elem.attr('data-min')),
				max: parseFloat(elem.attr('data-max')),
				value: value,
				initValue: value,
				cc: -1
			},
			audio: false
		};
	}
	w.mappings[w.hash][paramName].midi.value = value;
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


function deleteSelectedMapping() {
	var mappedElement = $('[data-midi-mappable][data-midi-linked].waiting');
  	if(mappedElement) {
  		console.log('Deleting a mapping!');
  		
  		var paramName = mappedElement.attr('data-name');
  		var paramType = mappedElement.attr('data-midi-type');
  		if(paramType == 'pot') {
  			if(isset(w.mappings[w.hash][paramName])) delete w.mappings[w.hash][paramName];
  			mappedElement.removeAttr('data-midi-linked').removeClass('waiting');
  			$('body').removeClass('waiting');
  		}else if (paramType == 'key') {
  			if(isset(w.mappings['midiButtons'][paramName])) delete w.mappings['midiButtons'][paramName];
  			mappedElement.removeAttr('data-midi-linked').removeClass('waiting');
  			$('body').removeClass('waiting');
  		}
  	}else{
  		console.log('no mapping to delete');
  	}
}
