
boolean invertImageData = false;
boolean flattenDepth = true;
boolean getImageEdges = false;



int minVolume = 2000;
int lineSpacing = 10;
int offset = 0;
int volOffset = 0;


void draw() {

  fill(0,51);
  rect(0,0,winW,winH);
  scale(2);

  image(img,0,0);


  if(volume > minVolume) {
    int newVolOffset = round((volume-minVolume)/500);
    if(newVolOffset > lineSpacing) newVolOffset = lineSpacing;
    // console.log(newVolOffset);
    if(newVolOffset > volOffset) volOffset = newVolOffset;
  }else if(volOffset > 0) volOffset --;
  else if(volOffset < 0) volOffset = 0;


  if(++offset >= lineSpacing+1) offset = 0;

  if(gotImage) {
    for(int i=-1; i<320/lineSpacing; i ++) {
      fill(0);

      rect(
        0,
        i*(lineSpacing+1) + offset - volOffset/2,
        320,
        lineSpacing - volOffset
      );

    }
  }


}