
boolean invertImageData = false;
boolean flattenDepth = true;


//if(!window['volumeDivider']) volumeDivider = 20;


//variable name, min, max, default
setMapping('volumeDivider', 400, 15, 100);
setMapping('maxPointDist', 35, 300, 70);
setMapping('trailAmount', 0, 255, 51); //51 works well


void draw() {

  noStroke();
  fill(0,trailAmount);
  rect(0,0,winW,winH);
  scale(2);


  if(gotImage) {
    // image(img,0,0);
    for(int i=0; i<volume/volumeDivider; i ++) {
      drawLines();
    }
  }

  if(gotSound) processAudio ();


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

void drawLines() {

  int rand1 = int(random(0,img.pixels.length-1));
  while(imageData[rand1] == 0) rand1 = int(random(0,img.pixels.length-1));

  int rand2 = int(random(0,img.pixels.length-1));
  while(
    imageData[rand2] == 0 || comparePts(rand1,rand2) > maxPointDist + kickVolume/5 || 
    imageData[ Math.round( (rand1+rand2)*0.5 ) ] == 0
  ) rand2 = int(random(0,img.pixels.length-1));
  
  int midpoint = round((rand1+rand2)/2);
  int alf = 255;
  alf = (alpha(img.pixels[midpoint])+150)*5 + volume/100;


  int yPos1 = floor(rand1/320);
  int xPos1 = (rand1 % 320);

  int yPos2 = floor(rand2/320);
  int xPos2 = (rand2 % 320);

  if(window.currentPalette) {
    int colNum = int(random(0,window.currentPalette.colors.length));
    var col = window.currentPalette.colors[colNum].rgb;
    stroke(col[0],col[1],col[2]);
  }else{
    stroke(255);
  }
  line(xPos1, yPos1, xPos2, yPos2);



}