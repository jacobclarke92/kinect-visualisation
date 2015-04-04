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