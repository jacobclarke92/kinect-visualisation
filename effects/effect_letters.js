effect_letters = {
	
	particles: [],
	spawned: false,

	init:function() {
    	setMapping('maxParticles', 10, 1000, 150);
    	setMapping('letterSize', 5, 100, 20);
    	setMapping('sizeVariation', 0.05, 1.0, 0.5);
    	// setMapping('trailAmount', 0, 100, 50);
    	setMapping('lifespan', 50, 500, 50);
	},
	draw:function() {

		if(gotImage) {

			if(!this.spawned) {
				//once its got an image generate all particles
				for(var i=0; i<maxParticles; i++) {
					this.spawnParticle();
				}
				this.spawned = true;
			}else{

				if(this.particles.length-1 > maxParticles) {
				  for(var i=0; i < (this.particles.length-1)-maxParticles; i ++) {
				    // console.log(i,this.particles[i].index);
				    // this.particles.splice(this.particles[i].index,1);
				    this.particles[i].die = true;
				  }
				}else if(this.particles.length-1 < maxParticles) {
				  for(var i=0; i < maxParticles-(this.particles.length-1); i ++) this.spawnParticle();
				}
			}

			for(var i=0; i < this.particles.length; i++) {
    			var p1 = this.particles[i];

    			if(!pixelInRange(pixels[p1.pixel*4 + pixelBit])/* || p1.x < 0 || p1.y < 0 || p1.x > winW || p1.y > winH*/) p1.die = true;

    			p1.draw();

    		}
		}
	},

	spawnParticle: function() {

		var rand1 = Math.floor(Math.random()*(320*240));
		var count = 0;
		while(!pixelInRange(pixels[rand1*4 + pixelBit]) && ++count < breakLoop) rand1 = Math.floor(Math.random()*(320*240));
		if(count >= breakLoop) return false;

		var yPos1 = Math.floor(rand1/320);
		var xPos1 = (rand1 % 320);

		//makes a clone rather than an association
		this.particles.push( jQuery.extend(true, {}, Particle) );

		// maybeLog(this.particles[this.particles.length-1]);
		this.particles[this.particles.length-1].init(xPos1, yPos1, rand1);

  }

}

var letters = ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m'];

Particle = {

	init:function(_x, _y, _pixel) {
		this.pixel = _pixel;
    	this.die = false;
    	this.dieCount = 100+Math.round(Math.random()*lifespan);

    	var letter = letters[Math.floor(Math.random()*letters.length)];
    	letter = (Math.random() > 0.5) ? letter.toUpperCase() : letter;
    	var size = Math.ceil( letterSize*(Math.random()*sizeVariation) );

    	this.letter = new PIXI.Text(letter, { font: size+"px sans-serif", fill: "white", align: "left" });
    	// console.log(this.letter);
    	this.letter.x = tX( _x );
    	this.letter.y = tY( _y );
    	this.letter.alpha = 0;
    	stage.addChild(this.letter);


	},
	draw: function() {
		if(!this.die) {
			if(this.letter.alpha < 1) this.letter.alpha += 0.05;
			else if(--this.dieCount <= 0) this.die = true;
		}else{
			if(this.letter.alpha > 0) this.letter.alpha -= 0.05;
			else{
				stage.removeChild(this.letter);
				this.index = currentScript.particles.indexOf(this);
				currentScript.spawnParticle();
				currentScript.particles.splice(this.index,1);

			}
		}
		
	}

};