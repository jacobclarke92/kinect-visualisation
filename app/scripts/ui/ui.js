
var mappingAudio = false;
var mappingMIDI = false;
var autoMapInProgress = false;
var autoMapType = '';

//reset all mappable elements' click bindings
function linkMappableElements() {
	console.log('binding element events');
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
		$('[data-audio-mappable].waitingAudio').removeClass('waitingAudio12');
		$(this).addClass('waitingAudio');
		$('body').addClass('waitingAudio');
		
		e.preventDefault();
		console.log('Now waiting for audio params to be set up for ',e.target);
	
	}
}

//mapping audio done button pressed
function mappingAudioDone(e) {
	if($('body').hasClass('mappingAudio') && $('body').hasClass('waitingAudio')) {
		console.log('confirming audio mapping');
		var elem = $('[data-audio-mappable].waitingAudio');
		if(elem) {

			$('body').addClass('disabled');
			showAlert(uiMessages.mappingAudioDone, [
				{label: 'Cancel', callback: function() { 
					$('body').removeClass('disabled');
				}},
				{label: 'Average', callback: function() { saveAudioMapping('average', elem) }},
				{label: 'Trigger', callback: function() { saveAudioMapping('trigger', elem) }}
			]);

		}else{
			console.log('no audio mappable element selected -- how did you get this far??');
		}

	}else{
		console.log("body doesn't have classes: mappingAudio waitingAudio");
	}
}

