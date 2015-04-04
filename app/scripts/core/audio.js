
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
	analyserNode.fftSize = audioSampleSize;
	console.log('fft size = '+analyserNode.fftSize);
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
var gainAmount = 1;

var bass;
var bassLastVal = 0;
var audioTriggerCoolOff = 20;
var audioTriggerFadeRate = 1.5; //division
var audioTriggerKnee = 20; // amount it must be increased by to trigger
var bassCount = 0;


var threshMultiplier = 2;

function processAudio() {

	if(gotSound && showFrequencyData && typeof frequencyArray == 'object') {

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
				var barHeight = frequencyArray[i]/2*gainAmount;

				//disperse the bars pseudo-logarithmically so bass frequencies are more visible
				var barWidth = Math.floor(freqBarWidth*8 - i/4);

				//var barWidth = 20 - i;
				if(barWidth < 1) barWidth = 1;

				var minX = soundRange[0]/100*freqCanvasWidth;
				var maxX = soundRange[1]/100*freqCanvasWidth;

				if(currentlyMappingAudio && x+barWidth >= minX && x+barWidth <= maxX) {

					if(barHeight > soundThresh*threshMultiplier) freqBarsCanvas.fillStyle = 'rgb(50, ' + (barHeight+100) + ', 50)';
					else freqBarsCanvas.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
					currentFreqRangeVolume += barHeight;
					freqCount ++;
				}else{

					freqBarsCanvas.fillStyle = 'rgb(' + (barHeight+50) + ','+(barHeight+50)+','+(barHeight+50)+')';
				}

				if(uiPopup.mappingAudio || i%10 == 1) {
					
					freqBarsCanvas.fillRect(Math.round(x), Math.round(200-barHeight), Math.round(barWidth), Math.round(barHeight)); 
				}
				

				if(audioMappings.length > 0) {
					// console.log(audioMappings.length);
					for(var n=0; n< audioMappings.length; n++) {
						minX = audioMappings[n].audio.range[0]/100*freqCanvasWidth;
						maxX = audioMappings[n].audio.range[1]/100*freqCanvasWidth;
						if( x+barWidth >= minX  && x+barWidth <= maxX) {
							if(!isset(audioMappings[n].audio.freqCount)) {

								audioMappings[n].audio.freqCount = 0;
								audioMappings[n].audio.rangeLevel = 0;
								audioMappings[n].audio.peakCount = 0;
								audioMappings[n].audio.peakLevel = 0;
								audioMappings[n].audio.rangePeak = 0;
								audioMappings[n].audio.minX = minX;
							}
							if(200-barHeight < audioMappings[n].audio.soundThresh*threshMultiplier) {

								if(barHeight > audioMappings[n].audio.rangePeak) audioMappings[n].audio.rangePeak = barHeight;
								audioMappings[n].audio.peakLevel += barHeight;
								audioMappings[n].audio.peakCount ++;
							}
							audioMappings[n].audio.freqCount ++;
							audioMappings[n].audio.rangeLevel += barHeight;

						}else if(x > maxX && isset(audioMappings[n].audio.freqCount) && !isset(audioMappings[n].audio.maxX)) audioMappings[n].audio.maxX = maxX;
					}
				}



				x += barWidth;
			}

			for(var n=0; n < audioMappings.length; n++) {

				var param = audioMappings[n];

				//mapping saved correctly
				if(isset(param.audio.rangeLevel) && isset(param.audio.freqCount)) {

					var averageLevel = param.audio.rangeLevel/param.audio.freqCount;
					var difference = averageLevel - param.audio.soundThresh*2;

					var paramName = param.name.split('_knob').join('');
					if(!isset(mappings[hash][paramName])) console.log(paramName,' not defined yet');

					if(difference > 0) freqBarsCanvas.fillStyle = 'rgba(255, 255, 255, '+(0.1 + difference/200)+')';


					//range of original param
					var range = mappings[hash][paramName].midi.max - mappings[hash][paramName].midi.min;
					//audio knob value
					var audioInfluence = mappings[hash][param.name].midi.value;
					var stepAmount = reduceToOne(audioInfluence) * range/100;
					var val = mappings[hash][paramName].midi.value;
					if(param.audio.type == 'average') {

						//sets the primary param's postValue to its value plus its range times the difference over threshold
						if(difference > 0) {
							val += (audioInfluence * difference/100);
						}

						//this eases the value back to its default rather than jumping sharply
						if((val > mappings[hash][paramName].midi.postValue-stepAmount && audioInfluence > 0) ||
						   (val < mappings[hash][paramName].midi.postValue-stepAmount && audioInfluence < 0) ||
						   Math.round(mappings[hash][paramName].midi.postValue) == val) {
							mappings[hash][paramName].midi.postValue = val;
						}else{
							mappings[hash][paramName].midi.postValue -= stepAmount;
						}
						window[paramName] = mappings[hash][paramName].midi.postValue;

					}else if(param.audio.type == 'trigger') {

						//if we're ready for a new trigger and the time is right, go ahead
						if(difference > 0 && param.audio.coolOff <= 0 && averageLevel - param.audio.lastAverageLevel > audioTriggerKnee) {
								
							//sets the trigger value to the range times the audio knob value (-1 to 1)
							console.log('audio mapping triggered!', param.name, audioInfluence, range*(audioInfluence/100));
							param.audio.coolOff = audioTriggerCoolOff;

							audioMappings[n].audio.triggerValue = range*(audioInfluence/100);
							mappings[hash][paramName].midi.postValue = val + audioMappings[n].audio.triggerValue;

							audioMappings[n].audio.coolOff = audioTriggerCoolOff;

							freqBarsCanvas.fillStyle = 'rgba(255, 80, 80, 1)';

						//otherwise ease back to current value if it's greater
						}else {

							if((mappings[hash][paramName].midi.postValue - stepAmount > val && audioInfluence > 0) || 
							   (mappings[hash][paramName].midi.postValue - stepAmount < val && audioInfluence < 0)) {
								mappings[hash][paramName].midi.postValue -= stepAmount;
							}else{
								mappings[hash][paramName].midi.postValue = val;
							}
							/*
							mappings[hash][paramName].midi.postValue = mappings[hash][paramName].midi.value + audioMappings[n].audio.triggerValue;
							audioMappings[n].audio.lastAverageLevel = averageLevel;
							if(isset(audioMappings[n].audio.triggerValue) && audioMappings[n].audio.triggerValue != 0) {
								audioMappings[n].audio.triggerValue /= audioTriggerFadeRate;
								if(Math.round(audioMappings[n].audio.triggerValue) == 0) audioMappings[n].audio.triggerValue = 0;
								// console.log('postmidi: ',mappings[hash][paramName].midi.postValue);
								window[paramName] = mappings[hash][paramName].midi.postValue;
							}
							*/
						}
						window[paramName] = mappings[hash][paramName].midi.postValue;
						if(param.audio.coolOff > 0) audioMappings[n].audio.coolOff --;
					}


					freqBarsCanvas.fillRect(param.audio.minX, 0, param.audio.maxX-param.audio.minX, 200);



					freqBarsCanvas.beginPath();
					freqBarsCanvas.strokeStyle = 'rgb(255,255,255)';
					freqBarsCanvas.moveTo(param.audio.minX, Math.round(200-param.audio.soundThresh*threshMultiplier));
					freqBarsCanvas.lineTo(param.audio.maxX, Math.round(200-param.audio.soundThresh*threshMultiplier));
					freqBarsCanvas.stroke();

					freqBarsCanvas.beginPath();
					freqBarsCanvas.strokeStyle = 'rgb(80,80,255)';
					freqBarsCanvas.moveTo(param.audio.minX, Math.round(200-averageLevel));
					freqBarsCanvas.lineTo(param.audio.maxX, Math.round(200-averageLevel));
					freqBarsCanvas.stroke();
					audioMappings[n].audio.freqCount = undefined;

				}else{
					conole.log(param.audio.rangeLevel, param.audio.freqCount);
				}

			}

			//draw guidelines while mapping
			if(uiPopup.mappingAudio) {

				freqBarsCanvas.beginPath();
				freqBarsCanvas.strokeStyle = 'rgb(255,255,255)'   ;
				freqBarsCanvas.moveTo(minX,200);
				freqBarsCanvas.lineTo(minX,0);
				freqBarsCanvas.moveTo(maxX,200);
				freqBarsCanvas.lineTo(maxX,0);
				freqBarsCanvas.moveTo(0,200-soundThresh*threshMultiplier);
				freqBarsCanvas.lineTo(freqCanvasWidth,200-soundThresh*threshMultiplier);
				freqBarsCanvas.stroke();
			}

			currentFreqRangeVolume /= freqCount;
		}
	}

}