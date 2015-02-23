
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var analyserNode;
var javascriptNode;
if(typeof audioSampleSize == 'undefined') audioSampleSize = 1024;
var amplitudeArray;     // array to hold frequency data
var frequencyArray;
var audioStream;

var volume = 0;

var gotSound = false;
var showFrequencyData = true;
var showFrequencyDataSkip = 1;
var soundRange = [0,177];
var currentFreqRangeVolume;
var audioMappings = [];



var session = {
	audio: true,
	video: false
};
var recordRTC = null;
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

function attemptUseMic() {
	navigator.getUserMedia(session, setupAudioNodes, function() {
		console.warn('dicks... mic error, trying again');
		gotSound = false;
		setTimeout(attemptUseMic,2000);
	});
}
attemptUseMic();

var initedControlsFreq = false;

function setupAudioNodes(stream) {

	console.info('mic conencted!');
	gotSound = true;
	$('#soundCheck',uiPopup.document).removeClass('error');

	sourceNode = audioContext.createMediaStreamSource(stream);
	audioStream = stream;

	analyserNode = audioContext.createAnalyser();
	console.warn('fft size = '+analyserNode.fftSize);
	// analyserNode.fftSize = 256;
	analyserNode.fftSize = audioSampleSize;
	console.warn('fft size = '+analyserNode.fftSize);
	analyserNode.smoothingTimeConstant = 0.5;
	javascriptNode = audioContext.createScriptProcessor(audioSampleSize, 1, 1);

	javascriptNode.onaudioprocess = function () {

		if(!gotSound) gotSound = true;

			amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
			analyserNode.getByteTimeDomainData(amplitudeArray);

			frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);
			analyserNode.getByteFrequencyData(frequencyArray);

			volume = 0;
			for(var i=0; i < amplitudeArray.length; i++) {
				volume += Math.abs(amplitudeArray[i]-128);
			}

	}

	sourceNode.connect(analyserNode);
	analyserNode.connect(javascriptNode);
	javascriptNode.connect(audioContext.destination);

}



var kickVolume = 0;


var bass;
var bassLastVal = 0;
var bassCoolOff = 5;
var bassCount = 0;

