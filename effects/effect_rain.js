effect_rain = {

	particles: [],
	
	init:function() {

		setMapping('gravity', 1, 100, 20);
		setMapping('wind',-100,100,50);
		setMapping('density',1, 200);
		setMapping('trailAmount', 0, 1, 0.2);
	},

	draw: function() {
		for(var i=0; i<density; i++) {
			
		}
	}
}