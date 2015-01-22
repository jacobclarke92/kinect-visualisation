effect_lsd1 = {

  screens: [],
  graphics: false,


  init: function() {
    setMapping('volumeDivider', 200, 40, 40);
    setMapping('shapeSize', 1, 100, 6);
    setMapping('trailAmount', 0, 1, 0.2); 
  },

  draw: function() {

    if(gotSound) {
      processAudio();

    }
    if(gotImage) {
      // console.log(volume, volumeDivider);
      for(var i=0; i<volume/(volumeDivider); i ++) {
        this.makeShape();
      }
    }

  },


  makeShape: function() {
    var rand = Math.round(Math.random()*(320*240));

    if(Math.random()*500 < 2) console.log(pixels[rand*4 + 2],depthThreshold,depthRange);
    
    var count = 0;
    while(!pixelInRange(pixels[rand*4 + 2]) && ++count < breakLoop) rand = Math.round(Math.random()*(320*240));

    if(count >= breakLoop) return false;

    this.graphics.beginFill(randomPaletteColour());

    var yPos = Math.floor(rand/320);
    var xPos = (rand % 320);

    var shSize = Math.round(shapeSize + kickVolume/20);

    this.graphics.drawRect(xPos*2-shSize/2, yPos*2-shSize/2, shSize, shSize);

   
  }


};





      
