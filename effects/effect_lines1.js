effect_lines1 = {
  
  lastX: 0,
  lastY: 0,


  breakLoop: 50,

  init: function() {
    setMapping('volumeDivider', 100, 5000, 150);
    setMapping('maxPointDist', 2, 100, 20);
    setMapping('lineThickness', 1, 30, 1);
    setMapping('trailAmount', 0, 1, 0.5);
  },

  draw: function() {



    if(gotImage) {
      // image(img,0,0);
      for(var i=0; i<volume/volumeDivider; i ++) {
        this.drawLines();
      }
    }


  },


  drawLines: function() {


    var count = 0;

    var rand1 = Math.floor(Math.random()*(canvasWidth*canvasHeight));

    while((!pixelInRange(pixels[rand1*4 + 3]) || comparePts(this.lastX + this.lastY*canvasWidth, rand1) < maxPointDist)
          && ++count < this.breakLoop) {
      rand1 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
    }

    var yPos = Math.floor(rand1/canvasWidth);
    var xPos = (rand1 % canvasWidth);

    this.graphics.lineStyle(lineThickness, randomPaletteColour(), 1);

    this.graphics.moveTo(this.lastX*2, this.lastY*2);
    this.graphics.lineTo(xPos*2, yPos*2);

    this.lastX = xPos;
    this.lastY = yPos;


  }
}