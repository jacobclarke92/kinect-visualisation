effect_outline2 = {

	requresOutline: false,

	init: function() {
    	setMapping('lineThickness', 1, 50, 2);
		setMapping('pixelResolution', 1, 10, 3);
		setMapping('trailAmount', 0, 1, 0.8);

	},

	skip: 4,

	lastX: 0,
	lastY: 0,
	lastDiff: 0,
	draw: function() {

		if(gotImage) {

			this.graphics.lineStyle(lineThickness,randomPaletteColour());

			var rez = Math.round(pixelResolution);

			for (var x = rez; x < 320-rez; x+= rez) {
				for (var y = 5; y < 240; y+= rez) {

					// Pixel location and color
					var loc = x + y*320;
					var pix = pixels[loc*4 + pixelBit];

					if(pixelInRange(pix)) {
						// color pix = img.pixels[loc];

						// Pixel to the left location and color
						var leftLoc = (x-1) + y*320;
						var leftPix = pixels[leftLoc*4 + pixelBit];

						// New color is difference between pixel and left neighbor
						var diffLeft = Math.abs(pix - leftPix);
						if(diffLeft > 0 && this.lastDiff > 0) {
							this.graphics.moveTo(tX( this.lastX ), tY( this.lastY ));
							this.graphics.lineTo(tX( x ), tY( y ));
						}


						if(diffLeft > 0) {
						    this.lastX = x;
						    this.lastY = y;
						}
						this.lastDiff = diffLeft;

					}

				}
			}
		}
	}
}