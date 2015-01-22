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

  init: function() {
    setMapping('cropAmount', 0.05, 0.95, 0.8);
    setMapping('scaleAmount', 0, 1, 0.05); //51 works well
    setMapping('trailAmount', 0, 1, 0.2); //51 works well
    setMapping('cropTop', 0, 240, 0);
    setMapping('cropRight', 0, 320, 0);
    setMapping('cropBottom', 0, 240, 0);
    setMapping('cropLeft', 0, 320, 0);
  }

  initFrame: function() {

    if(this.screens.length > maxFrames) {
      while(stage.children[maxFrames]) { stage.removeChild(stage.children[maxFrames]); }
      this.screens = this.screens.splice(0,maxFrames);
    }

    //apply fade out to past frames
    this.graphics = new PIXI.Graphics();
    for(var i=0; i<this.screens.length; i++) {

      this.screens[i].alpha -= trailAmount;

      this.screens[i].pivot.x = (this.centerX) ? this.centerX : winW/2;
      this.screens[i].pivot.y = (this.centerY) ? this.centerY : winH/2;

      this.screens[i].scale.x = this.screens[i].scale.y -= scaleAmount;
      
      if(this.screens[i].alpha <= 0 || this.screens[i].scale.x <= 0) {
        stage.removeChild(this.screens[i]);
        this.screens.splice(i,1);
      }
    }

  },

  draw: function() {

    if(gotImage && typeof outlineArray != 'undefined') {
      
      this.graphics.lineStyle(randomPaletteColour);

      this.minX = 0;
      this.minY = 0;
      this.maxX = 320;
      this.minY = 240;

      for(var i=0; i<outlineArray.length; i++){
        if(i > 0) {

          if(outlineArray[i][0] < this.minX) this.minX = outlineArray[i][0];
          if(outlineArray[i][0] > this.maxX) this.maxX = outlineArray[i][0];
          if(outlineArray[i][1] < this.minY) this.minY = outlineArray[i][1];
          if(outlineArray[i][1] > this.maxY) this.maxY = outlineArray[i][1];
          

          this.graphics.lineTo(outlineArray[i][0], outlineArray[i][1]);
        }else{
          this.graphics.moveTo(outlineArray[i][0], outlineArray[i][1]);
        }
      }

      this.centerX = this.minX + (this.maxX-this.minX)/2;
      this.centerY = this.minY + (this.maxY-this.minY)/2;

    }else{
      console.log('outlineArray is undefined');
    }

  }


}
