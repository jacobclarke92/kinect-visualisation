(function () {

  var _marchingSquares = require('./marchingsquares_worker.js');

  self.depthThreshold = 166;
  self.outlineSmooth = 1; //gotta implement this later but it seems to be running smoothly without any downscaling! :D
  var pixelBit = 2;

  var startingPoints = [];
  var outlines = [];

  self.onmessage = function(e) {

    self.depthThreshold = e.data.depthThreshold;
    self.outlineSmooth = e.data.outlineSmooth;

    pixelBit = e.data.pixelBit;

    var blobs = FindBlobs(e.data.imageData);

    // console.log('Starting points', startingPoints);
    outlines = [];
    for(var i=0; i<startingPoints.length; i ++) {
      outlines.push( MarchingSquares.walkPerimeter(startingPoints[i][0], startingPoints[i][1], startingPoints[i][2], blobs) );
    }

    // console.log('Outlines', outlines);

    self.postMessage({
      // 'blobs': blobs,
      'outlines': outlines
      // 'image': e.data.imageData
    });

    // if(Math.random() < 0.01) console.log(e.data);
    // console.log(e.data);
  }  

  var usedLabels = [];

  function FindBlobs(srcPixels) {

    startingPoints = [];
    usedLabels = [];

    var origSizeX = 320;
    var origSizeY = 240;

    var xSize = origSizeX/self.outlineSmooth;
    var ySize = origSizeY/self.outlineSmooth;
    var x, y, pos;

    // This will hold the indecies of the regions we find
    var blobMap = [];
    var label = 1;

    // The labelTable remembers when blobs of different labels merge
    // so labelTabel[1] = 2; means that label 1 and 2 are the same blob
    var labelTable = [0];

    // Start by labeling every pixel as blob 0
    for(y=0; y<ySize; y++){
      blobMap.push([]);
      for(x=0; x<xSize; x++){
        blobMap[y].push(0);
      }
    }

    // Temporary variables for neighboring pixels and other stuff
    var nn, nw, ne, ww, ee, sw, ss, se, minIndex;
    var luma = 0;
    var isVisible = 0;

    // We're going to run this algorithm twice
    // The first time identifies all of the blobs candidates the second pass
    // merges any blobs that the first pass failed to merge


    var nIter = 2;
    while( nIter-- ){

      // We leave a 1 pixel border which is ignored so we do not get array
      // out of bounds errors
      for( y = self.outlineSmooth; y < ySize - self.outlineSmooth; y += self.outlineSmooth){
        for( x = self.outlineSmooth; x < xSize - self.outlineSmooth; x += self.outlineSmooth){

          pos = (y*origSizeX+x)*4;
          // pos = (y*xSize+x);

          // We're only looking at the alpha channel in this case but you can
          // use more complicated heuristics
          isVisible = (srcPixels[pos+pixelBit] > self.depthThreshold);

          if( isVisible ){

            // Find the lowest blob index nearest this pixel
            nw = blobMap[y-self.outlineSmooth][x-self.outlineSmooth] || 0;
            nn = blobMap[y-self.outlineSmooth][x-0] || 0;
            ne = blobMap[y-self.outlineSmooth][x+self.outlineSmooth] || 0;
            ww = blobMap[y-0][x-self.outlineSmooth] || 0;
            ee = blobMap[y-0][x+self.outlineSmooth] || 0;
            sw = blobMap[y+self.outlineSmooth][x-self.outlineSmooth] || 0;
            ss = blobMap[y+self.outlineSmooth][x-0] || 0;
            se = blobMap[y+self.outlineSmooth][x+self.outlineSmooth] || 0;
            minIndex = ww;
            if( 0 < ww && ww < minIndex ){ minIndex = ww; }
            if( 0 < ee && ee < minIndex ){ minIndex = ee; }
            if( 0 < nn && nn < minIndex ){ minIndex = nn; }
            if( 0 < ne && ne < minIndex ){ minIndex = ne; }
            if( 0 < nw && nw < minIndex ){ minIndex = nw; }
            if( 0 < ss && ss < minIndex ){ minIndex = ss; }
            if( 0 < se && se < minIndex ){ minIndex = se; }
            if( 0 < sw && sw < minIndex ){ minIndex = sw; }
    
            // This point starts a new blob -- increase the label count and
            // and an entry for it in the label table
            if( minIndex === 0 ) {

              blobMap[y][x] = label;
              labelTable.push(label);
              label += 1;

    
            // This point is part of an old blob -- update the labels of the
            // neighboring pixels in the label table so that we know a merge
            // should occur and mark this pixel with the label.
            }else{
              if( minIndex < labelTable[nw] ){ labelTable[nw] = minIndex; }
              if( minIndex < labelTable[nn] ){ labelTable[nn] = minIndex; }
              if( minIndex < labelTable[ne] ){ labelTable[ne] = minIndex; }
              if( minIndex < labelTable[ww] ){ labelTable[ww] = minIndex; }
              if( minIndex < labelTable[ee] ){ labelTable[ee] = minIndex; }
              if( minIndex < labelTable[sw] ){ labelTable[sw] = minIndex; }
              if( minIndex < labelTable[ss] ){ labelTable[ss] = minIndex; }
              if( minIndex < labelTable[se] ){ labelTable[se] = minIndex; }

              blobMap[y][x] = minIndex;
            }

          // This pixel isn't visible so we won't mark it as special
          }else{
            blobMap[y][x] = 0;
          }
    
        }
      }
    
      // Compress the table of labels so that every location refers to only 1
      // matching location
      var i = labelTable.length;
      while( i-- ){
        label = labelTable[i];
        while( label !== labelTable[label] ){
          label = labelTable[label];
        }
        labelTable[i] = label;
      }
    
      // Merge the blobs with multiple labels
      for(y=0; y<ySize; y++){
        for(x=0; x<xSize; x++){
          label = blobMap[y][x];
          if( label === 0 ){ continue; }
          while( label !== labelTable[label] ){
            label = labelTable[label];
          }
          blobMap[y][x] = label;
        }
      }
    }

    // The blobs may have unusual labels: [1,38,205,316,etc..]
    // Let's rename them: [1,2,3,4,etc..]
    var uniqueLabels = unique(labelTable);
    var i = 0;
    for( label in uniqueLabels ){
      labelTable[label] = i++;
    }

    // convert the blobs to the minimized labels
    var newLabel;
    for(y=0; y<ySize; y++){
      for(x=0; x<xSize; x++){
        label = blobMap[y][x];
        newLabel = labelTable[label];
        blobMap[y][x] = newLabel;

        if(newLabel != 0 && !isIn(labelTable[label],usedLabels)) {
          startingPoints.push([x,y,newLabel]);
          usedLabels.push(newLabel)
        }

      }
    }

    // Return the blob data:
    return blobMap;

  };

  function isIn(val,arr) {
    for(var i=0; i<arr.length; i++) {
      if(arr[i] == val) return true;
    }
    return false;
  }

  function unique(arr){
  /// Returns an object with the counts of unique elements in arr
  /// unique([1,2,1,1,1,2,3,4]) === { 1:4, 2:2, 3:1, 4:1 }

      var value, counts = {};
      var i, l = arr.length;
      for( i=0; i<l; i+=1) {
          value = arr[i];
          if( counts[value] ){
              counts[value] += 1;
          }else{
              counts[value] = 1;
          }
      }

      return counts;
  }

}.call(self));