(function () {

_this = this;

this.testingImage = false;
this.testingSound = false;
this.testImageURL = '';
this.currentScriptString = false;
this.lastScriptName = false;


this.pixelBit = 2;
this.loadedScript = false;
this.loadChecker;
this.timeout = 3000; //ms
this.timeoutTimer = 0;
this.intervalCheck = 100; //ms
this.hash = 'depth_image';

//for this to work it must be compiled with browserify which is done automatically with -devmode
var websocket = require('../../../node_modules/websocket-stream');


this.inited = false;


this.startPage = function(fallback) {

	this.hash = window.location.hash;

	loadCookie();
	
	if(hash){

		this.hash = this.hash.substr(1,this.hash.length-1);

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

	this.lastScriptName = this.currentScriptString;

	this.currentScriptString = script;
	//clear stage
	this.clearStage();
	this.loadedScript = false;

	//change window hash to new script
	console.info('loading ~'+script+'~');
	window.location.href = '/#'+script;
	this.hash = script;

	//create mapping objects if they don't exist
	if(typeof this.mappings != 'object') {
		this.mappings = {};
	}
	if(typeof this.mappings[hash] != 'object') {
		this.mappings[hash] = {};
	}


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

	//carry on calibration mapping data from previous effect
	if(this.lastScriptName != false) {
		$.each(mappings[lastScriptName], function(key,elem) {
			if(key.indexOf('calibration_') > -1 || key.indexOf('filter_') > -1) {
				if(!isObjectPathSet(mappings, [script, key, 'midi', 'cc']) && 
				   isObjectPathSet(mappings, [lastScriptName, key, 'midi', 'cc']) && 
				   mappings[lastScriptName][key].midi.cc != -1) {

				   	console.info('setting previous mapping CC for '+key+', CC: '+mappings[lastScriptName][key].midi.cc)
					mappings[script][key] = mappings[lastScriptName][key];
				}
			}
		});
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

	currentScriptRequiresOutlines = (this.currentScript.requiresOutlines) ? true : false;
	console.log('Current script requires outlines: '+currentScriptRequiresOutlines);

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
this.imageBlobs = [];


var socket;
var attemptingToUseSocketLol = false;

this.startOutlineX = -1;
this.startOutlineY = -1;
this.outlineSmooth = 1;


var attemptingToUseBlobDetection = true;
var waitingForBlobs = false;
var currentScriptRequiresOutlines = false;

var outlineWorker;
var imageLoaderWorker;
var blobDetectionWorker;


var timesRun = 0;

this.run = function() {

	timesRun ++;
	if(timesRun > 1) console.warn('Core init is being run more than once!');

	_this.image = new Image();
	var showDepth = true;
	

	if(testingImage) {

		this.pixelBit = 3;

		this.image.onload = function() {

			bufferCanvasContext.drawImage(this, 0, 0);
			_this.rawImage = false;
			_this.rawImage = bufferCanvasContext.getImageData(0, 0, width, height);
			_this.pixels = _this.rawImage.data;

			console.log('test image loaded',_this.pixels.length);

			_this.imageLoaded = this;

			blobDetectionWorker.postMessage({
		    	'cmd': 'getBlobs', 
		    	'imageData': _this.rawImage.data,
				'depthThreshold': _this.calibration_depthThreshold,
				'pixelBit': _this.pixelBit,
				'outlineSmooth': _this.outlineSmooth
			});
			waitingForBlobs = true;

		};

		console.log('changing src to '+_this.testImageURL);
		_this.imageLoaded = false;
		window.pixels = [];
		_this.image.src = _this.testImageURL;
		document.getElementById('testImage').src = _this.testImageURL;

		launchBlobDetectionWorker();

	}else if(!websocket) {

		console.warn('Web Socket not inited wtf! run -devmode');

	}else{

		this.pixelBit = 2;

		// This is from when I attempted to use an alternative socket method to get kinect data
		// I want to try processing it in a work a worker
		if(attemptingToUseSocketLol) {

			console.info('setting up new image socket method');

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

			//older and current method -- loads image stream


			console.info('setting up old eventsource method');

			image.onload = function() {

		    	if(!_this.gotKinect) {
					 _this.gotKinect = true;
					 _this.gotImage = true;
					 $('#kinectCheck', _this.uiPopup.document).removeClass('error');
				}

				bufferCanvasContext.drawImage(this, 0, 0);
				_this.rawImage = bufferCanvasContext.getImageData(0, 0, width, height);
				_this.pixels = _this.rawImage.data;

				_this.imageLoaded = _this.image;

				if(attemptingToUseBlobDetection && currentScriptRequiresOutlines) {
					if(!waitingForBlobs) {
						blobDetectionWorker.postMessage({
					    	'cmd': 'getBlobs', 
					    	'imageData': _this.rawImage.data,
							'depthThreshold': _this.calibration_depthThreshold,
							'pixelBit': _this.pixelBit,
							'outlineSmooth': _this.outlineSmooth
						});
						waitingForBlobs = true;
					}
				}else{
					processImageOutline();
				}

			}

			launchImageLoaderWorker();
			launchBlobDetectionWorker();

		}
	}
	

	
}




_this.currentTestImage = 0;
_this.testImages = 2;
_this.randomInterval = false;
_this.randomizeImage = function(intervalChange) {

  console.log('changing test image');


  var rand = Math.ceil(Math.random()*(_this.testImages-1));
  while(rand == _this.currentTestImage && _this.testImages > 1) rand = Math.ceil(Math.random()*(_this.testImages-1));

  _this.currentTestImage = rand;
  _this.testImageURL = '/app/img/test'+_this.currentTestImage+'.png';

  //console.log('new image: '+testImageURL);

  if(_this.randomInterval) clearInterval(_this.randomInterval);

  if(intervalChange) randomInterval = setTimeout(function() {randomizeImage(true)}, 5000);

}
_this.toggleTesting = function(thing, elem) {
  console.info('toggling test '+thing);
  if(thing == 'image') {
    _this.testingImage = !_this.testingImage;
    if(_this.testingImage) {
    	console.log('stopping image loader worker');
    	_this.randomizeImage(false);
    	imageLoaderWorker.postMessage({
	    	'cmd': 'stop'
	    });
    }else{
    	console.log('starting image loader worker');
    	imageLoaderWorker.postMessage({
	    	'cmd': 'start'
	    });
    }
    _this.run();
  }else if(thing == 'sound') {
    _this.testingSound = !_this.testingSound;
    elem.innerHTML = ((_this.testingImage) ? 'Disable' : 'Enable') + ' test ' + thing;
  }
}


function processImageOutline() {
	
	if(_this.currentScript.requresOutline === true) {

		//worker can't create canvas elements for data manipulation so we send it the first non transparent pixel in image
		var y, i, rowData;
		_this.startOutlineX = -1;
		_this.startOutlineY = -1;
	    for(y = 0; y < canvasHeight - 10 ; y += 10) {

	        rowData = bufferCanvasContext.getImageData(0, y, canvasWidth, 1).data;

	        for(var i=0; i < rowData.length - 4; i += 4){

	            if(rowData[i+pixelBit] > _this.calibration_depthThreshold && rowData[i+pixelBit] < _this.calibration_depthThreshold+_this.calibration_depthRange){

	            	_this.startOutlineX = i/4;
	            	_this.startOutlineY = y;

	            }
	        }
	    }

		if(_this.startOutlineX != -1 && _this.startOutlineY != -1) {
			outlineWorker.postMessage({
		    	'cmd': 'getOutline', 
		    	'imageData': _this.rawImage,
				'firstPixel': [_this.startOutlineX, _this.startOutlineY],
				'outlineAccuracy': 3,
				'depthThreshold': _this.calibration_depthThreshold
			});
		}else{
			console.log('cannot find first non transparent pixel!')
		}
	}
}



function launchBlobDetectionWorker() {

	console.info('starting blob detection worker');

	if(blobDetectionWorker) {
		blobDetectionWorker.terminate();
	}

	blobDetectionWorker = new Worker('/app/scripts/helpers/find_blobs_worker_built.js');
		
    blobDetectionWorker.onmessage = function(e) {

		if(e.data.outlines.length > 1) _this.outlineArray = e.data.outlines;
		waitingForBlobs = false;
    };
    blobDetectionWorker.onerror = function(e) {
      console.log('Error: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
    };
}

function launchImageLoaderWorker() {

	console.info('starting image loader worker');

	if(imageLoaderWorker) {
		imageLoaderWorker.terminate();
	}

	imageLoaderWorker = new Worker('/app/scripts/helpers/image_loader_worker.js');
		
    imageLoaderWorker.onmessage = function(e) {
		image.src = e.data.image;
    };
    imageLoaderWorker.onerror = function(e) {
      alert('Error: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
    };
    imageLoaderWorker.postMessage({
    	'cmd': 'start'
    });

}

}.call(window));
