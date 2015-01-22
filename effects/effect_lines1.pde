
boolean invertImageData = false;
boolean flattenDepth = true;


int shapeSize = 6;
int loopSize = 100;


int lineSpacing = 20;
int lastX = 0;
int lastY = 0;


void draw() {

  fill(0,51);
  rect(0,0,winW,winH);
  scale(2);


  if(gotImage) {
    image(img,0,0);
    for(int i=0; i<loopSize; i ++) {
      drawLines();
    }
  }


}


void drawLines() {

  // console.log(img.pixels.length);
  int randPix = int(random(0, img.pixels.length-1))+1;

  while(imageData[randPix] == 0) randPix = int(random(0,img.pixels.length-1));

  int pixel = imageData[randPix];

  int yPos = floor(randPix/320);
  int xPos = (randPix % 320);

  if(window.currentPalette) {
    int colNum = int(random(0,window.currentPalette.colors.length));
    var col = window.currentPalette.colors[colNum].rgb;
    stroke(col[0],col[1],col[2]);
  }else{
    stroke(255);
  }
  line(xPos, yPos, lastX, lastY);

  lastX = xPos;
  lastY = yPos;


}