
var midiChangeTimeout = false;

//midi data has been received! 
//if we've been waiting to map something then the data has already been routed to another fuction to handle that
function processMidiData(byteArray) {

  byteArray[0] = parseInt(byteArray[0]);
  byteArray[1] = parseInt(byteArray[1]);
  byteArray[2] = parseInt(byteArray[2]);
  // console.log(byteArray);

  //try to find a matching CC value
  var midiType = false;
  if(byteArray[0] >= 176 && byteArray[0] <= 191) midiType = 'pot';
  else if(byteArray[0] >= 144 && byteArray[0] <= 159) midiType = 'key';

  if(midiType == 'pot') $.each(w.mappings[w.hash],function(key, mapping) {

    //is the effect param mapped with midi? and does the CC code match?
    if(mapping.type == 'midi' && mapping.cc == byteArray[1]) {


      //convert from midi value 0-127 to param's own min/max range
      var mappedValue = map_range(byteArray[2], 0, 127, mapping.min, mapping.max);
      // console.log('updating ',mapping.name,' to ',byteArray[2],' = ', mappedValue);

      //update the mapping value
      w.mappings[w.hash][mapping.name]['midi'].value = mappedValue;
      w[mapping.name] = mappedValue;

      //update the appropriate element
      setElementValue(mapping.name, mappedValue);

      //obviously don't save a cookie on every midi message, so just set a timeout and clear it on any overriding midi messages
      if(midiChangeTimeout) clearTimeout(midiChangeTimeout);
      midiChangeTimeout = setTimeout(function() {
        w.saveCookie();
      },2000);

    }

  });
  else if(midiType == 'key') $.each(w.mappings['midiButtons'],function(key, mapping) {
    if(mapping.cc == byteArray[1]) {

      var elem = $('#'+mapping.name+'[data-midi-mappable]');
      console.log('midi key pressed for ',$(elem));
      if(elem) {
        $(elem).trigger('click');
        if(elem.hasClass('.palette')) console.log('is palette');
      }else{
        console.log('elem ',mapping.name,' for CC ',mapping.cc,' not found!');
      }

    }
  });

}



// this will be triggered from body class is 'mapping' and 'waiting'
function receiveMappingData(midiData, externalOverride) {

  // midiData
  midiData[0].destring();
  midiData[1].destring();
  midiData[2].destring();

  //this should refer to only 1 element - the on waiting to be mapped
  var mappedElement = $('[data-midi-mappable].waiting');
  if(!mappedElement) {
    console.log('no midi mappable element waiting to be mapped ????');
    return;
  }
  var paramName = (mappedElement.attr('name')) ? mappedElement.attr('name') : mappedElement.attr('data-name');
  var paramType = mappedElement.attr('data-midi-type');

  //detect whether a key or potentiometer was touched
  var midiType = false;
  if(midiData[0] >= 176 && midiData[0] <= 191) midiType = 'pot';
  else if(midiData[0] >= 144 && midiData[0] <= 159) midiType = 'key';

  //if the midi message type matches the elements allowed midi type then proceed
  if(paramType == midiType) {

    console.log('compatible control type to match midi type! --',midiType);

    if(typeof externalOverride == 'undefined') {

      var mappingOverride = isMappingSetForCC(midiData[1], paramType);
      //don't ask to override element that's already selected
      if(mappingOverride.length == 1 && mappingOverride[0] == paramName) mappingOverride = false;
      if(mappingOverride) {
        console.log('mapping override!');
        $('body').addClass('disabled');
        var readableList = mappingOverride;
        for(var i=0; i<readableList.length; i++) readableList[i] = readableList[i].readable();
        showAlert({
          title: 'Mapping override',
          message: 'Midi CC already set for '+readableList.join(', ')+'.<br>What would you like to do?',
          buttons: [
            {label: 'Keep '+readableList.join(', '), callback: function() {
              console.log('keep original');
              mappedElement.removeClass('waiting');
              $('body').removeClass('disabled waiting');
            }},
            {label: 'Keep '+((mappingOverride.length > 1) ? 'all' : 'both'), callback: function() {
              console.log('keep both');
              //pass the same midi data received in the function with the addition of override = true to prevent a further prompts
              receiveMappingData(midiData,true);
              $('body').removeClass('disabled');
            }},
            {label: ((mappingOverride.length > 1) ? 'Only keep ' : 'Keep ')+paramName.readable(), callback: function() {
              console.log('keep original');
              removeMappingsByCC(midiData[1]);
              //pass the same midi data received in the function with the addition of override = true to prevent a further prompts
              receiveMappingData(midiData,true);
              $('body').removeClass('disabled');
            }}
          ]
        });
        return;
      }
    }

    if(midiType == 'pot') {
      var mapping;
      //update the mapping details for the parameter
      if(!isset( w.mappings[w.hash][paramName])) mapping = {
        label: paramName.readable(), 
        name: paramName, 
        type: 'midi', 
        min: parseFloat(mappedElement.attr('data-min')),
        max: parseFloat(mappedElement.attr('data-max')),
        range: false, threshold: false, initValue: 0, value: 0};
      else mapping = w.mappings[w.hash][paramName];
      // if(!isset(mapping)) console.log(isset( w.mappings[w.hash][paramName]), paramName, mapping);
      mapping.type = 'midi';
      mapping.value = midiData[2];
      mapping.cc = midiData[1];

      w.mappings[w.hash][paramName] = mapping;

      //if(mappedElement.hasClass('dial')) mappedElement.trigger('configure', {'fgColor':'#f9d423'}); 
      //use this for audio mapping

      
    }else if(midiType == 'key') {
      
      if(!isset( w.mappings['midiButtons'])) w.mappings['midiButtons'] = {};
      w.mappings['midiButtons'][paramName] = {
        label: paramName.readable(),
        name: paramName,
        cc: midiData[1]
      }
      mappedElement.removeClass('waiting').attr('data-midi-linked','');



    }

    mappedElement.removeClass('waiting').attr('data-midi-linked','');
    $('body').removeClass('waiting');

    w.saveCookie();

    console.log('Mapping made!',mappedElement,midiData);
    //store changes to w.mappings
    

  }else{
    console.log('incompatible control type to midi type!');
  }

  
}




function updateMappings(byteArray) {


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
          $(document,uiPopup).removeClass('mapping');

          saveCookie();


        }else{

          console.warn('user chose to not overwrite, nothing changed.');
          clearTimeout(mapTimeout);
          mappingCC = prompting = mappingCanvasControl = false;
          $(document,uiPopup).removeClass('mapping');

        }
      }else{

        //mapping is fresh, so save it

        // console.log(mappingID);
        mappings[tempHash][mappingID]['cc'] = parseInt(byteArray[1]);

        // midiCCs[mappingID] = parseInt(byteArray[1]);
        console.info('mapping updated: '+mappings[tempHash][mappingID]['name']);
        clearTimeout(mapTimeout);
        mappingCC = mappingCanvasControl = false;
        $(document,uiPopup).removeClass('mapping');

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