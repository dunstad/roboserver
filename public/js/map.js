var container;
var camera, scene, renderer;
var controls;
var cube;
var cubeGeo, cubeMat;
var rollOverGeo, rollOverMesh, rollOverMaterial;
var prevRollOverMeshPos;
var framerate = 1000/30;
var lastRender;
var raycaster;
var voxelSideLength = 50;
var voxels = [];
var voxelMap = new VoxelMap();
var robotMaterial;
var selectedRobotMesh, selectedRobotMaterial;
var allRobotInfo = {};
var hardnessToColorMap;
var selections = {};
var selectBox;
var selectStart = new CoordForm(
  document.getElementById('selectStartX'),
  document.getElementById('selectStartY'),
  document.getElementById('selectStartZ')
);
var selectEnd = new CoordForm(
  document.getElementById('selectEndX'),
  document.getElementById('selectEndY'),
  document.getElementById('selectEndZ')
);
var cutawayForm = new CutawayForm(
  document.getElementById('axisButton'),
  document.getElementById('operationButton'),
  document.getElementById('cutawayValue')
);
var altOrCtrlKeyPressed;
var gameLoop;

main();

/**
 * Runs the rendering and camera control code.
 */
function main() {
  init();
  render();
  handleVisibilityChange();
}

/**
 * Sets the initial scene.
 */
function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

  scene = new THREE.Scene();

  // controls
  controls = new PointerLockControls(camera);

  // change the starting position of the camera/controls
  goToAndLookAt(controls, new WorldAndScenePoint(0, 0, 0, false));

  scene.add(controls.getObject());

  // raycaster
  raycaster = new THREE.Raycaster();

  // cubes

  cubeGeo = new THREE.BoxGeometry( voxelSideLength, voxelSideLength, voxelSideLength );
  cubeMat = new THREE.MeshLambertMaterial({color: 0xfeb74c});

  rollOverGeo = new THREE.BoxGeometry( voxelSideLength, voxelSideLength, voxelSideLength );
  rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });
	rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  prevRollOverMeshPos = rollOverMesh.position.clone();
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

  document.addEventListener('keydown', (e)=>{
    if (e.altKey || e.ctrlKey) {e.preventDefault(); altOrCtrlKeyPressed = true;}
  });

  document.addEventListener('keyup', (e)=>{
    if (!(e.altKey || e.ctrlKey)) {altOrCtrlKeyPressed = false;}
  });

  selectedRobotMaterial = new THREE.MeshLambertMaterial({ color: 0xff9999, opacity: 0.9, transparent: true });
	selectedRobotMesh = new THREE.Mesh(cubeGeo, selectedRobotMaterial);
  scene.add(selectedRobotMesh);
  robotMaterial = new THREE.MeshLambertMaterial({color:0xffcccc});

  hardnessToColorMap = {
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

  document.addEventListener("visibilitychange", handleVisibilityChange);

}

/**
 * Stop the game loop when the tab isn't visible, and start it when it is.
 * This prevents the tab from freezing when focus is returned.
 */
function handleVisibilityChange() {
  if (document.hidden) {
    clearInterval(gameLoop);
    gameLoop = false;
  } else  {
    gameLoop = startGameLoop();
    requestRender();
  }
}

function startGameLoop() {
  return setInterval(()=>{
    if (controls.enabled) {
      requestAnimationFrame(render);
      controls.update(framerate);
    }
  }, framerate);
}

/**
 * Moves to the specified point and looks toward it.
 * Used to set our initial viewpoint, and when we change the selected robot.
 * @param {PointerLockControls} controls 
 * @param {WorldAndScenePoint} point
 */
function goToAndLookAt(controls, point) {
  var scenePoint = point.scene();
  var x = scenePoint.x;
  var y = scenePoint.y;
  var z = scenePoint.z;
  var controlsObject = controls.getObject();
  controlsObject.position.set(
    x,
    y + 800,
    z
  );
  controlsObject.children[0].rotation.x = -1.5;
}

/**
 * Makes sure everything looks fine after the window changes size.
 */
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  requestRender();

  // cancel and re-apply the pointer lock when the window resizes
  // if we don't, when the window gets bigger the camera can't rotate freely
  var pointerLockElement = document.pointerLockElement;
  document.exitPointerLock();
  if (pointerLockElement) {
    // the lock doesn't happen unless we delay it for some reason
    setTimeout(()=>{
      pointerLockElement.requestPointerLock();
    }, 10);
  }

}

/**
 * Determines where to place the hover guide.
 */
