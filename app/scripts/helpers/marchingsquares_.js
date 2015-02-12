/**
 * Created by @sakri on 25-3-14.
 *
 * Javascript port of :
 * http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/
 * returns an Array of x and y positions defining the perimeter of a blob of non-transparent pixels on a canvas
 *
 */
(function (window){

    var MarchingSquares = {};

    MarchingSquares.NONE = 0;
    MarchingSquares.UP = 1;
    MarchingSquares.LEFT = 2;
    MarchingSquares.DOWN = 3;
    MarchingSquares.RIGHT = 4;

    MarchingSquares.testing = false;
    MarchingSquares.forceStop = false;

    MarchingSquares.theshold = 155;
    MarchingSquares.w = 320;
    MarchingSquares.h = 240;

    // Takes a canvas and returns a list of pixels that
    // define the perimeter of the upper-left most
    // object in that texture, using pixel alpha>0 to define
    // the boundary.
    MarchingSquares.getBlobOutlinePoints = function(sourceCanvas){

        //Add a padding of 1 pixel to handle points which touch edges
        MarchingSquares.sourceCanvas = document.createElement("canvas");
        MarchingSquares.sourceCanvas.width = sourceCanvas.width;
        MarchingSquares.sourceCanvas.height = sourceCanvas.height;
        MarchingSquares.sourceContext = MarchingSquares.sourceCanvas.getContext("2d");
        MarchingSquares.sourceContext.drawImage(sourceCanvas,1,1);

        // Find the starting point
        var startingPoint = MarchingSquares.getFirstNonTransparentPixelTopDown(MarchingSquares.sourceCanvas);

        MarchingSquares.forceStop = false;
        MarchingSquares.testing = false;
        // Return list of x and y positions
        return MarchingSquares.walkPerimeter(startingPoint.x, startingPoint.y);
    };

    MarchingSquares.getBlobOutlinePointsFromImage = function(sourceDataRaw){

        //comes in at 307200 or 640*480
        //console.log(sourceDataRaw.length);

        //Add a padding of 1 pixel to handle points which touch edges
        MarchingSquares.sourceCanvas = document.createElement("canvas");
        MarchingSquares.sourceCanvas.width = MarchingSquares.w+2;
        MarchingSquares.sourceCanvas.height = MarchingSquares.h+2;

        MarchingSquares.sourceContext = MarchingSquares.sourceCanvas.getContext("2d");
        MarchingSquares.sourceData = MarchingSquares.sourceContext.createImageData(MarchingSquares.w, MarchingSquares.h); 
        MarchingSquares.sourceData.data.set(sourceDataRaw);
        MarchingSquares.sourceContext.putImageData(MarchingSquares.sourceData, 1, 1);

        // drawImage(sourceCanvas,1,1);

        // Find the starting point
        var startingPoint = MarchingSquares.getFirstNonTransparentPixelTopDown(MarchingSquares.sourceCanvas);
        MarchingSquares.testing = false;
        MarchingSquares.forceStop = false;
        // Return list of x and y positions
        if(startingPoint != null) {
            //console.log(startingPoint);
            return MarchingSquares.walkPerimeter(startingPoint.x, startingPoint.y);
        }
        else return [];
    };

    MarchingSquares.getFirstNonTransparentPixelTopDown = function(canvas){
        var context = canvas.getContext("2d");
        var counter = 0;
        var x, y, n;

        if(typeof bleh == 'undefined') {
           // alert(MarchingSquares.sourceData.data);
            bleh = true;
        }
        // console.log(MarchingSquares.sourceData.data[6400]);
        // console.info(MarchingSquares.sourceData.data.length);
        for(y = 0; y < MarchingSquares.h/2; y+= 10){
            // rowData = context.getImageData(0, y, canvas.width, 10).data;
            for(x = 0; x<MarchingSquares.w/2; x+= 10){
                
                n = (y)*(MarchingSquares.w/2) + x;
                n = n*4;

                if(MarchingSquares.sourceData.data[n] > MarchingSquares.theshold) {

                    // console.log('found outline')

                    var pt = {x : x, y : y};
                    // console.log(pt);
                    // console.log(pt, MarchingSquares.sourceData.data[n]);
                    MarchingSquares.testing = true;
                    MarchingSquares.forceStop = false;
                    var pts = MarchingSquares.walkPerimeter(x,y);
                    // console.log(pts);
                    // if(pts && pts.length > 4) return pts;
                    if(pts.length >= 20) {
                        // console.info('found info');
                        y = MarchingSquares.h;
                        return pt;
                    }else{
                        counter ++;
                        // y += 20;
                        if(counter > 20) {
                            // console.info('skip no outline');
                            y = MarchingSquares.h;
                            return null;
                        }
                    }
                }


            }
        }
        return null;
    };

    MarchingSquares.walkPerimeter = function(startX, startY){
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
        var pointList =[];

        // Our current x and y positions, initialized
        // to the init values passed in
        var x = startX;
        var y = startY;

        // var imageData = MarchingSquares.sourceContext.getImageData(0,0, MarchingSquares.sourceCanvas.width, MarchingSquares.sourceCanvas.height);
        var index;

        // var width = MarchingSquares.w;

        var counter = 0;
        // The main while loop, continues stepping until
        // we return to our initial points
        do{
            counter ++;
            // Evaluate our state, and set up our next direction
            index = (y) * (MarchingSquares.w) + (x);
            index = index*4;
            //index *= 2;
            // index = (y-1) * width4 + (x-1) * 4;
            MarchingSquares.step(index, MarchingSquares.sourceData.data, MarchingSquares.w*4);

            // If our current point is within our image
            // add it to the list of points
            if (x >= 0 &&
                x < MarchingSquares.w &&
                y >= 0 &&
                y < MarchingSquares.h) {
                
                pointList.push(x - 1, y);//offset of 1 due to the 1 pixel padding added to sourceCanvas

                if(MarchingSquares.testing && pointList.length > 20) MarchingSquares.forceStop = true;
            }

            switch (MarchingSquares.nextStep){
                case MarchingSquares.UP:    y--; break;
                case MarchingSquares.LEFT:  x--; break;
                case MarchingSquares.DOWN:  y++; break;
                case MarchingSquares.RIGHT: x++; break;
                default:
                    break;
            }

        } while ((x != startX || y != startY ) && MarchingSquares.forceStop == false && counter <= 5000);

        pointList.push(x - 1, y - 1);

        return pointList;
    };

    // Determines and sets the state of the 4 pixels that
    // represent our current state, and sets our current and
    // previous directions

    MarchingSquares.step = function(index, data, width){
        //console.log("Sakri.MarchingSquares.step()");
        // Scan our 4 pixel area
        //Sakri.imageData = Sakri.MarchingSquares.sourceContext.getImageData(x-1, y-1, 2, 2).data;

        // MarchingSquares.upLeft = data[index + 3] > 0;
        // MarchingSquares.upRight = data[index + 7] > 0;
        // MarchingSquares.downLeft = data[index + width + 3] > 0;
        // MarchingSquares.downRight = data[index + width + 7] > 0;
        
        MarchingSquares.upLeft = data[index + 3] > MarchingSquares.theshold;
        MarchingSquares.upRight = data[index + 7] > MarchingSquares.theshold;
        MarchingSquares.downLeft = data[index + width + 3] > MarchingSquares.theshold;
        MarchingSquares.downRight = data[index + width + 7] > MarchingSquares.theshold;

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

        // console.log(MarchingSquares.state);        
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

    window.MarchingSquares = MarchingSquares;

}(window));