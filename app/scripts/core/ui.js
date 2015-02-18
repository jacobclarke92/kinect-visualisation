

var frequencyBars;
var freqBarsCanvas;


uiPopup = false;
function openControls() {

  //launch popup window
  uiPopup = window.open("/app/ui.html", "Controls", 'width=524,height='+screen.height+',left=0,top=0');
  uiPopup.focus();

  //wait for controls window to load
  uiPopup.onload = function() {

    frequencyBars = $('#frequencyBars',uiPopup.document).get(0);
    freqBarsCanvas = frequencyBars.getContext('2d');

    $('#leftSlider',uiPopup.document).css('left',soundRange[0]+'px');
    $('#rightSlider',uiPopup.document).css('left',soundRange[1]+'px');

    if(typeof uiPopup.controlsLoaded != 'undefined') $('#openControlsToggle').hide();
    if(typeof window.palettesHtml == 'string' && window.palettesHtml != '') $('#paletteZone',uiPopup.document).html(window.palettesHtml);

  	console.log('control window loaded now!');


  }
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
  if(!mappings[hash])  mappings[hash] = {};

  //handled by the UI functions 
  if(isset(uiPopup.initAllParameters)) {
    uiPopup.initAllParameters();
    console.info('controls updated');
  }else console.log('ui function generateEffectParams not available yet...');
  

}



calibration_mirrored = calibration_zoom = 1;
calibration_rotateX = calibration_rotateY = calibration_offsetX = calibration_offsetY = 0;
var calibration_depthThreshold = 145;
var calibration_depthRange = 50;
var calibration_perspective = 800;

function updateCanvas() {
 
  console.log('updating canvas');
  //console.log(calibration_mirrored,calibration_rotateX,calibration_rotateY,calibration_offsetX,calibration_offsetY);

  var transform = 'scaleX('+calibration_mirrored+') rotateX('+calibration_rotateX+'deg) rotateY('+calibration_rotateY+'deg)';
      transform += ' translate('+calibration_offsetX+'px,'+calibration_offsetY+'px)';
  $('.effectsRenderer,#processingCanvas3D').css({
    'zoom': calibration_zoom,
    'transform': transform
  });

  var h = 480*calibration_zoom;
  $('#contentZone').css({
    'perspective-origin': '50% '+(h/2),
    'perspective': calibration_perspective+'px',
    'padding-bottom': calibration_offsetY+'px'
  });
}


