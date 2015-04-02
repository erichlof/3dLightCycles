/*
** GLOBAL VARIABLES and OBJECTS
*/


// WINDOW, CAMERA, and SCENE VARIABLES ///////////////////////////////////////////////////////////////////////////////////////////

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SCREEN_HEIGHT_DIVISION = SCREEN_HEIGHT / 3.5; // used for dual camera
var SCREEN_HEIGHT_DIVISION_X_0_9 = SCREEN_HEIGHT_DIVISION * 0.9; // 0.9, so there is a dividing black bar between camera views
var SCREEN_HEIGHT_MINUS_SCREEN_HEIGHT_DIVISION = SCREEN_HEIGHT - SCREEN_HEIGHT_DIVISION;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT_MINUS_SCREEN_HEIGHT_DIVISION, 0.1, 2000);
scene.add(camera);
var enemyCamera = new THREE.PerspectiveCamera(25, SCREEN_WIDTH / SCREEN_HEIGHT_DIVISION_X_0_9, 0.1, 2000);
scene.add(enemyCamera);

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

// are we in portrait mobile view? if so, move the buttons over to the left a little..
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
var controls = new THREEx.FirstPersonControls(camera, true);
scene.add( controls.getObject() );
var enemyControls = new THREEx.FirstPersonControls(enemyCamera, false);
scene.add( enemyControls.getObject() );

var mouseControl = false;
// if not on a mobile device, enable mouse control 
if ( !('createTouch' in document) ) {
	mouseControl = true;
}

// the following variables will be used to calculate rotations and directions from the camera, 
// such as when shooting, which direction do we shoot in?
var cameraRotationVector = new THREE.Vector3();//for moving and firing projectiles where the camera is looking
var cameraWorldQuaternion = new THREE.Quaternion();//for rotating scene objects to match camera's current rotation
var cameraControlsObject = controls.getObject();//for positioning and moving the camera itself
var cameraControlsYawObject = controls.getYawObject();//allows access to control camera's left/right movements through mobile input
var cameraControlsPitchObject = controls.getPitchObject();//allows access to control camera's up/down movements through mobile input

var enemyCameraRotationVector = new THREE.Vector3();
var enemyCameraWorldQuaternion = new THREE.Quaternion();
var enemyCameraControlsObject = enemyControls.getObject();
var enemyCameraControlsYawObject = enemyControls.getYawObject();
var enemyCameraControlsPitchObject = enemyControls.getPitchObject();


var renderer = new THREE.WebGLRenderer();
// pixelRatio of 1 is default. Numbers less than 1 result in less pixels and larger pixels. Must be > 0.0
//renderer.setPixelRatio(0.5);
//renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
document.getElementById("container").appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize, false);
var fontAspect = 0;

var bannerElement = document.getElementById("banner");
var scoreElement = document.getElementById("score");
var gameOverElement = document.getElementById("gameover");
var containerElement = document.getElementById("container");
	
// debug elements
var debug1Element = document.getElementById("debug1");

if (mouseControl) {
	
	document.getElementById("banner").addEventListener("click", function() {
		this.requestPointerLock = this.requestPointerLock || this.mozRequestPointerLock;
		this.requestPointerLock();
	}, false);

	document.getElementById("container").addEventListener("click", function() {
		this.requestPointerLock = this.requestPointerLock || this.mozRequestPointerLock;
		this.requestPointerLock();
	}, false);

	document.getElementById("banner").addEventListener("mousedown", function(event) {
		if (playerAlive && !gamePaused) {
			if(event.button === 0)
				turnCycleLeft = true;
			else if(event.button === 2)
				turnCycleRight = true;
		}	
	}, false);

	document.getElementById("container").addEventListener("mousedown", function(event) {
		if (playerAlive && !gamePaused) {
			if(event.button === 0)
				turnCycleLeft = true;
			else if(event.button === 2)
				turnCycleRight = true;
		}	
	}, false);
	
	
	var pointerlockChange = function ( event ) {
		
		if ( document.pointerLockElement === bannerElement || document.mozPointerLockElement === bannerElement || document.webkitPointerLockElement === bannerElement ||
		   	document.pointerLockElement === containerElement || document.mozPointerLockElement === containerElement || document.webkitPointerLockElement === containerElement ) {
			
			bannerElement.style.display = 'none';
			gamePaused = false;
			
		} else {
			
			bannerElement.style.display = '';
			gamePaused = true;
			
		}
		
	};
	
	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockChange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockChange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockChange, false );

}