function placeSelector() {

  if (selectBox && !(prevRollOverMeshPos.equals(rollOverMesh.position))) {
    removeSelectBox();
  }

  prevRollOverMeshPos = rollOverMesh.position.clone();

  var fromScreenCenter = new THREE.Vector2(
    ((renderer.domElement.clientWidth / 2) / renderer.domElement.clientWidth) * 2 - 1,
    -(((renderer.domElement.clientHeight / 2) / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(fromScreenCenter, camera);

  var intersects = raycaster.intersectObjects(voxels);
  if (intersects.length > 0) {

    var intersect = intersects[0];
    var normal = intersect.face.normal.clone();
    normal.multiplyScalar(voxelSideLength);

    rollOverMesh.position.copy(intersect.object.position);
    if (!altOrCtrlKeyPressed) {
      rollOverMesh.position.add(normal);
    }

    var rollOverPoint = new WorldAndScenePoint(rollOverMesh.position, false);

    if (selectStart.isComplete() && !selectEnd.isComplete()) {
      scene.remove(rollOverMesh);
      if (!selectBox) {
        selectBox = makeBoxAround(selectStart.getPoint(), rollOverPoint, rollOverMaterial);
        scene.add(selectBox);
      }
    }
    else if (!selectStart.isComplete() && selectEnd.isComplete()) {
      scene.remove(rollOverMesh);
      if (!selectBox) {
        selectBox = makeBoxAround(rollOverPoint, selectEnd.getPoint(), rollOverMaterial);
        scene.add(selectBox);
      }
    }
    else {
      scene.add(rollOverMesh);
    }

  }

  if (selectStart.isComplete() && selectEnd.isComplete()) {
    if (!selectBox) {
      selectBox = makeBoxAround(selectStart.getPoint(), selectEnd.getPoint(), rollOverMaterial);
      scene.add(selectBox);
    }
  }

  var worldCoords = new WorldAndScenePoint(rollOverMesh.position, false).world();
  var hoverCoordDiv = document.getElementById('hoverGuideCoordinates');
  hoverCoordDiv.innerHTML = String([worldCoords.x, worldCoords.y, worldCoords.z]);
  
}

/**
 * Creates a box. Used to indicate a selected area.
 * @param {number} length 
 * @param {number} height 
 * @param {number} width 
 * @param {THREE.Material} material 
 * @param {WorldAndScenePoint} position 
 * @returns {THREE.Mesh}
 */
function makeBox(length, height, width, material, position) {
  var preventFlickeringOffset = 1;
  var geometry = new THREE.BoxGeometry(
    length + preventFlickeringOffset,
    height + preventFlickeringOffset,
    width + preventFlickeringOffset
  );
	var mesh = new THREE.Mesh(geometry, material || cubeMat);
  if (position) {mesh.position.copy(position.scene());}
  return mesh;
}

/**
 * Finds the midpoint of two vectors. Used to position boxes between the two voxels at opposite corners.
 * @param {WorldAndScenePoint} v1 
 * @param {WorldAndScenePoint} v2 
 * @returns {WorldAndScenePoint}
 */
function getMidpoint(v1, v2) {
  var midpoint = v1.scene().clone();
  midpoint.add(v2.scene());
  midpoint.divideScalar(2);
  return new WorldAndScenePoint(midpoint, false);
}

/**
 * Creates a box with the given voxels at opposite corners. Used to indicate a selected area.
 * @param {WorldAndScenePoint} startPoint
 * @param {WorldAndScenePoint} endPoint
 * @param {THREE.Material} material
 * @returns {THREE.Mesh}
 */
function makeBoxAround(startPoint, endPoint, material) {
  var midpoint = getMidpoint(startPoint, endPoint);
  var sceneStart = startPoint.scene();
  var sceneEnd = endPoint.scene();
  var box = makeBox(
    Math.abs(sceneEnd.x-sceneStart.x) + voxelSideLength,
    Math.abs(sceneEnd.y-sceneStart.y) + voxelSideLength,
    Math.abs(sceneEnd.z-sceneStart.z) + voxelSideLength,
    material,
    midpoint
  );
  return box;
}

/**
 * Places the hover guide, listens for the camera controls, and draws the scene.
 */
function render() {
  placeSelector();
  renderer.render(scene, camera);
}

/**
 * Only renders if there isn't too much activity to prevent excessive numbers of renders.
 */
function requestRender() {
  var now = new Date().getTime();
  var lastRenderTooRecent = now - lastRender < framerate;
  if (!controls.enabled && gameLoop && !lastRenderTooRecent) {
    requestAnimationFrame(render);
    lastRender = new Date().getTime();
  }
}

// code for drawing minecraft maps

/**
 * Removes the given robot's voxel and redraws it elsewhere.
 * @param {WorldAndScenePoint} pos
 * @param {string} robot
 */
function moveRobotVoxel(pos, robot) {

  var previousPosition = allRobotInfo[robot].getPosition();
  if (previousPosition) {
    removeVoxel(previousPosition);
  }

  addVoxel(pos, robotMaterial);

  allRobotInfo[robot].setPosition(pos);

  requestRender();
}

/**
 * Removes any existing voxel at the coordinates and adds a new one.
 * @param {WorldAndScenePoint} pos
 * @param {THREE.Material} material
 * @returns {THREE.Mesh}
 */
function addVoxel(pos, material) {
  var voxel = new THREE.Mesh(cubeGeo, material || cubeMat);
  voxel.position.copy(pos.scene());

  var priorVoxel = voxelMap.get(pos);
  if (priorVoxel) {removeVoxel(pos);}

  voxels.push(voxel);
  voxelMap.set(pos, voxel);
  scene.add(voxel);

  voxel.visible = cutawayForm.shouldBeRendered(pos);

  return voxel;
}

/**
 * Removes the voxel at pos if there is one.
 * @param {WorldAndScenePoint} pos
 * @returns {boolean}
 */
function removeVoxel(pos) {
  result = false;
  var voxel = voxelMap.get(pos);
  if (voxel && voxels.indexOf(voxel) != -1) {
    scene.remove(voxel);
    voxelMap.set(pos, undefined);
    voxels.splice(voxels.indexOf(voxel), 1);
    result = true;
  }
  requestRender();
  return result;
}

/**
 * Used to draw terrain data received from a robot.
 * @param {object} shape
 * @param {string} robot
 */
function addShapeVoxels(shape, robot) {
  for (var x = 0; x < shape.w; x++) {
    for (var z = 0; z < shape.d; z++) {
      for (var y = 0; y < (shape.data.n / (shape.w * shape.d)); y++) {

        var xWithOffset = x + shape.x;
        var yWithOffset = y + shape.y;
        var zWithOffset = z + shape.z;

        var shapePoint = new THREE.Vector3(xWithOffset, yWithOffset, zWithOffset);

        var knownRobotPosition = false;
        for (var robot of Object.values(allRobotInfo)) {
          if (robot) {
            var robotPos = robot.getPosition().world();
            if (robotPos && robotPos.x == shapePoint.z && robotPos.y == shapePoint.y && robotPos.z == shapePoint.z) {
              knownRobotPosition = true;
            }
         }
        }

        // this is how the geolyzer reports 3d data in a 1d array
        // also lua is indexed from 1
        var index = (x + 1) + z*shape.w + y*shape.w*shape.d;

        var worldPos = new WorldAndScenePoint(shapePoint, true);

        if (shape.data[index]) {

          var material;
          if (knownRobotPosition) {
            material = robotMaterial;
          }
          else {
            material = colorFromHardness(shape.data[index]);
          }

          addVoxel(worldPos, material);

        }

        else {
          removeVoxel(worldPos);
        }

      }
    }
  }
  // have the shapes appear immediately when the camera isn't moving as well
  requestRender();
}

/**
 * Converts ranges of noisy hardness values to specific colors.
 * @param {number} hardness
 * @returns {THREE.Material}
 */
function colorFromHardness(hardness) {

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

/**
 * Serializes objects to Lua tables. Makes sending commands to robots easier.
 * @param {object} object 
 * @returns {string}
 */
function objectToLuaString(object) {
  var luaString = '{';
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) {
      luaString = luaString + prop + '=' + object[prop] + ',';
    }
  }
  luaString = luaString + '}'
  return luaString;
}

/**
 * Removes the temporary selected area.
 */
function removeSelectBox() {
  if (selectBox) {
    scene.remove(selectBox);
    selectBox.geometry.dispose();
    selectBox = undefined;
  }
}

/**
 * Stores a selection so it can be shown until the task it's for is completed.
 * @param {object} selections 
 * @param {THREE.Mesh} selection 
 * @returns {number}
 */
function addSelection(selections, selection) {
  removeSelectBox();
  var counter = 0;
  while (selections[counter]) {counter++;}
  selections[counter] = selection;
  return counter;
}

/**
 * Used to get rid of a selection when the task it's for is completed.
 * @param {object} selections 
 * @param {number} index 
 */
function deleteSelection(selections, index) {
  var selection = selections[index];
  scene.remove(selection);
  selection.geometry.dispose();
  delete selections[index];
  requestRender();
}