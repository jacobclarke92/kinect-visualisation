
var imageEventSource;
// var image = new Image();

function getOutline(imageData) {
	outline = MarchingSquares.walkPerimeter(firstPixel[0], firstPixel[1], imageData);
	self.postMessage({'outline': outline});
}
self.onmessage = function(e) {

	if(e.data.cmd == 'start') {

		console.info('image worker initing');
		imageEventSource = new EventSource('/images');
		imageEventSource.addEventListener('message', function(event) {

			// console.log('got image');
			if(event.data.substring(0,14) == 'data:image/png' ) {
				
				// image.src = event.data;

				self.postMessage({

					'image': event.data

				});
				
			}
		});
	}

}  