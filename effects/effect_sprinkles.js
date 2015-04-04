effect_sprinkles = {

  requiresOutlines: false,

  screens: [],
  graphics: false,


  init: function() {
    setMapping('lineThickness', 1, 50, 2);
    setMapping('maxPointDist', 10, 200, 20);
    setMapping('volumeDivider', 100, 400, 150);
    setMapping('trailAmount', 0, 1, 0.2);
  },


  draw: function() {

    if(gotImage) {
      for(var i=0; i<volume/volumeDivider; i ++) {
        if(this.drawLines()) console.log('drew line');//) console.warn('returned false');
      }
    }

  },

  drawLines: function() {

    var count = 0;

    var rand1 = Math.floor(Math.random()*(320*240));
    while(!pixelInRange(pixels[rand1*4 + pixelBit]) && ++count < breakLoop) rand1 = Math.floor(Math.random()*(320*240));

    if(count >= breakLoop) return false;

    count = 0;


    var rand2 = Math.floor(Math.random()*(320*240));


    // if(Math.random()*500 < 2) console.log(count, pixels[rand2*4 + pixelBit], pixelInRange(pixels[rand2*4 + pixelBit]),pixels[ Math.round( (rand1+rand2)/2 )*4 + pixelBit ], pixelInRange(pixels[ Math.round( (rand1+rand2)/2 )*4 + pixelBit ] ), Math.round(comparePts(rand1,rand2)), maxPointDist + kickVolume/5)

    while(
      (
        !pixelInRange(pixels[rand2*4 + pixelBit]) || 
        comparePts(rand1,rand2) > maxPointDist + kickVolume/5 || 
        !pixelInRange(pixels[ Math.round( (rand1+rand2)/2 )*4 + pixelBit ] ) 
      ) && ++count < breakLoop
    ) rand2 = Math.floor(Math.random()*(320*240));
    
    if(count >= breakLoop) return false;

    var midpoint = Math.round((rand1+rand2)/2);
    var alf = 1;
    alf = rangeAdjustedPixel(pixels[midpoint*4 + pixelBit])/255;

    // maybeLog(alf);

    var yPos1 = Math.floor(rand1/320);
    var xPos1 = (rand1 % 320);

    var yPos2 = Math.floor(rand2/320);
    var xPos2 = (rand2 % 320);


    this.graphics.lineStyle(lineThickness, randomPaletteColour(), alf);

    this.graphics.moveTo(tX( xPos1 ), tY( yPos1 ));
    this.graphics.lineTo(tX( xPos2 ), tY( yPos2 ));

  }
}