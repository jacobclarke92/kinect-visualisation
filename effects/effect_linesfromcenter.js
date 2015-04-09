effect_linesfromcenter = {

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
  aimCenterX: tX( 160 ),
  aimCenterY: tY( 120 ),

  screens: [],
  graphics: false,

  init: function() {
    setMapping('lineThickness', 1, 50, 2);
    setMapping('randomizeAmount', 0, 50, 1);
    setMapping('outlinePointSkip', 3, 10, 1);
    setMapping('spawnAmount', 1, 100, 20);
    setMapping('lineAlpha', 0, 1, 1);
    setMapping('outlineAlpha', 0, 1, 1);
    setMapping('trailAmount', 0, 1, 0.1);
  },

  draw: function() {

   if(gotImage && isset(outlineArray) && outlineArray.length > 0) {
      
      this.graphics.lineStyle(lineThickness, randomPaletteColour(), outlineAlpha);

      this.minX = 320;
      this.minY = 240;
      this.maxX = 0;
      this.minY = 0;

      //draws outlines and generates max and min XY values
      var firstX, firstY, offsetX, offsetY, outline, x, y;
      var skip = (outlinePointSkip < 1) ? 1 : Math.round(outlinePointSkip);
      for(var n=0; n < outlineArray.length; n ++) {
        outline = outlineArray[n];
        if(outline.length > skip) {
          for(var i=0; i<outline.length-skip; i += skip) {
            if(i >= outline.length) i = outline.length-1;

            offsetX = Math.random()*randomizeAmount - (randomizeAmount/2);
            offsetY = Math.random()*randomizeAmount - (randomizeAmount/2);

            x = outline[i][0] + offsetX;
            y = outline[i][1] + offsetY;

            //moveTo if first point otherwise lineTo
            if(i == 0) {
              firstX = x;
              firstY = y;
              if(outlineAlpha > 0) this.graphics.moveTo(tX( firstX ), tY( firstY ));
            }else{
              if(outlineAlpha > 0) this.graphics.lineTo( tX( x ), tY( y ) );
            }

            //update min/max values
            if(x > this.maxX) this.maxX = x;
            else if(x < this.minX) this.minX = x;
            if(y > this.maxY) this.maxY = y;
            else if(y < this.minY) this.minY;

          }
          //complete the outline by drawing back to first point
          if(outlineAlpha > 0) this.graphics.lineTo(tX( firstX ), tY( firstY ));

        }
      }

      
      //gets mid point
      this.centerX = this.minX + (this.maxX-this.minX)/2;
      this.centerY = this.minY + (this.maxY-this.minY)/2;

      //eases aimCenter to center
      this.aimCenterX += (this.centerX-this.aimCenterX)/30;
      this.aimCenterY += (this.centerY-this.aimCenterY)/30;

      // this.graphics.drawCircle(tX( this.centerX), tY( this.centerY ), 10);

      //draw random lines
      var px, outline, randOutline;
      for(var n=0; n < spawnAmount; n ++) {

        //select random point from any of the outlines
        outline = outlineArray[Math.floor(Math.random()*outlineArray.length)];
        px = outline[Math.floor(Math.random()*outline.length)];
        
        offsetX = Math.random()*randomizeAmount - (randomizeAmount/2);
        offsetY = Math.random()*randomizeAmount - (randomizeAmount/2);
        
        this.graphics.lineStyle(lineThickness, randomPaletteColour(), lineAlpha);
        this.graphics.moveTo(tX( this.aimCenterX ), tY( this.aimCenterY ));
        this.graphics.lineTo(tX( px[0] + offsetX ), tY( px[1] + offsetY ));

      }

    }else{
      console.log('outlineArray is undefined');
    }

  }


}
