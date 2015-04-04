# Kinect Audio-Visual Effects Framework

I'm working on a system that uses kinect depth data, audio analysis and midi input to create immersive visuals -- ideal for live performances. It uses code borrowed from sstephenson/kinect for streaming kinect data via node, PIXI.js as a rendering client (delicious openGL) and node.js for kinect and midi streaming.


## Requirements
1. An old [Kinect](http://www.ebay.com/bhp/xbox-360-kinect-sensor) for starters, maybe the new ones work too I haven't tried. This isn't essential for testing purposes though.

2. [libfreenect](https://github.com/OpenKinect/libfreenect) and
[libpng](http://www.libpng.org/). I would highly recommend OS X users use [Homebrew](http://mxcl.github.com/homebrew/) to install these dependencies `brew install libfreenect libpng`. While a kinect isn't necessarily required for testing, the libraries still need to exist for the script to run.

3. [Node.js](http://nodejs.org/) to run the streaming server and to install other dependencies

## Setup

Navigate to the project folder in terminal and install npm dependencies

`npm install`

The app requires Browserify installed globally so run the command

`npm install browserify -g` or if that doesn't work `sudo npm install browserify -g` 

Then to launch the server type

`./launcher | ./server `

You will be prompted with a list of MIDI devices if you have any plugged in/running (the first one will be selected if no command is provided), to select a device add something like:

`./launcher | ./server -port2`

So far I've set up the following parameters:

`-portX` selects the approriate MIDI port

`-skipmidi` don't even listen for MIDI, use this if you have no midi devices plugged in

`-skipkinect` you don't really need this as the kinect middleware dies gracefully, but just in case

`-skipcolours` doesn't attempt to download the top colour palettes from [Colour Lovers](http://colourlovers.com)

`-devmode` watches for changes in .less and specific .js files and recompiles accordingly

`-verbose` logs out extra information

`-autolaunch` opens chrome window in full screen as soon as server starts, only works if chrome isn't open


The node server will be running at 

`http://localhost:5600/`


## Notes

Enable popups. I've built it with chrome in mind and it seems work just fine on firefox.

For audio you can use your microphone but I highly recommend getting [Soundflower](https://rogueamoeba.com/freebies/soundflower/), which allows you to stream system audio as an audio input. Once installed just set system output and input to `Soundflower (2ch)` open `Soundflowerbed` and select 'Built-in Output' from the flower icon in the tray.

If you want to try making your own effects create the file `effect_youreffect.js` in the `effects`. You will need to rerun the server script for it to scan the effects folder again. I will write documentation for it soon.

In terms of automation I've had great success with BetterTouchTool, where I'll chain lots of window commands and keyboard shortcut injection to launch the browser stuff just how I want it (even position mouse over the allow microphone button). Would highly recommend.


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
* Look into chrome's --kiosk mode, properly separate UI from Core so that it could even be run remotely from a device.

### Effects ideas
* Tree branches spawn from outline angles / spirals 
* [lightning](http://gamedevelopment.tutsplus.com/tutorials/how-to-generate-shockingly-good-2d-lightning-effects--gamedev-2681)
* Rain effect -- particles with splash
* Cut up outline into pieces and offset in, jagged glitchy manner
* Spread lines out from center of person 
* Look into using [Matter.js](http://brm.io/matter-js/) for sweet sweet physics-based effects

-----

Copyright &copy; 2015 Jacob Clarke.
