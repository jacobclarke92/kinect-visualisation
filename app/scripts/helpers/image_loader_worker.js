
var imageEventSource;
var running = false;

self.onmessage = function(e) {

	if(e.data.cmd == 'start') {

		running = true;

		console.info('image worker initing');
		imageEventSource = new EventSource('/images');
		imageEventSource.addEventListener('message', function(event) {

			if(running) {
				
				if(event.data.substring(0,14) == 'data:image/png' ) {

					self.postMessage({

						'image': event.data

					});
					
				}
			}
		});
	}else if(e.data.cmd == 'stop') {
		console.warn('image loader stopping!');
		running = false;
		imageEventSource.removeEventListener('message');
		imageEventSource = false;
	}

}  