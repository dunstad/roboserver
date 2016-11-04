var container;
var camera, scene, renderer;
var controls;
var cube;
var cubeGeo;
var framerate = 1000/60;
var voxelSideLength = 50;
var robotVoxel;

init();
render();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

  scene = new THREE.Scene();

  // controls
  controls = new PointerLockControls(camera);
  var controlsObject = controls.getObject();

  // change the starting position of the camera/controls
  // settings for 0, 0
  controlsObject.translateZ(200);
  controlsObject.translateY(800);
  controlsObject.children[0].rotation.x = -1.5;

  // settings for 235, 63, 366
  // controlsObject.position.x = 9137.7;
  // controlsObject.position.y = 4234.5;
  // controlsObject.position.z = 18416.7;
  // controlsObject.rotation.y = -13.886;
  // controlsObject.children[0].rotation.x = -.8112;

  scene.add(controlsObject);

  // cubes

  cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );

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

// robotVoxel is global
function moveRobotVoxel(pos) {
  if (!robotVoxel) {
    robotVoxel = addVoxel(
      pos.x * voxelSideLength,
      pos.y * voxelSideLength,
      pos.z * voxelSideLength,
      0xff9999
    );
  }
  else {
    // robotVoxel.position is a Vector3, pos is not
    robotVoxel.position.x = pos.x * voxelSideLength;
    robotVoxel.position.y = pos.y * voxelSideLength;
    robotVoxel.position.z = pos.z * voxelSideLength;
  }
  render();
}

function addVoxel(x, y, z, color) {
  // default color is yellow
  var cubeMaterial = new THREE.MeshLambertMaterial({color: color || 0xfeb74c});
  var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
  voxel.position.set(x, y, z);
  scene.add(voxel);
  return voxel;
}

function addShapeVoxels(shape) {
  for(var x = 0; x < shape.w; x++) {
    for(var z = 0; z < shape.d; z++) {
      for(var y = 0; y < (shape.data.n / (shape.w * shape.d)); y++) {
        // this is how the geolyzer reports 3d data in a 1d array
        // also lua is indexed from 1
        index = (x + 1) + z*shape.w + y*shape.w*shape.d;
        if(shape.data[index]) {
          addVoxel(
            (x + shape.x) * voxelSideLength,
            (y + shape.y) * voxelSideLength,
            (z + shape.z) * voxelSideLength,
            colorFromHardness(shape.data[index])
          );
        }
      }
    }
  }
  // have the shapes appear immediately even if the camera isn't moving
  render();
}

// convert ranges of noisy hardness values to specific colors
function colorFromHardness(hardness) {

  var hardnessToColorMap = {
    // bedrock
    '-1': 0x000000,
    // leaves
    0.2: 0x00cc00,
    // glowstone
    0.3: 0xffcc00,
    // netherrack
    0.4: 0x800000,
    // dirt or sand
    0.5: 0xffc140,
    // grass block
    0.6: 0xddc100,
    // sandstone
    0.8: 0xffff99,
    // pumpkins or melons
    1.0: 0xfdca00,
    // smooth stone
    1.5: 0xcfcfcf,
    // cobblestone
    2.0: 0x959595,
    // ores
    3.0: 0x66ffff,
    // cobwebs
    4.0: 0xf5f5f5,
    // ore blocks
    5.0: 0xc60000,
    // obsidian
    50: 0x1f1f1f,
    // water or lava
    100: 0x9900cc
  };

  var closestMatch = 999; // arbitrarily high number
  var oldDifference = Math.abs(closestMatch - hardness);
  for (var key in hardnessToColorMap) {

    var newDifference = Math.abs(key - hardness);
    if (newDifference < oldDifference) {
      closestMatch = key;
      oldDifference = newDifference;
    }

  }

  return hardnessToColorMap[closestMatch];

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

render();
// after the first time, render only while controls are active
setInterval(function() {controls.enabled ? render() : false}, framerate);
