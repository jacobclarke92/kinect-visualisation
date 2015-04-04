//exclude
effect_outline4 = {

	requiresOutlines: true,

	init: function() {
    	setMapping('lineThickness', 1, 50, 2);
		setMapping('pixelResolution', 1, 10, 3);
		setMapping('trailAmount', 0, 1, 0.8);

	},

	skip: 4,

	lastX: 0,
	lastY: 0,
	lastDiff: 0,

	draw: function() {

		if(gotImage) {

			clearStage();

			var base = new PIXI.BaseTexture(imageLoaded);
			var texture = new PIXI.Texture(base,new PIXI.Rectangle(0,0,320,240));
			// console.log(typeof imageLoaded);
			var img = new PIXI.Sprite(texture);
			img.alpha = 1;
			img.x = startDrawX;
			img.y = startDrawY;
			img.scale.x = sizeRatio;
			img.scale.y = sizeRatio;
			stage.addChild(img);

		 	var outline;
			for(var n=0; n<outlineArray.length; n++) {
				outline = outlineArray[n];
				for(var i=0; i< outline.length; i++) {

					this.graphics.lineStyle(lineThickness,randomPaletteColour());
	    			if(i==0) this.graphics.moveTo(tX( outline[i][0] ), tY( outline[i][1] ));
					else this.graphics.lineTo(tX( outline[i][0] ), tY( outline[i][1] ));
				}
        	}
		}
	}
}


