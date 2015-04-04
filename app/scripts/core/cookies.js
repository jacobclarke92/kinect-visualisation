
var updateCookieTimeout;
var storageLoaded = false;

var date = new Date();
var days = 365 * 10;
date.setTime(date.getTime() + (days*24*60*60*1000));

function saveStorage() {

  if(!supports_html5_storage()) {
    console.error('HTML5 localStorage required to save/load');
    return false;
  }

	var mappingsString = JSON.stringify(mappings);

  localStorage['mappings'] = mappingsString;

	console.info('cookie saved!');

}

var loadedCookieBefore = false;
function loadStorage() {

  if(!supports_html5_storage()) {
    console.error('HTML5 localStorage required to save/load');
    return false;
  }


  if(localStorage.getItem('mappings') !== null) {
    mappings = JSON.parse(localStorage['mappings']); 
  }else{
    console.log('mappings not in localStorage, creating empty object now');
    mappings = {};
  }

  updateCanvas();
  storageLoaded = true;
	console.info('cookie loaded!');
	
}


function clearStorage() {
	localStorage.clear();
}


function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}