
var mappings = {};

var lastCC = false;
var prompting = false;

var mapTimeout;
var mappingCC = false;
var mappingID;
var mappingCanvasControl = false;



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
  if(hashy == 'controls') {
    $('#'+m.name, uiPopup.document).val(varVal);
  }else{
    $('#'+m.name, uiPopup.document).val(val/1.27);
  }
  // console.log('updated CC value aw yis');

  if(updateCookieTimeout) clearTimeout(updateCookieTimeout);
  updateCookieTimeout = setTimeout(function() {saveCookie()},2000);

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
