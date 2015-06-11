effect_smoke = {

	requiresOutlines: true,
	ignoreStageThrottle: true,

	particles: [],

	availableSpawnPoints: [],
	
	init:function() {

		setMapping('particleSize',5, 50, 18);
		setMapping('spawnAmount', 2, 50, 2);
		setMapping('gravity', 0.5, 6, 2);
		setMapping('wind',-12, 12, 0);
    	setMapping('particleAlpha', 0, 1, 1);
		setMapping('filter_blur', 0, 100, 25);
		setMapping('trailAmount', 0, 1, 0.2); //irrelevant

		var thing = [
			[
				[140, 100],
				[180, 100],
				[180, 200],
				[140, 200],
				[140, 100]
			]
		];

		// console.log('intersecting?', isPointInsidePolygon([160, 150], thing[0], true));

	},

	draw: function() {

		//clearStage();
		//this.graphics.clear();

		var skip = 4;//(outlinePointSkip < 1) ? 1 : Math.round(outlinePointSkip);

		var x,y;

		availableSpawnPoints = [];

		for(var n=0; n < outlineArray.length; n ++) {
	        outline = outlineArray[n];
	        if(outline.length > skip) {

				for(var i=0; i<outline.length-skip; i += skip) {
					if(i >= outline.length) i = outline.length-1;

					x = outline[i][0];
					y = outline[i][1];

					if(i != 0) {
						var angle = Math.atan2(outline[i][1] - outline[i-skip][1], outline[i][0] - outline[i-skip][0])*180/Math.PI;
						if((angle >= 90 && angle <= 135) || (angle <= -90 && angle >= -135)) {
							availableSpawnPoints.push([x,y]);
						}
					}

					/*
    				this.graphics.lineStyle(2,0xFFFFFF);
					if(i == 0) {
					  firstX = tX( x );
					  firstY = tY( y );
					  this.graphics.moveTo(firstX,firstY);
					}else{
						if((angle >= 90 && angle <= 135)) {
							this.graphics.lineStyle(2,0xFF0000);
						}else if((angle <= -90 && angle >= -135)) {
							this.graphics.lineStyle(2,0x00FF00);
						}
						this.graphics.lineTo(tX( x ), tY( y ));

					}
					*/
				}
				//this.graphics.lineTo( firstX , firstY );
			}
		}

		// console.log(availableSpawnPoints.length);

		skip = (spawnAmount < 1) ? 1 : Math.round(spawnAmount);
		for(var i=0; i<availableSpawnPoints.length; i+= skip) {
			if(i >= availableSpawnPoints.length) return;
			//clone particle
			var particle = jQuery.extend(true, {}, SmokeParticle);
			//init particle
			particle.init(availableSpawnPoints[i][0], availableSpawnPoints[i][1]);
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

SmokeParticle = {
	init: function(posX, posY) {

		this.shape = new PIXI.Graphics();
		this.moveX = this.lastX = posX;
		this.moveY = this.lastY = posY;

		this.gravity = gravity + rand([0.8, 1.2]);

		this.radius = randRound([particleSize-5, particleSize+5]);

		this.shape.beginFill(randomPaletteColour(), particleAlpha);
		// this.shape.lineStyle(0, 0x000000, 0);
		this.shape.drawCircle(posX, posY, this.radius);

		this.dead = false;
		this.rotateSpeed = rand([0,0.2]);

		// this.shape.alpha = 0;

	},

	draw: function() {

		this.life ++;

		if(this.life < 20) this.shape.alpha = life/20;

		
			//update position
			this.moveX += wind + (Math.random()*1 - 1);
			this.moveY -= this.gravity;

			this.shape.scale.x = this.shape.scale.y += 0.02;

			if(this.shape.alpha > 0) this.shape.alpha -= 0.02;
			else this.selfRemove();

			// this.shape.rotation += this.rotateSpeed;

			if(this.moveY < -this.radius*4 || this.moveX < -this.radius*4 || this.moveX >= 320 + this.radius*4) {
				this.selfRemove();
			}

			//position based on stage size
			this.shape.x = tX( this.moveX );
			this.shape.y = tY( this.moveY );

			this.lastX = this.moveX;
			this.lastY = this.moveY;

			if(this.life > 200) this.selfRemove();



	},

	selfRemove: function() {
		stage.removeChild(this.shape);
		var index = currentScript.particles.indexOf(this);
		currentScript.particles.splice(index,1);
	}
}