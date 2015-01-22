effect_outline1 = {

	invertImageData: false,
	flattenDepth: false,

	init: function() {
		setMapping('trailAmount', 0, 255, 102); //51 works well
	}

	skip: 4,

	lastX: 0,
	lastY: 0,
	lastDiff: 0,

	initFrame: function() {

	},

	draw: function() {

		if(gotImage) {

			stroke(255);
			strokeWeight(2);

			PImage edgeImg = createImage(img.width, img.height, ARGB);

			for (int x = 1; x < img.width; x+= 3) {
			  for (int y = 5; y < img.height; y+= 3 ) {
			    // Pixel location and color
			    int loc = x + y*img.width;
			    color pix = img.pixels[loc];

			    // Pixel to the left location and color
			    int leftLoc = (x-1) + y*img.width;
			    color leftPix = img.pixels[leftLoc];

			    // New color is difference between pixel and left neighbor
			    float diffLeft = abs(brightness(pix) - brightness(leftPix));

			    if(diffLeft > 0 && lastDiff > 0) line(lastX,lastY,x,y);


			    if(diffLeft > 50) {
				    lastX = x;
				    lastY = y;
				}
			    lastDiff = diffLeft;

			    edgeImg.pixels[loc] = color(diffLeft,diffLeft);
			  }
			}
			edgeImg.updatePixels();

			image(edgeImg,0,0);
		}

	}

}


