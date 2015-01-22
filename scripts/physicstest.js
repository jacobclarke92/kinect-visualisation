// console.info(Box2D);

var box2d;
var SCALE = 30;
var stage, world;
function startPhysics() {

	console.warn('STARTING PHYSICS')
	box2d = {
		b2Vec2 : Box2D.Common.Math.b2Vec2,
		b2BodyDef : Box2D.Dynamics.b2BodyDef,
		b2Body : Box2D.Dynamics.b2Body,
		b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
		b2Fixture : Box2D.Dynamics.b2Fixture,
		b2World : Box2D.Dynamics.b2World,
		b2MassData : Box2D.Collision.Shapes.b2MassData,
		b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw : Box2D.Dynamics.b2DebugDraw
	};
	console.info(Box2D);
	
	stage = new createjs.Stage(document.getElementById('testCanvas'));
	setupPhysics();

	stage.onMouseDown = function() {

		var fixDef = new box2d.b2FixtureDef();
		fixDef.density = 1;
		fixDef.friction = 0.5;

		var bodyDef = new box2d.b2BodyDef();
		bodyDef.type = box2d.b2Body.b2_dynamicBody;
		bodyDef.position.x = Math.random()*640 / SCALE;
		bodyDef.position.y = 0;

		fixDef.shape = new box2d.b2CircleShape( Math.random()*100 / SCALE );

		world.CreateBody(bodyDef).CreateFixture(fixDef);

	}

	// createjs.Ticker

	// createjs.Ticker.addListener(this);
	// createjs.Ticker.setFPS(60);
	// createjs.Ticker.useRAF = true;

}

function setupPhysics() {
	
	world = new box2d.b2World(new box2d.b2Vec2(0,50), true);

	var fixDef = new box2d.b2FixtureDef();
	fixDef.density = 1;
	fixDef.friction = 0.5;

	var bodyDef = new box2d.b2BodyDef();
	bodyDef.type = box2d.b2Body.b2_staticBody;
	bodyDef.position.x = 320 / SCALE;
	bodyDef.position.y = 480 / SCALE;

	fixDef.shape = new box2d.b2PolygonShape();
	fixDef.shape.SetAsBox(320 / SCALE, 20 / SCALE);

	world.CreateBody(bodyDef).CreateFixture(fixDef);

	var debugDraw = new box2d.b2DebugDraw();

	debugDraw.SetSprite(stage.canvas.getContext('2d'))
	
	debugDraw.SetDrawScale(SCALE);
	debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);

	world.SetDebugDraw(debugDraw);
}

function progressPhysics() {
	stage.update();
	world.DrawDebugData();
	//fps, velocity, movement
	world.Step(1/60, 10, 10);
	world.ClearForces();
}