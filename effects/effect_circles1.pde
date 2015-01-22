window.currentScript = (function(name) {


boolean invertImageData = false;
boolean flattenDepth = false;
boolean getImageEdges = false;


setMapping('volumeDivider', 200, 15, 50);
setMapping('maxPointDist', 15, 300, 100);
setMapping('trailAmount', 0, 255, 255); //51 works well


// int fftSkip = 1;


void draw() {

  noSmooth();
  noStroke();
  fill(0,trailAmount);
  rect(0,0,winW,winH);
  scale(2);

  if(gotImage) {
    // image(img,0,0);
    for(var i=0; i<volume/volumeDivider; i ++) {
      makeShape();
    }
  }

  if(gotSound) processAudio();  

}

int comparePts(int pos1, int pos2) {
  int xPos1 = (pos1 % 320);
  int yPos1 = floor(pos1/320);

  int xPos2 = (pos2 % 320);
  int yPos2 = floor(pos2/320);

  int distance = dist(xPos1, yPos1, xPos2, yPos2);;
  // console.log(pos1, pos2);
  return distance;   
}


int safety = 0;
int safeAmt = 1000;
int cutoff = 0;
void makeShape() {

  safety = 0;

  int rand1 = int(random(0,img.pixels.length-1));
  while(imageData[rand1] <= cutoff && ++safety < safeAmt) rand1 = int(random(0,img.pixels.length-1));

  safety = 0;

  int rand2 = int(random(0,img.pixels.length-1));
  while(
    (
      imageData[rand2] <= cutoff || comparePts(rand1,rand2) > maxPointDist || 
      imageData[ Math.round( (rand1+rand2)*0.5 ) ] <= cutoff)  
    && ++safety < safeAmt
  ) { 
    rand2 = int(random(0,img.pixels.length-1));
  }

  int midpoint = round((rand1+rand2)/2);

  int alf = 255;
  alf = (alpha(img.pixels[midpoint])+150)*5 + volume/100;





  //fill(int(random(0,255)),int(random(0,255)),int(random(0,255)),alf);


  int yPos1 = floor(rand1/320);
  int xPos1 = (rand1 % 320);

  int yPos2 = floor(rand2/320);
  int xPos2 = (rand2 % 320);

  int yPos3 = floor(midpoint/320);
  int xPos3 = (midpoint % 320);

  int diameter = dist(xPos1, yPos1, xPos2, yPos2);

  float additionalSize = kickVolume/20;
  additionalSize += img.pixels[midpoint];

  if(window.currentPalette) {
    int colNum = int(random(0,window.currentPalette.colors.length));
    var col = window.currentPalette.colors[colNum].rgb;
    stroke(col[0],col[1],col[2],alf);
  }else{
    stroke(255,255,255,alf);
  }

  ellipseMode(CENTER);
  ellipse(xPos3, yPos3, diameter/2 + additionalSize, diameter/2 + additionalSize);

  // triangle(xPos1,yPos1,xPos2,yPos2,xPos3,yPos3);

  // rect(xPos*2-shapeSize/2, yPos*2-shapeSize/2, shapeSize, shapeSize);


}



})('effect_circles1');




      