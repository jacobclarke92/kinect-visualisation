
boolean invertImageData = false;
boolean flattenDepth = false;
boolean getImageEdges = false;




setMapping('volumeDivider', 200, 40, 40);
setMapping('shapeSize', 1, 100, 6);
setMapping('trailAmount', 0, 255, 51); //51 works well
// int fftSkip = 1;


void draw() {

  fill(0,trailAmount);
  rect(0,0,winW,winH);
  // scale(2);

  if(gotImage) {
    for(var i=0; i<volume/volumeDivider; i ++) {
      makeShape();
    }
  }

  if(gotSound) processAudio();


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


void makeShape() {



  int rand = int(random(0,img.pixels.length-1));

  while(imageData[rand] == 0) rand = int(random(0,img.pixels.length-1));

  int pixel = imageData[rand];

  if(window.currentPalette) {
    int colNum = int(random(0,window.currentPalette.colors.length));
    var col = window.currentPalette.colors[colNum].rgb;
    fill(col[0],col[1],col[2]);
  }else{
    fill(int(random(0,255)),int(random(0,255)),int(random(0,255)));
  }


  int yPos = floor(rand/320);
  int xPos = (rand % 320);

  int shSize = round(shapeSize + kickVolume/20);

  rect(xPos*2-shSize/2, yPos*2-shSize/2, shSize, shSize);

 
}








      