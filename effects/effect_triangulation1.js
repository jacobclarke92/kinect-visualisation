effect_triangulation1 = {

  requiresOutlines: false,

  init: function() {
    setMapping('lineThickness', 0.5, 10, 1);
    setMapping('maxPointDist', 15, 85, 50);
    setMapping('maxParticles', 20, 100, 60);
    setMapping('particleSpeedVariaton', 0, 5, 0.5);
    setMapping('circleOpacity', 0, 1, 1);

    setMapping('trailAmount', 0, 1, 1);
    
  },

  spawned: false,
  particles: [],

  draw: function() {

    if(gotSound)  processAudio();


    if(gotImage) {

      if(!this.spawned) {
        //once its got an image generate all particles
        for(var i=0; i<maxParticles; i++) {
          this.spawnParticle();
        }
        this.spawned = true;
      }else{


        //once particles have been created, moderate their numbers in accordance to the maxParticles variable
        if(this.particles.length-1 > maxParticles) {
          for(var i=0; i < (this.particles.length-1)-maxParticles; i ++) {
            this.particles[i].die = true;
          }
        }else if(this.particles.length-1 < maxParticles) {
          for(var i=0; i < maxParticles-(this.particles.length-1); i ++) this.spawnParticle();
        }


      }

      for(var i=0; i < this.particles.length; i++) {
        var p1 = this.particles[i];

        for(var n=i; n < this.particles.length; n++) {
          var p2 = this.particles[n];
          var distance = dist(p1.x, p1.y, p2.x, p2.y);

          var op = (p1.opacity < p2.opacity) ? p1.opacity : p2.opacity;

          // maybeLog(r(p2.x)+', '+r(p2.y)+': '+distance);
          // maybeLog(maxPointDist+", "+(maxPointDist + kickVolume/10));

          if (distance < maxPointDist + kickVolume/30 /**(volume/800)*/) {
            
            this.graphics.lineStyle(tV( lineThickness ), 0xFFFFFF, op/2/255);
          
            this.graphics.moveTo(tX( p1.x ), tY( p1.y )) ;
            this.graphics.lineTo(tX( p2.x ), tY( p2.y )) ;

          }
        }

        if(!pixelInRange(pixels[p1.pixel*4 + pixelBit]) || p1.x < 0 || p1.y < 0 || p1.x > winW || p1.y > winH) p1.die = true;

        p1.step();

      }
      for(var i=0; i < this.particles.length; i++) {
       this.particles[i].draw();
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
    this.particles[this.particles.length-1].init(xPos1,yPos1,rand1);

  }

};


Particle = {

  init: function(_x, _y, _pixel) {
    this.opacity = 0;
    this.die = false;
    this.index = currentScript.particles.length-1;
    this.x = _x;
    this.y = _y;
    this.pixel = _pixel;
    this.speedX = rand(-particleSpeedVariaton,particleSpeedVariaton);
    this.speedY = rand(-particleSpeedVariaton,particleSpeedVariaton);
    this.colour = randomPaletteColour();
  },
  step: function() {
    if(this.die) {
      if(this.opacity > 0) this.opacity -= 15;
      else{
        this.index = currentScript.particles.indexOf(this);
        currentScript.spawnParticle();
        currentScript.particles.splice(this.index,1);
      }
    }else{
      if(this.opacity < 255) this.opacity += 15;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    this.pixel = Math.round(this.y)*320 + Math.round(this.x);

  },

  draw: function() {
    var opacity = (this.opacity/255)*circleOpacity;
    currentScript.graphics.lineStyle(2, this.colour, opacity);
    currentScript.graphics.beginFill(0x000000, opacity);
    currentScript.graphics.drawCircle(tX( this.x ), tY( this.y ), 5, 5);
    currentScript.graphics.endFill();
  }

};







      