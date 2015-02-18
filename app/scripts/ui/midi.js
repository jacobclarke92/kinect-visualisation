
function processMidiData(byteArray) {
  // console.log(byteArray);
  
  for(var i=0; i< w.mappings[w.hash].length; i++) {
    if(w.mappings[w.hash].type == 'midi' && w.mappings[w.hash][i].cc == byteArray[1]) {

      w.mappings[w.hash][i].value = byteArray[2];

    }
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