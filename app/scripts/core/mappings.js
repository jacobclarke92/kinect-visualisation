
var mappings = {};

var lastCC = false;
var prompting = false;

var mapTimeout;
var mappingCC = false;
var mappingID;
var mappingCanvasControl = false;



function setMapping(variable, minimum, maximum, _default) {

  // console.log(mappings);
  var isSet = isMappingSet(variable);

  console.log('hash: '+hash+', key to set: '+variable, isSet);
  if(!isSet) {

    // createMapping(variable, minimum, maximum, _default);
    mappings[hash][variable] = {name: variable, min: minimum, max: maximum, value: _default, initValue: _default, cc: false, type: false, audioTriggerType: false, range: false, threshold: false};
    window[variable] = _default;

  }else{

    console.log('setting window variable ~'+mappings[hash][variable]['name']+'~ from mappings: '+mappings[hash][variable]['value']);
    window[variable] = mappings[hash][variable]['value'];

  }
}


function isMappingSet(paramName) {

  if(Object.size(mappings) > 0) {
    if(typeof mappings[hash] != 'undefined') $.each(mappings[hash], function(key, mapping) {
      if(key == paramName) return true;
    });
    if(typeof mappings['filterParams'] != 'undefined') $.each(mappings['filterParams'], function(key, mapping) {
      if(key == paramName) return true;
    });
    if(typeof mappings['calibrationParams'] != 'undefined') $.each(mappings['calibrationParams'], function(key, mapping) {
      if(key == paramName) return true;
    });
  }
  return false;

}


function updateCC(hashy, id, val) {

  var m = mappings[hashy][id];
  var varVal = map_range(val, 0, 127, m.min, m.max);
  window[m.name] = varVal;
  mappings[hashy][id]['value'] = varVal;
  if(hashy == 'controls') {
    $('#'+m.name, uiPopup.document).val(varVal);
  }else{
    $('#'+m.name, uiPopup.document).val(val/1.27);
  }
  // console.log('updated CC value aw yis');

  if(updateCookieTimeout) clearTimeout(updateCookieTimeout);
  updateCookieTimeout = setTimeout(function() {saveCookie()},2000);

}

