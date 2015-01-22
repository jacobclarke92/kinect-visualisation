boolean invertImageData = false;
boolean flattenDepth = false;

setMapping('trailAmount', 0, 255, 51); //51 works well

int skip = 4;

int lastX = 0;
int lastY = 0;
float lastDiff = 0;

void draw() {

	
  fill(0,trailAmount);
  noStroke();
  rect(0,0,winW,winH);
  scale(2);

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


		    if(diffLeft > 0) {
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




