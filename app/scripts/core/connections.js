(function () {

console.log('running connections.js');

_this = this;

this.testingImage = false;
this.testingSound = false;
this.testImageURL = '';
this.currentScriptString = false;


this.pixelBit = 2;
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

var animatingTimeout = false;
var initScriptTimeout = false;
this.changeScript = function(script) {

	//remove instance of previous script
	// if(this.currentScriptString && this.currentScriptString != script) {
	// 	window['effect_'+this.currentScriptString] = false;
	// }

	this.$('.blackness').addClass('active');
	if(animatingTimeout) clearTimeout(animatingTimeout);
	if(initScriptTimeout) clearTimeout(initScriptTimeout);

	animatingTimeout = setTimeout(function() {
		_this.animating = false;
	},500);
	initScriptTimeout = setTimeout(function() {
		_this.clearStage();
		_this.realChangeScript(script);
	},600);
}
this.realChangeScript = function(script) {


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
	if(window['effect_'+script]) {
		initLoadedScript(script);
	}else{
		requirejs(['/effects/effect_'+script+'.js'],function() {

			//check that the loaded file contained the actual effect object
			if(window['effect_'+script]) {

				initLoadedScript(script);
				
			}else{
				console.warn('Loaded script but incorrectly named or something');
			}
		});
	}
	
	$('.changeScript',this.uiPopup.document).removeClass('active');
	$('#'+script, this.uiPopup.document).addClass('active');

	if(!this.inited) {
		this.inited = true;
		run();
	}

}

this.initLoadedScript = function(script) {

	this.$('.blackness').removeClass('active');

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


	if(!_this.animating) {
		_this.animating = true;
		this.requestAnimFrame(animateFrame);
	}


	setTimeout(function() {
		_this.clearStage();
		_this.$('.blackness').removeClass('active');
	},50);

}



this.pixels = false;
this.rawImage = false;
this.canvasWidth = 320;
this.canvasHeight = 240;
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
var worker;


var socket;
var attemptingToUseSocketLol = false;



this.run = function() {

	console.log('running core -- should only occur once');

	_this.image = new Image();
	var showDepth = true;
	

	if(testingImage) {

		this.pixelBit = 3;

		this.image.onload = function() {

			bufferCanvasContext.drawImage(this, 0, 0);
			_this.rawImage = false;
			_this.rawImage = bufferCanvasContext.getImageData(0, 0, width, height);
			window.pixels = _this.rawImage.data;

			if(_this.testingImage) console.log('test image loaded',_this.pixels.length);

			if (!_this.waiting && window.worker) {

				console.log('image loaded sending to post service');

				//calibration_depthThreshold and calibration_depthRange are delcared in mappings.js and are controlled in popup
				window.worker.postMessage([_this.pixels, _this.calibration_depthThreshold, _this.calibration_depthRange]);
				_this.waiting = true;
			}

			_this.imageLoaded = this;

		};

		console.log('changing src to '+_this.testImageURL);
		_this.imageLoaded = false;
		window.pixels = [];
		_this.image.src = _this.testImageURL;
		document.getElementById('testImage').src = _this.testImageURL;

	}else if(!websocket) {

		console.warn('Web Socket not inited wtf! run -devmode');

	}else{

		this.pixelBit = 2;

		// This is from when I attempted to use an alternative socket method to get kinect data
		// I want to try processing it in a work a worker
		if(attemptingToUseSocketLol) {

			//this new fangled technologoy idk

			socket = websocket('ws://localhost:5600');
			socket.on('data', function (data) {

				console.log('received image'); return;

	  			var bytearray = new Uint8Array(data);

	  			// var b64encoded = btoa(String.fromCharCode.apply(null, bytearray));
	  			
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
				// var b64encoded = bufferCanvas.toDataURL("image/png");
				
				var b64encoded = bufferCanvas.toDataURL("image/png");
				// window.image.src = b64encoded;
				window.image.src = b64encoded;
				document.getElementById('testImage').src = b64encoded;

				console.log(b64encoded);

				window.pixels = window.rawImage.data;

			});

		}else{

			//old method -- loads image stream

			console.warn('setting up old eventsource method');

			image.onload = function() {

				bufferCanvasContext.drawImage(this, 0, 0);
				_this.rawImage = bufferCanvasContext.getImageData(0, 0, width, height);
				_this.pixels = _this.rawImage.data;

				_this.imageLoaded = _this.image;

				if(_this.pixels && _this.hash.indexOf('outline') > -1) {

					//worker can't create canvas elements for data manipulation so we send it the first non transparent pixel in image
					var y, i, rowData;
					var firstX = -1;
					var firstY = -1;
			        for(y = 0; y < canvasHeight - 10 ; y += 10) {

			            rowData = bufferCanvasContext.getImageData(0, y, canvasWidth, 1).data;

			            for(var i=0; i < rowData.length - 4; i += 4){

			                if(rowData[i+pixelBit] > calibration_depthThreshold && rowData[i+pixelBit] < 255){

			                	firstX = i;
			                	firstY = y;

			                }
			            }
			        }

					// _this.outlineArray = _this.MarchingSquares.getBlobOutlinePointsFromImage(_this.pixels, 3, 20);
					if(firstX != -1 && firstY != -1) {
						worker.postMessage({
					    	'cmd': 'getOutline', 
					    	'imageData': _this.rawImage,
							'firstPixel': [firstX, firstY],
							'outlineAccuracy': 3,
							'depthTheshold': calibration_depthThreshold
						});
					}else{
						console.log('cannot find first non transparent pixel!')
					}
				}

			}
			if(this.imageEventSource) {
				this.imageEventSource.removeEventListener('message');
				this.imageEventSource = false;
			}
			this.imageEventSource = new EventSource('/images');
			this.imageEventSource.addEventListener('message', function(event) {

				// console.log('got image');
				if(event.data.substring(0,14) == 'data:image/png' ) {
					
					_this.image.src = event.data;
					

					if(!_this.gotKinect) {
						 console.log(event);
						 _this.gotKinect = true;
						 _this.gotImage = true;
						 $('#kinectCheck', _this.uiPopup.document).removeClass('error');
					}
				}
			});


		}
	}
	
	launchOutlineWorker();

	
}

function launchOutlineWorker() {

	worker = new Worker('/app/scripts/helpers/outline_worker_built.js');
		
    worker.onmessage = function(e) {
		_this.outlineArray = e.data.outline;
    };
    // worker.onerror = function(e) {
    //   alert('Error: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
    // };

    //start the worker
 //    worker.postMessage({
 //    	'cmd': 'getOutline', 
	// 	'value': _this.pixels
	// });
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

		if(_this.testingImage) console.log('test image received from worker', event);
		_this.waiting = false;
		_this.gotImage = true;

		var eventCopy = event;
		eventCopy.width = _this.canvasWidth;

		var blobs = FindBlobs(event);

		console.log(blobs.length+' outlines');
		// console.log(blobs);

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
