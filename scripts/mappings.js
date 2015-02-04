Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var frequencyBars;
var freqBarsCanvas;

controlsPopup = false;
function openControls() {
    controlsPopup = window.open("controls.html", "Controls", 'width=524,height='+screen.height+',left=0,top=0');
    controlsPopup.focus();



    setTimeout(function() {
      
      frequencyBars = $('#frequencyBars',controlsPopup.document).get(0);
      // console.log(frequencyBars);
      freqBarsCanvas = frequencyBars.getContext('2d');

      $('#leftSlider',controlsPopup.document).css('left',soundRange[0]+'px');
      $('#rightSlider',controlsPopup.document).css('left',soundRange[1]+'px');

      /*
      var id = currentPalette ? currentPalette.id : paletteID ? paletteID : false;
      console.log('paletteID: ',id);
      if(id) {
        // console.log(id);
        console.log($('#'+id,controlsPopup.document));
        $('#'+id,controlsPopup.document).addClass('active');
      }
      */

      if(typeof controlsPopup.controlsLoaded != 'undefined') $('#openControlsToggle').hide();


      if(typeof window.palettesHtml == 'string' && window.palettesHtml != '') $('#paletteZone',controlsPopup.document).html(window.palettesHtml);
      
      if(typeof mappings['controls'] == 'undefined') {
        mappings['controls'] = [];
        $('#canvasControls tr, #renderEffectsControls tr', controlsPopup.document).each(function(index,elem) {
          
          if($('td',elem).length > 3) {
            var id = $('td:eq(3) input',elem).attr('data-id');
            // var name = $('td',elem).get(0).innerHTML;
            var name = $('td:eq(1) input',elem).attr('id');
            var min = $('td:eq(1) input',elem).attr('min');
            var max = $('td:eq(1) input',elem).attr('max');
            var val = $('td:eq(1) input',elem).attr('value');

            
            mappings['controls'][id] = {};
            mappings['controls'][id]['name'] = name;
            mappings['controls'][id]['cc'] = -1;
            mappings['controls'][id]['min'] = parseFloat(min);
            mappings['controls'][id]['max'] = parseFloat(max);
            mappings['controls'][id]['value'] = parseFloat(val);

            // console.info($('td',elem).eq(0).html());

            $('td',elem).each(function(index2, elem2) {
              
            })
          }else{
            console.info('not long enough -- checkbox or other');
          }
          
        });
      }


    },2500);
}
function controlsClosed() {
  console.warn('controls closed!');
  controlsPopup.close();
  controlsPopup = false;
  setTimeout(function() {openControls()},500);
  $('#openControlsToggle').show();
}
window.onunload = function() {
  controlsPopup.close();
}


function keyPressed(event) {
  var chCode = ('charCode' in event) ? event.charCode : event.keyCode;
  if(chCode >= 48 && chCode <= 57) {
    if(chCode == 48) chCode += 10;
    var num = chCode-49;

    if(num <= effects.length-1) {
      console.info("loading from key: "+num);
      changeScript(effects[num]);
    }else{
      console.log('key pressed is greater than number of effects');
    }

  }
  // console.info ("The Unicode character code is: " + chCode);
}



var mappings = {};

var lastCC = false;
var prompting = false;


function setMapping(variable, minimum, maximum, _default) {

  // console.log(mappings);
  var isSet = isMappingSet('name',variable);

  console.log('hash: '+hash+', key to set: '+variable, isSet);
  if(isSet == -1) {

    // createMapping(variable, minimum, maximum, _default);
    mappings[hash].push({name: variable, min: minimum, max: maximum, value: _default, cc: -1} );
    window[variable] = _default;

  }else{

    console.log('setting window variable ~'+mappings[hash][isSet]['name']+'~ from mappings: '+mappings[hash][isSet]['value']);
    window[variable] = mappings[hash][isSet]['value'];

  }
}



//if it doesn't find 
function isMappingSet(key,val) {
  // console.log('checking if mapping is set');
  if(Object.size(mappings) > 0) {
    for(var i=0; i < mappings[hash].length; i++) {
      // console.warn(mappings[hash][i][key]+' == '+val+'?');
      if(mappings[hash][i][key] == val) return i;
    }
    if(typeof mappings['controls'] != 'undefined') {
      for(var i=0; i < mappings['controls'].length; i++) {
        // console.warn(mappings[hash][i][key]+' == '+val+'?');
        if(mappings['controls'][i] && 
        mappings['controls'][i][key] == val) {
          mappingCanvasControl = true;
          return i;
        }
      }
    }
  }//else console.log('no mappings length hey', mappings);
  return -1;

}