function onWindowResize() {
	
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	
	SCREEN_HEIGHT_DIVISION = SCREEN_HEIGHT / 3.5;
	SCREEN_HEIGHT_DIVISION_X_0_9 = SCREEN_HEIGHT_DIVISION * 0.9;
	SCREEN_HEIGHT_MINUS_SCREEN_HEIGHT_DIVISION = SCREEN_HEIGHT - SCREEN_HEIGHT_DIVISION;
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	
	fontAspect = (SCREEN_WIDTH / 175) * (SCREEN_HEIGHT / 200);
	if (fontAspect > 25) fontAspect = 25;
	if (fontAspect < 4) fontAspect = 4;
	
	
	document.getElementById("sound").style.fontSize = (fontAspect) + "px";
	
	fontAspect *= 2;
	bannerElement.style.fontSize = fontAspect + "px";
	scoreElement.style.fontSize = fontAspect + "px";
	
	fontAspect *= 3;
	gameOverElement.style.fontSize = fontAspect + "px";
	
	
	
	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT_MINUS_SCREEN_HEIGHT_DIVISION;
	camera.updateProjectionMatrix();
	
	enemyCamera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT_DIVISION_X_0_9;
	enemyCamera.updateProjectionMatrix();
	

	// check if mobile device is in portrait or landscape mode and position buttons accordingly
	b2PercentLeft = SCREEN_WIDTH < SCREEN_HEIGHT ? 50 : 65;
	joystick._button2El.style.left = b2PercentLeft + "%";
	b1PercentLeft = SCREEN_WIDTH < SCREEN_HEIGHT ? 76 : 80;
	joystick._button1El.style.left = b1PercentLeft + "%";
			
}


// GAMEPLAY VARIABLES /////////////////////////////////////////////////////////////////////////////////////////////////////////////

//var variablesReady = 0;
var playerAlive = false;
var enemyAlive = false;
var canPause = true;
var gamePaused = true;
//var gameBeginningFlag = true;
var CockpitCamera_MODE = 0;
var Close_3rdPersonCamera_MODE = 1;
var Far_3rdPersonCamera_MODE = 2;
var SkyCamera_MODE = 3;
var cameraMode = Close_3rdPersonCamera_MODE;
var enemyCameraMode = Close_3rdPersonCamera_MODE;
var frameTime = 0;
var TWO_PI = Math.PI * 2;
var PI_4 = Math.PI / 4;
var north_Y_Rotation = 0;
var west_Y_Rotation = PI_2;
var south_Y_Rotation = Math.PI;
var east_Y_Rotation = Math.PI + PI_2;

var NORTH = 0;
var EAST = 1;
var SOUTH = 2;
var WEST = 3;
var cycleDirection = NORTH;
var enemyCycleDirection = SOUTH;
var northVector = new THREE.Vector3(0, 0, -1);
var southVector = new THREE.Vector3(0, 0, 1);
var eastVector = new THREE.Vector3(1, 0, 0);
var westVector = new THREE.Vector3(-1, 0, 0);
var cycleHeadingVector = new THREE.Vector3();
var enemyCycleHeadingVector = new THREE.Vector3();
var canTurnLeft = false;
var canTurnRight = false;
var cycleSpeed = 20;
var enemyCycleSpeed = 20;
var playingCrashAnimation = false;
var playingTrailDisappearAnimation = false;
var trailLoweringAmount = 0;
var crashAnimationTimer = new THREEx.GameTimer(1.5);
var trailDisappearAnimationTimer = new THREEx.GameTimer(3);

var cycleJustTurned = false;
var turnCycleRight = false;
var turnCycleLeft = false;
var turningNorthFromEast = false;
var turningNorthFromWest = false;
var turningEastFromNorth = false;
var turningEastFromSouth = false;
var turningSouthFromEast = false;
var turningSouthFromWest = false;
var turningWestFromNorth = false;
var turningWestFromSouth = false;

var enemyCycleJustTurned = false;
var enemyTurnCycleRight = false;
var enemyTurnCycleLeft = false;
var enemyTurningNorthFromEast = false;
var enemyTurningNorthFromWest = false;
var enemyTurningEastFromNorth = false;
var enemyTurningEastFromSouth = false;
var enemyTurningSouthFromEast = false;
var enemyTurningSouthFromWest = false;
var enemyTurningWestFromNorth = false;
var enemyTurningWestFromSouth = false;

