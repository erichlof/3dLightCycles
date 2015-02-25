/*
** GLOBAL VARIABLES and OBJECTS
*/


// WINDOW, CAMERA, and SCENE VARIABLES ///////////////////////////////////////////////////////////////////////////////////////////

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SCREEN_WIDTH_DIVISION = SCREEN_WIDTH / 4;//used for radar minicam
var SCREEN_HEIGHT_DIVISION = SCREEN_HEIGHT / 3;//used for radar minicam
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(55, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 3000);
scene.add(camera);
/*
var radarScene = new THREE.Scene();
var camera2 = new THREE.PerspectiveCamera(70, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 2000);
radarScene.add(camera2);
*/

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

//are we in portrait mobile view? if so, move the buttons over to the left a little..
// if not and we are in landscape mode, they can safely be moved farther right without running into each other
var b2PercentLeft = SCREEN_WIDTH < SCREEN_HEIGHT ? 50 : 65;
var b1PercentLeft = SCREEN_WIDTH < SCREEN_HEIGHT ? 76 : 80;
var joystick = new VirtualJoystick({
	container: document.getElementById("container"),
	add2Buttons: true,
	hideJoystick: true,
	hideButtons: false,
	button1PercentLeft: b1PercentLeft,
	button2PercentLeft: b2PercentLeft,
});

var PI_2 = Math.PI / 2;//used by controls below
var controls = new THREEx.FirstPersonControls(camera);
scene.add( controls.getObject() );
var mouseControl = false;
//if not on a mobile device, enable mouse control 
if ( !('createTouch' in document) ) {
	mouseControl = true;
}

//the following variables will be used to calculate rotations and directions from the camera, 
// such as when shooting, which direction do we shoot in?
var cameraRotationVector = new THREE.Vector3();//for moving and firing projectiles where the camera is looking
var cameraWorldQuaternion = new THREE.Quaternion();//for rotating scene objects to match camera's current rotation
var cameraControlsObject = controls.getObject();//for positioning and moving the camera itself
var cameraControlsYawObject = controls.getYawObject();//allows access to control camera's left/right movements through mobile input
var cameraControlsPitchObject = controls.getPitchObject();//allows access to control camera's up/down movements through mobile input

// for the game's cutscenes, we remove the camera (child of controls), so we can animate it
// freely without user interaction. When the cutscene ends, we will re-attach it as a child of controls

///cameraControlsPitchObject.remove(camera);

var renderer = new THREE.WebGLRenderer();

//pixelRatio of 1 is default. Numbers less than 1 result in less pixels and larger pixels. Must be > 0.0
//renderer.setPixelRatio(0.5);
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
document.getElementById("container").appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize, false);
var fontAspect = 0;

document.getElementById("container").addEventListener("click", function() {
	this.requestPointerLock = this.requestPointerLock || this.mozRequestPointerLock;
	this.requestPointerLock();
}, false);

document.getElementById("container").addEventListener("mousedown", function() {
	//if (playerAlive) shootBullet();
}, false);



function onWindowResize() {
	
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	
	fontAspect = (SCREEN_WIDTH / 175) * (SCREEN_HEIGHT / 200);
	if (fontAspect > 25) fontAspect = 25;
	if (fontAspect < 4) fontAspect = 4;
	
	
	document.getElementById("sound").style.fontSize = (fontAspect * 1.8) + "px";
	
	fontAspect *= 2;
	document.getElementById("score").style.fontSize = fontAspect + "px";
	
	fontAspect *= 3;
	document.getElementById("banner").style.fontSize = fontAspect + "px";
	document.getElementById("gameover").style.fontSize = fontAspect + "px";
	
	
	
	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();
	/*
	camera2.aspect = SCREEN_WIDTH_DIVISION / SCREEN_HEIGHT_DIVISION;
	camera2.updateProjectionMatrix();
	*/

	//check if mobile device is in portrait or landscape mode and position buttons accordingly
	b2PercentLeft = SCREEN_WIDTH < SCREEN_HEIGHT ? 50 : 65;
	joystick._button2El.style.left = b2PercentLeft + "%";
	b1PercentLeft = SCREEN_WIDTH < SCREEN_HEIGHT ? 76 : 80;
	joystick._button1El.style.left = b1PercentLeft + "%";
			
}


