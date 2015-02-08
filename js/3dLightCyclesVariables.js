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

var renderer = new THREE.WebGLRenderer({
	//antialias: true
});
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


// GAME OBJECTS and MATERIALS /////////////////////////////////////////////////////////////////////////////////////////////////////

// LIGHTS
//var ambientLight = new THREE.AmbientLight('rgb(80,80,80)', 1);
//scene.add(ambientLight);
var directionalLight = new THREE.DirectionalLight('rgb(255,255,255)', 1);
directionalLight.position.set(0, 1000, 300);
directionalLight.lookAt(scene.position);
scene.add(directionalLight);

// MODELS
var cycle = new THREE.Mesh();
var loader = new THREE.ObjectLoader();
//the following load function gives us a mesh object which is in this function's local scope.  
// We call the mesh's clone function to copy it (and its properties) and place the end result in 'cycle', 
// which is a THREE.Mesh declared (above) globally, giving us access to change its position/rotation/etc..
loader.load( 'models/classic-1982-tron-light-cycle.json', function ( mesh ) {
	mesh.clone(cycle);//copy mesh's contents into the global 'cycle' mesh
	scene.add(cycle);//add the cycle mesh to the scene, so it becomes a game object
} );

// FLOOR
var floorTexture = new THREE.ImageUtils.loadTexture( 'images/grid_floor01.png' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 30, 30 );
//floorTexture.minFilter = THREE.LinearMipMapNearestFilter; 
var floorMaterial = new THREE.MeshPhongMaterial({
	shininess: 10,
	map: floorTexture
});
var floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / -2;
scene.add(floor);


// GAMEPLAY VARIABLES /////////////////////////////////////////////////////////////////////////////////////////////////////////////

var playerAlive = false;
var frameTime = 0;
var TWO_PI = Math.PI * 2;
var PI_4 = Math.PI / 4;
var upVector = new THREE.Vector3(0, 1, 0);
var rightVector = new THREE.Vector3(1, 0, 0);
var forwardVector = new THREE.Vector3(0, 0, -1);
var cycleRotationAmount = 2;



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

// HUD html text elements
var bannerText = document.getElementById("banner");
var scoreText = document.getElementById("score");
var gameOverText = document.getElementById("gameover");


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
