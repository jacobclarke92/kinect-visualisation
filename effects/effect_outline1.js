effect_outline1 = {

	init: function() {
    	setMapping('lineThickness', 1, 50, 2);
		setMapping('pixelResolution', 1, 10, 3);
		setMapping('trailAmount', 0, 1, 0.2);

	},

	skip: 4,

	lastX: 0,
	lastY: 0,
	lastDiff: 0,

	draw: function() {

		if(gotImage) {

			this.graphics.lineStyle(lineThickness,randomPaletteColour());

			// PImage edgeImg = createImage(img.width, img.height, ARGB);
			var rez = Math.round(pixelResolution);
			for (var x = rez; x < 320-rez; x+= rez) {
				for (var y = 5; y < 240; y+= rez) {

					// Pixel location and color
					var loc = x + y*320;
					var pix = pixels[loc*4 + 2];
					// color pix = img.pixels[loc];

					// Pixel to the left location and color
					var leftLoc = (x-1) + y*320;
					var leftPix = pixels[leftLoc*4 + 2];

					// New color is difference between pixel and left neighbor
					var diffLeft = Math.abs(pix - leftPix);

					if(diffLeft > 0 && this.lastDiff > 0 && pixelInRange(pix)) {
						this.graphics.moveTo(this.lastX*2, this.lastY*2);
						this.graphics.lineTo(x*2, y*2);
						// line(this.lastX,this.lastY,x,y);
					}


					if(diffLeft > 50) {
					    this.lastX = x;
					    this.lastY = y;
					}
					
					this.lastDiff = diffLeft;


				}
			}
		}
	}
}


