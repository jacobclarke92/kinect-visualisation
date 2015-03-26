effect_triangles1 = {

	invertImageData: false,
	flattenDepth: false,
	getImageEdges: false,

	screens: [],
  	graphics: false,


	shapeSize: 6,
	breakLoop: 500,

	init: function() {
		setMapping('volumeDivider', 100, 400, 150);
		setMapping('maxPointDist', 10, 200, 20);
		setMapping('trailAmount', 0, 0.5, 0.2);
	},
	


	draw: function() {

		if(gotImage) {
		  for(var i=0; i<volume/volumeDivider; i ++) {
		    this.makeShape();
		  }
		}


	},

	makeShape: function() {

		var count = 0;

		var rand1 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
		while(!pixelInRange(pixels[rand1*4 + 3]) && ++count < this.breakLoop) rand1 = Math.floor(Math.random()*(canvasWidth*canvasHeight));


		if(count >= this.breakLoop) return false;
		else count = 0;

		var rand2 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
		while((!pixelInRange(pixels[rand2*4 + 3]) || comparePts(rand2,rand1) > maxPointDist) && ++count < this.breakLoop) rand2 = Math.floor(Math.random()*(canvasWidth*canvasHeight));

		if(count >= this.breakLoop) return false;
		else count = 0;

		var rand3 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
		while((!pixelInRange(pixels[rand3*4 + 3]) || comparePts(rand3,rand1) > maxPointDist) && ++count < this.breakLoop) rand3 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
		
		if(count >= this.breakLoop) return false;
		else count = 0;

		var mean = Math.round((rand1+rand2+rand3)/3);
		var alf = 1;
		alf = rangeAdjustedPixel(pixels[mean*4 + 3])/255;

		this.graphics.beginFill(randomPaletteColour(), alf);

		var yPos1 = Math.floor(rand1/320);
		var xPos1 = (rand1 % 320);

		var yPos2 = Math.floor(rand2/320);
		var xPos2 = (rand2 % 320);

		var yPos3 = Math.floor(rand3/320);
		var xPos3 = (rand3 % 320);

		// this.graphics.triangle(xPos1,yPos1,xPos2,yPos2,xPos3,yPos3);
		this.graphics.moveTo(xPos1*2,yPos1*2);
		this.graphics.lineTo(xPos2*2,yPos2*2);
		this.graphics.lineTo(xPos3*2,yPos3*2);
		// this.graphics.lineTo(xPos1,yPos1);

		this.graphics.endFill();

		// rect(xPos*2-shapeSize/2, yPos*2-shapeSize/2, shapeSize, shapeSize);


	}

}