var upVector = new THREE.Vector3(0, 1, 0);
var rightVector = new THREE.Vector3(1, 0, 0);
var forwardVector = new THREE.Vector3(0, 0, -1);
var cameraDistance = 0;
var enemyCameraDistance = 0;

var northSouthTrailCount = -1; // start this index at -1 so that during init time, 1 gets added to it, making 0th element
var eastWestTrailCount = -1;
var testNSTrailCount = -1;
var testEWTrailCount = -1;
var northSouthTrail = [];
var eastWestTrail = [];
var trailSpawnX = 0;
var trailSpawnZ = 0;
var cycleTrailSpawnDistance = 0;
var animatingBlendedTrail = false;

var cyclePositionX = 0;
var cyclePositionZ = 0;
var test_NS_trailX = [];
var test_NS_trailStartZ = [];
var test_NS_trailEndZ = [];
var test_NS_currentTrailStartZ = 0;
var test_EW_trailZ = [];
var test_EW_trailStartX = [];
var test_EW_trailEndX = [];
var test_EW_currentTrailStartX = 0;
// Shadows
var cycleShadow = [];
var enemyCycleShadow = [];
var northSouthTrailShadow = [];
var eastWestTrailShadow = [];
var blendedBeginningTrailShadow;
var normalVector = new THREE.Vector3( 0, 1, 0 );
var planeConstant = 0.01;
var groundPlane = new THREE.Plane( normalVector, planeConstant );
var verticalAngle = 0;
var horizontalAngle = 0;
var testAngle = 0;
var flipper = 0;


// GAME OBJECTS and MATERIALS /////////////////////////////////////////////////////////////////////////////////////////////////////

// LIGHTS
//var ambientLight = new THREE.AmbientLight('rgb(80,80,80)', 1);
//scene.add(ambientLight);
var directionalLight = new THREE.DirectionalLight('rgb(255,255,255)', 1);
directionalLight.position.set(-1000, 5000, 1000);
directionalLight.lookAt(scene.position);
scene.add(directionalLight);

var lightPosition4D = new THREE.Vector4();
lightPosition4D.x = directionalLight.position.x;
lightPosition4D.y = directionalLight.position.y;
lightPosition4D.z = directionalLight.position.z;
lightPosition4D.w = 0.5;


