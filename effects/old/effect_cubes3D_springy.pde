
setMapping('spazAmount', 0, 50, 20);
setMapping('snapBack', 0.05, 0.95, 0.3);
setMapping('inertia', 0.05, 0.95, 0.7);
setMapping('trailAmount', 0, 255, 255);

// float spazAmount = 20;
boolean use3D = true;

int stepSize = 5;
float springAmount = 5;

ArrayList<Particle> particles = new ArrayList();

boolean spawned = false;


class Particle{

  float x;
  float y;
  float z;
  float origX;
  float origY;
  float origZ;
  float speedX;
  float speedY;
  float speedZ;
  float speedSize;
  float offsetX;
  float offsetY;
  float offsetZ;
  float easeX;
  float easeY;
  float easeZ;

  int index;
  int pixel;
  float shapeSize;

  int spazCount;

  float lastZ = 0;


  Particle(_x, _y, _z, _pixel) {
    opacity = 0;
    die = false;
    index = particles.size()-1;
    x = origX = _x;
    y = origY = _y;
    z = origZ = _z;

    pixel = _pixel;
    speedX = speedY = speedZ = 0;
  }
  void step(_z) {
  	
  	if(_z == 0) lastZ = origZ;
  	origZ = _z;


    speedX = (origX-(x+offsetX));
    speedY = (origY-(y+offsetY));
    speedZ = (origZ-(z+offsetZ));

    easeX = easeX*inertia + speedX*snapBack;
    easeY = easeY*inertia + speedY*snapBack;
    easeZ = easeZ*inertia + speedZ*snapBack;

    speedSize = (origZ-z)/springAmount;

    offsetX /= 2;
    offsetY /= 2;
    offsetZ /= 2;

    x += easeX;
    y += easeY;
    z += easeZ;

    // pixel = Math.round(y)*Math.round(winW/zoom) + Math.round(x);
    spazCount ++;
  }
  void draw() {
  	if(origZ > 0) {
		pushMatrix();
		translate(x*2,y*2,z*5);
		box(origZ);
		popMatrix();
	}
  }
  void spaz() {
  	if(spazCount > 10) {
  		float tmpAmt = spazAmount+(origZ/2)
	  	offsetX = random(-tmpAmt,tmpAmt);
	  	offsetY = random(-tmpAmt,tmpAmt);
	  	offsetZ = random(-tmpAmt,tmpAmt);
	  	spazCount = 0;
	  }
  }

};


void draw() {
	noStroke();
	lights();
	// directionalLight(255, 0, 0, 320, 240, 50);
	// spotLight(255, 0, 0, width/2, height/2, 400, 0, 0, -1, PI/4, 2);
	// ambientLight();
	fill(0,255);
  	rect(0,0,winW,winH);
	
	// float rotX = (mouseY/winH)*2 - 1;
	// float rotY = (mouseX/winW)*2 - 1;
	// rotateX(Math.PI*rotX);
	// rotateY(Math.PI*rotY);
	
	// scale(2);

	lights();

	if(gotImage) {

		stroke(255);
		fill(0);
		int i = 0;
		for(int y=0; y < img.height; y += stepSize) {
			for(int x=0; x < img.width; x += stepSize) {
				i++;
				
				int pixNum = y*img.width + x;
				color pixel = img.pixels[pixNum];
				int num = alpha(pixel);

				float shapeSize = num/10;
				if(num == 0) shapeSize = 0;

				if(!spawned) particles.add(new Particle(x,y,shapeSize,pixNum));
				else{
					
					Particle p1 = (Particle) particles.get(i-1);
					if(typeof p1 != 'undefined') {
						// console.log(p1);
						if(kickVolume > 0) p1.spaz();

						p1.step(shapeSize);

						p1.draw();

					}
				}

			}
		}
		if(!spawned) spawned = true;
	}
	
}