var stage, renderer, depthTextureBase, depthTexture, depthImageSprite;

var winW = 640;
var winH = 480;

var animating = false;
var gotImage = false;

var maxFrames = 500; //amount of trail frames to allows before force deleting them - can take a huge performance hit
var breakLoop = 500; //amount of times a while loop can try before breaking



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

	var val2 = map_range(val, 0, 255, depthThreshold, (depthThreshold+depthRange < 255) ? depthThreshold-depthRange : 255 );
	val2 = (val2 < 0) ? 0 : (val2 > 255) ? 255 : val2;
	return val2;

}
function pixelInRange(val) {
	// console.log(val);
	return (val > depthThreshold && val < depthThreshold+depthRange) ? true : false;
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
      currentScript.screens[i].alpha -= trailAmount;
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

	$('#volumeBar',controlsPopup.document).css('width',(volume/255)+'%');

	if(currentScript) {
		if(typeof currentScript.initFrame != 'undefined') currentScript.initFrame(currentScript);
		else initFrame();
		currentScript.draw();
		addFrame();
	}
	// depthImageSprite.setTexture(depthTexture);
	renderer.render(stage);
	if(animating) requestAnimFrame(animateFrame);

}

function changeScript(script) {
	clearStage();

	console.info('loading ~'+script+'~');
	window.location.href = '/#'+script;
	hash = script;

	if(typeof mappings != 'object') mappings = {};
	if(typeof mappings[hash] != 'object') mappings[hash] = [];


	loadedScript = false;
	
	if(window[script]) {
		currentScript = window['effect_'+script];
		loadedScript = true;
		console.info('Loading from cached script');
	}else{
		requirejs(['/effects/effect_'+script+'.js'],function() {
			if(window['effect_'+script]) {

				currentScript = window['effect_'+script];
				
				//always run init before anything else
				currentScript.init();
				if(typeof currentScript.screens == 'undefined') {
					currentScript.screens = [];
					currentScript.graphics = false;
				}
				createControls();

				console.info('Script loaded! ',currentScript);
				loadedScript = true;
				requestAnimFrame(animateFrame);
			}else{
				console.warn('Loaded script but incorrectly named or something');
			}
		});
	}
	
	$('.changeScript',controlsPopup.document).removeClass('active');
	$('#'+script, controlsPopup.document).addClass('active');
	// currentScript = window[script];

	if(!inited) {
        inited = true;
        //THIS CAN ONLY BE RUN ONCE OR ELSE MAX LAG (due to listener double-ups)
        run();
    }

}