
boolean invertImageData = false;
boolean flattenDepth = false;
boolean getImageEdges = false;


int shapeSize = 6;
int loopSize = 500;


setMapping('volumeDivider', 400, 100, 150);
setMapping('maxPointDist', 10, 200, 20);
setMapping('trailAmount', 0, 255, 255); //51 works well


void draw() {

  fill(0,trailAmount);
  rect(0,0,winW,winH);
  scale(2);

  if(gotImage) {
    for(var i=0; i<volume/volumeDivider; i ++) {
      makeShape();
    }
  }


  // if(gotSound) {
  //   stroke(255);
  //   // console.log(freqData.length);
  //   for(int i=1; i<freqData.length/fftSkip; i ++) {
  //     line(
  //       2*(i-1),
  //       winH/2-(freqData[i*fftSkip - fftSkip]-128)*4,
  //       2*i,
  //       winH/2-(freqData[i*fftSkip]-128)*4
  //     );
  //   }

  //   noStroke();
  // }
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

void makeShape() {



  int rand1 = int(random(0,img.pixels.length-1));
  while(imageData[rand1] == 0) rand1 = int(random(0,img.pixels.length-1));

  int rand2 = int(random(0,img.pixels.length-1));
  while(imageData[rand2] == 0 || comparePts(rand2,rand1) > maxPointDist) rand2 = int(random(0,img.pixels.length-1));

  int rand3 = int(random(0,img.pixels.length-1));
  while(imageData[rand3] == 0|| comparePts(rand3,rand1) > maxPointDist) rand3 = int(random(0,img.pixels.length-1));
/*
  int rand2 = int(random(
    (rand1-100 < 0) ? 0 : (rand1-100),
    (rand1+100 > img.pixels.length-1) ? img.pixels.length-1 : (rand1+100) 
  ));
  while(imageData[rand2] == 0) rand2 = int(random(
    (rand1-100 < 0) ? 0 : (rand1-100),
    (rand1+100 > img.pixels.length-1) ? img.pixels.length-1 : (rand1+100) 
  ));

  int rand3 = int(random(
    (rand1-100 < 0) ? 0 : (rand1-100),
    (rand1+100 > img.pixels.length-1) ? img.pixels.length-1 : (rand1+100) 
  ));
  while(imageData[rand3] == 0) rand3 = int(random(
    (rand1-100 < 0) ? 0 : (rand1-100),
    (rand1+100 > img.pixels.length-1) ? img.pixels.length-1 : (rand1+100) 
  ));
*/
  
  int mean = round((rand1+rand2+rand3)/3);
  int alf = 255;
  alf = (alpha(img.pixels[mean])+150)*5 + volume/100;


  noSmooth();
  if(window.currentPalette) {
    int colNum = int(random(0,window.currentPalette.colors.length));
    var col = window.currentPalette.colors[colNum].rgb;
    fill(col[0],col[1],col[2]);
  }else{
    fill(int(random(0,255)),int(random(0,255)),int(random(0,255)));
  }

  int yPos1 = floor(rand1/320);
  int xPos1 = (rand1 % 320);

  int yPos2 = floor(rand2/320);
  int xPos2 = (rand2 % 320);

  int yPos3 = floor(rand3/320);
  int xPos3 = (rand3 % 320);

  triangle(xPos1,yPos1,xPos2,yPos2,xPos3,yPos3);

  // rect(xPos*2-shapeSize/2, yPos*2-shapeSize/2, shapeSize, shapeSize);


}








      