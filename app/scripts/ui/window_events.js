
w = false;
controlsLoaded = true;
if (window.opener != null && !window.opener.closed) {
	// window.opener.testConnection();
	w = window.opener;
}


window.onunload = function() {
	w.controlsClosed();
}
var curDrag = false;
var offsetLeft = 0;

window.onkeypress = function(e) {keyPressed(e)};

window.onresize = function(e) {
	//update freq bar width in core upon resize so it draws accordingly
	if(isset(w.frequencyArray)) {
		// var width = $('#rightOfSpectrum').width();
		w.freqCanvasWidth = $('.rightOfSpectrum').width();
		console.log($('.rightOfSpectrum').width());
		$('#frequencyBars').attr('width', w.freqCanvasWidth);
		$('#frequencyBars').attr('height', 200);
		w.freqBarWidth = w.freqCanvasWidth/w.frequencyArray.length;
	}
}

function reinitStaticElement(elem) {
	var el = $(elem),  
	newone = el.clone(true);
	el.before(newone);
	el.remove();
	//$("#" + el.attr("id") + ":last").remove();
}

var jsonStream;
var wasClosed = true;
var logPopup = false;

function openLogWindow() {
	logPopup = window.open("/app/log.html", "Controls", 'width=524,height='+screen.height+',left=0,top=0');
}

//maybe do this kind of not worth it though
function debug() {

}
debug.prototype = {
	log: function() {

	},
	info: function() {

	},
	warn: function() {

	},
	error: function() {

	}
}

function loaded() {

	// init resize and grab palettes if core has loaded them
	updatePalettes();

	// update device status icons
	if(w.gotKinect) $('#kinectCheck').removeClass('error');
	if(w.gotAudio) $('#soundCheck').removeClass('error');

	// begin midi data streaming
	jsonStream = new EventSource('/app/midi.json');
	jsonStream.addEventListener('open', function(e) {
  		wasClosed = false;
  		$('#midiCheck').removeClass('error');
	}, false);
	jsonStream.addEventListener('error', function(e) {

		wasClosed = true;
		$('#midiCheck').addClass('error');

		if (e.readyState == EventSource.CLOSED || e.type == 'error') console.warn("conncetion was closed due to inactivity");
		else console.log('unintended error: ',e);

	}, false);
	jsonStream.addEventListener('message', function(e) {

		if($('body').hasClass('disabled')) return;
		
		//never cross streams lmao
		if(e.data.substring(0,14) != 'data:image/png' ) {

			//trick to retrigger css animation
			reinitStaticElement($('#midiCheck'));

			if(wasClosed) {
				console.info("port reopened!");
				$('#midiCheck').removeClass('error');
				wasClosed = false;
			}

			if($('body').hasClass('mapping waiting')) {
				receiveMappingData(e.data.split(' '));
			}else{
				processMidiData(e.data.split(' '));
			}

		}

	}, false);
	

	// Tray buttons
	$('#toggleTesting').unbind('click').bind('click', function(e) {
		w.toggleTesting('image',false);
	});

	$('#mapMidiButton').unbind('click').bind('click', function(e) {
		toggleMidiMapping();
	});

	$('#mapAudioButton').unbind('click').bind('click', function(e) {
		toggleAudioMapping();
	});

	$('#rebindButton').unbind('click').bind('click', function(e) {
		linkMappableElements();
	});

	$('#autoMapButton').unbind('click').bind('click', function(e) {
		commenceAutoMapping();
	});	


	$('#exportButton').unbind('click').bind('click', function(e) {
		showAlert({
			title: 'Copy to a text file:',
			message: '<p>Be careful if you choose to modify this, min/max values are there for a reason.</p><textarea>'+JSON.stringify(w.mappings, null, 3)+'</textarea>',
		}, [
			{label: 'Otayy'}
		]);
	});
	$('#importButton').unbind('click').bind('click', function(e) {

		showAlert(uiMessages.importButton, [
			{label: 'Cancel'},
			{label: 'Import', callback: function() {

				var importedData = $('.alertBox textarea').first().val();
				// alert(importedData);

				try {
					JSON.parse(importedData);
				} catch (e) {
					console.log('unable to parse json string');
					setTimeout(function() {
						showAlert(uiMessages.importError, [{label: 'Aw rats!'}]);
					}, 500);
					
					return false;
				}
				w.mappings = JSON.parse(importedData);
				w.saveCookie();
				w.loadCookie();
				window.close();

			}}
		]);


	});

	$('.doneAudioMapping').unbind('click').bind('click', function(e) {
		console.log('done button pressed');
		mappingAudioDone(e);
	});







	// Init frequency range selectors
	$('#freqRange').noUiSlider({
		start: [0,100],
		limit: 40,
		behaviour: 'drag',
		connect: true,
		range: {
			'min': [0],
			'max': [100]
		}
	}); 
	$('#freqThresh').noUiSlider({
		start: [50],
		behaviour: 'drag',
		orientation: 'vertical',
		direction: 'rtl',
		range: {
			'min': [0],
			'max': [100]
		}
	});
	$('#freqRange').on({
    	slide: function() {
    		var val = $(this).val();
    		w.soundRange = [parseFloat(val[0]),parseFloat(val[1])];
    	}
    });
    $('#freqThresh').on({
    	slide: function() {
    		w.soundThresh = parseFloat($(this).val());
    	}
    });
    console.log($('.dial.gainKnob'));
	$('.dial.gainKnob').knob({
		release: function (v) { 
			console.log(typeof v,v);
			w.gainAmount = v/100;
		}
	});
	$('.qFactorKnob.dial').knob({
		// 'readOnly': true,
		release: function (v) { 
			console.log(v);
			paramElementChanged(this,v);
		}
	});

	// Add mappable parameter to frequenecy range sliders
	$('#freqRange .noUi-handle-lower').attr({'data-name': 'global_audioRangeLower', 'data-midi-mappable':'','data-midi-type': 'pot'});
	$('#freqRange .noUi-handle-upper').attr({'data-name': 'global_audioRangeUpper', 'data-midi-mappable':'','data-midi-type': 'pot'});
	$('#freqThresh .noUi-handle').attr({'data-name': 'global_audioThresh', 'data-midi-mappable':'','data-midi-type': 'pot'});

	// Init all the tab views
	generateEffectsFiles();
	initAllParameters();

	// Init mappable elements ... but wait for DOM to propgate first it misses elements otherwise :/
	setTimeout(function() {
		linkMappableElements();
		refreshAudioMappings();
	},3000);


	// Init tab view
	$('.tabs').tabslet();
	
}

