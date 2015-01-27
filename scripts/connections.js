var testingImage = false;
var testingSound = false;
var testImageURL = '';
var currentTestImage = 1;


var loadedScript = false;
var loadChecker;
var timeout = 3000; //ms
var timeoutTimer = 0;
var intervalCheck = 100; //ms
hash = false;

var inited = false;

var jsonStream;

var wasClosed = false;


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

  jsonStream = new EventSource('/midi.json');
  jsonStream.addEventListener('message', function(e) {
    if(wasClosed) {
      console.info("port reopened!");
      wasClosed = false;
    }

    if(e.data.substring(0,14) != 'data:image/png' ) {
      updateMappings(e.data.split(','));
      console.log("midi: "+e.data);
    }


  }, false);
  jsonStream.addEventListener('error', function(e) {
    
    if (e.readyState == EventSource.CLOSED || e.type == 'error') {
      console.warn("conncetion was closed due to inactivity");
      wasClosed = true;
    }else{
      console.log('unintended error: ');
      console.log(e);
    }
  }, false);


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

var startedPhysics = false;
function run() {

  image = new Image();
  var showDepth = true;
  image.onload = function() {

    imageLoaded = image;

    bufferContext.drawImage(image, 0, 0);
    pixels = bufferContext.getImageData(0, 0, width, height).data;

    // console.log(image.src);
    // depthTextureBase = new PIXI.BaseTexture(image);
    // depthTexture.baseTexture = depthTextureBase;
    // no idea hey

    if(testingImage) console.log('test image loaded',pixels.length);

    if (!waiting && window.worker) {

      //depthThreshold and depthRange are delcared in mappings.js and are controlled in popup
      window.worker.postMessage([pixels, depthThreshold, depthRange]);
      waiting = true;
    }

  };

  if(testingImage) {

    console.log('changing src to '+testImageURL);
    image.src = testImageURL;

  }else{

    var source = new EventSource('/images');
    source.addEventListener('message', function(event) {
      if(event.data.substring(0,14) == 'data:image/png' ) {
        image.src = event.data;
        if(testingImage) gotImage = true;
        if(pixels && hash.indexOf('outline') > -1) {

          //generate array of outline points, second parameter is smoothing
          outlineArray = MarchingSquares.getBlobOutlinePointsFromImage(pixels, 3, 20);

          // if(!startedPhysics) {
          //   startPhysics();

          //   startedPhysics = true;
          // }

          // var tmp = Smooth(outlineArray, {
          //     method: Smooth.METHOD_CUBIC, 
          //     clip: Smooth.CLIP_PERIODIC, 
          //     cubicTension: Smooth.CUBIC_TENSION_CATMULL_ROM
          // });
          // outlineArray = tmp;
          // console.info(outlineArray.length);
          // console.log(outlineArray);
        }

        if(!gotKinect) {
         console.log(event);
         gotKinect = true;
         $('#kinectCheck',controlsPopup.document).removeClass('error');
        }
      }
    });

   startWorker();
  }

  
}

function startWorker() {
  if(window.worker) {
    console.log("removing window worker");
    window.worker.terminate();
    delete window.worker;
  }


  window.worker = createWorker(process, 320, 240, hash);
  window.worker.addEventListener('message', function(event) {

    if(testingImage) console.log('test image received from worker');
    waiting = false;
    gotImage = true;
    // if(loadedScript) Processing.getInstanceById(processingInstanceName).setImage(event.data);
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



//this function is outside of any scope in this page

function process(width, height, hash) {

  //var outline = (hash == 'outline') ? true : false;

  addEventListener('message', function(event) {

    // console.log("WORKER HASH: "+hash);
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
        
        if(value > min && value < max) value = ((value-min)/range)*255;
        else value = 0; 
        

        i++;
        image[i] = Math.floor(value);
      }
    }
    postMessage(image);

  });
  
}
