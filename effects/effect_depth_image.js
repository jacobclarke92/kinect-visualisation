effect_depth_image = {
	draw:function() {
		if(imageLoaded) {

			clearStage();

			var base = new PIXI.BaseTexture(imageLoaded);
			var texture = new PIXI.Texture(base,new PIXI.Rectangle(0,0,320,240));
			// console.log(typeof imageLoaded);
			var img = new PIXI.Sprite(texture);
			img.alpha = 1;
			img.x = 0;
			img.y = 0;
			img.scale.x = sizeRatio;
			img.scale.y = sizeRatio;
			stage.addChild(img);
		}
	}
}