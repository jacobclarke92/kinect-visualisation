effect_outline3 = {

  requiresOutlines: true,

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
    setMapping('trailAmount', 0, 1, 0.8);
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
      var outline;
      for(var n=0; n < outlineArray.length; n ++) {
        outline = outlineArray[n];
        for(var i=0; i<outline.length; i++){
          if(i == 0) this.graphics.moveTo(tX( outline[i][0] ), tY( outline[i][1] ));
          else this.graphics.lineTo(tX( outline[i][0] ), tY( outline[i][1] ));
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