// FLOOR
var arenaRadius = 100;
var floorTexture = new THREE.ImageUtils.loadTexture( 'images/grid_floor2.png' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set(arenaRadius * 0.72, arenaRadius * 0.72);
//floorTexture.minFilter = THREE.LinearMipMapLinearFilter; 
var floorMaterial = new THREE.MeshPhongMaterial({
	emissive: 'rgb(5,5,5)',
	shininess: 10,
	map: floorTexture
});
var floorGeometry = new THREE.PlaneBufferGeometry(arenaRadius * 2, arenaRadius * 2, 1, 1);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / -2;
scene.add(floor);

// TEST TRANSPARENCY
var explosionRingsTexture = new THREE.ImageUtils.loadTexture( 'images/explosionRings.png' );
var explosionRingsMaterial = new THREE.MeshBasicMaterial({
	transparent: true,
	opacity: 1.0,
	side: THREE.DoubleSide,
	map: explosionRingsTexture
});
var explosionTextureSize = 5;
var explosionRingsGeometry = new THREE.PlaneBufferGeometry(explosionTextureSize, explosionTextureSize / 2, 1, 1);
var explosionRings = new THREE.Mesh(explosionRingsGeometry, explosionRingsMaterial);
explosionRings.position.y = -10;//pre-load the texture under the grid floor
explosionRings.visible = true;
scene.add(explosionRings);


// ARENA WALLS
var arenaNorthWallTexture = new THREE.ImageUtils.loadTexture( 'images/arenaWalls2.png' );
arenaNorthWallTexture.wrapS = THREE.ClampToEdgeWrapping;
arenaNorthWallTexture.wrapT = THREE.RepeatWrapping;
arenaNorthWallTexture.offset.set(0, 0.765);//NORTH WALL
//arenaWestWallTexture.offset.set(0, 0);//WEST WALL
//arenaEastWallTexture.offset.set(0, 0.5);//EAST WALL
//arenaSouthWallTexture.offset.set(0, 0.25);//SOUTH WALL
arenaNorthWallTexture.repeat.set(1, 0.225);// 1, 0.225
//arenaNorthWallTexture.maxFilter = THREE.NearestFilter;
var arenaNorthWallMaterial = new THREE.MeshBasicMaterial({
	//color: 'rgb(200,200,200)',
	map: arenaNorthWallTexture
});
var arenaNorthWallGeometry = new THREE.PlaneBufferGeometry(arenaRadius * 2, arenaRadius * 0.14, 1, 1);
var arenaNorthWall = new THREE.Mesh(arenaNorthWallGeometry, arenaNorthWallMaterial);
//arenaSouthWall.rotation.y = Math.PI / -2;
arenaNorthWall.position.set(0, arenaRadius * 0.07, -arenaRadius);
scene.add(arenaNorthWall);

var arenaSouthWallTexture = new THREE.ImageUtils.loadTexture( 'images/arenaWalls2.png' );
//var arenaSouthWallTexture = arenaNorthWallTexture.clone();
arenaSouthWallTexture.wrapS = THREE.ClampToEdgeWrapping;
arenaSouthWallTexture.wrapT = THREE.RepeatWrapping;
arenaSouthWallTexture.offset.set(0, 0.265);//SOUTH WALL
arenaSouthWallTexture.repeat.set(1, 0.225); 
var arenaSouthWallMaterial = new THREE.MeshBasicMaterial({
	//emissive: 'rgb(5,5,5)',
	map: arenaSouthWallTexture
});
var arenaSouthWallGeometry = new THREE.PlaneBufferGeometry(arenaRadius * 2, arenaRadius * 0.14, 1, 1);
var arenaSouthWall = new THREE.Mesh(arenaSouthWallGeometry, arenaSouthWallMaterial);
arenaSouthWall.position.set(0, arenaRadius * 0.07, arenaRadius);
arenaSouthWall.rotation.y = -Math.PI;
scene.add(arenaSouthWall);

var arenaEastWallTexture = new THREE.ImageUtils.loadTexture( 'images/arenaWalls2.png' );
//var arenaEastWallTexture = arenaNorthWallTexture.clone();
arenaEastWallTexture.wrapS = THREE.ClampToEdgeWrapping;
arenaEastWallTexture.wrapT = THREE.RepeatWrapping;
arenaEastWallTexture.offset.set(0, 0.515);//EAST WALL
arenaEastWallTexture.repeat.set(1, 0.225); 
var arenaEastWallMaterial = new THREE.MeshBasicMaterial({
	//emissive: 'rgb(5,5,5)',
	map: arenaEastWallTexture
});
var arenaEastWallGeometry = new THREE.PlaneBufferGeometry(arenaRadius * 2, arenaRadius * 0.14, 1, 1);
var arenaEastWall = new THREE.Mesh(arenaEastWallGeometry, arenaEastWallMaterial);
arenaEastWall.position.set(arenaRadius, arenaRadius * 0.07, 0);
arenaEastWall.rotation.y = -Math.PI * 0.5;
scene.add(arenaEastWall);

var arenaWestWallTexture = new THREE.ImageUtils.loadTexture( 'images/arenaWalls2.png' );
//var arenaWestWallTexture = arenaNorthWallTexture.clone();
arenaWestWallTexture.wrapS = THREE.ClampToEdgeWrapping;
arenaWestWallTexture.wrapT = THREE.RepeatWrapping;
arenaWestWallTexture.offset.set(0, 0.015);//WEST WALL
arenaWestWallTexture.repeat.set(1, 0.225); 
var arenaWestWallMaterial = new THREE.MeshBasicMaterial({
	//emissive: 'rgb(5,5,5)',
	map: arenaWestWallTexture
});
var arenaWestWallGeometry = new THREE.PlaneBufferGeometry(arenaRadius * 2, arenaRadius * 0.14, 1, 1);
var arenaWestWall = new THREE.Mesh(arenaWestWallGeometry, arenaWestWallMaterial);
arenaWestWall.position.set(-arenaRadius, arenaRadius * 0.07, 0);
arenaWestWall.rotation.y = Math.PI * 0.5;
scene.add(arenaWestWall);


// JET TRAIL BLENDED, CURVED BEGINNING SEGMENT (White, blended to cycle's color)

var trailLength = 10;
var trailScale = 1;
var trailBeginningLength = 1;
var trailBeginningVerticalScale = 1;
var trailHeight = 1.4;
var halfTrailHeight = trailHeight * 0.5;

var currentColorText = "";
var currentColorR1 = 0;
var currentColorG1 = 0;
var currentColorB1 = 0;
var currentColorR2 = 0;
var currentColorG2 = 0;
var currentColorB2 = 0;
// this dims the color to match the main trail's slightly darker texture masking color
var trailColorR = Math.floor( 255 * 0.67 );
var trailColorG = Math.floor( 190 * 0.67 );
var trailColorB = Math.floor( 0 * 0.67 );
var colorDeltaR = 255 - trailColorR;
var colorDeltaG = 255 - trailColorG;
var colorDeltaB = 255 - trailColorB;
var curveSegments = 8;//8
var curveSegmentsX2 = curveSegments * 2; 
// make the following 0.06 width instead of 0.05 so that the blended trail will cover up 
// the light vertical line segment of the main trail
var trailBeginningGeometry = new THREE.BoxGeometry(0.06, trailHeight, 1, 1, 1, curveSegments);

var v2 = 0;
var deformVec = new THREE.Vector3();
// when changing the top of the trailBeginning to gently curve downward towards cycle's rear wheel,
// vertices[0]is southeast corner, [1] is east right above (north of) 0, [2] is north of that, etc.. till [curveSegments]
// then going back south along the west side, starting at (curveSegmentsX2 + 2), continue till (curveSegmentsX2 + 2) + curveSegments
for (var v = 0; v <= curveSegments; v++) {
	deformVec.set(-v * 0.005, (-v * v * v) * 0.0008, 0);
	trailBeginningGeometry.vertices[v].add(deformVec);
	v2 = v;
}
for (var v = (curveSegmentsX2 + 2); v <= (curveSegmentsX2 + 2 + curveSegments); v++) {
	deformVec.set(v2 * 0.005, (-v2 * v2 * v2) * 0.0008, 0);
	trailBeginningGeometry.vertices[v].add(deformVec);
	v2 -= 1;
}


// east side of beginning trail wall
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
	trailBeginningGeometry.faces[i].vertexColors[0] = new THREE.Color().setStyle(currentColorText);
	trailBeginningGeometry.faces[i].vertexColors[1] = new THREE.Color().setStyle(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i].vertexColors[2] = new THREE.Color().setStyle(currentColorText);
	
	// face(i+1) - the rest of the interlocking triangles for this large rectangle
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[0] = new THREE.Color().setStyle(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[1] = new THREE.Color().setStyle(currentColorText);
	trailBeginningGeometry.faces[i+1].vertexColors[2] = new THREE.Color().setStyle(currentColorText);
	
	
	
	
}

// west side of beginning trail wall
for ( var i = curveSegmentsX2; i < (curveSegmentsX2 * 2); i += 2 ) {
	
	currentColorR1 = 255 - Math.floor( colorDeltaR * ((i - curveSegmentsX2) / curveSegmentsX2) );
	currentColorG1 = 255 - Math.floor( colorDeltaG * ((i - curveSegmentsX2) / curveSegmentsX2) );
	currentColorB1 = 255 - Math.floor( colorDeltaB * ((i - curveSegmentsX2) / curveSegmentsX2) );
	currentColorR2 = 255 - Math.floor( colorDeltaR * (((i+2) - curveSegmentsX2) / curveSegmentsX2) );
	currentColorG2 = 255 - Math.floor( colorDeltaG * (((i+2) - curveSegmentsX2) / curveSegmentsX2) );
	currentColorB2 = 255 - Math.floor( colorDeltaB * (((i+2) - curveSegmentsX2) / curveSegmentsX2) );
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i].vertexColors[0] = new THREE.Color().setStyle(currentColorText);
	trailBeginningGeometry.faces[i].vertexColors[1] = new THREE.Color().setStyle(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i].vertexColors[2] = new THREE.Color().setStyle(currentColorText);
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[0] = new THREE.Color().setStyle(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[1] = new THREE.Color().setStyle(currentColorText);
	trailBeginningGeometry.faces[i+1].vertexColors[2] = new THREE.Color().setStyle(currentColorText);
	
}

// main trail texture max intensity = (209,209,209) light grey color
colorDeltaR = 255 - 209;
colorDeltaG = 255 - 155;
colorDeltaB = 255 - 0;

// top of beginning trail wall
for ( var i = curveSegmentsX2 * 2; i < curveSegmentsX2 * 3; i+=2 ) {
	
	currentColorR1 = 255 - Math.floor( colorDeltaR * ((i - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorG1 = 255 - Math.floor( colorDeltaG * ((i - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorB1 = 255 - Math.floor( colorDeltaB * ((i - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorR2 = 255 - Math.floor( colorDeltaR * (((i+2) - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorG2 = 255 - Math.floor( colorDeltaG * (((i+2) - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	currentColorB2 = 255 - Math.floor( colorDeltaB * (((i+2) - (curveSegmentsX2 * 2)) / curveSegmentsX2) );
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i].vertexColors[0] = new THREE.Color().setStyle(currentColorText);
	trailBeginningGeometry.faces[i].vertexColors[2] = new THREE.Color().setStyle(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i].vertexColors[1] = new THREE.Color().setStyle(currentColorText);
	
	currentColorText = "rgb(" + currentColorR1 + "," + currentColorG1 + "," + currentColorB1 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[2] = new THREE.Color().setStyle(currentColorText);
	currentColorText = "rgb(" + currentColorR2 + "," + currentColorG2 + "," + currentColorB2 + ")";
	trailBeginningGeometry.faces[i+1].vertexColors[0] = new THREE.Color().setStyle(currentColorText);
	trailBeginningGeometry.faces[i+1].vertexColors[1] = new THREE.Color().setStyle(currentColorText);
	
}

// capped vertical end-face of this blended trail
trailBeginningGeometry.faces[curveSegmentsX2 * 4].vertexColors[0] = new THREE.Color().setStyle( 'rgb(165,123,0)' );
trailBeginningGeometry.faces[curveSegmentsX2 * 4].vertexColors[1] = new THREE.Color().setStyle( 'rgb(165,123,0)' );
trailBeginningGeometry.faces[curveSegmentsX2 * 4].vertexColors[2] = new THREE.Color().setStyle( 'rgb(165,123,0)' );
trailBeginningGeometry.faces[curveSegmentsX2 * 4+1].vertexColors[0] = new THREE.Color().setStyle( 'rgb(165,123,0)' );
trailBeginningGeometry.faces[curveSegmentsX2 * 4+1].vertexColors[1] = new THREE.Color().setStyle( 'rgb(165,123,0)' );
trailBeginningGeometry.faces[curveSegmentsX2 * 4+1].vertexColors[2] = new THREE.Color().setStyle( 'rgb(165,123,0)' );


var trailBeginningMaterial = new THREE.MeshBasicMaterial({
	vertexColors: THREE.VertexColors
});
var trailBeginning = new THREE.Mesh(trailBeginningGeometry, trailBeginningMaterial);
scene.add(trailBeginning);

blendedBeginningTrailShadow = new THREE.ShadowMesh(trailBeginning);
blendedBeginningTrailShadow.material.opacity = 0.9;
//blendedBeginningTrailShadow.visible = false;
scene.add(blendedBeginningTrailShadow);


// MAIN JET TRAILS

var northSouthTrailGeometry = new THREE.BoxGeometry(0.05, trailHeight, 10);

for ( var i = 0; i < northSouthTrailGeometry.faces.length; i++ ) {			
	northSouthTrailGeometry.faces[ i ].color.set( 'rgb(210,210,210)' );
}
northSouthTrailGeometry.faces[ 4 ].color.set( 'rgb(255,255,255)' );//top edge
northSouthTrailGeometry.faces[ 5 ].color.set( 'rgb(255,255,255)' );//top edge
northSouthTrailGeometry.faces[ 8 ].color.set( 'rgb(255,255,255)' );//south edge
northSouthTrailGeometry.faces[ 9 ].color.set( 'rgb(255,255,255)' );//south edge
northSouthTrailGeometry.faces[ 10 ].color.set( 'rgb(255,255,255)' );//north edge
northSouthTrailGeometry.faces[ 11 ].color.set( 'rgb(255,255,255)' );//north edge

var eastWestTrailGeometry = new THREE.BoxGeometry(10, trailHeight, 0.05);

for ( var i = 0; i < eastWestTrailGeometry.faces.length; i++ ) {			
	eastWestTrailGeometry.faces[ i ].color.set( 'rgb(210,210,210)' );
}
eastWestTrailGeometry.faces[ 4 ].color.set( 'rgb(255,255,255)' );//top edge
eastWestTrailGeometry.faces[ 5 ].color.set( 'rgb(255,255,255)' );//top edge
eastWestTrailGeometry.faces[ 0 ].color.set( 'rgb(255,255,255)' );//east edge
eastWestTrailGeometry.faces[ 1 ].color.set( 'rgb(255,255,255)' );//east edge
eastWestTrailGeometry.faces[ 2 ].color.set( 'rgb(255,255,255)' );//west edge
eastWestTrailGeometry.faces[ 3 ].color.set( 'rgb(255,255,255)' );//west edge

var trailLineTexture = new THREE.ImageUtils.loadTexture( 'images/lineSegment01.png' );

var trailMaterial = new THREE.MeshBasicMaterial({
	map: trailLineTexture,
	color: 'rgb(255,190,0)',
	vertexColors: THREE.FaceColors
});

northSouthTrail[0] = new THREE.Mesh(northSouthTrailGeometry, trailMaterial);
northSouthTrail[0].position.set(0, halfTrailHeight, 30);
northSouthTrail[0].visible = false;
scene.add(northSouthTrail[0]);

northSouthTrailShadow[0] = new THREE.ShadowMesh(northSouthTrail[0]);
northSouthTrailShadow[0].material.opacity = 0.9;
northSouthTrailShadow[0].visible = false;
scene.add(northSouthTrailShadow[0]);

// make many copies of these jet walls for later use
for ( var i = 1; i < 1000; i++ ) {			
	northSouthTrail[i] = northSouthTrail[0].clone();
	northSouthTrail[i].visible = false;
	scene.add(northSouthTrail[i]);
	
	northSouthTrailShadow[i] = new THREE.ShadowMesh(northSouthTrail[i]);
	northSouthTrailShadow[i].material.opacity = 0.9;
	northSouthTrailShadow[i].visible = false;
	scene.add(northSouthTrailShadow[i]);
}


eastWestTrail[0] = new THREE.Mesh(eastWestTrailGeometry, trailMaterial);
eastWestTrail[0].visible = false;
scene.add(eastWestTrail[0]);

eastWestTrailShadow[0] = new THREE.ShadowMesh(eastWestTrail[0]);
eastWestTrailShadow[0].material.opacity = 0.9;
eastWestTrailShadow[0].visible = false;
scene.add(eastWestTrailShadow[0]);

// make many copies of these jet walls for later use
for ( var i = 1; i < 1000; i++ ) {			
	eastWestTrail[i] = eastWestTrail[0].clone();
	eastWestTrail[i].visible = false;
	scene.add(eastWestTrail[i]);
	
	eastWestTrailShadow[i] = new THREE.ShadowMesh(eastWestTrail[i]);
	eastWestTrailShadow[i].material.opacity = 0.9;
	eastWestTrailShadow[i].visible = false;
	scene.add(eastWestTrailShadow[i]);
}



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
// load the game with the sound already muted - no loud surprises!
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
	bannerElement.innerHTML = "Get Ready...";

	onWindowResize();
	initLevel();
}

*/

// HUD html text elements /////////////////////////////////////////////////////////////////////////////////////////////////////////

// disable clicking and selecting/highlighting text of help, score, level, and gameOver banner elements
document.getElementById("help").style.cursor = "default";
document.getElementById("help").style.webkitUserSelect = "none";
document.getElementById("help").style.MozUserSelect = "none";
//document.getElementById("help").style.msUserSelect = "none";
document.getElementById("help").style.userSelect = "none";
document.getElementById("help1").style.cursor = "default";
document.getElementById("help1").style.webkitUserSelect = "none";
document.getElementById("help1").style.MozUserSelect = "none";
//document.getElementById("help1").style.msUserSelect = "none";
document.getElementById("help1").style.userSelect = "none";
document.getElementById("help2").style.cursor = "default";
document.getElementById("help2").style.webkitUserSelect = "none";
document.getElementById("help2").style.MozUserSelect = "none";
//document.getElementById("help2").style.msUserSelect = "none";
document.getElementById("help2").style.userSelect = "none";
document.getElementById("score").style.cursor = "default";
document.getElementById("score").style.webkitUserSelect = "none";
document.getElementById("score").style.MozUserSelect = "none";
//document.getElementById("score").style.msUserSelect = "none";
document.getElementById("score").style.userSelect = "none";
document.getElementById("gameover").style.cursor = "default";
document.getElementById("gameover").style.webkitUserSelect = "none";
document.getElementById("gameover").style.MozUserSelect = "none";
//document.getElementById("gameover").style.msUserSelect = "none";
document.getElementById("gameover").style.userSelect = "none";
document.getElementById("banner").style.cursor = "pointer";
document.getElementById("sound").style.cursor = "pointer";
document.getElementById("cameraButton").style.cursor = "pointer";

//variablesReady += 1;

// MODELS
var cycle = new THREE.Mesh();
var enemyCycle = new THREE.Mesh();
var loader = new THREE.ObjectLoader();

window.onload = function() {
			
	// the following load function gives us a mesh object which is in this function's local scope.  
	// We call the mesh's clone function to copy it (and its properties) and place the end result in 'cycle', 
	// which is a THREE.Mesh declared (above) globally, giving us access to change its position/rotation/etc..
	loader.load( 'models/classic-1982-tron-light-cycle.json', function ( mesh ) {

		cycle = mesh.clone();//copy mesh's contents into the global 'cycle' mesh
		scene.add(cycle);//add the cycle mesh to the scene, so it becomes a game object

		cycle.children[1].material.color.set('rgb(130,100,55)');// main colored hull
		cycle.children[1].material.specular.set('rgb(255,200,5)');// main hull specular highlight color
		cycle.children[1].material.emissive.set('rgb(30,15,0)');// main colored hull emissive
		
		cycle.children[3].material.emissive.set('rgb(10,10,10)');// grey underbody chassis

		// shadow for black windows
		cycleShadow[0] = new THREE.ShadowMesh( cycle.children[0] );
		cycleShadow[0].material.side = THREE.DoubleSide;
		cycleShadow[0].material.opacity = 0.8;
		scene.add( cycleShadow[0] );

		// shadow for main colored hull
		cycleShadow[1] = new THREE.ShadowMesh( cycle.children[1] );
		cycleShadow[1].material.side = THREE.DoubleSide;
		cycleShadow[1].material.opacity = 0.8;
		scene.add( cycleShadow[1] );

		// shadow for wheel rims/hubcaps
		cycleShadow[2] = new THREE.ShadowMesh( cycle.children[2] );
		cycleShadow[2].material.side = THREE.DoubleSide;
		cycleShadow[2].material.opacity = 0.8;
		scene.add( cycleShadow[2] );

		// shadow for grey underbody chassis
		cycleShadow[3] = new THREE.ShadowMesh( cycle.children[3] );
		cycleShadow[3].material.side = THREE.DoubleSide;
		cycleShadow[3].material.opacity = 0.8;
		scene.add( cycleShadow[3] );

	} );
	
	loader.load( 'models/classic-1982-tron-light-cycle.json', function ( mesh ) {

		// ENEMY CYCLE
		enemyCycle = mesh.clone();//copy mesh's contents into the global 'cycle' mesh
		scene.add(enemyCycle);//add the cycle mesh to the scene, so it becomes a game object

		//enemyCycle.rotation.set(0, Math.PI, 0);
		enemyCycle.children[1].material.color.set('rgb(0,84,183)');// main colored hull
		enemyCycle.children[1].material.specular.set('rgb(133,142,219)');// main hull specular highlight color
		enemyCycle.children[1].material.emissive.set('rgb(0,10,30)');// main colored hull emissive
		
		enemyCycle.children[3].material.emissive.set('rgb(10,10,10)');// grey underbody chassis

		// shadow for black windows
		enemyCycleShadow[0] = new THREE.ShadowMesh( enemyCycle.children[0] );
		enemyCycleShadow[0].material.side = THREE.DoubleSide;
		enemyCycleShadow[0].material.opacity = 0.8;
		scene.add( enemyCycleShadow[0] );

		// shadow for main colored hull
		enemyCycleShadow[1] = new THREE.ShadowMesh( enemyCycle.children[1] );
		enemyCycleShadow[1].material.side = THREE.DoubleSide;
		enemyCycleShadow[1].material.opacity = 0.8;
		scene.add( enemyCycleShadow[1] );

		// shadow for wheel rims/hubcaps
		enemyCycleShadow[2] = new THREE.ShadowMesh( enemyCycle.children[2] );
		enemyCycleShadow[2].material.side = THREE.DoubleSide;
		enemyCycleShadow[2].material.opacity = 0.8;
		scene.add( enemyCycleShadow[2] );

		// shadow for grey underbody chassis
		enemyCycleShadow[3] = new THREE.ShadowMesh( enemyCycle.children[3] );
		enemyCycleShadow[3].material.side = THREE.DoubleSide;
		enemyCycleShadow[3].material.opacity = 0.8;
		scene.add( enemyCycleShadow[3] );
		

		onWindowResize();
		initLevel();

	} );

};
