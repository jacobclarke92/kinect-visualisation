(function () {

  var _marchingSquares = require('./marchingsquares_worker.js');

  var firstPixel = [];
  var outlineAccuracy = 3;
  function getOutline(imageData) {
      // outline = MarchingSquares.getBlobOutlinePointsFromImage(imageData, outlineAccuracy, 20);
      outline = MarchingSquares.walkPerimeter(firstPixel[0], firstPixel[1], imageData);
      self.postMessage({'outline': outline});
  }
  self.onmessage = function(e) {


    firstPixel = e.data.firstPixel;
    outlineAccuracy = e.data.outlineAccuracy;
    MarchingSquares.depthThreshold = e.data.depthThreshold;
    _marchingSquares.depthThreshold = e.data.depthThreshold;
    getOutline(e.data.imageData);

    if(Math.random() < 0.01) console.log(e.data);
  }  

  
}.call(self));