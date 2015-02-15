
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


	$('.tabs').tabslet();
	$('#freqRange').noUiSlider({
		start: [0,100],
		limit: 40,
		behavior: 'drag',
		connect: true,
		range: {
			'min': [0],
			'max': [100]
		}
	});
	generateEffectsFiles();
	generateEffectParams();
	generateFilterParams();
	generateCalibrationParams();
	linkMappableElements();
}

function linkMappableElements() {
	$('[data-mappable').unbind('click');
	$('[data-mappable').bind('click',mappableElementClicked);
}
function mappableElementClicked(e) {
	if($('body').hasClass('mapping')) {
		e.preventDefault();
		// e.stopPropogation();
		console.log('mapping ',e.target);
		$('body').removeClass('mapping');
	}
}

function generateEffectsFiles() {
	
	var filesZone = $('#filesZone');
	filesZone.html('');
	console.log(effects);
	for(var i=0; i< effects.length; i++) {
		var template = $('#templates #fileTemplate').children().clone(true,true);
		console.log(template);
		console.log($('li', template));
		$(template).attr('data-name',effects[i]);
		$(template).html('&#xf1c9; '+effects[i].readable());
		filesZone.append(template);
	}
	filesZone.wrapInner('<ul class="fileGroup opened">');
	$('#filesZone .file').bind('click',effectSelected);

}

function createSliders(sliderArray,target) {

	console.log('Generating sliders for ',target);

	for(var i=0; i<sliderArray.length; i++) {
		var param = sliderArray[i];
		var template = $('#templates #paramTemplate').children().clone(true,true);
		var step = Math.round(Math.abs(param.max-param.min)/15);
		var label = (param.label) ? param.label : param.name.readable();
		var cc = (param.cc) ? param.cc : -1;
		$('.title span',template).html(label);
		$('.slider input',template).attr({'name':param.name, 'min':param.min, 'max':param.max, 'step':step, 'value':param.value,'data-cc':cc});
		$('.slider input',template).noUiSlider({
			start: param.value,
			step: step,
			range: {
				'min': param.min,
				'max': param.max

			}
		});
		$('.mapKnob input',template).attr({'name':param.name+'_knob'});
		target.append(template);
	}
	$('.mapKnob .dial',target).knob();

}

function generateEffectParams() {
	var effectsZone = $("#effectsZone");
	effectsZone.html('');
	if(w.mappings[w.hash].length == 0) $("#effectsZone").html('<p>No parameters for current effect ... add some! :D</p>');

	createSliders(w.mappings[w.hash], effectsZone);
	
}

function generateFilterParams() {
	var filterParams = [
		 {label: 'RGB Split', name: 'filter_rgbSplit', min: 0, max: 100, value: 0}
		,{label: 'Displacement', name: 'filter_displacement', min: 0, max: 100, value: 0}
		,{label: 'Pixelate', name: 'filter_pixelate', min: 0, max: 100, value: 0}
		,{label: 'Twist', name: 'filter_twist', min: 0, max: 100, value: 0}
		,{label: 'Invert', name: 'filter_invert', min: -10, max: 10, value: 0}
		,{label: 'Blur', name: 'filter_blur', min: 0, max: 100, value: 0}
	];
	var filterZone = $('#filtersZone');
	filterZone.html('');

	createSliders(filterParams,filterZone);
	
}

function generateCalibrationParams() {
	var calibrationParams = [
		 //{label: 'Mirrored', name: 'calibration_mirrored', value: 0, on:{onChange:sliderChange}}
		 {label: 'Depth Threshold', name: 'calibration_depthThreshold', min: 100, max: 200, value: 0}
		,{label: 'Depth Range', name: 'calibration_depthRange', min: 1, max: 50, value: 0}
		,{label: 'Zoom', name: 'calibration_zoom', min: 0.2, max: 4.0, step: 0.1, value: 0}
		,{label: 'Offset X', name: 'calibration_offsetX', min: -200, max: 200, value: 0}
		,{label: 'Offset Y', name: 'calibration_offsetY', min: -200, max: 200, value: 0}
		,{label: 'Rotate X', name: 'calibration_rotateX', min: -65, max: 65, value: 0}
		,{label: 'Rotate Y', name: 'calibration_rotateY', min: -65, max: 65, value: 0}
		,{label: 'Perspective', name: 'calibration_perspective', min: 10, max: 2000, value: 800}
	];
	console.log(calibrationParams);

	var calibrationZone = $('#calibrationZone');
	calibrationZone.html('');

	createSliders(calibrationParams,calibrationZone);

}