// GAMEPLAY VARIABLES /////////////////////////////////////////////////////////////////////////////////////////////////////////////

var playerAlive = false;
var frameTime = 0;
var TWO_PI = Math.PI * 2;
var PI_4 = Math.PI / 4;
var north_Y_Rotation = 0;
var west_Y_Rotation = PI_2;
var south_Y_Rotation = Math.PI;
var east_Y_Rotation = Math.PI + PI_2;

var northVector = new THREE.Vector3(0, 0, -1);
var southVector = new THREE.Vector3(0, 0, 1);
var eastVector = new THREE.Vector3(1, 0, 0);
var westVector = new THREE.Vector3(-1, 0, 0);
var cycleHeadingVector = new THREE.Vector3();
var cycleSpeed = 10;
var upVector = new THREE.Vector3(0, 1, 0);
var rightVector = new THREE.Vector3(1, 0, 0);
var forwardVector = new THREE.Vector3(0, 0, -1);
var cycleRotationAmount = 2;
var cameraDistance = 8;
//Shadows
var testMesh;
var cycleShadow = [];
var trailShadow = [];
var normalVector = new THREE.Vector3( 0, 1, 0 );
var planeConstant = 0.01;
var groundPlane = new THREE.Plane( normalVector, planeConstant );
var verticalAngle = 0;
var horizontalAngle = 0;
var flipper = 0;


// GAME OBJECTS and MATERIALS /////////////////////////////////////////////////////////////////////////////////////////////////////

// LIGHTS
//var ambientLight = new THREE.AmbientLight('rgb(80,80,80)', 1);
//scene.add(ambientLight);
var directionalLight = new THREE.DirectionalLight('rgb(255,255,255)', 1);
directionalLight.position.set(5, 20, 1);
directionalLight.lookAt(scene.position);
scene.add(directionalLight);

var lightPosition4D = new THREE.Vector4();
lightPosition4D.x = directionalLight.position.x;
lightPosition4D.y = directionalLight.position.y;
lightPosition4D.z = directionalLight.position.z;
lightPosition4D.w = 0.5;