function saveAudioMapping(mappingType, elem) {

	if(!mappingType || !elem) return;

	console.log('saving audio '+mappingType+' mapping, elem: ',elem);
	var paramName = (elem.attr('name')) ? elem.attr('name') : elem.attr('data-name');

	if(!isset( w.mappings[w.hash][paramName])) {
		mapping = {
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
	}else{
		mapping = w.mappings[w.hash][paramName];
	}

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
	$.each(w.mappings[w.hash],function(key,mapping) {
		if(mapping.audio) {
			w.audioMappings.push(mapping);
		}
	});
	console.log(w.audioMappings);
	//sort audio mappings by their starting range point
	w.audioMappings.sort(function(a,b) {
		if (a.audio.range[0] < b.audio.range[0]) return -1;
		if (a.audio.range[1] > b.audio.range[0]) return 1;
		return 0;
	});
	console.log(w.audioMappings);
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

	var targetElem;

	var elemType = false;
	if(elem.$) {
		// is a knob
		targetElem = elem.$; 
		elemType = 'knob';
	}else if($(elem).find('.noUi-handle').length > 0) {
		// is an actual slider
		targetElem = $(elem).find('.noUi-handle').first();
		elemType = 'slider';
	}else if($(elem).hasClass('noUi-handle')) {
		// is a slider input field
		targetElem = $(elem);
		elemType = 'input';
	}else{
		console.warn('unknown element value changed', elem);
		targetElem = $(elem); //or otherwise...
	}
	// console.log(elemType);
	// console.log($(elem)[0]);

	if(typeof value == 'string' && !isNaN(parseFloat(value))) value = parseFloat(value);
	var paramName = targetElem.attr('data-name') || targetElem.attr('id');
	if(!isset(paramName)) {
		console.warn('paramName is unknown for ',targetElem);
		return false;
	}

	if(!isset(w.mappings[w.hash][paramName])) {
		w.mappings[w.hash][paramName] = {
			label: paramName.readable(), 
			name: paramName, 
			midi: {
				min: parseFloat(targetElem.attr('data-min')),
				max: parseFloat(targetElem.attr('data-max')),
				value: value,
				initValue: value,
				cc: -1
			},
			audio: false
		};
	}
	w.mappings[w.hash][paramName].midi.value = value;
	w[paramName] = value;

	if(paramName.indexOf('calibration_') === 0 && paramName != 'calibration_depthThreshold' && paramName != 'calibration_depthRange') w.updateCanvas();

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


function deleteSelectedMidiMapping() {
	var mappedElement = $('[data-midi-mappable][data-midi-linked].waiting');
  	if(mappedElement) {
  		console.log('Deleting a midi mapping!');
  		
  		var paramName = mappedElement.attr('data-name');
  		var paramType = mappedElement.attr('data-midi-type');
  		if(paramType == 'pot') {
  			if(isset(w.mappings[w.hash][paramName].midi)) w.mappings[w.hash][paramName].midi.cc = -1;
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


function deleteSelectedAudioMapping() {
	var mappedElement = $('[data-audio-mappable][data-audio-linked].waitingAudio');
  	if(mappedElement) {
  		console.log('Deleting an audio mapping!');
  		var paramName = mappedElement.attr('data-name');
  		if(isObjectPathSet(w.mappings, [w.hash, paramName, 'audio'])) w.mappings[w.hash][paramName].audio = false;
  		mappedElement.removeAttr('data-midi-linked').removeClass('waitingAudio');
  		$('body').removeClass('waitingAudio');
  	}else{
  		console.log('no mapping to delete');
  	}
}

function commenceAutoMapping() {
	showAlert(uiMessages.commenceAutoMapping, [
		{label: 'Visualisation List', callback: function() {
			console.info(autoMapInProgress);
			autoMapInProgress = true;
			console.info(autoMapInProgress);
			autoMapType = 'Visualisation List';
			setTimeout(function() {
				showAlert({
					title: 'Waiting for MIDI button...', 
					message: 'This will use '+effects.length+' consecutive keys/buttons'
				}, [{label: 'Cancel'}]);
			}, 500);
		}},
		{label: 'Colours', callback: function() {
			autoMapInProgress = true;
			autoMapType = 'Colour Palettes';
			setTimeout(function() {
				showAlert({
					title: 'Waiting for MIDI button...', 
					message: 'This will use '+w.palettes.length+' consecutive keys/buttons'
				}, [{label: 'Cancel'}]);
			}, 500);
		}},
		{label: 'Calibration Params 1', callback: function() {
			autoMapInProgress = true;
			autoMapType = 'Calibration 1';
			setTimeout(function() {
				showAlert({
					title: 'Waiting for MIDI button...', 
					message: 'This will use 4 pots for depthThreshold, depthRange, offsetX and offsetY'
				}, [{label: 'Cancel'}]);
			}, 500);
		}},
		{label: 'Calibration Params 2', callback: function() {
			autoMapInProgress = true;
			autoMapType = 'Calibration 2';
			setTimeout(function() {
				showAlert({
					title: 'Waiting for MIDI button...', 
					message: 'This will use 4 pots for zoom, perspective, rotateX and rotateY'
				}, [{label: 'Cancel'}]);
			}, 500);
		}},
		{label: 'Filter Params', callback: function() {

		}},
		{label: 'Current Visualisation Params', callback: function() {

		}},
		{label: 'Cancel'}
	]);
}
function receivedAutoMapMidi(byteArray, midiType) {
	
	if(!isset(w.mappings.midiButtons)) w.mappings.midiButtons = {};

	var currentCC = byteArray[1];
	console.log(midiType);

	if(autoMapType == 'Visualisation List' && midiType == 'key') {
		for(var i=0; i < effects.length; i ++) {
			w.mappings.midiButtons[effects[i]] = {
				label: effects[i].readable(),
				name: effects[i],
				midi: {
					cc: currentCC
				}
			}
			$('#'+effects[i]+'.file').attr('data-midi-linked','');
			currentCC ++ ;
		}
	}else if(autoMapType == 'Colour Palettes' && midiType == 'key') {
		for(var i=0; i < w.palettes.length; i ++) {

			var paletteName = 'palette_'+w.palettes[i].id;
			w.mappings.midiButtons[effects[i]] = {
				label: w.palettes[i].title,
				name: paletteName,
				midi: {
					cc: currentCC
				}
			}
			$('#'+paletteName+'.palette').attr('data-midi-linked','');
			currentCC ++ ;
		}
	}else if(autoMapType.indexOf('Calibration ') === 0 && midiType == 'pot') {

		calibrationParams = $('[data-parent="calibrationZone"].noUi-handle');

		var start = 0;
		var finish = 4;
		if(autoMapType == 'Calibration 2') {
			start = 4;
			finish = calibrationParams.length;
		}
		for(var i = start; i < finish; i ++) {

			var paramElem = $(calibrationParams[i]);
			var paramName = paramElem.attr('data-name');
			if(isObjectPathSet(w.mappings, [w.hash, paramName, 'midi'])) {

				w.mappings[w.hash][paramName].midi.cc = currentCC;

			}else{

				w.mappings[w.hash][paramName] = {
					label: paramName.replace('calibration_','').readable(), 
					name: paramName, 
					midi: {
						min: parseFloat(paramElem.attr('data-min')),
						max: parseFloat(paramElem.attr('data-max')),
						value: byteArray[2],
						initValue: byteArray[2],
						postValue: byteArray[2],
						cc: currentCC
					},
					audio: false
				};
			}
			paramElem.attr('data-midi-linked','');
			currentCC ++;
		}
	}
	
	w.saveCookie();

	autoMapInProgress = false;
	showAlert({
		label: 'Success', 
		message: autoMapType+' has been auto-mapped to '+effects.length+' keys/buttons starting from CC '+byteArray[1]
	}, [
		{label: 'Sweet!', callback: function() {
			setTimeout(function() { commenceAutoMapping() }, 500);
		}}
	]);
}


