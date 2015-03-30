effect_depth_image = {

	requresOutline: false,
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


			// var pixel = [pixels[810*4],pixels[810*4 + 1],pixels[810*4 + 2],pixels[810*4 + 3]];
			// console.log(1,pixel);
			console.log(1,pixels[pixels.length/2]);

			this.graphics.beginFill(0xFF0000,1);
			this.graphics.drawRect( tX(170), tY(2), 2, 2);

		}
	}
}