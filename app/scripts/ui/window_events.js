
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

function windowResize() {
	
	if(!$$('palettes')) return false;

	offsetLeft = parseInt($('#frequencySelector',document).css('left'));
	console.log(offsetLeft);
	$$('palettes').resize();
	$$('params').resize();
}
window.onresize = function() {windowResize()};
window.onkeypress = function(e) {w.keyPressed(e)};


function loaded() {
	windowResize();
	updatePalettes();

	if(w.gotKinect) $('#kinectCheck',document).removeClass('error');
	if(w.gotAudio) $('#soundCheck',document).removeClass('error');

	$('#leftSlider',document).bind('mousedown',function() {
		console.log('left slider click');
		curDrag = this;
	});
	$('#rightSlider',document).bind('mousedown',function() {
		console.log('right slider click');
		curDrag = this;
	});

	$(document,document).bind('mouseup',function() {
		curDrag = false;
	});
	$(document,document).bind('mousemove',function(e) {
		if(curDrag != false) {
			var posX = e.clientX - offsetLeft;
			posX = posX < 0 ? 0 : posX > 512 ? 512 : posX;
			$(curDrag).css('left',posX+'px');

			w.soundRange = [
				parseInt($('#leftSlider',document).css('left')),
				parseInt($('#rightSlider',document).css('left'))
			];
			w.soundRange.sort();
			if(w.soundRange[0] > w.soundRange[1]) w.soundRange.reverse();
		}
	});

	$('#toggleTesting').click(function() {
		w.toggleTesting('image',false);
	});
	$('.tabs').tabslet();
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
	console.log($('#freqRange .noUi-handle-lower'));
	$('#freqRange .noUi-handle-lower').attr('data-mappable','');
	$('#freqRange .noUi-handle-upper').attr('data-mappable','');

	generateEffectsFiles();
	generateEffectParams();
	generateFilterParams();
	generateCalibrationParams();
	linkMappableElements();
}




