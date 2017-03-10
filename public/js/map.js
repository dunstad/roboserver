var container;
var camera, scene, renderer;
var controls;
var cube;
var cubeGeo, cubeMat;
var rollOverGeo, rollOverMesh, rollOverMaterial;
var framerate = 1000/30;
var voxelSideLength = 50;
var raycaster;
var voxels = [];
var voxelMap = new VoxelMap();
var robotVoxel;

main();

function main() {
  init();
  render();
  initPointerLock();
  initMoveOnClick()
  render();
  setInterval(function() {controls.enabled ? render() : false}, framerate);
}

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

  // raycaster
  raycaster = new THREE.Raycaster();

  // cubes

  cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
  cubeMat = new THREE.MeshLambertMaterial({color: 0xfeb74c});

  rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
  rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });
	rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
	scene.add(rollOverMesh);

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

// determine where the hover guide should be
function placeSelector() {

  var fromScreenCenter = new THREE.Vector2(
    ((renderer.domElement.clientWidth / 2) / renderer.domElement.width) * 2 - 1,
    -(((renderer.domElement.clientHeight / 2) / renderer.domElement.height) * 2 - 1)
  );

  raycaster.setFromCamera(fromScreenCenter, camera);

  var intersects = raycaster.intersectObjects(voxels);
  if (intersects.length > 0) {

    var intersect = intersects[0];
    var normal = intersect.face.normal.clone();
    normal.multiplyScalar(50);
    rollOverMesh.position.copy(intersect.object.position).add(normal);

  }

  var worldCoords = getWorldCoord(rollOverMesh);
  var hoverCoordDiv = document.getElementById('hoverGuideCoordinates');
  hoverCoordDiv.innerHTML = String([worldCoords.x, worldCoords.y, worldCoords.z]);

}

function render() {
  // use # of ms since last update as delta
  placeSelector();
  controls.update(framerate);
  renderer.render(scene, camera);
}

// code for drawing minecraft maps

function moveRobotVoxel(pos) {

  newRobot = addVoxel(
    pos.x * voxelSideLength,
    pos.y * voxelSideLength,
    pos.z * voxelSideLength,
    new THREE.MeshLambertMaterial({color:0xff9999})
  );

  if (robotVoxel) {
    var robotPos = getWorldCoord(robotVoxel);
    removeVoxel(robotPos.x, robotPos.y, robotPos.z, robotVoxel);
  }
  robotVoxel = newRobot;

  render();
}

function addVoxel(x, y, z, material) {
  var voxel = new THREE.Mesh(cubeGeo, material || cubeMat);
  voxel.position.set(x, y, z);

  var coord = getWorldCoord(voxel);
  var priorVoxel = voxelMap.get(coord.x, coord.y, coord.z);
  if (priorVoxel) {removeVoxel(coord.x, coord.y, coord.z, priorVoxel);}

  voxels.push(voxel);
  voxelMap.set(coord.x, coord.y, coord.z, voxel);
  scene.add(voxel);

  return voxel;
}

function removeVoxel(x, y, z, voxel) {
  result = false;
  if (voxel && voxels.indexOf(voxel) != -1) {
    scene.remove(voxel);
    voxelMap.set(x, y, z, undefined);
    voxels.splice(voxels.indexOf(voxel), 1);
    result = true;
  }
  return result;
}

function addShapeVoxels(shape) {
  for(var x = 0; x < shape.w; x++) {
    for(var z = 0; z < shape.d; z++) {
      for(var y = 0; y < (shape.data.n / (shape.w * shape.d)); y++) {
        // this is how the geolyzer reports 3d data in a 1d array
        // also lua is indexed from 1
        index = (x + 1) + z*shape.w + y*shape.w*shape.d;

        var worldPos = {
          x: (x + shape.x) * voxelSideLength,
          y: (y + shape.y) * voxelSideLength,
          z: (z + shape.z) * voxelSideLength,
        };
        if(shape.data[index]) {
          addVoxel(worldPos.x, worldPos.y, worldPos.z, colorFromHardness(shape.data[index]));
        }
        else {
          removeVoxel(worldPos.x, worldPos.y, worldPos.z, voxelMap.get(worldPos.x, worldPos.y, worldPos.z));
        }
      }
    }
  }
  // have the shapes appear immediately even if the camera isn't moving
  render();
}

// convert ranges of noisy hardness values to specific colors
// todo: make this look better
function colorFromHardness(hardness) {

  var hardnessToColorMap = {
    // bedrock
    '-1': new THREE.MeshLambertMaterial({color:0x000000}),
    // leaves
    0.2: new THREE.MeshLambertMaterial({color:0x00cc00}),
    // glowstone
    0.3: new THREE.MeshLambertMaterial({color:0xffcc00}),
    // netherrack
    0.4: new THREE.MeshLambertMaterial({color:0x800000}),
    // dirt or sand
    0.5: new THREE.MeshLambertMaterial({color:0xffc140}),
    // grass block
    0.6: new THREE.MeshLambertMaterial({color:0xddc100}),
    // sandstone
    0.8: new THREE.MeshLambertMaterial({color:0xffff99}),
    // pumpkins or melons
    1.0: new THREE.MeshLambertMaterial({color:0xfdca00}),
    // smooth stone
    1.5: new THREE.MeshLambertMaterial({color:0xcfcfcf}),
    // cobblestone
    2.0: new THREE.MeshLambertMaterial({color:0x959595}),
    // ores
    3.0: new THREE.MeshLambertMaterial({color:0x66ffff}),
    // cobwebs
    4.0: new THREE.MeshLambertMaterial({color:0xf5f5f5}),
    // ore blocks
    5.0: new THREE.MeshLambertMaterial({color:0xc60000}),
    // obsidian
    50: new THREE.MeshLambertMaterial({color:0x1f1f1f}),
    // water or lava
    100: new THREE.MeshLambertMaterial({color:0x9900cc})
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

function initPointerLock() {
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
}

function getWorldCoord(mesh) {
  return mesh.clone().position.divideScalar(50).round();
}

function initMoveOnClick() {
  // send command to goto coordinate on click
  renderer.domElement.addEventListener('click', ()=>{
    if (controls.enabled) {
      var coord = getWorldCoord(rollOverMesh);
      console.log(coord);
      var scanLevel = document.getElementById('scanWhileMoving').value;
      var luaString = 'return mas.to(' + [coord.x, coord.y, coord.z, scanLevel] + ');'
      addMessage(luaString, true);
      socket.emit('command', luaString);
    }
  });
}