// FLOOR
var floorTexture = new THREE.ImageUtils.loadTexture( 'images/grid_floor.png' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set(36, 36);
//floorTexture.minFilter = THREE.LinearMipMapLinearFilter; 
var floorMaterial = new THREE.MeshPhongMaterial({
	//emissive: 'rgb(5,5,5)',
	shininess: 10,
	map: floorTexture
});
var floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / -2;
scene.add(floor);


// MODELS
var cycle;
var loader = new THREE.ObjectLoader();

//the following load function gives us a mesh object which is in this function's local scope.  
// We call the mesh's clone function to copy it (and its properties) and place the end result in 'cycle', 
// which is a THREE.Mesh declared (above) globally, giving us access to change its position/rotation/etc..
loader.load( 'models/classic-1982-tron-light-cycle.json', function ( mesh ) {
	
	cycle = mesh.clone();//copy mesh's contents into the global 'cycle' mesh
	scene.add(cycle);//add the cycle mesh to the scene, so it becomes a game object
	
	cycle.children[1].material.emissive.set('rgb(30,10,0)');//main hull
	cycle.children[3].material.emissive.set('rgb(10,10,10)');//underbody chassis
	
	//shadow for black windows
	cycleShadow[0] = new THREE.ShadowMesh( cycle.children[0] );
	cycleShadow[0].material.side = THREE.DoubleSide;
	cycleShadow[0].material.opacity = 0.8;
	//cycleShadow[0].material.color.set(0xffffff);
	scene.add( cycleShadow[0] );
	
	//shadow for main colored hull
	cycleShadow[1] = new THREE.ShadowMesh( cycle.children[1] );
	cycleShadow[1].material.side = THREE.DoubleSide;
	cycleShadow[1].material.opacity = 0.8;
	//cycleShadow[1].material.color.set(0xffffff);
	scene.add( cycleShadow[1] );
	
	//shadow for wheel rims/hubcaps
	cycleShadow[2] = new THREE.ShadowMesh( cycle.children[2] );
	cycleShadow[2].material.side = THREE.DoubleSide;
	cycleShadow[2].material.opacity = 0.8;
	//cycleShadow[2].material.color.set(0xffffff);
	scene.add( cycleShadow[2] );
	
	//shadow for grey underbody chassis
	cycleShadow[3] = new THREE.ShadowMesh( cycle.children[3] );
	cycleShadow[3].material.side = THREE.DoubleSide;
	cycleShadow[3].material.opacity = 0.8;
	//cycleShadow[3].material.color.set(0xffffff);
	scene.add( cycleShadow[3] );
	
	initLevel();
	
} );

// JET TRAILS
var northSouthTrail = [];

var northSouthTrailGeometry = new THREE.BoxGeometry(0.05, 1.32, 10);
for ( var i = 0; i < northSouthTrailGeometry.faces.length; i++ ) {			
	northSouthTrailGeometry.faces[ i ].color.set( 'rgb(210,210,210)' );
}
northSouthTrailGeometry.faces[ 4 ].color.set( 'rgb(255,255,255)' );//top edge
northSouthTrailGeometry.faces[ 5 ].color.set( 'rgb(255,255,255)' );//top edge
northSouthTrailGeometry.faces[ 8 ].color.set( 'rgb(255,255,255)' );//south edge
northSouthTrailGeometry.faces[ 9 ].color.set( 'rgb(255,255,255)' );//south edge
northSouthTrailGeometry.faces[ 10 ].color.set( 'rgb(255,255,255)' );//north edge
northSouthTrailGeometry.faces[ 11 ].color.set( 'rgb(255,255,255)' );//north edge

var trailLineTexture = new THREE.ImageUtils.loadTexture( 'images/lineSegment.png' );
//trailLineTexture.minFilter = THREE.NearestMipMapNearestFilter; 
//trailLineTexture.wrapS = trailLineTexture.wrapT = THREE.RepeatWrapping; 
//trailLineTexture.repeat.set(2, 1);
var trailMaterial = new THREE.MeshBasicMaterial({
	map: trailLineTexture,
	color: 'rgb(255,190,0)',
	vertexColors: THREE.FaceColors
});

northSouthTrail[0] = new THREE.Mesh(northSouthTrailGeometry, trailMaterial);
northSouthTrail[0].position.set(0, 0.66, 34);
scene.add(northSouthTrail[0]);

trailShadow[0] = new THREE.ShadowMesh(northSouthTrail[0]);
trailShadow[0].material.opacity = 0.9;
scene.add(trailShadow[0]);

northSouthTrail[1] = new THREE.Mesh(northSouthTrailGeometry, trailMaterial);
northSouthTrail[1].position.set(0, 0.66, 44);
scene.add(northSouthTrail[1]);

trailShadow[1] = new THREE.ShadowMesh(northSouthTrail[1]);
trailShadow[1].material.opacity = 0.9;
scene.add(trailShadow[1]);

// Jet trail beginning (White blended to cycle's color)

var currentColorText = "";
var currentColorR1 = 0;
var currentColorG1 = 0;
var currentColorB1 = 0;
var currentColorR2 = 0;
var currentColorG2 = 0;
var currentColorB2 = 0;
// this dims the color to match trail's slightly darker texture masking color
var trailColorR = Math.floor( 255 * 0.65 );
var trailColorG = Math.floor( 190 * 0.65 );
var trailColorB = Math.floor( 0 * 0.65 );
var colorDeltaR = 255 - trailColorR;
var colorDeltaG = 255 - trailColorG;
var colorDeltaB = 255 - trailColorB;
var currentColorValue = new THREE.Color();
var curveSegments = 5;
var curveSegmentsX2 = curveSegments * 2;
var trailBeginningGeometry = new THREE.BoxGeometry(0.05, 1.32, 5, 1, 1, curveSegments);
var trailBeginningMaterial = new THREE.MeshBasicMaterial({ 
	//wireframe:true, 
	//shading: THREE.FlatShading,
	vertexColors: THREE.VertexColors 
});

//east side of trail wall
for ( var i = 0; i < curveSegmentsX2; i+=2 ) {
	// calculate color based on where we are along the rectangle (blends from trailColor to White, inside cycle's back wheel)
	currentColorR1 = trailColorR + Math.floor( colorDeltaR * (i / curveSegmentsX2) );
	currentColorG1 = trailColorG + Math.floor( colorDeltaG * (i / curveSegmentsX2) );
	currentColorB1 = trailColorB + Math.floor( colorDeltaB * (i / curveSegmentsX2) );
	currentColorR2 = trailColorR + Math.floor( colorDeltaR * ((i+2) / curveSegmentsX2) );
	currentColorG2 = trailColorG + Math.floor( colorDeltaG * ((i+2) / curveSegmentsX2) );
	currentColorB2 = trailColorB + Math.floor( colorDeltaB * ((i+2) / curveSegmentsX2) );
	
	// face(i) - the first series of triangles for this large rectangle
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i].vertexColors[0] = new THREE.Color().set(currentColorText);
	trailBeginningGeometry.faces[i].vertexColors[1] = new THREE.Color().set(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i].vertexColors[2] = new THREE.Color().set(currentColorText);
	
	// face(i+1) - the rest of the interlocking triangles for this large rectangle
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[0] = new THREE.Color().set(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[1] = new THREE.Color().set(currentColorText);
	trailBeginningGeometry.faces[i+1].vertexColors[2] = new THREE.Color().set(currentColorText);
	
}

//west side of trail wall
for ( var i = curveSegmentsX2; i < (curveSegmentsX2 * 2); i += 2 ) {
	
	currentColorR1 = 255 - Math.floor( colorDeltaR * ((i - curveSegmentsX2) / curveSegmentsX2) );
	currentColorG1 = 255 - Math.floor( colorDeltaG * ((i - curveSegmentsX2) / curveSegmentsX2) );
	currentColorB1 = 255 - Math.floor( colorDeltaB * ((i - curveSegmentsX2) / curveSegmentsX2) );
	currentColorR2 = 255 - Math.floor( colorDeltaR * (((i+2) - curveSegmentsX2) / curveSegmentsX2) );
	currentColorG2 = 255 - Math.floor( colorDeltaG * (((i+2) - curveSegmentsX2) / curveSegmentsX2) );
	currentColorB2 = 255 - Math.floor( colorDeltaB * (((i+2) - curveSegmentsX2) / curveSegmentsX2) );
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i].vertexColors[0] = new THREE.Color().set(currentColorText);
	trailBeginningGeometry.faces[i].vertexColors[1] = new THREE.Color().set(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i].vertexColors[2] = new THREE.Color().set(currentColorText);
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[0] = new THREE.Color().set(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[1] = new THREE.Color().set(currentColorText);
	trailBeginningGeometry.faces[i+1].vertexColors[2] = new THREE.Color().set(currentColorText);
	
}

//texture = (209,209,209) light grey color
colorDeltaR = 255 - 209;
colorDeltaG = 255 - 155;
colorDeltaB = 255 - 0;
//top of trail wall
for ( var i = curveSegmentsX2 * 2; i < curveSegmentsX2 * 3; i+=2 ) {
	
	currentColorR1 = 255 - Math.floor( colorDeltaR * ((i - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorG1 = 255 - Math.floor( colorDeltaG * ((i - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorB1 = 255 - Math.floor( colorDeltaB * ((i - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorR2 = 255 - Math.floor( colorDeltaR * (((i+2) - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorG2 = 255 - Math.floor( colorDeltaG * (((i+2) - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorB2 = 255 - Math.floor( colorDeltaB * (((i+2) - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i].vertexColors[0] = new THREE.Color().set(currentColorText);
	trailBeginningGeometry.faces[i].vertexColors[2] = new THREE.Color().set(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i].vertexColors[1] = new THREE.Color().set(currentColorText);
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[2] = new THREE.Color().set(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[0] = new THREE.Color().set(currentColorText);
	trailBeginningGeometry.faces[i+1].vertexColors[1] = new THREE.Color().set(currentColorText);
	
}



trailBeginning = new THREE.Mesh(trailBeginningGeometry, trailBeginningMaterial);
trailBeginning.position.set(0, 0.66, 26.5);
scene.add(trailBeginning);

// SOUNDS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
var totalSoundsToLoad = 1;
var soundsLoaded = 0;
var canPlayBeginLevelSound = false;
var soundMuted = true;
var thrustersSoundShouldStop = false;
var ufoSoundShouldStop = false;
var canStartThrustSound = true;
var canFadeThrustSound = false;
//load the game with the sound already muted - no loud surprises!
// (players must turn sounds on with the button)
Howler.mute(soundMuted);

document.getElementById("sound").style.cursor = "pointer";
document.getElementById("sound").addEventListener("click", function() {
	soundMuted = !soundMuted;
	if (soundMuted) {
		this.style.color = 'rgb(70,70,110)';
		this.innerHTML = "Sound: Off ";
	}
	else {
		this.style.color = 'rgb(200,200,255)';
		this.innerHTML = "Sound: On ";
	     }
	Howler.mute(soundMuted);
}, false);

var soundLrgAsteroidExplode = new Howl({
	src: ['sounds/asteroidExplode.mp3'],
	rate: 0.8,
	onload: function() {
		soundsLoaded += 1;
		if (soundsLoaded >= totalSoundsToLoad) startGame();
	}
});


// when all sounds have loaded, the game animation loop is started
function startGame () {
	bannerText.innerHTML = "Get Ready...";
	animate();
}

*/

// HUD html text elements /////////////////////////////////////////////////////////////////////////////////////////////////////////

var bannerText = document.getElementById("banner");
var scoreText = document.getElementById("score");
var gameOverText = document.getElementById("gameover");
// debug elements
var debug1Text = document.getElementById("debug1");

// Misc. Elements

//disable clicking and selecting/highlighting text of help, score, level, and gameOver banner texts
document.getElementById("help").style.cursor = "default";
document.getElementById("help").style.webkitUserSelect = "none";
document.getElementById("help").style.MozUserSelect = "none";
document.getElementById("help").style.msUserSelect = "none";
document.getElementById("help").style.userSelect = "none";
document.getElementById("help1").style.cursor = "default";
document.getElementById("help1").style.webkitUserSelect = "none";
document.getElementById("help1").style.MozUserSelect = "none";
document.getElementById("help1").style.msUserSelect = "none";
document.getElementById("help1").style.userSelect = "none";
document.getElementById("help2").style.cursor = "default";
document.getElementById("help2").style.webkitUserSelect = "none";
document.getElementById("help2").style.MozUserSelect = "none";
document.getElementById("help2").style.msUserSelect = "none";
document.getElementById("help2").style.userSelect = "none";
document.getElementById("score").style.cursor = "default";
document.getElementById("score").style.webkitUserSelect = "none";
document.getElementById("score").style.MozUserSelect = "none";
document.getElementById("score").style.msUserSelect = "none";
document.getElementById("score").style.userSelect = "none";
document.getElementById("banner").style.cursor = "default";
document.getElementById("banner").style.webkitUserSelect = "none";
document.getElementById("banner").style.MozUserSelect = "none";
document.getElementById("banner").style.msUserSelect = "none";
document.getElementById("banner").style.userSelect = "none";
document.getElementById("gameover").style.cursor = "default";
document.getElementById("gameover").style.webkitUserSelect = "none";
document.getElementById("gameover").style.MozUserSelect = "none";
document.getElementById("gameover").style.msUserSelect = "none";
document.getElementById("gameover").style.userSelect = "none";
