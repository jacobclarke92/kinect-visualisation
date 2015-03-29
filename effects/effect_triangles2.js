effect_triangles2 = {

	requresOutline: false,

	screens: [],
  	graphics: false,


	init: function() {
		setMapping('volumeDivider', 100, 400, 150);
		setMapping('trailAmount', 0, 1, 0.2); //51 works well
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

		var rand1 = Math.floor(Math.random()*(320*240));
		while(!pixelInRange(pixels[rand1*4 + pixelBit]) && ++count < breakLoop) rand1 = Math.floor(Math.random()*(320*240));


		if(count >= breakLoop) return false;
		else count = 0;

		var rand2 = Math.floor(Math.random()*(320*240));
		while((!pixelInRange(pixels[rand2*4 + pixelBit]) || Math.abs(rand2-rand1) > 5000) && ++count < breakLoop) rand2 = Math.floor(Math.random()*(320*240));

		if(count >= breakLoop) return false;
		else count = 0;

		var rand3 = Math.floor(Math.random()*(320*240));
		while((!pixelInRange(pixels[rand3*4 + pixelBit]) || Math.abs(rand3-rand2) > 5000) && ++count < breakLoop) rand3 = Math.floor(Math.random()*(320*240));
		
		if(count >= breakLoop) return false;
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

		this.graphics.moveTo(tX( xPos1 ), tY( yPos1 ));
		this.graphics.lineTo(tX( xPos2 ), tY( yPos2 ));
		this.graphics.lineTo(tX( xPos3 ), tY( yPos3 ));

		this.graphics.endFill();



	}

}