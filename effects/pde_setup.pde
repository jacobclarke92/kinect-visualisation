
int winH;
int winW;
int zoom;
PImage img = createImage(320,240,ARGB);;

boolean gotImage = false;
boolean gotSound = false;
// int volume = 0;

int[] imageData = new int[76800];
int[] soundData = new int[1024];


void setup() {

  winW = 640;
  winH = 480;

  zoom = 2;
  // size(winW,winH, P3D);
  // console.warn('hash = ',hash);
  if(hash.indexOf('3D') > -1) size(winW,winH, P3D);
  else size(winW,winH);
  background(0);


  stroke(255);
  ellipse(50, 50, 25, 25);

  img = createImage(320,240,ARGB);

  noStroke();
  
}
