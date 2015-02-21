


//reset all mappable elements' click bindings
function linkMappableElements() {
	var counter = 0;

	$('[data-midi-mappable]').each(function() {
		counter ++;
	});
	console.log('MIDI MAPPABLE ELEMENTS: ',counter);
	$('[data-midi-mappable]').unbind('click',midiMappableElementClicked).bind('click',midiMappableElementClicked);


	$('[data-audio-mappable]').each(function() {
		counter ++;
	});
	console.log('MIDI MAPPABLE ELEMENTS: ',counter);
	$('[data-audio-mappable]').unbind('click',audioMappableElementClicked).bind('click',audioMappableElementClicked);

}

//a midi-mappable element has been clicked
function midiMappableElementClicked(e) {
	console.log('midi mappable item clicked ',e.target);

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
	console.log('audio mappable item clicked ',e.target);
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


// this will be triggered from body class is 'mapping' and 'waiting'
function receiveMappingData(midiData, externalOverride) {

	// midiData
	midiData[0].destring();
	midiData[1].destring();
	midiData[2].destring();

	//this should refer to only 1 element - the on waiting to be mapped
	var mappedElement = $('[data-midi-mappable].waiting');
	if(!mappedElement) {
		console.log('no midi mappable element waiting to be mapped ????');
		return;
	}
	var paramName = (mappedElement.attr('name')) ? mappedElement.attr('name') : mappedElement.attr('data-name');
	var paramType = mappedElement.attr('data-midi-type');

	//detect whether a key or potentiometer was touched
	var midiType = false;
	if(midiData[0] >= 176 && midiData[0] <= 191) midiType = 'pot';
	else if(midiData[0] >= 144 && midiData[0] <= 159) midiType = 'key';

	//if the midi message type matches the elements allowed midi type then proceed
	if(paramType == midiType) {

		console.log('compatible control type to match midi type! --',midiType);

		if(typeof externalOverride == 'undefined') {

			var mappingOverride = isMappingSetForCC(midiData[1], paramType);
			if(mappingOverride.length == 1 && mappingOverride[0] == paramName) mappingOverride = false;
			if(mappingOverride) {
				console.log('mapping override!');
				$('body').addClass('disabled');
				var readableList = mappingOverride;
				for(var i=0; i<readableList.length; i++) readableList[i] = readableList[i].readable();
				showAlert({
					title: 'Mapping override',
					message: 'Midi CC already set for '+readableList.join(', ')+'.<br>What would you like to do?',
					buttons: [
						{label: 'Keep '+readableList.join(', '), callback: function() {
							console.log('keep original');
							mappedElement.removeClass('waiting');
							$('body').removeClass('disabled waiting');
						}},
						{label: 'Keep '+((mappingOverride.length > 1) ? 'all' : 'both'), callback: function() {
							console.log('keep both');
							receiveMappingData(midiData,true);
							$('body').removeClass('disabled');
						}},
						{label: ((mappingOverride.length > 1) ? 'Only keep ' : 'Keep ')+paramName.readable(), callback: function() {
							console.log('keep original');
							removeMappingsByCC(midiData[1]);
							receiveMappingData(midiData,true);
							$('body').removeClass('disabled');
						}}
					]
				});
				return;
			}
		}

		if(midiType == 'pot') {
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

			//if(mappedElement.hasClass('dial')) mappedElement.trigger('configure', {'fgColor':'#f9d423'}); 
			//use this for audio mapping

			
		}else if(midiType == 'key') {
			
			if(!isset( w.mappings['midiButtons'])) w.mappings['midiButtons'] = {};
			w.mappings['midiButtons'][paramName] = {
				label: paramName.readable(),
				name: paramName,
				cc: midiData[1]
			}
			mappedElement.removeClass('waiting').attr('data-midi-linked','');



		}

		mappedElement.removeClass('waiting').attr('data-midi-linked','');
		$('body').removeClass('waiting');

		w.saveCookie();

		console.log('Mapping made!',mappedElement,midiData);
		//store changes to w.mappings
		

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