function processAudio() {

	if(gotSound && showFrequencyData && typeof frequencyArray != 'undefined' && typeof frequencyArray.length != 'undefined') {
		
		if(freqBarsCanvas) {

			var n=0;

			freqBarsCanvas.fillStyle = 'rgb(0, 0, 0)';
			freqBarsCanvas.fillRect(0, 0, freqCanvasWidth, 200);

			currentFreqRangeVolume = 0;
			var freqCount = 0;

			var x = 0;

			var currentAudioMapping = 0;

			for(var i=0; i<frequencyArray.length; i+= showFrequencyDataSkip) {
				n++;
				var barHeight = frequencyArray[i];

				//disperse the bars pseudo-logarithmically so bass frequencies are more visible
				var barWidth = Math.floor(freqBarWidth*8 - i/4);

				//var barWidth = 20 - i;
				if(barWidth < 1) barWidth = 1;

				var minX = soundRange[0]/100*freqCanvasWidth;
				var maxX = soundRange[1]/100*freqCanvasWidth;
				minX -= minX/weirdDivisionFixMin;
				maxX -= maxX/weirdDivisionFixMax;

				// console.log(soundRange[0]*freqBarWidth,soundRange[1]*freqBarWidth);
				if(currentlyMappingAudio && x+barWidth >= minX && x+barWidth <= maxX) {

					// console.log(soundRange[0]*freqBarWidth,soundRange[1]*freqBarWidth);

					if(200-barHeight/2 < soundThresh*weirdDivisionFixThresh) freqBarsCanvas.fillStyle = 'rgb(50, ' + (barHeight+100) + ', 50)';
					else freqBarsCanvas.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
					currentFreqRangeVolume += barHeight;
					freqCount ++;
				}else freqBarsCanvas.fillStyle = 'rgb(' + (barHeight+50) + ','+(barHeight+50)+','+(barHeight+50)+')';

				freqBarsCanvas.fillRect(x, 200-barHeight/2, barWidth, barHeight/2); 
				

				if(audioMappings.length > 0) {
					for(var n=0; n< audioMappings.length; n++) {
						minX = audioMappings[n].audio.range[0]/100*freqCanvasWidth;
							maxX = audioMappings[n].audio.range[1]/100*freqCanvasWidth;
							minX -= minX/weirdDivisionFixMin;
							maxX -= maxX/weirdDivisionFixMax;
						if( x+barWidth >= minX  && x+barWidth <= maxX) {
							if(!isset(audioMappings[n].audio.freqCount)) {
								audioMappings[n].audio.freqCount = 0;
								audioMappings[n].audio.rangeLevel = 0;
								audioMappings[n].audio.minX = minX
							}
							if(200-barHeight/2 < audioMappings[n].audio.soundThresh*weirdDivisionFixThresh) {
								audioMappings[n].audio.freqCount ++;
								audioMappings[n].audio.rangeLevel += barHeight;
							}

						}else if(x > maxX && isset(audioMappings[n].audio.freqCount) && !isset(audioMappings[n].audio.maxX)) audioMappings[n].audio.maxX = maxX;
					}
				}



				x += barWidth;
			}

			for(var n=0; n< audioMappings.length; n++) {

				audioMappings[n].audio.averageLevel = audioMappings[n].audio.rangeLevel/audioMappings[n].audio.freqCount;
				var difference = audioMappings[n].audio.averageLevel - audioMappings[n].audio.soundThresh;
				// difference = (difference < 0) ? 0 : difference;

				if(difference > 0) {
					freqBarsCanvas.fillStyle = 'rgba(255, 255, 255, '+(difference/300)+')';
					freqBarsCanvas.fillRect(audioMappings[n].audio.minX, 0, audioMappings[n].audio.maxX, 200);
				}

				freqBarsCanvas.beginPath();
				freqBarsCanvas.strokeStyle = 'rgb(255,255,255)';
				freqBarsCanvas.moveTo(audioMappings[n].audio.minX, 200-audioMappings[n].audio.soundThresh);
				freqBarsCanvas.lineTo(audioMappings[n].audio.maxX, 200-audioMappings[n].audio.soundThresh);
				freqBarsCanvas.stroke();
				freqBarsCanvas.beginPath();
				freqBarsCanvas.strokeStyle = 'rgb(80,80,255)';
				freqBarsCanvas.moveTo(audioMappings[n].audio.minX, 200-audioMappings[n].audio.averageLevel);
				freqBarsCanvas.lineTo(audioMappings[n].audio.maxX, 200-audioMappings[n].audio.averageLevel);


				audioMappings[n].audio.freqCount = undefined;

			}

			//draw guidelines while mapping
			if(currentlyMappingAudio) {
				freqBarsCanvas.beginPath();
				freqBarsCanvas.strokeStyle = 'rgb(255,255,255)'   ;
				freqBarsCanvas.moveTo(minX,200);
				freqBarsCanvas.lineTo(minX,0);
				freqBarsCanvas.moveTo(maxX,200);
				freqBarsCanvas.lineTo(maxX,0);
				freqBarsCanvas.moveTo(0,soundThresh*weirdDivisionFixThresh);
				freqBarsCanvas.lineTo(freqCanvasWidth,soundThresh*weirdDivisionFixThresh);
				freqBarsCanvas.stroke();
			}

			currentFreqRangeVolume /= freqCount;
		}
	}





	/* OLD CODE THAT WILL SOON BE DELETED */

	if(typeof frequencyArray == 'undefined') return false;

	//never really gets over 1000
	bass = 0;
	var counter = frequencyArray.length;
	if(counter > 380) counter = 380;
	counter = 4;

	for(var i=0; i<counter; i++) bass += frequencyArray[i];

	bassCount ++;
	if(bassCount > bassCoolOff && bass > 850 && bass-bassLastVal > 60) {

		// console.log('kick');
		bassCount = 0;

		kickVolume = bass;

	}
	bassLastVal = bass;
	kickVolume = (kickVolume < 0) ? 0 : kickVolume-100;

}