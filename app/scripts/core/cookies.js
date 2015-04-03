
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
      // console.log(value);
      // console.log(JSON.parse(value));

  		mappings = JSON.parse(value);
      $.each(mappings, function(key, effect) {
        console.log('Loaded saved effect mappings for '+key+': ',effect);
        window.mappings[key] = effect;
      })

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

  	}
  }

  updateCanvas();
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


function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}