var stage, renderer, depthTextureBase, depthTexture, depthImageSprite;

var winW = 640;
var winH = 480;

var animating = false;
var gotImage = false;

var maxFrames = 500; //amount of trail frames to allows before force deleting them - can take a huge performance hit
var breakLoop = 500; //amount of times a while loop can try before breaking


//filter effects
var displacementFilter, blurFilter, pixelateFilter, invertFilter, rgbSplitterFilter, twistFilter, kaleidoscopeFilter, glowFilter;
var displacementTexture;
var filterCollection = [];

window.filter_displacement = 0;
window.filter_blur = 0;
window.filter_pixelate = 0;
window.filter_invert = 0;
window.filter_rgbSplit = 0;
window.filter_twist = 0;


var startDrawX = 0;
var startDrawY = 0;
var endDrawX = winW;
var endDrawY = winH;


var sizeRatio = 1;

function initPixiFilters() {

	displacementTexture = PIXI.Sprite.fromImage("/app/img/displacement_maps/001.jpg");
	
	displacementFilter 	= new PIXI.filters.DisplacementFilter(displacementTexture);
	blurFilter 			= new PIXI.filters.BlurFilter();
	pixelateFilter 		= new PIXI.filters.PixelateFilter();
	invertFilter 		= new PIXI.filters.InvertFilter();
	rgbSplitterFilter 	= new PIXI.filters.RGBSplitFilter();
	twistFilter 		= new PIXI.filters.TwistFilter();
	kaleidoscopeFilter 	= new PIXI.filters.KaleidoscopeFilter();
	// glowFilter 			= new PIXI.filters.GlowFilter();

	rgbSplitterFilter.red.x = rgbSplitterFilter.red.y = rgbSplitterFilter.green.x = rgbSplitterFilter.green.y = rgbSplitterFilter.blue.x = rgbSplitterFilter.blue.y = 0;

	filterCollection = [pixelateFilter, invertFilter, rgbSplitterFilter, twistFilter, displacementFilter, blurFilter, glowFilter, kaleidoscopeFilter];
}

function updateDisplacementImage(url) {
	displacementTexture = PIXI.Sprite.fromImage(url);
	displacementFilter 	= new PIXI.filters.DisplacementFilter(displacementTexture);
}

function getWindowSize() {

	winW = $(window).width();
	winH = $(window).height();

	renderer.resize(winW,winH);

	if(winW/winH > 4/3) {
		//viewport is wider
		var zoomOffsetY = Math.round( (winH*calibration_zoom - winH)/2 );
		startDrawY = 0 - zoomOffsetY + calibration_offsetY;
		endDrawY = winH + zoomOffsetY + calibration_offsetY;

		var offsetSize = 640/(480/winH);
		var zoomOffsetX = Math.round( (offsetSize*calibration_zoom - offsetSize)/2 );

		sizeRatio = winH/240;

		startDrawX = Math.round( (winW-offsetSize)/2 ) + zoomOffsetX + calibration_offsetX;
		endDrawX = Math.round( winW - (winW-offsetSize)/2 ) + zoomOffsetX + calibration_offsetX;

	}else{
		//viewport is taller
		var zoomOffsetX = Math.round( (winW*calibration_zoom - winW)/2 );
		startDrawX = 0 - zoomOffsetX + calibration_offsetX;
		endDrawX = winW + zoomOffsetX + calibration_offsetX;

		var offsetSize = 480/((640)/winW);
		var zoomOffsetY = Math.round( (offsetSize*calibration_zoom - offsetSize)/2 )

		sizeRatio = winW/320;

		startDrawY = Math.round( (winH-offsetSize)/2 ) - zoomOffsetY + calibration_offsetY;
		endDrawY = Math.round( winH - (winH-offsetSize)/2 ) + zoomOffsetY + calibration_offsetY;
	}



	// console.log(startDrawX,endDrawX,startDrawY,endDrawY);

}

function tX(xVal) {
	return startDrawX + xVal*sizeRatio*calibration_zoom + calibration_offsetX;
}
function tY(yVal) {
	return startDrawY + yVal*sizeRatio*calibration_zoom  + calibration_offsetY;
}
function tV(val) {
	return val*sizeRatio;
}

function initPIXI() {

	$(window).unbind('resize').bind('resize',function () {
		getWindowSize();
	});

	stage = new PIXI.Stage(0x000000);
	renderer = PIXI.autoDetectRenderer(winW, winH, {antialias: true});
	renderer.view.className = "effectsRenderer";
	renderer.view.style.display = "block";

	getWindowSize();

	initPixiFilters();

	document.getElementById('contentZone').appendChild(renderer.view);

	if(typeof image != 'undefined') {
		depthTextureBase = new PIXI.BaseTexture(image);
		depthTexture = new PIXI.Texture(depthTextureBase);
		depthImageSprite = new PIXI.Sprite(depthTexture);
		stage.addChild(depthImageSprite);
	}
	animating = true;
}

