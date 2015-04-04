(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {

   _this = this;
  _this.depthThreshold = 166;
  _this.outlineSmooth = 1; //gotta implement this later but it seems to be running smoothly without any downscaling! :D

  var _marchingSquares = require('./marchingsquares_worker.js');

  var pixelBit = 2;

  var startingPoints = [];
  var outlines = [];

  self.onmessage = function(e) {

    _this.depthThreshold = e.data.depthThreshold;
    _this.outlineSmooth = e.data.outlineSmooth;
    _this.MarchingSquares.w = 320/_this.outlineSmooth;
    _this.MarchingSquares.h = 240/_this.outlineSmooth;

    pixelBit = e.data.pixelBit;
    
    var blobs = FindBlobs(e.data.imageData);

    outlines = [];
    if(startingPoints.length > 0) {
      for(var i=0; i<startingPoints.length; i ++) {
        outlines.push( MarchingSquares.walkPerimeter(startingPoints[i][0], startingPoints[i][1], startingPoints[i][2], blobs) );
      }
    }

    self.postMessage({
      // 'blobs': blobs,
      'outlines': outlines
      // 'image': e.data.imageData
    });

    
    // console.log(e.data);
  }  

  var usedLabels = [];

  function FindBlobs(srcPixels,smooth) {

    startingPoints = [];
    usedLabels = [];

    var origSizeX = 320;
    var origSizeY = 240;

    var xSize = origSizeX/_this.outlineSmooth;
    var ySize = origSizeY/_this.outlineSmooth;
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
      for( y = 1; y < ySize-1; y ++) {
        for( x = 1; x < xSize-1; x ++) {

          pos = ( ( (y*self.outlineSmooth)*origSizeX ) + (x*self.outlineSmooth) )*4;
          // pos = (y*xSize+x);

          // We're only looking at the alpha channel in this case but you can
          // use more complicated heuristics
          isVisible = (srcPixels[pos+pixelBit] > self.depthThreshold);

          if( isVisible ){

            // Find the lowest blob index nearest this pixel
            nw = blobMap[y-1][x-1] || 0;
            nn = blobMap[y-1][x-0] || 0;
            ne = blobMap[y-1][x+1] || 0;
            ww = blobMap[y-0][x-1] || 0;
            ee = blobMap[y-0][x+1] || 0;
            sw = blobMap[y+1][x-1] || 0;
            ss = blobMap[y+1][x-0] || 0;
            se = blobMap[y+1][x+1] || 0;
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
      for(y=0; y < ySize; y++){
        for(x=0; x < xSize; x++){
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
    for(y=0; y < ySize; y++){
      for(x=0; x < xSize; x++){
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
},{"./marchingsquares_worker.js":2}],2:[function(require,module,exports){
/**
 * Created by @sakri on 25-3-14.
 *
 * Javascript port of :
 * http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/
 * returns an Array of x and y positions defining the perimeter of a blob of non-transparent pixels on a canvas
 * 
 */
(function () {

    _this = this.self;

    var MarchingSquares = {};

    MarchingSquares.NONE = 0;
    MarchingSquares.UP = 1;
    MarchingSquares.LEFT = 2;
    MarchingSquares.DOWN = 3;
    MarchingSquares.RIGHT = 4;

    MarchingSquares.w = 320/_this.outlineSmooth;
    MarchingSquares.h = 240/_this.outlineSmooth;

    MarchingSquares.testing = false;
    MarchingSquares.forceStop = false;
    MarchingSquares.minPoints = 20;

    MarchingSquares.cT = 0;
    MarchingSquares.cR = MarchingSquares.w;
    MarchingSquares.cB = MarchingSquares.h;
    MarchingSquares.cL = 0;

    // Takes a canvas and returns a list of pixels that
    // define the perimeter of the upper-left most
    // object in that texture, using pixel alpha>0 to define
    // the boundary. 

    MarchingSquares.walkPerimeter = function(startX, startY, labelNum, imageData){
        // Do some sanity checking, so we aren't
        // walking outside the image
        // technically this should never happen

        if (startX < 1){
            startX = 1;
        }
        if (startX > MarchingSquares.w){
            startX = MarchingSquares.w;
        }
        if (startY < 1){
            startY = 1;
        }
        if (startY > MarchingSquares.h){
            startY = MarchingSquares.h;
        }

        // Set up our return list
        var pointList = [];

        // Our current x and y positions, initialized
        // to the init values passed in
        var x = startX;
        var y = startY;

        var count = 0;

        // The main while loop, continues stepping until
        // we return to our initial points
        do{
            // Evaluate our state, and set up our next direction
            // index = (y-1) * width4 + (x-1) * 4;

            if(x > MarchingSquares.w) {
                x = 1;
                y ++;
            }
            if(y > MarchingSquares.h) {
                y = MarchingSquares.h;
            }

            MarchingSquares.step(x-1, y-1, labelNum, imageData);

            // If our current point is within our image
            // add it to the list of points
            if (x >= 0 &&
                x < MarchingSquares.w &&
                y >= 0 &&
                y < MarchingSquares.h){

                pointList.push([x*_this.outlineSmooth, y*_this.outlineSmooth]);//offset of 1 due to the 1 pixel padding added to sourceCanvas
                    
            }

            switch (MarchingSquares.nextStep){
                case MarchingSquares.UP:    y -= 1; break;
                case MarchingSquares.LEFT:  x -= 1; break;
                case MarchingSquares.DOWN:  y += 1; break;
                case MarchingSquares.RIGHT: x += 1; break;
                default:
                    break;
            }

            if(++count >= MarchingSquares.w*MarchingSquares.h) MarchingSquares.forceStop = true; 

        } while ((x != startX || y != startY) && MarchingSquares.forceStop == false);

        pointList[0] = [startX*_this.outlineSmooth, startY*_this.outlineSmooth];
        return pointList;
    };

    // Determines and sets the state of the 4 pixels that
    // represent our current state, and sets our current and
    // previous directions

    MarchingSquares.step = function(x, y, labelNum, data){

        //used to be that i'd check if above threshold but now it uses blob labels which can be any number above 0

        MarchingSquares.upLeft = data[y][x] == labelNum;
        MarchingSquares.upRight = data[y][x+1] == labelNum;
        MarchingSquares.downLeft = data[y+1][x] == labelNum;
        MarchingSquares.downRight = data[y+1][x+1] == labelNum;

        /*
        console.log('Label',labelNum);
        console.log('upLeft',MarchingSquares.upLeft, data[y][x]);
        console.log('upRight',MarchingSquares.upRight, data[y][x+1]);
        console.log('downLeft',MarchingSquares.downLeft, data[y+1][x]);
        console.log('downRight',MarchingSquares.downRight, data[y+1][x+1]);
        */

        // Store our previous step
        MarchingSquares.previousStep = MarchingSquares.nextStep;

        // Determine which state we are in
        MarchingSquares.state = 0;

        if (MarchingSquares.upLeft){
            MarchingSquares.state |= 1;
        }
        if (MarchingSquares.upRight){
            MarchingSquares.state |= 2;
        }
        if (MarchingSquares.downLeft){
            MarchingSquares.state |= 4;
        }
        if (MarchingSquares.downRight){
            MarchingSquares.state |= 8;
        }

        // State now contains a number between 0 and 15
        // representing our state.
        // In binary, it looks like 0000-1111 (in binary)

        // An example. Let's say the top two pixels are filled,
        // and the bottom two are empty.
        // Stepping through the if statements above with a state
        // of 0b0000 initially produces:
        // Upper Left == true ==>  0b0001
        // Upper Right == true ==> 0b0011
        // The others are false, so 0b0011 is our state
        // (That's 3 in decimal.)

        // Looking at the chart above, we see that state
        // corresponds to a move right, so in our switch statement
        // below, we add a case for 3, and assign Right as the
        // direction of the next step. We repeat this process
        // for all 16 states.

        // So we can use a switch statement to determine our
        // next direction based on
        switch (MarchingSquares.state ){
            case 1: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 2: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 3: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 4: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            case 5: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 6:
                if (MarchingSquares.previousStep == MarchingSquares.UP){
                    MarchingSquares.nextStep = MarchingSquares.LEFT;
                }else{
                    MarchingSquares.nextStep = MarchingSquares.RIGHT;
                }
                break;
            case 7: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 8: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 9:
                if (MarchingSquares.previousStep == MarchingSquares.RIGHT){
                    MarchingSquares.nextStep = MarchingSquares.UP;
                }else{
                    MarchingSquares.nextStep = MarchingSquares.DOWN;
                }
                break;
            case 10: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 11: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 12: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            case 13: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 14: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            default:
                MarchingSquares.nextStep = MarchingSquares.NONE;//this should never happen
                break;
        }
    };

    self.MarchingSquares = MarchingSquares;

}(self));
},{}]},{},[1]);
