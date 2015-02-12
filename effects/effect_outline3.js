effect_outline3 = {

  invertImageData: false,
  flattenDepth: false,
  getImageEdges: false,

  maxX: false,
  maxY: false,
  minX: false,
  minY: false,
  centerX: false,
  centerY: false,

  screens: [],
  graphics: false,

  init: function() {
    setMapping('lineThickness', 1, 50, 2);
    setMapping('scaleAmount', 0, 1, 0.05);
    setMapping('trailAmount', 0, 0.5, 0.2);
  },

  //overriding function for enterframe init
  initFrame: function() {

    if(this.screens.length > maxFrames) {
      while(stage.children[maxFrames]) { stage.removeChild(stage.children[maxFrames]); }
      this.screens = this.screens.splice(0,maxFrames);
    }

    //apply fade out to past frames
    this.graphics = new PIXI.Graphics();
    for(var i=0; i<this.screens.length; i++) {

      this.screens[i].alpha -= trailAmount;


      this.screens[i].scale.x = this.screens[i].scale.y -= scaleAmount;

      this.screens[i].x = (640-640*this.screens[i].scale.x)/2;
      this.screens[i].y = (480-480*this.screens[i].scale.y)/2;

      
      if(this.screens[i].alpha <= 0 || this.screens[i].scale.x <= 0) {
        stage.removeChild(this.screens[i]);
        this.screens.splice(i,1);
      }
    }

  },

  draw: function() {

    if(gotImage && typeof outlineArray != 'undefined') {
      
      this.graphics.lineStyle(lineThickness,randomPaletteColour());

      this.minX = 320;
      this.minY = 240;
      this.maxX = 0;
      this.minY = 0;

      // console.log(outlineArray.length);

      for(var i=0; i<outlineArray.length; i++){
        if(i > 0) {

          if(outlineArray[i][0] < this.minX) this.minX = outlineArray[i][0];
          if(outlineArray[i][0] > this.maxX) this.maxX = outlineArray[i][0];
          if(outlineArray[i][1] < this.minY) this.minY = outlineArray[i][1];
          if(outlineArray[i][1] > this.maxY) this.maxY = outlineArray[i][1];

          // maybeLog(outlineArray[i][0]+", "+outlineArray[i][1]);

          
          if(i == 1) this.graphics.moveTo(outlineArray[i][0]*2, outlineArray[i][1]*2);
          else this.graphics.lineTo(outlineArray[i][0]*2, outlineArray[i][1]*2);
          
        }
        
      }

      this.centerX = this.minX + (this.maxX-this.minX)/2;
      this.centerY = this.minY + (this.maxY-this.minY)/2;
      // this.graphics.drawCircle(this.centerX*2, this.centerY*2, 10);

    }else{
      console.log('outlineArray is undefined');
    }

  }


}
