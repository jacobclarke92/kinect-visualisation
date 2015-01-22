effect_squiggle = {

  invertImageData: false,
  flattenDepth: false,
  getImageEdges: false,

  screens: [],
  graphics: false,


  init: function() {
    setMapping('volumeDivider', 400, 100, 150);
    setMapping('maxPointDist', 10, 200, 20);
    setMapping('trailAmount', 0, 1, 0.2); //51 works well
  },


  draw: function() {

    if(gotImage) {
      for(var i=0; i<volume/volumeDivider; i ++) {
        this.drawLines();
      }
    }

    if(gotSound) processAudio();

  },

  drawLines: function() {

    var count = 0;

    var rand1 = Math.floor(Math.random()*(320*240));
    while(!pixelInRange(pixels[rand1*4 +2]) && ++count < breakLoop) rand1 = Math.floor(Math.random()*(320*240));

    count = 0;

    var rand2 = Math.floor(Math.random()*(320*240));
    while((
      !pixelInRange(pixels[rand2*4 +2]) || comparePts(rand1,rand2) > maxPointDist + kickVolume/5 || 
      !pixelInRange(pixels[ Math.round( (rand1+rand2)/2 ) ] ))
       && ++count < breakLoop
    ) rand2 = Math.floor(Math.random()*(320*240));
    
    var midpoint = Math.round((rand1+rand2)/2);
    var alf = 1;
    alf = rangeAdjustedPixel(pixels[mean*4 +2])/255;

    var yPos1 = Math.floor(rand1/320);
    var xPos1 = (rand1 % 320);

    var yPos2 = Math.floor(rand2/320);
    var xPos2 = (rand2 % 320);


    this.graphics.lineStyle(randomPaletteColour, alf);

    this.graphics.moveTo(xPos1, yPos1);
    this.graphics.lineTo(xPos2, yPos2);

  }
}