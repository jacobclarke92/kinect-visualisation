var kinect = require('kinect');
var keypress = require('keypress');

var kinectContext = kinect();
var kinectAngle = 0;

updateKinectAngle(0);

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {

  if(key.name == 'up') updateKinectAngle(1);
  else if(key.name == 'down') updateKinectAngle(-1);

  if (key && key.ctrl && key.name == 'c') process.exit(0);//process.stdin.pause(); // die gracefully
});
process.stdin.setRawMode(true);
process.stdin.resume();

function updateKinectAngle(amt) {
	if(kinectAngle+amt <= 15 && kinectAngle+amt >= -15) {
		kinectAngle += amt;
		kinectContext.tilt(kinectAngle);
		for(var i = -15, str=''; i < 15; i ++) str += (i == kinectAngle) ? '|' : '-';
		console.log('adjusting tilt: '+str);
	}
}

kinectContext.on('video', function(buf) {
  // each depth pixel in buf has 2 bytes, 640 x 480, 11 bit resolution
  // console.log('got depth');
  console.log(buf);

  // kinectContext.pause();
});

kinectContext.start('depth');
kinectContext.resume();
