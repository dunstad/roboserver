import {WorldAndScenePoint} from '/js/client/WorldAndScenePoint.mjs';
import {VoxelMap} from '/js/client/VoxelMap.mjs';
import { MenuMaker } from '/js/client/MenuMaker.mjs';

export class MapRender {

  /**
   * Sets the initial scene.
   * @param {Game} game
   */
  constructor(game) {

    this.game = game;

    this.simple = Boolean(localStorage.getItem('simpleRendering'));

    this.framerate = 1000/30;
    this.voxelSideLength = 50;
    this.voxels = [];
    this.menuTiles = [];
    this.voxelMap = new VoxelMap();

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    this.scene = new THREE.Scene();
    this.controls = new PointerLockControls(this.camera);
    this.scene.add(this.controls.getObject());
    this.raycaster = new THREE.Raycaster();
  
    // change the starting position of the camera/controls
    this.goToAndLookAt(this.controls, new WorldAndScenePoint(0, 0, 0, false));
  
    this.scene.add(this.controls.getObject());
  
    this.hardnessToColorData = {
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

    // things that don't change with render mode (mostly geometries)
    this.voxelSideLength = 50;
    this.cubeGeo = new THREE.BoxGeometry(this.voxelSideLength, this.voxelSideLength, this.voxelSideLength);
    this.tileGeo = new THREE.BoxGeometry(this.voxelSideLength, this.voxelSideLength, this.voxelSideLength / 5);

    if (this.simple) {
      // cubes
      this.voxelWireGeo = new THREE.EdgesGeometry(this.cubeGeo);
      this.tileWireGeo = new THREE.EdgesGeometry(this.tileGeo);
      this.wireMat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 1 } );
    }
    else {
      // cubes
      this.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });
      this.selectedRobotMaterial = new THREE.MeshLambertMaterial({ color: 0xff9999, opacity: 0.9, transparent: true });
      this.robotMaterial = new THREE.MeshLambertMaterial({color:0xffcccc});
      
      // Lights
      this.directionalLight = new THREE.DirectionalLight( 0xffffff );
      this.directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
      this.scene.add(this.directionalLight);
    }

    // things that look different in the simple and full render modes
    let renderingModeMap = {
      
      cubeMat: {
        simple: ()=>{return new THREE.MeshLambertMaterial({color: 0xffffff, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});},
        full: ()=>{return new THREE.MeshLambertMaterial({color: 0xfeb74c});},
      },
      
      rollOverMesh: {
        simple: ()=>{return new THREE.Mesh(this.cubeGeo, this.cubeMat).add(new THREE.LineSegments(this.voxelWireGeo, this.wireMat));},
        full: ()=>{return new THREE.Mesh(this.cubeGeo, this.rollOverMaterial);},
      },
      
      selectedRobotMesh: {
        simple: ()=>{return new THREE.Mesh(this.cubeGeo, this.cubeMat).add(new THREE.LineSegments(this.voxelWireGeo, this.wireMat));},
        full: ()=>{return new THREE.Mesh(this.cubeGeo, this.selectedRobotMaterial);},
      },
      
      robotMaterial: {
        simple: ()=>{return this.cubeMat;},
        full: ()=>{return new THREE.MeshLambertMaterial({color:0xffcccc});},
      },

      tileMaterial: {
        simple: ()=>{return this.cubeMat},
        full: ()=>{return new THREE.MeshLambertMaterial({color:0x003366});},
      },
      
      hardnessToColorMap: {
        simple: ()=>{
          let hardnessToColorMap = {};
          for (let hardness in this.hardnessToColorData) {
            hardnessToColorMap[hardness] = this.cubeMat;
          }
          return hardnessToColorMap;
        },
        full: ()=>{
          let hardnessToColorMap = {};
          for (let hardness in this.hardnessToColorData) {
            hardnessToColorMap[hardness] = new THREE.MeshLambertMaterial({color: this.hardnessToColorData[hardness]});
          }
          return hardnessToColorMap;
        },
      },
      
      ambientLight: {
        simple: ()=>{return new THREE.AmbientLight( 0xf0f0f0 );},
        full: ()=>{return new THREE.AmbientLight( 0x606060 );},
      },

    };

    let renderMode = this.simple ? 'simple' : 'full';

    // cubes
    this.cubeMat = renderingModeMap.cubeMat[renderMode]();
    this.rollOverMesh = renderingModeMap.rollOverMesh[renderMode]();
    this.selectedRobotMesh = renderingModeMap.selectedRobotMesh[renderMode]();
    this.robotMaterial = renderingModeMap.robotMaterial[renderMode]();
    this.hardnessToColorMap = renderingModeMap.hardnessToColorMap[renderMode]();
    
    // tile
    this.tileMaterial = renderingModeMap.tileMaterial[renderMode]();

    // light
    this.ambientLight = renderingModeMap.ambientLight[renderMode]();

    this.menuMaker = new MenuMaker(this);

    this.scene.add(this.ambientLight);
  
    this.prevRollOverMeshPos = this.rollOverMesh.position.clone();
    this.scene.add(this.rollOverMesh);

    this.scene.add(this.selectedRobotMesh);
  
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setClearColor(0xf0f0f0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  
    document.addEventListener('keydown', (e)=>{
      const escCode = 27;
      if (e.altKey || e.ctrlKey) {e.preventDefault(); this.altOrCtrlKeyPressed = true;}
      // electron doesn't make esc cancel pointerlock like most browsers do by default
      else if (e.keyCode == escCode) {e.preventDefault(); document.exitPointerLock();}
    });
  
    document.addEventListener('keyup', (e)=>{
      if (!(e.altKey || e.ctrlKey)) {this.altOrCtrlKeyPressed = false;}
    });
  
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));

  }

  /**
   * Used to allow rendering in different ways.
   * @param {THREE.Geometry} geometry 
   * @param {THREE.Material} material 
   * @return {THREE.Mesh || THREE.LineSegments}
   */
  createMesh(geometry, material, simple) {
    let mesh;
    if (simple) {
      mesh = new THREE.Mesh(geometry, material);
      mesh.add(new THREE.LineSegments(this.voxelWireGeo, this.wireMat));
    }
    else {
      mesh = new THREE.Mesh(geometry, material);
    }
    return mesh;
  }

  /**
   * Moves to the specified point and looks toward it.
   * Used to set our initial viewpoint, and when we change the selected robot.
   * @param {PointerLockControls} controls 
   * @param {WorldAndScenePoint} point
   */
  goToAndLookAt(controls, point) {
    let scenePoint = point.scene();
    let x = scenePoint.x;
    let y = scenePoint.y;
    let z = scenePoint.z;
    let controlsObject = this.controls.getObject();
    controlsObject.position.set(x, y + 800, z);
    controlsObject.children[0].rotation.x = -1.5;
  }

  /**
   * Makes sure everything looks fine after the window changes size.
   */
  onWindowResize() {
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.requestRender();

    // unfortunately necessary to separate code by browser here
    let ua = navigator.userAgent.toLowerCase(); 
    // runs for safari
    if (ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1) {
      
      // do nothing on window resize, because of safari's banner
      // which causes the page to resize when the pointer is locked

    // runs for everyone else
    } else {
      // cancel and reapply the pointer lock when the window resizes
      // if we don't, when the window gets bigger the camera can't rotate freely
      let pointerLockElement = document.pointerLockElement;
      document.exitPointerLock();
      if (pointerLockElement) {
        // the lock doesn't happen unless we delay it for some reason
        setTimeout(()=>{
          pointerLockElement.requestPointerLock();
        }, 10);
      }
    }

  }

  /**
   * Stop the game loop when the tab isn't visible, and start it when it is.
   * This prevents the tab from freezing when focus is returned.
   */
  handleVisibilityChange() {
    if (document.hidden) {
      clearInterval(this.gameLoop);
      this.gameLoop = false;
    } else  {
      this.gameLoop = this.startGameLoop();
      this.requestRender();
    }
  }

  /**
   * Only renders if it hasn't been done in a bit, used to make sure performance stays good.
   */
  requestRender() {
    let now = new Date().getTime();
    let lastRenderTooRecent = now - this.lastRender < this.framerate;
    if (!this.controls.enabled && this.gameLoop && !lastRenderTooRecent) {
      requestAnimationFrame(this.render.bind(this));
      this.lastRender = new Date().getTime();
    }
  }

  /**
   * Used to resume rendering when the tab becomes visible.
   */
  startGameLoop() {
    return setInterval(()=>{
      if (this.controls.enabled) {
        requestAnimationFrame(this.render.bind(this));
        this.controls.update(this.framerate);
      }
    }, this.framerate);
  }

  /**
   * Places the hover guide, listens for the camera controls, and draws the scene.
   */
  render() {
    this.placeSelector();
    for (let tile of this.menuTiles) {
      tile.mixer.update(1 / this.framerate);
    }
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get intersections from a raycast out from the camera.
   * @param {THREE.Mesh[]} intersectObjects 
   */
  castFromCamera(intersectObjects) {
    let domElement = this.renderer.domElement;
  
    let fromScreenCenter = new THREE.Vector2(
      ((domElement.clientWidth / 2) / domElement.clientWidth) * 2 - 1,
      -(((domElement.clientHeight / 2) / domElement.clientHeight) * 2 - 1)
    );
  
    this.raycaster.setFromCamera(fromScreenCenter, this.camera);
  
    let intersects = this.raycaster.intersectObjects(intersectObjects);

    return intersects;
  }

  /**
   * Determines where to place the hover guide.
   */
  placeSelector() {
  
    if (this.selectBox && !(this.prevRollOverMeshPos.equals(this.rollOverMesh.position))) {
      this.removeSelectBox();
    }
  
    this.prevRollOverMeshPos = this.rollOverMesh.position.clone();

    let intersects = this.castFromCamera(this.voxels);
    if (intersects.length > 0) {
  
      let intersect = intersects[0];
      let normal = intersect.face.normal.clone();
      normal.multiplyScalar(this.voxelSideLength);
  
      this.rollOverMesh.position.copy(intersect.object.position);
      if (!this.altOrCtrlKeyPressed) {
        this.rollOverMesh.position.add(normal);
      }
  
      let rollOverPoint = new WorldAndScenePoint(this.rollOverMesh.position, false);
  
      if (this.game.GUI.selectStart.isComplete() && !this.game.GUI.selectEnd.isComplete()) {
        this.scene.remove(this.rollOverMesh);
        if (!this.selectBox) {
          this.selectBox = this.makeBoxAround(this.game.GUI.selectStart.getPoint(), rollOverPoint, this.rollOverMaterial);
          this.scene.add(this.selectBox);
        }
      }
      else if (!this.game.GUI.selectStart.isComplete() && this.game.GUI.selectEnd.isComplete()) {
        this.scene.remove(this.rollOverMesh);
        if (!this.selectBox) {
          this.selectBox = this.makeBoxAround(rollOverPoint, this.game.GUI.selectEnd.getPoint(), this.rollOverMaterial);
          this.scene.add(this.selectBox);
        }
      }
      else {
        this.scene.add(this.rollOverMesh);
      }
  
    }

    else {
      this.scene.remove(this.rollOverMesh);
    }
  
    if (this.game.GUI.selectStart.isComplete() && this.game.GUI.selectEnd.isComplete()) {
      if (!this.selectBox) {
        this.selectBox = this.makeBoxAround(this.game.GUI.selectStart.getPoint(), this.game.GUI.selectEnd.getPoint(), this.rollOverMaterial);
        this.scene.add(this.selectBox);
      }
    }
  
    let worldCoords = new WorldAndScenePoint(this.rollOverMesh.position, false).world();
    let hoverCoordDiv = this.game.GUI.hoverGuideCoordinates;
    hoverCoordDiv.innerHTML = String([worldCoords.x, worldCoords.y, worldCoords.z]);
    
  }

  /**
   * Removes the temporary selected area.
   */
  removeSelectBox() {
    if (this.selectBox) {
      this.scene.remove(this.selectBox);
      this.selectBox.geometry.dispose();
      this.selectBox = undefined;
    }
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
  makeBox(length, height, width, material, position) {
    let preventFlickeringOffset = 1;
    let geometry = new THREE.BoxGeometry(
      length + preventFlickeringOffset,
      height + preventFlickeringOffset,
      width + preventFlickeringOffset
    );
    let mesh = this.createMesh(geometry, material || this.cubeMat, this.simple);
    if (position) {mesh.position.copy(position.scene());}
    return mesh;
  }

  /**
   * Finds the midpoint of two vectors. Used to position boxes between the two voxels at opposite corners.
   * @param {WorldAndScenePoint} v1 
   * @param {WorldAndScenePoint} v2 
   * @returns {WorldAndScenePoint}
   */
  getMidpoint(v1, v2) {
    let midpoint = v1.scene().clone();
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
  makeBoxAround(startPoint, endPoint, material) {
    let midpoint = this.getMidpoint(startPoint, endPoint);
    let sceneStart = startPoint.scene();
    let sceneEnd = endPoint.scene();
    let box = this.makeBox(
      Math.abs(sceneEnd.x-sceneStart.x) + this.voxelSideLength,
      Math.abs(sceneEnd.y-sceneStart.y) + this.voxelSideLength,
      Math.abs(sceneEnd.z-sceneStart.z) + this.voxelSideLength,
      material,
      midpoint
    );
    return box;
  }

  // code for drawing minecraft maps

  /**
   * Removes the given robot's voxel and redraws it elsewhere.
   * @param {WorldAndScenePoint} pos
   * @param {string} robot
   */
  moveRobotVoxel(pos, robot) {
  
    let previousPosition = this.game.webClient.allRobotInfo[robot].getPosition();
    if (previousPosition) {
      this.removeVoxel(previousPosition);
    }
  
    this.addVoxel(pos, this.robotMaterial);
  
    this.game.webClient.allRobotInfo[robot].setPosition(pos);
  
    this.requestRender();
  }

  /**
   * Removes any existing voxel at the coordinates and adds a new one.
   * @param {WorldAndScenePoint} pos
   * @param {THREE.Material} material
   * @returns {THREE.Mesh}
   */
  addVoxel(pos, material) {
    let voxel = this.createMesh(this.cubeGeo, material || this.cubeMat, this.simple);
    voxel.position.copy(pos.scene());
  
    let priorVoxel = this.voxelMap.get(pos);
    if (priorVoxel) {this.removeVoxel(pos);}
  
    this.voxels.push(voxel);
    this.voxelMap.set(pos, voxel);
    this.scene.add(voxel);
  
    voxel.visible = this.game.GUI.cutawayForm.shouldBeRendered(pos);
  
    return voxel;
  }
  
  /**
   * Removes the voxel at pos if there is one.
   * @param {WorldAndScenePoint} pos
   * @returns {boolean}
   */
  removeVoxel(pos) {
    let result = false;
    let voxel = this.voxelMap.get(pos);
    if (voxel && this.voxels.indexOf(voxel) != -1) {
      this.scene.remove(voxel);
      this.voxelMap.set(pos, undefined);
      this.voxels.splice(this.voxels.indexOf(voxel), 1);
      result = true;
    }
    this.requestRender();
    return result;
  }
  
  /**
   * Used to draw terrain data received from a robot.
   * @param {object} shape
   */
  addShapeVoxels(shape) {
    for (let x = 0; x < shape.w; x++) {
      for (let z = 0; z < shape.d; z++) {
        for (let y = 0; y < (shape.data.n / (shape.w * shape.d)); y++) {
  
          let xWithOffset = x + shape.x;
          let yWithOffset = y + shape.y;
          let zWithOffset = z + shape.z;
  
          let shapePoint = new THREE.Vector3(xWithOffset, yWithOffset, zWithOffset);
  
          let knownRobotPosition = false;
          for (let robot of Object.values(this.game.webClient.allRobotInfo)) {
            if (robot) {
              let robotPoint = robot.getPosition();
              // this stops an error if a robot has connected but not sent their location yet
              if (robotPoint) {
                let robotPos = robotPoint.world();
                if (robotPos && robotPos.x == shapePoint.x && robotPos.y == shapePoint.y && robotPos.z == shapePoint.z) {
                  knownRobotPosition = true;
                }
              }
          }
          }
  
          // this is how the geolyzer reports 3d data in a 1d array
          // also lua is indexed from 1
          let index = (x + 1) + z*shape.w + y*shape.w*shape.d;
  
          let worldPos = new WorldAndScenePoint(shapePoint, true);
  
          if (shape.data[index]) {
  
            let material;
            if (knownRobotPosition) {
              material = this.robotMaterial;
            }
            else {
              material = this.colorFromHardness(shape.data[index]);
            }
  
            this.addVoxel(worldPos, material);
  
          }
  
          else {
            this.removeVoxel(worldPos);
          }
  
        }
      }
    }
    // have the shapes appear immediately when the camera isn't moving as well
    this.requestRender();
  }
  
  /**
   * Converts ranges of noisy hardness values to specific colors.
   * @param {number} hardness
   * @returns {THREE.Material}
   */
  colorFromHardness(hardness) {
  
    let closestMatch = 999; // arbitrarily high number
    let oldDifference = Math.abs(closestMatch - hardness);
    for (let key in this.hardnessToColorMap) {
  
      let newDifference = Math.abs(key - hardness);
      if (newDifference < oldDifference) {
        closestMatch = key;
        oldDifference = newDifference;
      }
  
    }
  
    return this.hardnessToColorMap[closestMatch];
  
  }
  
  /**
   * Removes the temporary selected area.
   */
  removeSelectBox() {
    if (this.selectBox) {
      this.scene.remove(this.selectBox);
      this.selectBox.geometry.dispose();
      this.selectBox = undefined;
    }
  }

}