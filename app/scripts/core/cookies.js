
var updateCookieTimeout;
var cookieLoaded = false;

var date = new Date();
var days = 365 * 10;
date.setTime(date.getTime() + (days*24*60*60*1000));

function saveCookie() {

	// console.info(mappings);
	var mappingsString = JSON.stringify(mappings);
	// console.log(mappingsString);

	document.cookie = 'mappings='+mappingsString+';expires='+date.toUTCString();
  document.cookie = 'paletteID='+currentPalette.id+';expires='+date.toUTCString();
  document.cookie = 'testImage='+testingImage.toString()+';expires='+date.toUTCString();

	console.info('cookie saved!');
	// console.info(testingImage.toString());
	// console.info(document.cookie);

}

function loadCookie() {
	// console.info(document.cookie);
	var cookieArray  = document.cookie.split(';');

	for(var i=0; i<cookieArray.length; i++) {
		var name = cookieArray[i].split('=')[0];
  	var value = cookieArray[i].split('=')[1];

  	if(name == 'mappings' || name == ' mappings') {

  		mappings = JSON.parse(value);
  		for(var n=0; n<mappings.length; n++) {
  			window[mappings[n]['name']] = mappings[n]['value'];
  		}

  	}else if(name == 'testImage') {

  		testingImage = (value == 'true') ? true : false;

  		if(testingImage) {
  			testingImage = !testingImage;
  			$('#imageToggle').attr('checked','checked');
  			setTimeout(function() {toggleTesting('image',false)}, 1000);
  			console.log('setting checbox to sleceted');
  		}

    }else if(name == 'paletteID' || name == ' paletteID') {

      console.log('paletteID loaded!', value);
      paletteID = value;

  	}else if(name == 'controls' || name == ' controls') {

      console.info('loading controls!');
      var controls = JSON.parse(value);
      for(var key in controls) {
        window[key] = controls[key];
        console.log(key+' = '+controls[key]);

        if(key != 'mirror') $('#canvas'+capitaliseFirstLetter(key), uiPopup.document).val(controls[key]);
        else{
          if(mirror == 1) $('#canvasMirror', uiPopup.document).removeAttr('checked');

        }
      }
      
      updateCanvas();

    }
	}
  cookieLoaded = true;
	console.info('cookie loaded!');

  if(!paletteID) {
    currentPalette = palettes[0];
    paletteID = '_0';

    console.log('no default colour palette selected, choosing white now')
    document.cookie = 'paletteID='+currentPalette.id+';expires='+date.toUTCString();

  }
	
}


function clearCookie() {
	document.cookie = 'mappings=;testImage=false;expires=-50';
}






function toggleTesting(thing, elem) {
  console.info('toggling test '+thing);
  if(thing == 'image') {
    testingImage = !testingImage;
    randomizeImage(true);
    run();
  }else if(thing == 'sound') {
    testingSound = !testingSound;
    elem.innerHTML = ((testingImage) ? 'Disable' : 'Enable') + ' test ' + thing;
  }
}



var testImages = 5;
var randomInterval = false;
function randomizeImage(intervalChange) {

  console.log('changing test image');


  var rand = Math.round(Math.random()*(testImages-1))+1;
  while(rand == currentTestImage && testImages > 1) rand = Math.round(Math.random()*(testImages-1))+1;

  currentTestImage = rand;
  testImageURL = '/app/img/test'+currentTestImage+'.png';

  //console.log('new image: '+testImageURL);

  if(randomInterval) clearInterval(randomInterval);
  run();

  if(intervalChange) randomInterval = setTimeout(function() {randomizeImage(true)}, 5000);

}


function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}