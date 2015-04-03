#TODO

### General operations
See my [Trello board](https://trello.com/b/mIdudIqQ/kinect-visualisation)

### Immediate, concerning functionality

* Get the node server working on windows / find a solution to stream [intrael](https://code.google.com/p/intrael/) seems very promising
* Potentially switch from image streaming to raw depth data for higher depth precision than 0-255 [this](http://blog.mackerron.com/2012/02/03/depthcam-webkinect/) seems like a good solution
* Beat detection / BPM punch in for more reliable audio cues?

### Future endeavours
* Build a kaleidoscope openGL effect [refer to this](http://stackoverflow.com/questions/13739901/vertex-kaleidoscope-shader)
* Pull a few new filter effects from the [DEV branch of PIXI](https://github.com/GoodBoyDigital/pixi.js/tree/dev/src/filters) such as bloom, tiltshift, shockwave
* Look into using [Matter.js](http://brm.io/matter-js/) for sweet sweet physics-based effects
* Make a heap of effects!

### Effects ideas
* Tree branches spawn from outline angles / spirals 
* [lightning](http://gamedevelopment.tutsplus.com/tutorials/how-to-generate-shockingly-good-2d-lightning-effects--gamedev-2681)
* Rain effect -- particles with splash
* Cut up outline into pieces and offset in, jagged glitchy manner
* Spread lines out from center of person 