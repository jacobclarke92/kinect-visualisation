#TODO

### Immediate, concerning functionality
* Ensure MIDI mapping is still working since moving to PIXI.js
* Switch npm midi package to use [web-midi-api](https://www.npmjs.com/package/web-midi-api) for future windows compatabiltiy
* Get the node server working on windows / find a solution to stream [intrael](https://code.google.com/p/intrael/) seems very promising
* Potentially switch from image streaming to raw depth data for higher depth precision than 0-255 [this](http://blog.mackerron.com/2012/02/03/depthcam-webkinect/) seems like a good solution



### Future endeavours
* Look into using [Matter.js](http://brm.io/matter-js/) for sweet sweet physics-based effects
* Implement a more robust method of getting outlines -- [blob detection](http://blog.acipo.com/blob-detection-js/)
* Tap into PIXI.js's ability to use [openGL filters](http://www.goodboydigital.com/pixijs/examples/15/indexAll.html) -- especially RGB spltting and displacement 
* Make a heap of effects!

* Expand upon audio/FFT anaysis
	* make a frequency spectrum output in the controls window for range selection
	* implement a way to map frequency ranges to other variables -- similar to how VJ program Resolume works