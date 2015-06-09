effect_triangles1 = {

	requiresOutlines: false,

	screens: [],
  	graphics: false,


	shapeSize: 6,
	breakLoop: 500,

	init: function() {
		setMapping('volumeDivider', 50, 400, 150);
		setMapping('maxPointDist', 10, 200, 20);
		setMapping('trailAmount', 0, 1, 0.5);
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
		while(!pixelInRange(pixels[rand1*4 + pixelBit]) && ++count < this.breakLoop) rand1 = Math.floor(Math.random()*(canvasWidth*canvasHeight));


		if(count >= this.breakLoop) return false;
		else count = 0;

		var rand2 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
		while((!pixelInRange(pixels[rand2*4 + pixelBit]) || comparePts(rand2,rand1) > maxPointDist) && ++count < this.breakLoop) rand2 = Math.floor(Math.random()*(canvasWidth*canvasHeight));

		if(count >= this.breakLoop) return false;
		else count = 0;

		var rand3 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
		while((!pixelInRange(pixels[rand3*4 + pixelBit]) || comparePts(rand3,rand1) > maxPointDist) && ++count < this.breakLoop) rand3 = Math.floor(Math.random()*(canvasWidth*canvasHeight));
		
		if(count >= this.breakLoop) return false;
		else count = 0;

		var mean = Math.round((rand1+rand2+rand3)/3);
		var alf = 1;
		alf = rangeAdjustedPixel(pixels[mean*4 + pixelBit])/255;

		this.graphics.beginFill(randomPaletteColour(), alf);

		var yPos1 = Math.floor(rand1/320);
		var xPos1 = (rand1 % 320);

		var yPos2 = Math.floor(rand2/320);
		var xPos2 = (rand2 % 320);

		var yPos3 = Math.floor(rand3/320);
		var xPos3 = (rand3 % 320);

		// this.graphics.triangle(xPos1,yPos1,xPos2,yPos2,xPos3,yPos3);
		this.graphics.moveTo(tX( xPos1 ), tY( yPos1 ));
		this.graphics.lineTo(tX( xPos2 ), tY( yPos2 ));
		this.graphics.lineTo(tX( xPos3 ), tY( yPos3 ));
		// this.graphics.lineTo(xPos1,yPos1);

		this.graphics.endFill();

		// rect(xPos*2-shapeSize/2, yPos*2-shapeSize/2, shapeSize, shapeSize);


	}

}