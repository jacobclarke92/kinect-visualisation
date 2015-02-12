
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

	offsetLeft = parseInt(w.jQuery('#frequencySelector',document).css('left'));
	console.log(offsetLeft);
	$$('palettes').resize();
	$$('params').resize();
}
window.onresize = function() {windowResize()};
window.onkeypress = function(e) {w.keyPressed(e)};


function loaded() {
	windowResize();
	updatePalettes();

	if(w.gotKinect) w.jQuery('#kinectCheck',document).removeClass('error');
	if(w.gotAudio) w.jQuery('#soundCheck',document).removeClass('error');

	w.jQuery('#leftSlider',document).bind('mousedown',function() {
		console.log('left slider click');
		curDrag = this;
	});
	w.jQuery('#rightSlider',document).bind('mousedown',function() {
		console.log('right slider click');
		curDrag = this;
	});

	w.jQuery(document,document).bind('mouseup',function() {
		curDrag = false;
	});
	w.jQuery(document,document).bind('mousemove',function(e) {
		if(curDrag != false) {
			var posX = e.clientX - offsetLeft;
			posX = posX < 0 ? 0 : posX > 512 ? 512 : posX;
			w.jQuery(curDrag).css('left',posX+'px');

			w.soundRange = [
				parseInt(w.jQuery('#leftSlider',document).css('left')),
				parseInt(w.jQuery('#rightSlider',document).css('left'))
			];
			w.soundRange.sort();
			if(w.soundRange[0] > w.soundRange[1]) w.soundRange.reverse();
		}
	})
}