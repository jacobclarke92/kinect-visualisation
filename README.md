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

Enable popups. I use chrome and it works on firefox. I wish there were a way to permanently allow a site to access microphone in chrome... Allowallwoalwowlawoalwawoalwoaw

For audio you can use your microphone but I highly recommend getting [Soundflower](https://rogueamoeba.com/freebies/soundflower/), which allows you to stream system audio as an audio input. Once installed just set system output and input to `Soundflower (2ch)` open `Soundflowerbed` and select 'Built-in Output' from the flower icon in the tray.

I was originally running Processing.js but the performance was atrocious so I went with PIXI.js instead. No 3D now but the 2D effects are enough and translate well when projected directly onto a person.

If you want to try making your own effects create the file `effect_youreffect.js` in the `effects` folder and append it to the `effects` array in `index.html` (in the todos to automatically compile a list of a files)

Once I'm happy with this I'll start making documentation but for now it is what it is, feel free to message me questions.


-----

Copyright &copy; 2015 Jacob Clarke.

Released under the MIT License.
