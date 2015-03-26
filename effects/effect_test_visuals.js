effect_test_visuals = {


	// this effect utilizes pixi's shape classes and creates stored objects rather than a storing all recent graphic frames
	
	particles: [],

	init: function() {
    	setMapping('spawnAmount', 1, 50, 10);
    	setMapping('shapeSize', 1, 200, 100);
		setMapping('trailAmount', 0, 1, 0.2);
	},

	draw: function() {
		for(var n=0; n < spawnAmount; n ++) {
			var particle = jQuery.extend(true, {}, Particle);
			particle.init();
			stage.addChild(particle.shape)
			this.particles.push(particle);			
		}
		for(var i=0; i<this.particles.length; i++) {
			this.particles[i].draw();
		}
	}

}

Particle = {
	init: function() {
		this.shape = new PIXI.Graphics();
		this.shape.pivot.x = this.shape.pivot.y = 0;
		this.shape.x = Math.round(Math.random()*640);
		this.shape.y = Math.round(Math.random()*480);
		this.shape.alpha = 0;
		this.shape.scale.x = this.shape.scale.y = shapeSize/100;

		this.color = randomPaletteColour();
		this.size = Math.round(Math.random()*200)+20;

		this.shape.beginFill(this.color);
		switch(Math.floor(Math.random()*3)) {
			case 0: this.shape.drawRect(-this.size/2, -this.size/2, this.size, this.size);
			break;
			case 1: this.shape.drawCircle(0, 0, this.size/2);
			break;
			case 2: 
				this.shape.moveTo(Math.cos(0)*(this.size/2), Math.sin(0)*(this.size/2));
				this.shape.lineTo(Math.cos(2.094)*(this.size/2), Math.sin(2.094)*(this.size/2));
				this.shape.lineTo(Math.cos(4.188)*(this.size/2), Math.sin(4.188)*(this.size/2));
			break;
		}
		this.shape.endFill();
		
		this.shape.rotation = Math.random()*Math.PI;
	},
	draw: function() {
		this.shape.scale.x = this.shape.scale.y -= 0.01;
		if(this.shape.alpha < 1) this.shape.alpha += 0.05;
		if(this.shape.scale.x <= 0) {
			stage.removeChild(this.shape);
			var index = currentScript.particles.indexOf(this);
			currentScript.particles.splice(index,1);
		}
	}
}