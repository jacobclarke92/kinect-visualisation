
var midiChangeTimeout = false;

//midi data has been received! 
//if we've been waiting to map something then the data has already been routed to another fuction to handle that
function processMidiData(byteArray) {

  byteArray[0] = parseInt(byteArray[0]);
  byteArray[1] = parseInt(byteArray[1]);
  byteArray[2] = parseInt(byteArray[2]);
  // console.log(byteArray);

  //try to find a matching CC value
  $.each(w.mappings[w.hash],function(key, mapping) {

    //is the effect param mapped with midi? and does the CC code match?
    if(mapping.type == 'midi' && mapping.cc == byteArray[1]) {

      //convert from midi value 0-127 to param's own min/max range
      var mappedValue = map_range(byteArray[2], 0, 127, mapping.min, mapping.max);
      // console.log('updating ',mapping.name,' to ',byteArray[2],' = ', mappedValue);

      //update the mapping value
      w.mappings[w.hash][mapping.name].value = mappedValue;
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