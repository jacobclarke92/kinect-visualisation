effect_rain = {

	requiresOutlines: true,

	particles: [],
	
	init:function() {

		setMapping('lineThickness',1, 50, 2);
		setMapping('spawnAmount', 1, 50, 1);
		setMapping('gravity', 0.5, 15, 20);
		setMapping('wind',-12, 12, 0);
		setMapping('gust',0, 10, 2);
    	setMapping('lineAlpha', 0, 1, 1);
		setMapping('trailAmount', 0, 1, 0.2); //irrelevant
	},

	draw: function() {
		for(var i=0; i<spawnAmount; i++) {
			//clone particle
			var particle = jQuery.extend(true, {}, Droplet);
			//init particle
			particle.init();
			//add particle shape instance to PIXI stage
			stage.addChild(particle.shape);
			//add particle to array
			this.particles.push(particle);
		}
		for(var i=0; i<this.particles.length; i++) {
			this.particles[i].draw();
		}
	}
}

Droplet = {
	init: function() {

		var windOffset = Math.abs(wind*25);


		this.shape = new PIXI.Graphics();
		this.moveX = this.lastX = randRound(320 + windOffset*2) - windOffset;

		// console.log(this.moveX, tX( this.moveX ));
		this.moveY = this.lastY = 0;
		// this.lastX = 
		this.gravity = gravity + rand([0.8, 1.2]);

		this.shape.lineStyle(lineThickness, randomPaletteColour(), lineAlpha);
		this.shape.moveTo(0,0);
		this.shape.lineTo(0, -20);

		this.life = 0;

		this.splash = false;

	},

	draw: function() {

		this.life ++;

		if(this.splash) {

			this.shape.scale.x += 0.5;
			this.shape.scale.y += 0.5;
			this.shape.alpha -= 0.2;
			
			if(this.life > 3) {
				this.selfRemove();
			}

		}else{

			//update position
			this.moveX += wind;
			this.moveY += this.gravity + (this.moveY/240)*this.gravity;

			this.shape.rotation = Math.atan2( this.moveY-this.lastY, this.moveX-this.lastX ) - Math.PI/2;

			if(this.moveY > 240) this.moveY = 240;

			//position based on stage size
			this.shape.x = tX( this.moveX );
			this.shape.y = tY( this.moveY );

			//if out of bounds then clear
			if(this.moveX < -20 || this.moveX > 320+20) {
				this.selfRemove();
			}else if(this.moveY >= 240) {
				this.changeToSplash();
			//if intersecting an outline then make splash
			}else if(this.isIntersectingOutline()) {// || (this.moveX > 140 && this.moveX < 180 && this.moveY > 100)) {
				console.log('IS IN OUTLINE');
				this.changeToSplash();
			}

			this.lastX = this.moveX;
			this.lastY = this.moveY;

		}


	},

	changeToSplash: function() {

		//redraw rain line as splash 
		this.shape.clear();
		this.shape.lineStyle(lineThickness, randomPaletteColour(), lineAlpha);
		this.shape.moveTo(0,0);
		this.shape.lineTo(0, -20);
		this.shape.moveTo(0,0);
		this.shape.lineTo(-15, -10);
		this.shape.moveTo(0,0);
		this.shape.lineTo(15, -10);

		this.shape.scale.x = 0.5;
		this.shape.scale.y = 0.5;

		this.life = 0;
		this.splash = true;

	},

	isIntersectingOutline: function() {

		outlineArray = [
			[
				[140, 100],
				[180, 100],
				[180, 200],
				[140, 200]
			]
		];

		if(isset(outlineArray) && outlineArray.length > 0) {
			
			for(var n=0; n < outlineArray.length; n ++) {
				if(isPointInsidePolygon( {x: this.moveX, y: this.moveY}, outlineArray[n], true )) return true;
			}
			return false;

		}else{
			// console.log('no outline array');
			return false;
		}

	},

	selfRemove: function() {
		stage.removeChild(this.shape);
		var index = currentScript.particles.indexOf(this);
		currentScript.particles.splice(index,1);
	}
}