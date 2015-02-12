// gotImage gotSound volume image soundData
boolean invertImageData = false;
boolean flattenDepth = false;
boolean getImageEdges = false;


void draw() {

  fill(0,51);
  rect(0,0,winW,winH);

  if(gotImage) {

    image(img,0,0);
   
  }


  if(gotSound) {

    stroke(255);

    for(int i=1; i<soundData.length; i ++) {
      line(
        i-1,
        winH/2-(soundData[i-1]-128)*4,
        i,
        winH/2-(soundData[i]-128)*4
      );
    }
    noStroke();

  }


}