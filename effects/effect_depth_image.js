effect_depth_image = {

	requiresOutlines: false,
	draw:function() {
		if(imageLoaded) {

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

			// console.log(1,pixels[pixels.length/2]);

			this.graphics.beginFill(0xFF0000,1);
			this.graphics.drawRect( tX(170), tY(2), 2, 2);

		}
	}
}