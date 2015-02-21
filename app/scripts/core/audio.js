
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