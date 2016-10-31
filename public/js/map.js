var container;
var camera, scene, renderer;
var controls;
var cube;
var cubeGeo, cubeMaterial;
var framerate = 1000/60;

init();
render();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  // camera.position.set( 50, 80, 130 );
  // camera.lookAt( new THREE.Vector3() );

  scene = new THREE.Scene();

  // controls
  controls = new PointerLockControls(camera);
  scene.add(controls.getObject());

  // cubes

  cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
  cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c} );

  // Lights

  var ambientLight = new THREE.AmbientLight( 0x606060 );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  render();

}

function render() {
  // use # of ms since last update as delta
  controls.update(framerate);
  renderer.render(scene, camera);
}

// code for drawing minecraft maps

function addVoxel(x, y, z) {
  var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
  voxel.position.set(x, y, z);
  scene.add( voxel );
}

function addShapeVoxels(shape) {
  voxelSideLength = 50;
  var yOffset = 32;
  // lua sends data in a weird format
  for (var i = 1; i <= shape.data.n; i++) {
    if (shape.data[i]) {
      addVoxel(
        // todo: add in shape.x, y and z for offsets later
        // todo: write an explanation of the math here
        // todo: fix this
        ((i - 1) % shape.w) * voxelSideLength,
        (Math.floor((i - 1) / (shape.w * shape.d)) - yOffset)  * voxelSideLength,
        ((i - 1) % (shape.w * shape.d))  * voxelSideLength
      );
    }
  }
}

function addColumnVoxels(col) {
  voxelSideLength = 50;
  var yOffset = 32;
  // lua sends data in a weird format
  for (var i = 1; i <= col.data.n; i++) {
    if (col.data[i]) {
      addVoxel(
        col.x * voxelSideLength,
        (i - yOffset)  * voxelSideLength,
        col.z  * voxelSideLength
      );
    }
  }
}

// locking/unlocking the cursor, enabling/disabling controls
if ('pointerLockElement' in document) {

  var element = renderer.domElement;

  function pointerLockChangeCB(event) {
    if (document.pointerLockElement === element) {controls.enabled = true;}
    else {
      controls.enabled = false;
      document.getElementById('commandInput').focus();
    }
  }

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerLockChangeCB, false );
  document.addEventListener( 'pointerlockerror', console.dir, false );

  element.addEventListener('click', function(event) {
    element.requestPointerLock();
  }, false);

}
else {alert("Your browser doesn't seem to support Pointer Lock API");}



// add the map data to the scene
// should probably be in init
addVoxel(0, 0, 0);
addVoxel(100, 0, 100);
addVoxel(-100, 0, 100);
addVoxel(100, 0, -100);
addVoxel(-100, 0, -100);

// todo: draw whatever data gets sent in from the socket


render();
// after the first time, render only while controls are active
setInterval(function() {controls.enabled ? render() : false}, framerate);
