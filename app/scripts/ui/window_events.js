
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

		//trick to retrigger css animation
		reinitStaticElement($('#midiCheck'));

		if(wasClosed) {
			console.info("port reopened!");
			$('#midiCheck').removeClass('error');
			wasClosed = false;
		}

		//never cross streams lmao
		if(e.data.substring(0,14) != 'data:image/png' ) {

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



	// Init tab view
	$('.tabs').tabslet();

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
	// Add mappable parameter to frequenecy range sliders
	$('#freqRange .noUi-handle-lower').attr('data-midi-mappable','').attr('data-midi-type','pot');
	$('#freqRange .noUi-handle-upper').attr('data-midi-mappable','').attr('data-midi-type','pot');

	// Init all the tab views
	generateEffectsFiles();
	generateEffectParams();
	generateFilterParams();
	generateCalibrationParams();

	// Init mappable elements ... but wait for DOM to propgate first it misses elements otherwise :/
	setTimeout(function() {linkMappableElements()},200);
	
}


function keyPressed(event) {

  //number keys trigger effects
  var chCode = ('charCode' in event) ? event.charCode : event.keyCode;
  console.log('key pressed ',chCode);
  
}



