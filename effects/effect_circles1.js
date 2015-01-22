effect_circles1 = {

  init: function() {
    setMapping('volumeDivider', 400, 100, 150);
    setMapping('maxPointDist', 10, 200, 20);
    setMapping('lineThickness', 1, 50, 2);
    setMapping('trailAmount', 0, 1, 0.2); //51 works well
  },

  draw: function() {

    if(gotImage) {
      // image(img,0,0);
      for(var i=0; i<volume/volumeDivider; i ++) {
        this.makeShape();
      }
    }

    if(gotSound) processAudio();  

  },

  makeShape: function() {

    var count = 0;

    var rand1 = Math.floor(Math.random()*(320*240));
    while(!pixelInRange(pixels[rand1*4 +2]) && ++count < breakLoop) rand1 = Math.floor(Math.random()*(320*240));

    if(count >= breakLoop) return false;

    count = 0;

    var rand2 = Math.floor(Math.random()*(320*240));
    while(
      (
        !pixelInRange(pixels[rand2*4 +2]) || 
        comparePts(rand1,rand2) > maxPointDist || 
        !pixelInRange(pixels[ Math.round( (rand1+rand2)/2 )*4 + 2 ] )
      )  && ++count < breakLoop ) { 
      rand2 = Math.floor(Math.random()*(320*240));
    }

    if(count >= breakLoop) return false;

    var midpoint = Math.round((rand1+rand2)/2);

    var alf = 255;
    alf = rangeAdjustedPixel(pixels[midpoint*4 +2])/255;


    var yPos1 = Math.floor(rand1/320);
    var xPos1 = (rand1 % 320);

    var yPos2 = Math.floor(rand2/320);
    var xPos2 = (rand2 % 320);

    var yPos3 = Math.floor(midpoint/320);
    var xPos3 = (midpoint % 320);

    var diameter = dist(xPos1, yPos1, xPos2, yPos2);

    var additionalSize = kickVolume/20;
    // additionalSize += img.pixels[midpoint];

    this.graphics.lineStyle(lineThickness, randomPaletteColour(), alf);

    this.graphics.drawCircle(xPos3*2, yPos3*2, diameter/2 + additionalSize);

  }



};




      