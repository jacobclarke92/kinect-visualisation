effect_squiggle = {

  invertImageData: false,
  flattenDepth: false,
  getImageEdges: false,

  screens: [],
  graphics: false,


  init: function() {
    setMapping('volumeDivider', 400, 100, 150);
    setMapping('maxPointDist', 10, 200, 20);
    setMapping('lineThickness', 1, 50, 2);
    setMapping('trailAmount', 0, 0.5, 0.2); //51 works well
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
    while(!pixelInRange(pixels[rand1*4 +2]) && ++count < breakLoop) rand1 = Math.floor(Math.random()*(320*240));

    if(count >= breakLoop) return false;

    count = 0;


    var rand2 = Math.floor(Math.random()*(320*240));


    // if(Math.random()*500 < 2) console.log(count, pixels[rand2*4 +2], pixelInRange(pixels[rand2*4 +2]),pixels[ Math.round( (rand1+rand2)/2 )*4 + 2 ], pixelInRange(pixels[ Math.round( (rand1+rand2)/2 )*4 + 2 ] ), Math.round(comparePts(rand1,rand2)), maxPointDist + kickVolume/5)

    while(
      (
        !pixelInRange(pixels[rand2*4 +2]) || 
        comparePts(rand1,rand2) > maxPointDist + kickVolume/5 || 
        !pixelInRange(pixels[ Math.round( (rand1+rand2)/2 )*4 + 2 ] ) 
      ) && ++count < breakLoop
    ) rand2 = Math.floor(Math.random()*(320*240));
    
    if(count >= breakLoop) return false;

    var midpoint = Math.round((rand1+rand2)/2);
    var alf = 1;
    alf = rangeAdjustedPixel(pixels[midpoint*4 +2])/255;

    // maybeLog(alf);

    var yPos1 = Math.floor(rand1/320);
    var xPos1 = (rand1 % 320);

    var yPos2 = Math.floor(rand2/320);
    var xPos2 = (rand2 % 320);


    this.graphics.lineStyle(lineThickness, randomPaletteColour(), alf);

    this.graphics.moveTo(xPos1*2, yPos1*2);
    this.graphics.lineTo(xPos2*2, yPos2*2);

  }
}