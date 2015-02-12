
var mappings = {};

var lastCC = false;
var prompting = false;

var mapTimeout;
var mappingCC = false;
var mappingID;
var mappingCanvasControl = false;


function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

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


function isMappingSet(key,val) {

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
  }
  return -1;

}


function updateCC(hashy, id, val) {

  var m = mappings[hashy][id];
  var varVal = map_range(val, 0, 127, m.min, m.max);
  window[m.name] = varVal;
  mappings[hashy][id]['value'] = varVal;
  var target = 'input[type=range]:eq('+id+')';
  if(hashy == 'controls') {
    $('#canvasControls input[type=range]:eq('+id+')', uiPopup.document).val(varVal).trigger('input');

  }else{
    $('input[type=range]:eq('+id+')', uiPopup.document).val(val/1.27);
  }
  // console.log('updated CC value aw yis');

  if(updateCookieTimeout) clearTimeout(updateCookieTimeout);
  updateCookieTimeout = setTimeout(function() {saveCookie()},2000);

}


function mapCC(elem, isCanvasControl) {

  if(typeof isCanvasControl != 'undefined') mappingCanvasControl = true;

  //map button pressed

  mappingID = parseInt($(elem).attr('data-id'));
  $(elem, uiPopup.document).addClass('active');
  $('.map', uiPopup.document).attr('disabled','disabled');
  mapTimeout = setTimeout(function() {
    $('.map', uiPopup.document).removeAttr('disabled');
    console.warn('CC mapping timed out, is device hooked up properly?');
    mappingCanvasControl = false;
  },10000);
  mappingCC = true;
}



function keyPressed(event) {

  //number keys trigger effects
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
