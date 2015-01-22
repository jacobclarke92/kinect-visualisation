
boolean invertImageData = false;
boolean flattenDepth = true;
boolean getImageEdges = false;

int bass;
PImage bgImg;
fill(0,255);
int lastVal = 0;
// int speed = 
int coolOff = 5;
int kickCount = 0;

int kickVolume = 0;

void draw() {


	noStroke();
	bgImg = get();
  	fill(0,255);
  	rect(0,0,width,height);
	image(bgImg,1,0);

  	

	if(gotSound) {
		//never really gets over 1000
		bass = 0;
		int counter = soundData.length;
		if(counter > 380) counter = 380;

		counter = 4;


		for(int i=0; i<counter; i++) {
			if(i <= 4) {
				stroke(255,0,0);
				bass += soundData[i];
			}else stroke(255);
			// line(i,height,i,height-soundData[i]);
		}

		// console.log(bass
		stroke(0);
		// rect(0,0,1,height);
		stroke(255);
		// rect(0,height-((bass/1000)*height),1,1);
		line(0,height-((bass/1000)*400), 1, height-((lastVal/1000)*400));
		kickCount ++;
		if(kickCount > coolOff && bass > 850 && bass-lastVal > 60) {

			fill(255,0,0);
			ellipseMode(CENTER);
			ellipse(0,height-((bass/1000)*400),40,40);
			console.log('kick');
			kickCount = 0;

			kickVolume = bass;

		}
		lastVal = bass;
		
		kickVolume = (kickVolume < 0) ? 0 : kickVolume-50;
	}

}