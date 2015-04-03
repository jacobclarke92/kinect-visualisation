
var mappings = {};

//this is called by effects

function setMapping(variable, minimum, maximum, _default) {

  var paramIsSet = isObjectPathSet(mappings, [hash, variable, 'midi']);

  if(!paramIsSet) {

    console.log('setting window variable '+variable+' to effect defaults');

    mappings[hash][variable] = {
      label: variable.readable(), 
      name: variable, 
      midi: { 
        min: minimum, 
        max: maximum, 
        value: _default, 
        initValue: _default, 
        cc: -1
      }, 
      audio: false
    };
    window[variable] = _default;

  }else{

    console.log('setting window variable ~'+mappings[hash][variable].name+'~ from mappings: '+mappings[hash][variable].midi.value);
    window[variable] = mappings[hash][variable].midi.vlaue;

  }
}
