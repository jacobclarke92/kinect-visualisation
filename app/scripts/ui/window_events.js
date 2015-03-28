
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

	//open log window


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
		// console.log(e.data.substring(0,14));
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
	$('#toggleTesting').click(function() {
		w.toggleTesting('image',false);
	});

	$('#mapMidiButton').click(function() {
		if($('body').hasClass('mapping')) {
			$('body').removeClass('mapping waiting');
			$('[data-midi-mappable].waiting').removeClass('waiting');
		}else{
			$('body').addClass('mapping');
		}
		console.log('toggling mapping');
	});

	$('#mapAudioButton').click(function() {
		if($('body').hasClass('mappingAudio')) {
			w.currentlyMappingAudio = false;
			$('body').removeClass('mappingAudio waitingAudio');
			$('[data-audio-mappable].waiting').removeClass('waiting');
		}else{
			$('body').addClass('mappingAudio');
		}
	});

	$('.doneAudioMapping').click(function(e) {
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
	},2000);


	// Init tab view
	$('.tabs').tabslet();
	
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

	if(hasFocus) {
		var input = $('input:focus').first();
		if(input.attr('type') == 'number') {
			if (chCode < 48 || chCode > 57) {
				console.log('preventing non-number key press');
				event.preventDefault();
				return false;
			}else{

				/*
				//this doesn't work because it needs to be on keyup to get the updated value but in order for preventdefault to work it needs to be on keydown lmao
				var inputVal = parseFloat(input.val());
				var inputMin = parseFloat(input.attr('min'));
				var inputMax = parseFloat(input.attr('max'));
				console.log(inputVal, inputMin, inputMax);
				if( inputVal < parseFloat(input.attr('min')) || inputVal > parseFloat(input.attr('max')) ) {
					event.preventDefault();
					return false;
				}
				*/
				return;
			}
		}else{
			return;
		}
	}


	// MMMMMMMMMMMAP key
	if(chCode == 77) {
		$('#mapMidiButton').trigger('click');
	}else if(chCode == 65) {
		$('#mapAudioButton').trigger('click');
	//Key 1-4 toggle tabs
	}else if(chCode >= 49 && chCode <= 52) {
		$('body').blur();
		$('.tabs>ul>li').removeClass('active');
		$('.tabs>ul>li>a').removeClass('active');
		$('a[href="#tab-'+(chCode-48)+'"]').parent().addClass('active');
		$('.tabArea').removeClass('active').hide();
		$('#tab-'+(chCode-48)).show().addClass('active');
	}else if(chCode == 8 && $('body').hasClass('mapping waiting')) {
		deleteSelectedMapping();
	}
	console.log('key pressed ',chCode);
  
}

function showAlert(config) {

	console.log('showing alert');
	var alertWindow = $('#alertWindow');
	var dialog = $('#alertWindow .alertBox');

	$('.button',dialog).show().unbind('click').addClass('hidden')


	$('.title',dialog).html(config.title || '');
	$('.message',dialog).html(config.message || '');
	if(isset(config.message)) $('.message',dialog).html(config.message);
	if(isset(config.buttons)) {
		for(var i=0; i<config.buttons.length; i++) {
			$('.button'+(i+1),dialog).html(config.buttons[i].label || 'Okay').bind('click', config.buttons[i].callback).removeClass('hidden');
		}
		$('.button:not(.hidden').click(closeAlert);
		$('.button:not(.hidden').last().focus();
	}

	alertWindow.addClass('opened');
}
function closeAlert(e) {
	$('#alertWindow').removeClass('opened');
}
