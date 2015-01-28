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
    controlsPopup = window.open("controls.html", "Controls", 'width=520,height='+screen.height+',left=0,top=0');
    controlsPopup.focus();



    setTimeout(function() {
      
      frequencyBars = $('#frequencyBars',controlsPopup.document).get(0);
      // console.log(frequencyBars);
      freqBarsCanvas = frequencyBars.getContext('2d');

      if(typeof controlsPopup.controlsLoaded != 'undefined') $('#openControlsToggle').hide();


      if(typeof window.palettesHtml == 'string' && window.palettesHtml != '') $('#paletteZone',controlsPopup.document).html(window.palettesHtml);
      
      if(typeof mappings['controls'] == 'undefined') {
        mappings['controls'] = [];
        $('#canvasControls tr', controlsPopup.document).each(function(index,elem) {
          
          if($('td',elem).length > 3) {
            var id = $('td:eq(3) input',elem).attr('data-id');
            var name = $('td',elem).get(0).innerHTML;
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


    },200);
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
    for(var i=0; i < mappings['controls'].length; i++) {
      // console.warn(mappings[hash][i][key]+' == '+val+'?');
      if(mappings['controls'][i][key] == val) {
        mappingCanvasControl = true;
        return i;
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

// console.error(map_range(5,200, 5, 0, 100));

function dragCC(elem,isCanvasControl) {
  //0-100
  var tempHash = hash;
  if(typeof isCanvasControl != 'undefined') tempHash = 'controls';

  var id = parseInt(elem.getAttribute('data-id'))
  var mapping = mappings[tempHash][id];
  var val = elem.value;

  if(typeof val == 'string') val = parseInt(val);
  else console.log('not string?');

  val = map_range(val, 0, 100, mapping.min, mapping.max);

  if(Math.abs(mapping.max-mapping.min) > 50) window[mapping.name] = Math.round(val);
  else window[mapping.name] = val;

  
  mappings[tempHash][id]['value'] = val;

  // console.log(mapping.name+": "+val);
}

function updateCC(hashy, id, val) {

  //

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

  //generate sliders when new script is loaded


  if(!mappings[hash] || mappings[hash].length == 0) {
    console.warn('no CC controls set for this visualization .. add some');

  }

  // at this stage the effect should have set all the standard values
  // console.info(mappings[hash]);
  if(!mappings[hash]) {
    console.info(mappings[hash]);
    console.info('is ^^^ an empty array? because is creating one now...');
    mappings[hash] = [];
  }
  if(mappings[hash].length > 0) {
    if(mappings[hash][0]['name'] != 'volumeMaster') {
      console.log('creating volumeMaster becuase one doesn\'t exist for this effect?');
      mappings[hash].unshift({name: 'volumeMaster', min: 16, max: 0.5, value: 1, cc: -1});
      // console.info(hash+' = '+JSON.stringify(mappings[hash]));
    }//else console.info('PRAISE volumeMaster was defined already');
  }else{
    mappings[hash].unshift({name: 'volumeMaster', min: 16, max: 0.5, value: 1, cc: -1});
    console.warn('there are no mappings .. there should have been a volumeMaster by now');
  }

  // console.log(mappings);

  var ctrlStr = '<table align="center">';
  ctrlStr += '<thead><tr><td colspan="4">Effect Controls</td></tr></thead>'
  for(var i=0; i < mappings[hash].length; i++) {

    var m = mappings[hash][i];
    var val = m.value;
    // console.info(typeof val);
    if(typeof val == 'string') val = parseFloat(val);
    val = map_range(val, m.min, m.max, 0, 100);
    console.log('giving '+m.name+' a range value of '+val);

    ctrlStr += 
      '<tr><td class="right">'+(mappings[hash][i].name)+'</td><td>' + 
      '<input type="range" oninput="w.dragCC(this)" onchange="w.saveCookie()" data-id="'+i+'" value="'+val+'">' + 
      '</td><td>('+mappings[hash][i].min+' - '+mappings[hash][i].max+')</td>' + 
      '<td><input type="button" class="map" value="map" data-id="'+i+'" onclick="w.mapCC(this)"></td></tr>';
  }
  ctrlStr += '</table>';
  // console.log(controlsPopup.document);
  // console.log($('#controlsZone',controlsPopup.document));
  $('#controlsZone',controlsPopup.document).html(ctrlStr);
  console.info('controls updated');
}


var mirror, zoom = 1;
var rotateX, rotateY, offsetX, offsetY = 0;
depthThreshold = 145;
depthRange = 50;
var perspective = 800;

function updateCanvas(getVals) {
  if(typeof getVals == 'undefined') {
    depthThreshold = $('#canvasDepthThreshold',controlsPopup.document).val();
    depthRange = $('#canvasDepthRange',controlsPopup.document).val();
    mirror = $('#canvasMirror',controlsPopup.document).attr('checked') ? -1 : 1;
    zoom = $('#canvasZoom',controlsPopup.document).val();
    rotateX = $('#canvasRotateX',controlsPopup.document).val();
    rotateY = $('#canvasRotateY',controlsPopup.document).val();
    offsetX = $('#canvasOffsetX',controlsPopup.document).val();
    offsetY = $('#canvasOffsetY',controlsPopup.document).val();
    perspective = $('#canvasPerspective',controlsPopup.document).val();
    if(mirror == -1) offsetX = -offsetX;
  }

  var transform = 'scaleX('+mirror+') rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)';
      transform += ' translate('+offsetX+'px,'+offsetY+'px)';
  $('.effectsRenderer,#processingCanvas3D').css({
    'zoom': zoom,
    'transform': transform
  });
  var h = 480*zoom;
  $('#contentZone').css({
    'perspective-origin': '50% '+(h/2),
    'perspective': perspective+'px',
    'padding-bottom': offsetY+'px'
  });
  // console.log(mirror,zoom,rotateX,rotateY,offsetX,offsetY);
  // console.log(transform);
}

