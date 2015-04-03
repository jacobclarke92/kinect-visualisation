
var midiChangeTimeout = false;

//midi data has been received! 
//if we've been waiting to map something then the data has already been routed to another fuction to handle that
function processMidiData(byteArray) {

	byteArray[0] = byteArray[0].destring();
	byteArray[1] = byteArray[1].destring();
	byteArray[2] = byteArray[2].destring();
	// console.log(byteArray);

	//try to find a matching CC value
	var midiType = false;
	if(byteArray[0] >= 176 && byteArray[0] <= 191) midiType = 'pot';
	else if(byteArray[0] >= 144 && byteArray[0] <= 159) midiType = 'key';

	if(midiType == 'pot') {
		$.each(w.mappings[w.hash],function(key, mapping) {

			//is the effect param mapped with midi? and does the CC code match?
			if(mapping.midi.cc == byteArray[1]) {


				//convert from midi value 0-127 to param's own min/max range
				var mappedValue = map_range(byteArray[2], 0, 127, mapping.midi.min, mapping.midi.max);
				// console.log('updating ',mapping.name,' to ',byteArray[2],' = ', mappedValue);

				//update the mapping value
				w.mappings[w.hash][mapping.name].midi.value = mappedValue;
				w[mapping.name] = mappedValue;

				//update the appropriate element
				setElementValue(mapping.name, mappedValue);

				//update canvas if calibration value is changed
				if(mapping.name.indexOf('calibration_') === 0 && mapping.name.indexOf('depth') == -1) {
					w.updateCanvas();
				}

				//obviously don't save a cookie on every midi message, so just set a timeout and clear it on any overriding midi messages
				if(midiChangeTimeout) clearTimeout(midiChangeTimeout);
				midiChangeTimeout = setTimeout(function() {
					w.saveCookie();
				},2000);

			}

		});
	}else if(midiType == 'key') {
		if(typeof w.mappings['midiButtons'] != 'undefined') {
			$.each(w.mappings['midiButtons'],function(key, mapping) {
				if(mapping.midi.cc == byteArray[1]) {

					var elem = $('#'+mapping.name+'[data-midi-mappable]');
					console.log('midi key pressed for ',elem);
					if(elem) {
						$(elem).trigger('click');
						if(elem.hasClass('.palette')) console.log('is palette');
					}else{
						console.log('elem ',mapping.name,' for CC ',mapping.cc,' not found!');
					}

				}
			});
		}else{
			console.warn('midiButtons not defined in mappings!');
		}
	}

}



// this will be triggered from body class is 'mapping' and 'waiting'
function receiveMappingData(midiData, externalOverride) {

	// midiData
	midiData[0] = (typeof midiData[0] != 'number') ? parseInt(midiData[0]) : midiData[0];
	midiData[1] = (typeof midiData[1] != 'number') ? parseInt(midiData[1]) : midiData[1];
	midiData[2] = (typeof midiData[2] != 'number') ? parseInt(midiData[2]) : midiData[2];

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

			console.log(mappingOverride);

			//don't ask to override element that's already selected
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
							//pass the same midi data received in the function with the addition of override = true to prevent a further prompts
							receiveMappingData(midiData,true);
							$('body').removeClass('disabled');
						}},
						{label: ((mappingOverride.length > 1) ? 'Only keep ' : 'Keep ')+paramName.readable(), callback: function() {
							console.log('keep new');
							removeMappingsByCC(midiData[1]);
							//pass the same midi data received in the function with the addition of override = true to prevent a further prompts
							receiveMappingData(midiData);
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
				midi: {
					min: parseFloat(mappedElement.attr('data-min')),
					max: parseFloat(mappedElement.attr('data-max')),
				},
				audio: false
			};
			else mapping = w.mappings[w.hash][paramName];
			mapping.midi.value = midiData[2];
			mapping.midi.initValue = midiData[2];
			mapping.midi.postValue = midiData[2];
			mapping.midi.cc = midiData[1];

			w.mappings[w.hash][paramName] = mapping;
			
		}else if(midiType == 'key') {
			
			if(!isset( w.mappings['midiButtons'])) w.mappings['midiButtons'] = {};
			w.mappings['midiButtons'][paramName] = {
				label: paramName.readable(),
				name: paramName,
				midi: {
					cc: midiData[1],
				},
				audio: false
			}
			mappedElement.removeClass('waiting').attr('data-midi-linked','');



		}

		mappedElement.removeClass('waiting').attr('data-midi-linked','');
		$('body').removeClass('waiting');

		w.saveCookie();

		console.log('Mapping made!',mappedElement,midiData);

	}else{
		console.log('incompatible control type to midi type!',midiData[0]);
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
		if(isset(mapping.midi.cc) && mapping.midi.cc != -1 && mapping.midi.cc == cc) results.push(mapping.name);
	});

	return (results.length > 0) ? results : false;
}
function removeMappingsByCC(cc) {
	if(isset(w.mappings[w.hash])) $.each(w.mappings[w.hash],function(key,mapping) {
		if(isset(mapping.midi.cc) && mapping.midi.cc === cc) {
			$('#'+mapping.name).removeAttr('data-midi-linked');
			w.mappings[w.hash][key].midi.cc = -1;
		}
	});
	if(isset(w.mappings['midiButtons'])) $.each(w.mappings['midiButtons'],function(key,mapping) {
		if(mapping.cc === cc) {
			$('#'+mapping.name).removeAttr('data-midi-linked');
			delete w.mappings['midiButtons'][key];
		}
	});
}