function toggleAudioMapping() {
	if($('body').hasClass('mappingAudio')) {
		mappingAudio = false;
		w.currentlyMappingAudio = false;
		$('body').removeClass('mappingAudio waitingAudio');
		console.log($('.xe').length);
		$('[data-audio-mappable].waitingAudio').removeClass('waitingAudio');
	}else{
		if($('body').hasClass('mapping')) toggleMidiMapping();
		mappingAudio = true;
		$('body').addClass('mappingAudio');
	}
	console.log('toggling audio mapping');
}

function toggleMidiMapping() {
	if($('body').hasClass('mapping')) {
		mappingMIDI = false;
		$('body').removeClass('mapping waiting');
		$('[data-midi-mappable].waiting').removeClass('waiting');
	}else{
		if($('body').hasClass('mappingAudio')) toggleAudioMapping();
		mappingMIDI = true;
		$('body').addClass('mapping');
	}
	console.log('toggling midi mapping');
}

function initAllParameters() {

	generateEffectParams();
	generateFilterParams();
	generateCalibrationParams();
	refreshAudioMappings();

}


function keyPressed(event) {

	//number keys trigger effects
	var chCode = ('which' in event) ? event.which : event.keyCode;
		
	var hasFocus = $("input, textarea").is(":focus");

	// MMMMMMMMMMMAP key
	if(chCode == 77 || chCode == 109) {
		$('#mapMidiButton').trigger('click');
		if(hasFocus) {
			event.preventDefault();
			return false;
		}
	}else if(chCode == 65 || chCode == 97) {
		$('#mapAudioButton').trigger('click');
		if(hasFocus) {
			event.preventDefault();
			return false;
		}
	//Key 1-4 toggle tabs
	}else if(chCode >= 49 && chCode <= 52 && !hasFocus) {
		$('body').blur();
		$('.tabs>ul>li').removeClass('active');
		$('.tabs>ul>li>a').removeClass('active');
		$('a[href="#tab-'+(chCode-48)+'"]').parent().addClass('active');
		$('.tabArea').removeClass('active').hide();
		$('#tab-'+(chCode-48)).show().addClass('active');
	//delete mapping
	}else if(chCode == 100 || chCode == 68) {
		if($('body').hasClass('waiting') && $('body').hasClass('mapping')) {
			deleteSelectedMidiMapping();
		}else if($('body').hasClass('waitingAudio') && $('body').hasClass('mappingAudio')) {
			deleteSelectedAudioMapping();
		}
	}else if(hasFocus) {
		event.preventDefault();
	}
	console.log('key pressed ',chCode);
  
}

function showAlert(config, buttons) {

	console.log('showing alert');
	var alertWindow = $('#alertWindow');
	var dialog = $('#alertWindow .alertBox');

	$('.button',dialog).show().unbind('click').addClass('hidden');


	$('.title',dialog).html(config.title || '');
	$('.message',dialog).html(config.message || '');
	if(isset(config.message)) $('.message',dialog).html(config.message);
	if(isset(buttons)) {
		for(var i=0; i<buttons.length; i++) {

			var alertButton = $('.button'+(i+1),dialog);
			alertButton.html(buttons[i].label || 'Okay').unbind('click');
			if(typeof buttons[i].callback == 'function') {
				alertButton.bind('click', buttons[i].callback);
			}else{
				alertButton.bind('click', function() {
					autoMapInProgress = false;
				});
			}
			
			alertButton.removeClass('hidden');
		}
		$('.button:not(.hidden)',dialog).bind('click', function() { closeAlert(false) });
		$('.button:not(.hidden)',dialog).last().focus();
	}

	alertWindow.addClass('opened');
}
function closeAlert(e) {
	console.log('closing alert');
	$('#alertWindow').removeClass('opened');
}
