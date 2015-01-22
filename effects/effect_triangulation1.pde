
boolean invertImageData = false;
boolean flattenDepth = true;
boolean getImageEdges = false;


setMapping('maxParticles', 20, 100, 60);
setMapping('maxPointDist', 15, 85, 50);
setMapping('particleSpeedVariaton', 0, 5, 0.5);
setMapping('trailAmount', 0, 255, 255); //51 works well
setMapping('silhouetteOpacity', 0, 255, 255); //51 works well




// int fftSkip = 1;


ArrayList<Particle> particles = new ArrayList();

boolean spawned = false;


class Particle{

  float x;
  float y;
  float speedX;
  float speedY;
  float opacity;
  boolean die;
  int index;
  int pixel;

  Particle(_x, _y, _pixel) {
    opacity = 0;
    die = false;
    index = particles.size()-1;
    x = _x;
    y = _y;
    pixel = _pixel;
    speedX = random(-particleSpeedVariaton,particleSpeedVariaton);
    speedY = random(-particleSpeedVariaton,particleSpeedVariaton);
  }
  void step() {
    if(die) {
      if(opacity > 0) opacity -= 15;
      else{
        // console.log('removing');
        spawnParticle();
        particles.remove(index+1);
      }
    }else{
      if(opacity < 255) opacity += 15;
    }

    x += speedX;
    y += speedY;

    pixel = Math.round(y)*Math.round(winW/zoom) + Math.round(x);

  }
  void draw() {
    stroke(255,opacity);
    fill(0,opacity);
    ellipseMode(CENTER);
    ellipse(x,y,5,5);
  }

};



void draw() {



  noStroke();
  fill(0,trailAmount);
  rect(0,0,winW,winH);
  scale(2);

  if(gotSound) {
    processAudio();
    // if(kickVolume > 0) console.log(kickVolume);

  }


  if(gotImage) {


    tint(255,silhouetteOpacity/4)
    image(img,0,0,width/zoom,height/zoom);

    if(!spawned) {
      //once its got an image generate all particles
      for(int i=0; i<maxParticles; i++) {
        spawnParticle();
      }
      spawned = true;
    }else{


      //once particles have been created, moderate their numbers in accordance to the maxParticles variable
      if(particles.size()-1 > maxParticles) {
        for(int i=0; i < (particles.size()-1)-maxParticles; i ++) {
          particles.remove(i);
        }
      }else if(particles.size()-1 < maxParticles) {
        for(int i=0; i < maxParticles-(particles.size()-1); i ++) spawnParticle();
      }


    }
    // console.log(volume);

    for(int i=0; i < particles.size(); i++) {
      Particle p1 = (Particle) particles.get(i);

      for(int n=i; n < particles.size(); n++) {
        Particle p2 = (Particle) particles.get(n);
        float distance = dist(p1.x, p1.y, p2.x, p2.y);

        int op = (p1.opacity < p2.opacity) ? p1.opacity : p2.opacity;

        if (distance < maxPointDist+ kickVolume/10 /**(volume/800)*/) {
          //within minimum distance range
          
          stroke(255, op*0.5);
          if(window.currentPalette) {
            int colNum = int(random(0,window.currentPalette.colors.length));
            var col = window.currentPalette.colors[colNum].rgb;
            stroke(col[0], col[1], col[2], op*0.5);
          }else{
            stroke(255, op*0.5);
          }
          line(p1.x, p1.y, p2.x, p2.y);

        }
      }

      if(imageData[p1.pixel] == 0 || p1.x < 0 || p1.y < 0 || p1.x > width/2 || p1.y > height/2) p1.die = true;

      p1.step();

    }
    for(int i=0; i < particles.size(); i++) {
      (Particle) particles.get(i).draw();
    }
  }



}

int comparePts(int pos1, int pos2) {
  int xPos1 = (pos1 % 320);
  int yPos1 = floor(pos1/320);

  int xPos2 = (pos2 % 320);
  int yPos2 = floor(pos2/320);

  int distance = dist(xPos1, yPos1, xPos2, yPos2);
  // console.log(pos1, pos2);
  return distance;   
}

void spawnParticle() {

  int rand1 = int(random(0,img.pixels.length-1));
  while(imageData[rand1] == 0) rand1 = int(random(0,img.pixels.length-1));

  int yPos1 = floor(rand1/320);
  int xPos1 = (rand1 % 320);

  particles.add(new Particle(xPos1,yPos1,rand1));

}








      