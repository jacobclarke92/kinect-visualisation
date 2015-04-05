//exclude
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

  screens: [],
  graphics: false,

  init: function() {
    setMapping('lineThickness', 1, 50, 2);
    setMapping('randomizeAmount', 0, 50, 1);
    setMapping('outlinePointSkip', 3, 10, 1);
    setMapping('spawnAmount', 1, 100, 20);
    setMapping('outlineAlpha', 0, 1, 1);
    setMapping('trailAmount', 0, 1, 0.1);
  },

  draw: function() {

   if(gotImage && typeof outlineArray != 'undefined') {
      
      this.graphics.lineStyle(lineThickness, randomPaletteColour(), outlineAlpha);

      this.minX = 320;
      this.minY = 240;
      this.maxX = 0;
      this.minY = 0;

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

            if(i == 0) {
              firstX = x;
              firstY = y;
              this.graphics.moveTo(tX( firstX ), tY( firstY ));
            }else{
              this.graphics.lineTo( tX( x ), tY( y ) );
            }

            if(x > this.maxX) this.maxX = x;
            else if(x < this.minX) this.minX = x;
            if(y > this.maxY) this.maxY = y;
            else if(y < this.minY) this.minY;
          }
          this.graphics.lineTo(tX( firstX ), tY( firstY ));
        }
      }

      

      this.centerX = this.minX + (this.maxX-this.minX)/2;
      this.centerY = this.minY + (this.maxY-this.minY)/2;

      /*
      var isInOutline = true;
      for(var n=0; n < outlineArray.length; n ++) {
        if(typeof outlineArray[n] != 'undefined' && !isPointInsidePolygon({x: this.centerX, y: this.centerY}, outlineArray[n], true)) {
          isInOutline = false;
        }
      }
      console.log(isInOutline);

      
      */


      this.graphics.drawCircle(tX( this.centerX), tY( this.centerY ), 10);
      var px, outline, randOutline;
      for(var n=0; n < spawnAmount; n ++) {
        randOutline = Math.floor(outlineArray.length);
        // console.log(randOutline, outlineArray, outlineArray[randOutline]);
        if(isset(outlineArray[randOutline])) {
          console.log('is outline');
          outline = outlineArray[randOutline];
          px = outline[Math.floor(outline.length-1)];
          this.graphics.lineStyle(lineThickness, randomPaletteColour());
          this.graphics.moveTo(tX( this.centerX ), tY( this.centerY ));
          this.graphics.lineTo(tX( px[0] ), tY( px[1] ));
        }
      }

    }else{
      console.log('outlineArray is undefined');
    }

  }


}
