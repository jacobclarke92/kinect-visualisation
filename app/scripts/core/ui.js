
var frequencyBars;
var freqBarsCanvas;
var freqBarWidth = 1;
var freqCanvasWidth = 444;
var currentlyMappingAudio = false;
var soundThresh = 100;

var calibration_mirrored = appSettings.defaults.mirrored;
var calibration_depthThreshold = appSettings.defaults.depthThreshold;
var calibration_depthRange = appSettings.defaults.depthRange;
var calibration_perspective = appSettings.defaults.perspective;
var calibration_zoom = 1;
var calibration_rotateX = 0;
var calibration_rotateY = 0;
var calibration_offsetX = 0;
var calibration_offsetY = 0;


uiPopup = false;
function openControls() {

  //launch popup window
  uiPopup = window.open("/app/ui.html", "Controls", 'width=585,height='+screen.height+',left=0,top=0');
  uiPopup.focus();

  //wait for controls window to load
  uiPopup.onload = function() {

    frequencyBars = $('#frequencyBars',uiPopup.document).get(0);
    freqBarsCanvas = frequencyBars.getContext('2d');

    setFreqBarWidth();

    $('#openControlsToggle').hide();
    if(typeof window.palettesHtml == 'string' && window.palettesHtml != '') $('#paletteZone',uiPopup.document).html(window.palettesHtml);

  	console.info('Control window onload called');


  }
}
function setFreqBarWidth() {
  if(isset(frequencyArray)) {
    freqCanvasWidth = $(frequencyBars).width()
    freqBarWidth = freqCanvasWidth/frequencyArray.length;
  }else setTimeout(setFreqBarWidth, 1000);
}

//reopen controls if they close
function controlsClosed() {
  console.warn('controls closed!');
  uiPopup.close();
  uiPopup = false;
  setTimeout(function() {openControls()},500);
  $('#openControlsToggle').show();
}

//close controls popup on the way out ... balrog.jpg
window.onunload = function() {
  uiPopup.close();
}

function createControls() {

  // at this stage the effect should have set all the standard values
  audioMappings = [];
  if(!isset(mappings[hash]))  mappings[hash] = {};

  //handled by the UI functions 
  if(isset(uiPopup.updateEffectMappings)) {
    uiPopup.updateEffectMappings();
    console.info('controls updated');
  }else console.log('ui function updateEffectMappings not available yet...');
  

}

function updateCanvas() {
 
  console.log('updating canvas');
  //console.log(calibration_mirrored,calibration_rotateX,calibration_rotateY,calibration_offsetX,calibration_offsetY);

  var mirror = (Math.round(calibration_mirrored) == 1) ? 1 : -1;

  var transform = 'scaleX('+mirror+') rotateX('+calibration_rotateX+'deg) rotateY('+calibration_rotateY+'deg)';
  $('.effectsRenderer,#processingCanvas3D').css({
    'transform': transform
  });

  $('#contentZone').css({
    'perspective-origin': '50% 50%',
    'perspective': calibration_perspective+'px'
  });

  //set draw space is pixi_functions
  getWindowSize();
}


