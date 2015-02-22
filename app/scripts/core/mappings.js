
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
    mappings[hash][variable] = {label: variable.readable(), name: variable, midi: { min: minimum, max: maximum, value: _default, initValue: _default, cc: -1}, audio: false};
    window[variable] = _default;

  }else{

    console.log('setting window variable ~'+mappings[hash][variable]['name']+'~ from mappings: '+mappings[hash][variable]['midi']['value']);
    window[variable] = mappings[hash][variable]['midi']['value'];

  }
}


function isMappingSet(paramName, mappingType) {

  if(!isset(mappingType)) mappingType = 'midi';

  if(Object.size(mappings) > 0) {
    if(isset(mappings[hash]) && isset(mappings[hash][mappingType])) $.each(mappings[hash][mappingType], function(key, mapping) {
      if(key == paramName) return true;
    });
    if(isset(mappings['filterParams']) && isset(mappings['filterParams'][mappingType])) $.each(mappings['filterParams'][mappingType], function(key, mapping) {
      if(key == paramName) return true;
    });
    if(isset(mappings['calibrationParams']) && isset(mappings['calibrationParams'][mappingType])) $.each(mappings['calibrationParams'][mappingType], function(key, mapping) {
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

