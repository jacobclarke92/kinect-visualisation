(function () {

console.log('running connections.js');

this.testingImage = false;
this.testingSound = false;
this.testImageURL = '';
this.currentTestImage = 1;
this.currentScriptString = false;


this.loadedScript = false;
this.loadChecker;
this.timeout = 3000; //ms
this.timeoutTimer = 0;
this.intervalCheck = 100; //ms
this.hash = false;

//for this to work it must be compiled with browserify which is done automatically with -devmode
var websocket = require('../../../node_modules/websocket-stream');


this.inited = false;


this.startPage = function(fallback) {

	this.hash = window.location.hash;

	loadCookie();
	
	if(hash){
		this.hash = this.hash.substr(1,this.hash.length-1);

		//console.log('hash: '+hash);
		//console.log(_.indexOf(effects,hash));

		if(_.indexOf(effects,this.hash) > -1) {
			changeScript(this.hash);
		}else{
			changeScript(fallback);
		}

	}else{
		changeScript(fallback);
	}


	if(testingImage) {
		thisrandomizeImage(true);
		run();
	}


}

this.changeScript = function(script) {

	//remove instance of previous script
	if(this.currentScriptString && this.currentScriptString != script) {
		delete window['effect_'+this.currentScriptString];
	}
	this.currentScriptString = script;

	//clear stage
	this.clearStage();
	this.loadedScript = false;

	//change window hash to new script
	console.info('loading ~'+script+'~');
	window.location.href = '/#'+script;
	this.hash = script;

	//clear mappings for current hash
	if(typeof mappings != 'object') this.mappings = {};
	if(typeof mappings[hash] != 'object') this.mappings[hash] = {};

	//begin loading script
	requirejs(['/effects/effect_'+script+'.js'],function() {

		//check that the loaded file contained the actual effect object
		if(window['effect_'+script]) {

			this.currentScript = window['effect_'+script];
			
			//always run init before anything else -- this sets up mapping controls
			if(typeof currentScript.init != 'undefined') currentScript.init();
			else trailAmount = 1;

			if(typeof currentScript.screens == 'undefined') {
				this.currentScript.screens = [];
				this.currentScript.graphics = false;
			}

			//creates the mapping controls for the effect
			this.createControls();

			//begin animation frame
			console.info('Script loaded! ',currentScript);
			this.loadedScript = true;
			this.requestAnimFrame(animateFrame);

		}else{
			console.warn('Loaded script but incorrectly named or something');
		}
	});
	
	$('.changeScript',this.uiPopup.document).removeClass('active');
	$('#'+script, this.uiPopup.document).addClass('active');

	if(!this.inited) {
				this.inited = true;
				//THIS CAN ONLY BE RUN ONCE OR ELSE MAX LAG (due to listener double-ups)
				run();
		}

}



this.pixels = false;
this.rawImage = false;
this.canvasWidth = 640;
this.canvasHeight = 480;
this.processingInstance = false;
this.image = false;
this.imageLoaded = false;
this.gotKinect = false;
this.waiting = false;

var bufferCanvas = document.createElement('canvas');
var width = bufferCanvas.width = this.canvasWidth;
var height = bufferCanvas.height = this.canvasHeight;
var bufferCanvasContext = bufferCanvas.getContext('2d');
var bufferCanvasData = bufferCanvasContext.createImageData(width, height);

this.outlineArray = [];


var socket;

this.run = function() {

	console.log('running core -- should only occur once');

	this.image = new Image();
	var showDepth = true;
	

	if(testingImage) {

		this.image.onload = function() {

			bufferCanvasContext.drawImage(this.image, 0, 0);
			this.rawImage = bufferCanvasContext.getImageData(0, 0, width, height);
			this.pixels = rawImage.data;

			if(this.testingImage) console.log('test image loaded',this.pixels.length);

			if (!this.waiting && window.worker) {

				console.log('image loaded sending to post service');

				//calibration_depthThreshold and calibration_depthRange are delcared in mappings.js and are controlled in popup
				window.worker.postMessage([this.pixels, this.calibration_depthThreshold, this.calibration_depthRange]);
				this.waiting = true;
			}

		};

		console.log('changing src to '+this.testImageURL);
		this.image.src = this.testImageURL;

	}else if(!websocket) {

		console.warn('Web Socket not inited wtf! run -devmode');

	}else{

		// this.image = document.createElement("img");

		socket = websocket('ws://localhost:5600');
		socket.on('data', function (data) {

  			var bytearray = new Uint8Array(data);
  			window.rawImage = bufferCanvasContext.getImageData(0,0, width, height);
			var imgdatalen = window.rawImage.data.length;

			for(var i = 0; i < imgdatalen/4; i ++) {

				var depth = (bytearray[2*i]+bytearray[2*i+1]*255)/5;
				window.rawImage.data[4*i] = depth;
				window.rawImage.data[4*i+1] = depth;
				window.rawImage.data[4*i+2] = depth;
				window.rawImage.data[4*i+3] = 255;

			}

			bufferCanvasContext.putImageData(window.rawImage,0,0);
			
			// console.log('image src = ',bufferCanvas.toDataURL("image/png"));
			
			window.image.src = bufferCanvas.toDataURL("image/png");

			window.pixels = window.rawImage.data;

		});
/*
		image.onload = function() {

			// console.log("TEST IMAGE LOADED");

			bufferCanvasContext.drawImage(image, 0, 0);
			rawImage = bufferCanvasContext.getImageData(0, 0, width, height);
			pixels = rawImage.data;

			imageLoaded = image;

			// var midPt = width*(height/2) + width/2;
			// console.log(pixels[midPt*4+2]);

		}
		*/

		/*
		window.imageEventSource = new EventSource('/images');
		window.imageEventSource.addEventListener('message', function(event) {
			if(event.data.substring(0,14) == 'data:image/png' ) {
				
				this.image.src = event.data;
				if(this.testingImage) this.gotImage = true;
				if(this.pixels && this.hash.indexOf('outline') > -1) {

					//generate array of outline points, second parameter is smoothing
					this.outlineArray = this.MarchingSquares.getBlobOutlinePointsFromImage(this.pixels, 3, 20);

					var blobs = FindBlobs(rawImage);

					// if(Math.round(Math.random()*1000) < 1) {
					// console.log(blobs);
					// }

				}

				if(!this.gotKinect) {
				 console.log(event);
				 this.gotKinect = true;
				 $('#kinectCheck', this.uiPopup.document).removeClass('error');
				}
			}
		});

		startWorker();
		*/
	}

	
}

function startWorker() {

	//remove instance of worker if one already exists
	if(window.worker) {
		console.log("removing window worker");
		window.worker.terminate();
		delete window.worker;
	}

	//create window worker
	window.worker = createWorker(process, 320, 240, this.hash);
	window.worker.addEventListener('message', function(event) {

		if(this.testingImage) console.log('test image received from worker', event);
		this.waiting = false;
		this.gotImage = true;

		var eventCopy = event;
		eventCopy.width = this.canvasWidth;

		var blobs = FindBlobs(event);

		// console.log(blobs.length+' outline points');
		console.log(blobs);

	});
}

function createWorker(source) {
	var URL = window.URL || window.webkitURL;
	var args = Array.prototype.slice.call(arguments, 1);
	var script = '(' + source.toString() + ').apply(this,' + JSON.stringify(args) + ')';
	var blob = new Blob([script], {type: 'application/javascript'});
	var url = URL.createObjectURL(blob);
	var worker = new Worker(url);
	return worker;
}



//this function is a worker and only exists in its own scope\
function process(width, height, hash) {

	addEventListener('message', function(event) {

		var pixels = event.data[0];
		var threshold = event.data[1];
		var range = event.data[2];

		var image = new Array(width * height);
		var max = threshold+range;
		var min = threshold;

		var i=0;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var offset = ((y * width) + x)*4;
				var value = pixels[offset];
				
				if(value > min && value < max) value = ((value-min)/(max-min))*255;
				else value = 0; 
				

				i++;
				image[i] = Math.floor(value);
			}
		}
		postMessage(image);

	});
	
}

}.call(window));