function updateMappings(byteArray) {

  var tempHash = (mappingCanvasControl) ? 'controls' : hash;

  //midi signal: command, CC, value

  //midi signal 176-191 = cc control from midi channel 1-16
  if(byteArray[0] >= 176 && byteArray[0] <= 191 && !prompting) {

    if(mappingCC) {
      //SAVE MAPPING

      var ccUsed = isMappingSet('cc',byteArray[1]);

      tempHash = (mappingCanvasControl) ? 'controls' : hash;
      mappingCanvasControl = false;

      if(ccUsed != -1) {

        //mapping already exists, prompt to overwrite

        var overwriteName = mappings[tempHash][mappingID]['name'];
        prompting = true;

        if(confirm("That control is already being used for "+overwriteName)) {

          mappings[tempHash][ccUsed]['cc'] = -1;

          mappings[tempHash][mappingID]['cc'] = parseInt(byteArray[1]);
          //midiCCs[mappingID] = parseInt(byteArray[1]);

          //DEAL WITH STUFF
          clearTimeout(mapTimeout);
          mappingCC = prompting = mappingCanvasControl = false;
          $('.map',controlsPopup.document).removeAttr('disabled');

          saveCookie();


        }else{

          console.warn('user chose to not overwrite, nothing changed.');
          clearTimeout(mapTimeout);
          mappingCC = prompting = mappingCanvasControl = false;
          $('.map',controlsPopup.document).removeAttr('disabled');

        }
      }else{

        //mapping is fresh, so save it

        // console.log(mappingID);
        mappings[tempHash][mappingID]['cc'] = parseInt(byteArray[1]);

        // midiCCs[mappingID] = parseInt(byteArray[1]);
        console.info('mapping updated: '+mappings[tempHash][mappingID]['name']);
        clearTimeout(mapTimeout);
        mappingCC = mappingCanvasControl = false;
        $('.map',controlsPopup.document).removeAttr('disabled');

        saveCookie();
      }

    }else{

      //Not saving mapping, so updaing previous mapping
      var pos = isMappingSet('cc', byteArray[1]);

      tempHash = (mappingCanvasControl) ? 'controls' : hash;
      mappingCanvasControl = false;

      // console.log('tempHash',tempHash);

      if(pos > -1) {

        updateCC(tempHash, pos, byteArray[2])

      }else if(lastCC != byteArray[1]) {

        //however no previous mapping was made for that CC control

        console.warn('the CC control '+byteArray[1]+' is not listed in the effect CC mappings');
        lastCC = byteArray[1];

      }

    }

  }else if(byteArray[0] >= 144 && byteArray[0] <= 159 && !prompting) {

    //IT'S A NOTE ON ANY MIDI CHANNEL OMG

    if(byteArray[2] > 0) {
      var note = byteArray[1];
      if(byteArray[1] < effects.length) {
        changeScript(effects[byteArray[1]]);
      }else{
        console.warn('that note is higher than the number of effects there are');
      }
    }// else it's a note off event, not a note on. no need to double fire changeScript

  }
  
}



function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function sliderDrag(slider) {
  var val = slider.data.value;
  if(slider.data.view == 'checkbox') val = (val == 0) ? -1 : 1;

  if(window[slider.data.name] == val) return;

  var parentID = slider._parent_cell.config.id;
  var tempHash = hash;
  if(parentID == 'params_calibration' || parentID == 'params_filters') tempHash = 'controls';
  console.log(parentID, slider.data.name, val);
  window[slider.data.name] = val;
  mappings[tempHash][slider.data.name] = val;

  if(parentID == 'params_calibration') {
    updateCanvas();
  }

}

function updateCC(hashy, id, val) {

  var m = mappings[hashy][id];
  var varVal = map_range(val, 0, 127, m.min, m.max);
  //console.info('updateCC: '+id+' = '+val);
  window[m.name] = varVal;
  mappings[hashy][id]['value'] = varVal;
  var target = 'input[type=range]:eq('+id+')';
  if(hashy == 'controls') {
    $('#canvasControls input[type=range]:eq('+id+')',controlsPopup.document).val(varVal).trigger('input');

  }else{
    $('input[type=range]:eq('+id+')',controlsPopup.document).val(val/1.27);
  }
  // console.log('updated CC value aw yis');

  if(updateCookieTimeout) clearTimeout(updateCookieTimeout);
  updateCookieTimeout = setTimeout(function() {saveCookie()},2000);

}

var mapTimeout;
var mappingCC = false;
var mappingID;
var mappingCanvasControl = false;

function mapCC(elem, isCanvasControl) {

  if(typeof isCanvasControl != 'undefined') mappingCanvasControl = true;

  //map button pressed

  mappingID = parseInt($(elem).attr('data-id'));
  $(elem,controlsPopup.document).addClass('active');
  $('.map',controlsPopup.document).attr('disabled','disabled');
  mapTimeout = setTimeout(function() {
    $('.map',controlsPopup.document).removeAttr('disabled');
    console.warn('CC mapping timed out, is device hooked up properly?');
    mappingCanvasControl = false;
  },10000);
  mappingCC = true;
}

function createControls() {

  // at this stage the effect should have set all the standard values
  if(!mappings[hash]) {
    console.info(mappings[hash]);
    console.info('is ^^^ an empty array? because is creating one now...');
    mappings[hash] = [];
  }

  controlsPopup.updateEffectMappings();
  console.info('controls updated');
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

