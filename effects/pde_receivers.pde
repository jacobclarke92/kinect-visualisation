

if(typeof invertImageData == 'undefined') boolean invertImageData = false;
if(typeof flattenDepth == 'undefined') boolean flattenDepth = false;
if(typeof getImageEdges == 'undefined') boolean getImageEdges = false;

void setImage(byte[] imgData) {

  gotImage = true;
  // console.log(typeof img, typeof img['pixels']);
  if(typeof img != 'undefined' && typeof img['pixels'] != 'undefined') {
    if(imgData.length-1 != img.pixels.length) console.log('mismatched pixel length: '+imgData.length +" vs "+img.pixels.length);



     for(var i=0; i<imgData.length; i++) {

        imageData[i] = imgData[i];
        if(invertImageData) imgData[i] = 255-imgData[i];
        if(flattenDepth) {
          if(imgData[i] != 0) imgData[i] = 255;
        }
        imgData[i] = color(imgData[i], imgData[i]);

    }
   

    img.pixels = imgData;
    img.updatePixels();

  }else{
    console.warn('img var not inited');
  }

}


void setSound(int[] fftData) {

  soundData = new int[audioSampleSize];
  volume = 0;

  for(var i=0; i<fftData.length; i++) {
    soundData[i] = fftData[i];
    volume += Math.abs(fftData[i]-128);
  }
  gotSound = true;

}

void setVolume(int vol) {
  volume = vol;

  // console.log('receiving vol');
}

if(typeof mappings != 'object') mappings = {};

// console.debug(typeof mappings[hash]);
if(typeof mappings[hash] != 'object') {
  mappings[hash] = [];
}

void setMapping(string variable, float minimum, float maximum, float _default) {

  console.log('hash: '+hash+', key to set: '+variable);
  var isSet = isMappingSet('name',variable);
  if(isSet == -1) {

    createMapping(variable, minimum, maximum, _default);
  }else{

    console.log('(from within PDE) setting window variable ~'+mappings[hash][isSet]['name']+'~ from mappings: '+mappings[hash][isSet]['value']);
    window[variable] = mappings[hash][isSet]['value'];
  }
}



int kickVolume = 0;


int bass;
int bassLastVal = 0;
int bassCoolOff = 5;
int bassCount = 0;

void processAudio() {

  //never really gets over 1000
  bass = 0;
  int counter = soundData.length;
  if(counter > 380) counter = 380;
  counter = 4;

  for(int i=0; i<counter; i++) bass += soundData[i];

  bassCount ++;
  if(bassCount > bassCoolOff && bass > 850 && bass-bassLastVal > 60) {

    //console.log('kick');
    bassCount = 0;

    kickVolume = bass;

  }
  bassLastVal = bass;
  kickVolume = (kickVolume < 0) ? 0 : kickVolume-100;

}


/*
void I(int x, int y) {

  int offset = ((y * width) + x);
  return imageData[offset];
}

void Gx(int x, int y) {

  return I(x+1, y+1) + 2*I(x+1, y) + I(x+1, y-1) +
    -I(x-1, y-1) - 2*I(x-1, y) - I(x-1, y-1);
}

void Gy(int x, int y) {

  return I(x-1, y-1) + 2*I(x, y-1) + I(x+1, y-1) +
    -I(x-1, y+1) - 2*I(x, y-1) - I(x+1, y-1);
}

void E(int x, int y) {

  return Math.sqrt(
    Math.pow(Gx(x, y), 2) +
    Math.pow(Gy(x, y), 2)
  );
}
*/