// create a renderer instance

//FUNCTIONS USED COMMONLY INSIDE EFFECTS
function rgbToHexInt(rgb) {
	return rgb[0] * 0x10000 + rgb[1] * 0x100 + rgb[2];
}


function rangeAdjustedPixel(val) {

	var val2 = map_range(val, 0, 255, calibration_depthThreshold, (calibration_depthThreshold+calibration_depthRange < 255) ? calibration_depthThreshold-calibration_depthRange : 255 );
	val2 = (val2 < 0) ? 0 : (val2 > 255) ? 255 : val2;
	return val2;

}
function pixelInRange(val) {
	return (val > calibration_depthThreshold && val < calibration_depthThreshold+calibration_depthRange) ? true : false;
}
function dist(x1,y1,x2,y2) {
	
	return Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) );
}
function r(flot) {
	return Math.round(flot);
}
function isset(val) {
	return (typeof val != 'undefined');
}

function comparePts(pos1, pos2) {

	var xPos1 = (pos1 % 320);
	var yPos1 = Math.floor(pos1/320);

	var xPos2 = (pos2 % 320);
	var yPos2 = Math.floor(pos2/320);
	
	return dist(xPos1, yPos1, xPos2, yPos2);
  
}
function maybeLog(val) {
	if(Math.random()*500 <= 1) console.log(val);
}


function drawBoundingBox() {
	currentScript.graphics.lineStyle(1,0x000000);
	currentScript.graphics.drawRect(0,0,winW,winH)
	currentScript.graphics.lineStyle(false,false);
}

function clearStage() {
	while(stage.children.length > 1) { stage.removeChild(stage.children[0]); }
}

function initFrame() {
	//clear excess frames
	if(currentScript.screens.length > maxFrames) {
		while(stage.children[maxFrames]) { stage.removeChild(stage.children[maxFrames]); }
		currentScript.screens = currentScript.screens.splice(0,maxFrames);
	}

	//apply fade out to past frames
	currentScript.graphics = new PIXI.Graphics();

	//draw a rectangle around whole screen so filter effects don't clip
	drawBoundingBox();

	//iterate through past frames and fade them out
    for(var i=0; i<currentScript.screens.length; i++) {
      currentScript.screens[i].alpha -= (trailAmount == 1) ? 1 : trailAmount/10;
      if(currentScript.screens[i].alpha <= 0) {
        stage.removeChild(currentScript.screens[i]);
        currentScript.screens.splice(i,1);
      }
    }
}
function addFrame() {
    currentScript.screens.push(currentScript.graphics);
    stage.addChild(currentScript.screens[currentScript.screens.length-1]);
}

function animateFrame() {

	processAudio();

    //display overall volume metre in ui
    if(uiPopup.curDrag != false) $('#volumeBar',uiPopup.document).css({'width':(currentFreqRangeVolume/2)+'%'});
	else $('#volumeBar',uiPopup.document).css({'width':(volume/255)+'%'});

	//GOT SCRIPT?
	if(currentScript) {
		
		//does the script have its own custom initFrame function?
		if(typeof currentScript.initFrame != 'undefined') currentScript.initFrame(currentScript);
		else initFrame();

		//draw dat shit
		currentScript.draw();

		//does the script have its own custom addFrame function?
		if(typeof currentScript.addFrame != 'undefined') currentScript.addFrame();
		else addFrame();
	}


	//apply webgl filters

	//if one is defined then they probably all are hey
	if(typeof filter_displacement != 'undefined') {
		displacementFilter.scale.x = displacementFilter.scale.y = filter_displacement;
		twistFilter.angle = filter_twist;
		pixelateFilter.size.x = pixelateFilter.size.y = filter_pixelate;
		invertFilter.invert = filter_invert;
		rgbSplitterFilter.red.x = filter_rgbSplit;
		rgbSplitterFilter.blue.x = -filter_rgbSplit;
		blurFilter.blurX = blurFilter.blurY = filter_blur;

		filterCollection = [];
		if(filter_rgbSplit != 0) filterCollection.push(rgbSplitterFilter);
		if(filter_twist != 0) filterCollection.push(twistFilter);
		if(filter_pixelate != 0) filterCollection.push(pixelateFilter);
		if(filter_displacement != 0) filterCollection.push(displacementFilter);
		if(filter_invert != 0) filterCollection.push(invertFilter);
		if(filter_blur != 0) filterCollection.push(blurFilter);
		// if(1 != 0) filterCollection.push(glowFilter);
		// if(1 != 0) filterCollection.push(kaleidoscopeFilter); // not ready yet .. all in good time
		if(filterCollection.length == 0) filterCollection = null;
	}	

	
	stage.filters = filterCollection;

	//render it go go go
	renderer.render(stage);
	if(animating) requestAnimationFrame(animateFrame);

}
