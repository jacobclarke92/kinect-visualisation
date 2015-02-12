# Kinect Audio-Visual Effects Framework

I'm working on a system that uses kinect depth data, audio analysis and midi input to create immersive visuals -- ideal for live performances. It uses code borrowed from sstephenson/kinect for streaming kinect data via node, PIXI.js as a rendering client (delicious openGL) and node.js for kinect and midi streaming.


## Requirements
1. An old [Kinect](http://www.ebay.com/bhp/xbox-360-kinect-sensor) for starters, maybe the new ones work too I haven't tried. This isn't essential for testing purposes though.

2. [libfreenect](https://github.com/OpenKinect/libfreenect) and
[libpng](http://www.libpng.org/). I would highly recommend OS X users use [Homebrew](http://mxcl.github.com/homebrew/) to install these dependencies `brew install libfreenect libpng`. While a kinect isn't necessarily required for testing the libraries still need to exist for the script to run.

3. [Node.js](http://nodejs.org/) to run the streaming server and to install other dependencies

## Setup

Navigate to the project folder in terminal and install npm dependencies

`npm install`

Then to launch the server type

`./launcher | ./server `

You will be prompted with a list of MIDI devices if you have any plugged in/running, to select a device add something like:

`./launcher | ./server -port2`

So far I've set up the following parameters:

`-portX` selects the approriate MIDI port (the ports are listed when the script is run)

`-skipmidi` don't even listen for MIDI, if you see a `Segmentation fault 11` message then add this

`-skipcolours` doesn't attempt to download the top colour palettes from [Colour Lovers](http://colourlovers.com)

`-quick` skips the countdown for the node server start up


If all has gone as expected and you're using a kinect you should see a stream of a data running in terminal after a few seconds. Otherwise simply a countdown to node server launch.
The node server will be running at 

`http://localhost:5600/`


## Notes

Obviously enable popups. I use chrome but it should work for any browser (tested and working in firefox). I wish there were a way to permanently allow a site to access microphone in chrome... Allowallwoalwowlawoalwawoalwoaw

For audio you can use your microphone but I highly recommend getting [Soundflower](https://rogueamoeba.com/freebies/soundflower/), which allows you to stream system audio as an audio input. Once installed just set system output and input to `Soundflower (2ch)` open `Soundflowerbed` and select 'Build-in Output' from the flower icon in the tray.

I was originally running Processing.js but the performance was atrocious so I went with PIXI.js instead. No 3D now but the 2D effects are enough and translate well when projected directly onto a person.

If you want to try making your own effects create the file `effect_youreffect.js` in the `effects` folder and append it to the `effects` array in `index.html` (in the todos to automatically compile a list of a files)

Once I'm happy with this I'll start making documentation but for now it is what it is, feel free to message me questions.


-----

Copyright &copy; 2015 Jacob Clarke.

Released under the MIT License.
