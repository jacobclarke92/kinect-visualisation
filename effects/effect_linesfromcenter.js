//exclude
effect_linesfromcenter = {

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
    setMapping('spawnAmount', 1, 100, 20);
    setMapping('outlineAlpha', 0, 1, 1);
    setMapping('trailAmount', 0, 0.5, 0.1);
  },

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
      // this.screens[i].x += (320-this.centerX)/2;
      // this.screens[i].y += (240-this.centerY)/2;

      
      if(this.screens[i].alpha <= 0 || this.screens[i].scale.x <= 0) {
        stage.removeChild(this.screens[i]);
        this.screens.splice(i,1);
      }
    }

  },

  draw: function() {

    if(gotImage && typeof outlineArray != 'undefined') {
      
      this.graphics.lineStyle(lineThickness,randomPaletteColour(),outlineAlpha);

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

          
          if(i == 1) this.graphics.moveTo(tX( outlineArray[i][0] ), tY( outlineArray[i][1]));
          else this.graphics.lineTo(tX( outlineArray[i][0] ), tY( outlineArray[i][1] ));
          
        }
        
      }

      this.centerX = this.minX + (this.maxX-this.minX)/2;
      this.centerY = this.minY + (this.maxY-this.minY)/2;

      console.log(this.centerX, this.centerY);
      for(var i=0; i < Math.ceil(Math.random()*spawnAmount); i++) {
        // this.graphics.moveTo(this.centerX, this.centerY);
        //add the trig to detect how many times a line crosses a polygon
        var outlinePt = outlineArray[Math.floor(Math.random()*(outlineArray.length-1))];
        // console.log(outlinePt);
        // this.graphics.lineTo(outlinePt[0],outlinePt[1]);
      }

    }else{
      console.log('outlineArray is undefined');
    }

  }


}
