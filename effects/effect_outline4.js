effect_outline4 = {

	requresOutline: true,

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


		 	var lastX = startOutlineX;
		 	var lastY = startOutlineY;

		 	currentScript.graphics.lineStyle(2, 0xFF0000, 1);
		 	this.graphics.beginFill(0xFFFFFF, 1);
		 	this.graphics.drawCircle(tX( lastX ), tY( lastY ), 20);

			for(var i=1; i<outlineArray.length; i++) {

				this.graphics.lineStyle(lineThickness,randomPaletteColour());
    			this.graphics.moveTo(tX( lastX ), tY( lastY ));
				this.graphics.lineTo(tX( outlineArray[i][0] ), tY( outlineArray[i][1] ));
				lastX = outlineArray[i][0];
				lastY = outlineArray[i][1];
        	}
		}
	}
}


