(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by @sakri on 25-3-14.
 *
 * Javascript port of :
 * http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/
 * returns an Array of x and y positions defining the perimeter of a blob of non-transparent pixels on a canvas
 *
 */
(function (self){

    var MarchingSquares = {};

    MarchingSquares.NONE = 0;
    MarchingSquares.UP = 1;
    MarchingSquares.LEFT = 2;
    MarchingSquares.DOWN = 3;
    MarchingSquares.RIGHT = 4;

    MarchingSquares.depthThreshold = 155;
    MarchingSquares.w = 320;
    MarchingSquares.h = 240;

    MarchingSquares.smooth = 5;

    // MarchingSquares.sourceCanvas = document.getElementById('testCanvas');

    MarchingSquares.testing = false;
    MarchingSquares.forceStop = false;
    MarchingSquares.minPoints = 20;

    MarchingSquares.cT = 0;
    MarchingSquares.cR = 320;
    MarchingSquares.cB = 240;
    MarchingSquares.cL = 0;

    // Takes a canvas and returns a list of pixels that
    // define the perimeter of the upper-left most
    // object in that texture, using pixel alpha>0 to define
    // the boundary.

    MarchingSquares.walkPerimeter = function(startX, startY, imageData){
        // Do some sanity checking, so we aren't
        // walking outside the image
        // technically this should never happen
        if (startX < 0){
            startX = 0;
        }
        if (startX > MarchingSquares.w){
            startX = MarchingSquares.w;
        }
        if (startY < 0){
            startY = 0;
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

        var index, width4 = imageData.width * 4;

        var counter = 0;
        // The main while loop, continues stepping until
        // we return to our initial points
        do{
            // Evaluate our state, and set up our next direction
            //index = (y-1) * width4 + (x-1) * 4;
            index = (y-1) * width4 + (x-1) * 4;
            MarchingSquares.step(index, imageData.data, width4);

            counter ++;
            // If our current point is within our image
            // add it to the list of points
            if (x >= 0 &&
                x < MarchingSquares.w &&
                y >= 0 &&
                y < MarchingSquares.h){

                pointList.push([x - 2, y - 1]);//offset of 1 due to the 1 pixel padding added to sourceCanvas
                    
            }

            switch (MarchingSquares.nextStep){
                case MarchingSquares.UP:    y--; break;
                case MarchingSquares.LEFT:  x--; break;
                case MarchingSquares.DOWN:  y++; break;
                case MarchingSquares.RIGHT: x++; break;
                default:
                    break;
            }

        } while ((x != startX || y != startY) && MarchingSquares.forceStop == false && counter > 1);

        // console.log(MarchingSquares.depthThreshold);

        var firstFruits = [];

        for (var i = -3; i < pointList.length; i = i+MarchingSquares.smooth) {
            firstFruits.push(pointList[i]);
        };

        firstFruits.push([x - 1, y - 1]);

        return firstFruits;
    };

    // Determines and sets the state of the 4 pixels that
    // represent our current state, and sets our current and
    // previous directions

    MarchingSquares.step = function(index, data, width4){


        

        MarchingSquares.upLeft = data[index + 2] > MarchingSquares.depthThreshold;
        MarchingSquares.upRight = data[index + 6] > MarchingSquares.depthThreshold;
        MarchingSquares.downLeft = data[index + width4 + 2] > MarchingSquares.depthThreshold;
        MarchingSquares.downRight = data[index + width4 + 6] > MarchingSquares.depthThreshold;

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
},{}],2:[function(require,module,exports){
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
},{"./marchingsquares_worker.js":1}]},{},[2]);
