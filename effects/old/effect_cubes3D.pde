

setMapping('trailAmount', 0, 255, 255);
boolean use3D = true;


void draw() {
	noStroke();
	lights();
	// directionalLight(255, 0, 0, 320, 240, 50);
	// spotLight(255, 0, 0, width/2, height/2, 400, 0, 0, -1, PI/4, 2);
	// ambientLight();
	fill(0,trailAmount);
  	rect(0,0,winW,winH);
	
	// float rotX = (mouseY/winH)*2 - 1;
	// float rotY = (mouseX/winW)*2 - 1;
	// rotateX(Math.PI*rotX);
	// rotateY(Math.PI*rotY);
	
	// scale(2);

	if(gotImage) {
		for(int y=0; y < img.height; y += 5) {
			for(int x=0; x < img.width; x += 5) {
				
				int pixNum = y*img.width + x;
				color pixel = img.pixels[pixNum];
				int num = alpha(pixel);

				stroke(255);
				// noStroke();
				fill(0);
				if(num != 0) {
					pushMatrix();
					translate(x*2,y*2,num/2);
					
					float shapeSize = num/10;
					if(kickVolume > 0) shapeSize -= kickVolume/50;
					if(shapeSize < 0) shapeSize = -0.01;

					box(shapeSize);
					popMatrix();
				}


			}
		}	
	}
}