//exclude
effect_hexigons1 = {

	requiresOutlines: false,

	hexigons: [],

	init: function() {
		setMapping('shapeSize', 15, 200, 50);
		setMapping('coolOff', 1, 0.05, 1);
		setMapping('triggerSize', 5, 50, 20);
		setMapping('trailAmount', 0, 1, 0.2);

		this.defineHexigonGrid();
	},

	lastKickVolume: 0,

	defineHexigonGrid: function() {
		this.hexigons = [];
		for(var x=0; x < 320/shapeSize; x ++) {
			for(var y=1; y <= (240 +  100)/shapeSize; y++) {
			// for(var y=0; y < 240/shapeSize; y ++) {
				this.hexigons.push( jQuery.extend(true, {}, Hexigon) );
				this.hexigons[this.hexigons.length-1].init(x,y)
			}

		}
	},

	draw: function() {

		if(kickVolume > this.lastKickVolume) {

			this.lastKickVolume = kickVolume;
			var randomHexigon = Math.round(Math.random()*(currentScript.hexigons.length-1));
			currentScript.hexigons[randomHexigon].trigger();

		}else if(this.lastKickVolume > 0) this.lastKickVolume -= 5;

		for(var i=0; i < this.hexigons.length; i++) {

			var pix = this.hexigons[i].drawX + this.hexigons[i].drawY/2*320

			if(pixelInRange(pix*4 + pixelBit)) {

				if(this.hexigons[i].triggerAmount > 0) this.graphics.lineStyle(2,randomPaletteColour());
				else this.graphics.lineStyle(2,0xFFFFFF);
				this.hexigons[i].draw();

			}
		}

		if(shapeSize != this.lastShapeSize) this.defineHexigonGrid();
		this.lastShapeSize = shapeSize;

	},

	drawPolygon: function(sides,centerX,centerY,radius) {
		this.graphics.moveTo(centerX  + radius*Math.cos(0), centerY + radius*Math.sin(0));
		for(var i=1; i< sides+1; i++) {
			this.graphics.lineTo(tX( centerX + radius*Math.cos(i*2*Math.PI / sides) ), tY( centerY + radius*Math.sin(i*2*Math.PI / sides )));
		}
	}

};

Hexigon = {

	x: 0,
	y: 0,
	size: 0,

	triggerAmount: 0,
	index: 0,

	drawX: 0,
	drawY: 0,

	init: function(_x, _y) {
		this.x = _x;
		this.y = _y;
		this.index = currentScript.hexigons.length-1;
	},

	draw: function() {

		var rowLength = Math.floor((240 +  100)/shapeSize);
		var tempSize = shapeSize+this.triggerAmount;

		this.drawX = this.x*shapeSize*3 + ((this.y % 2 == 0) ? shapeSize*1.5 : 0);
		this.drawY = this.y*shapeSize*0.85;

		currentScript.drawPolygon(6, this.drawX, this.drawY, tempSize);

		if(this.triggerAmount > 0) this.triggerAmount -= coolOff;
		else{
			var i = this.index;
			this.triggerAmount = this.testTrigger(this.index - 1);
			this.triggerAmount = this.testTrigger(this.index - 1);
			this.triggerAmount = this.testTrigger(this.index + 1);
			this.triggerAmount = this.testTrigger(this.index - 2);
			this.triggerAmount = this.testTrigger(this.index + 2);
			this.triggerAmount = this.testTrigger(this.index - rowLength + 1);
			this.triggerAmount = this.testTrigger(this.index - rowLength - 1);
		}
	},

	trigger: function() {
		this.triggerAmount = triggerSize;
	},
	testTrigger: function(i) {
		if(i >= 0 && i < currentScript.hexigons.length && currentScript.hexigons[i].triggerAmount > this.triggerAmount) return Math.floor(currentScript.hexigons[i].triggerAmount/1.2);
		else return this.triggerAmount;
	}
};
