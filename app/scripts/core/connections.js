var testingImage = false;
var testingSound = false;
var testImageURL = '';
var currentTestImage = 1;
var currentScriptString = false;


var loadedScript = false;
var loadChecker;
var timeout = 3000; //ms
var timeoutTimer = 0;
var intervalCheck = 100; //ms
hash = false;


var inited = false;


function startPage(fallback) {

  hash = window.location.hash;

  loadCookie();
  
  if(hash){
    hash = hash.substr(1,hash.length-1);

    //console.log('hash: '+hash);
    //console.log(_.indexOf(effects,hash));

    if(_.indexOf(effects,hash) > -1) {
      changeScript(hash);
    }else{
      changeScript(fallback);
    }

  }else{
    changeScript(fallback);
  }


  if(testingImage) {
    randomizeImage(true);
    run();
  }


}

function changeScript(script) {

  //remove instance of previous script
  if(currentScriptString && currentScriptString != script) {
    delete window['effect_'+currentScriptString];
  }
  currentScriptString = script;

  //clear stage
  clearStage();
  loadedScript = false;

  //change window hash to new script
  console.info('loading ~'+script+'~');
  window.location.href = '/#'+script;
  hash = script;

  //clear mappings for current hash
  if(typeof mappings != 'object') mappings = {};
  if(typeof mappings[hash] != 'object') mappings[hash] = [];

  //begin loading script
  requirejs(['/effects/effect_'+script+'.js'],function() {

    //check that the loaded file contained the actual effect object
    if(window['effect_'+script]) {

      currentScript = window['effect_'+script];
      
      //always run init before anything else -- this sets up mapping controls
      if(typeof currentScript.init != 'undefined') currentScript.init();
      else trailAmount = 1;

      if(typeof currentScript.screens == 'undefined') {
        currentScript.screens = [];
        currentScript.graphics = false;
      }

      //creates the mapping controls for the effect
      createControls();

      //begin animation frame
      console.info('Script loaded! ',currentScript);
      loadedScript = true;
      requestAnimFrame(animateFrame);

    }else{
      console.warn('Loaded script but incorrectly named or something');
    }
  });
  
  $('.changeScript',uiPopup.document).removeClass('active');
  $('#'+script, uiPopup.document).addClass('active');

  if(!inited) {
        inited = true;
        //THIS CAN ONLY BE RUN ONCE OR ELSE MAX LAG (due to listener double-ups)
        run();
    }

}



var pixels = false;
var canvasWidth = 320;
var canvasHeight = 240;
var processingInstance = false;



var waiting = false;
var buffer = document.createElement('canvas');
var width = buffer.width = canvasWidth;
var height = buffer.height = canvasHeight;
var bufferContext = buffer.getContext('2d');
var bufferData = bufferContext.createImageData(width, height);

outlineArray = [];

var image;
var imageLoaded = false;
var gotKinect = false;

function run() {

  image = new Image();
  var showDepth = true;
  image.onload = function() {

    imageLoaded = image;

    bufferContext.drawImage(image, 0, 0);
    pixels = bufferContext.getImageData(0, 0, width, height).data;

    if(testingImage) console.log('test image loaded',pixels.length);

    if (!waiting && window.worker) {

      //calibration_depthThreshold and calibration_depthRange are delcared in mappings.js and are controlled in popup
      window.worker.postMessage([pixels, calibration_depthThreshold, calibration_depthRange]);
      waiting = true;
    }

  };

  if(testingImage) {

    console.log('changing src to '+testImageURL);
    image.src = testImageURL;

  }else{

    window.imageEventSource = new EventSource('/images');
    window.imageEventSource.addEventListener('message', function(event) {
      if(event.data.substring(0,14) == 'data:image/png' ) {
        image.src = event.data;
        if(testingImage) gotImage = true;
        if(pixels && hash.indexOf('outline') > -1) {

          //generate array of outline points, second parameter is smoothing
          outlineArray = MarchingSquares.getBlobOutlinePointsFromImage(pixels, 3, 20);

        }

        if(!gotKinect) {
         console.log(event);
         gotKinect = true;
         $('#kinectCheck',uiPopup.document).removeClass('error');
        }
      }
    });

   startWorker();
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
  window.worker = createWorker(process, 320, 240, hash);
  window.worker.addEventListener('message', function(event) {

    if(testingImage) console.log('test image received from worker');
    waiting = false;
    gotImage = true;

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
