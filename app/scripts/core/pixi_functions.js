var stage, renderer, depthTextureBase, depthTexture, depthImageSprite;

var winW = 640;
var winH = 480;

var animating = false;
var gotImage = false;

var maxFrames = 500; //amount of trail frames to allows before force deleting them - can take a huge performance hit
var breakLoop = 500; //amount of times a while loop can try before breaking


//filter effects
var displacementTexture = PIXI.Texture.fromImage("/app/img/displacement_map.png");
var displacementFilter = new PIXI.DisplacementFilter(displacementTexture);
var blurFilter = new PIXI.BlurFilter();
var pixelateFilter = new PIXI.PixelateFilter();
var invertFilter = new PIXI.InvertFilter();
var rgbSplitterFilter = new PIXI.RGBSplitFilter();
var twistFilter = new PIXI.TwistFilter();

rgbSplitterFilter.red.x = rgbSplitterFilter.red.y = rgbSplitterFilter.green.x = rgbSplitterFilter.green.y = rgbSplitterFilter.blue.x = rgbSplitterFilter.blue.y = 0;

var filterCollection = [displacementFilter, blurFilter, pixelateFilter, invertFilter, rgbSplitterFilter, twistFilter];

window.filter_displacement = 0;
window.filter_blur = 0;
window.filter_pixelate = 0;
window.filter_invert = 0;
window.filter_rgbSplit = 0;
window.filter_twist = 0;

function initPIXI() {
	stage = new PIXI.Stage(0x000000);
	renderer = PIXI.autoDetectRenderer(winW, winH, {antialias: true});
	renderer.view.className = "effectsRenderer";
	renderer.view.style.display = "block";

	document.getElementById('contentZone').appendChild(renderer.view);

	depthTextureBase = new PIXI.BaseTexture(image);
	depthTexture = new PIXI.Texture(depthTextureBase);
	depthImageSprite = new PIXI.Sprite(depthTexture);
	stage.addChild(depthImageSprite);
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
	if(!gotKinect) return true; // mostly for debugging
	return (val > calibration_depthThreshold && val < calibration_depthThreshold+calibration_depthRange) ? true : false;
}
function dist(x1,y1,x2,y2) {
	
	return Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) );
}
function rand(from,to) {
	var range = Math.abs(from) + Math.abs(to);
	return (from + Math.random()*range);
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




function clearStage() {
	while(stage.children[0]) { stage.removeChild(stage.children[0]); }
}

function initFrame() {
	//clear excess frames
	if(currentScript.screens.length > maxFrames) {
		while(stage.children[maxFrames]) { stage.removeChild(stage.children[maxFrames]); }
		currentScript.screens = currentScript.screens.splice(0,maxFrames);
	}

	//apply fade out to past frames
	currentScript.graphics = new PIXI.Graphics();
    for(var i=0; i<currentScript.screens.length; i++) {
      currentScript.screens[i].alpha -= trailAmount/10;
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

var weirdDivisionFixMin = 2.85;
var weirdDivisionFixMax = 3.25;
var weirdDivisionFixThresh = 1.5;
function animateFrame() {

	processAudio();

    //display overall volume metre in ui
    if(uiPopup.curDrag != false) $('#volumeBar',uiPopup.document).css({'width':(currentFreqRangeVolume/2)+'%', 'background-color':'#FF9999'});
	else $('#volumeBar',uiPopup.document).css({'width':(volume/255)+'%', 'background-color': '#FFFFFF'});

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
		if(filter_displacement != 0) filterCollection.push(displacementFilter);
		if(filter_twist != 0) filterCollection.push(twistFilter);
		if(filter_pixelate != 0) filterCollection.push(pixelateFilter);
		if(filter_rgbSplit != 0) filterCollection.push(rgbSplitterFilter);
		if(filter_invert != 0) filterCollection.push(invertFilter);
		if(filter_blur != 0) filterCollection.push(blurFilter);
		if(filterCollection.length == 0) filterCollection = null;
	}	

	
	stage.filters = filterCollection;

	//render it go go go
	renderer.render(stage);
	if(animating) requestAnimFrame(animateFrame);

}
