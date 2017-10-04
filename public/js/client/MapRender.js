class MapRender {
  
    /**
     * Sets the initial scene.
     */
    constructor() {

      this.framerate = 1000/30;
      this.voxelSideLength = 50;
      this.voxels = [];
      this.voxelMap = new VoxelMap();
  
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
      this.scene = new THREE.Scene();
      this.controls = new PointerLockControls(camera);
      this.scene.add(this.controls.getObject());
      this.raycaster = new THREE.Raycaster();

      this.container = document.createElement( 'div' );
      document.body.appendChild( container );
    
      // change the starting position of the camera/controls
      this.goToAndLookAt(this.controls, new WorldAndScenePoint(0, 0, 0, false));
    
      this.scene.add(this.controls.getObject());
    
      // cubes
      this.voxelSideLength = 50;
      this.cubeGeo = new THREE.BoxGeometry(this.voxelSideLength, this.voxelSideLength, this.voxelSideLength);
      this.cubeMat = new THREE.MeshLambertMaterial({color: 0xfeb74c});
    
      this.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });
      this.rollOverMesh = new THREE.Mesh(this.cubeGeo, this.rollOverMaterial);
      this.prevRollOverMeshPos = this.rollOverMesh.position.clone();
      this.scene.add(this.rollOverMesh);
    
      // Lights
    
      this.ambientLight = new THREE.AmbientLight( 0x606060 );
      this.scene.add(this.ambientLight);
    
      this.directionalLight = new THREE.DirectionalLight( 0xffffff );
      this.directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
      this.scene.add(this.directionalLight);
    
      this.renderer = new THREE.WebGLRenderer({antialias: true});
      this.renderer.setClearColor(0xf0f0f0);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.container.appendChild(this.renderer.domElement);
    
      window.addEventListener('resize', this.onWindowResize, false);
    
      document.addEventListener('keydown', (e)=>{
        const escCode = 27;
        if (e.altKey || e.ctrlKey) {e.preventDefault(); this.altOrCtrlKeyPressed = true;}
        // electron doesn't make esc cancel pointerlock like most browsers do by default
        else if (e.keyCode == escCode) {e.preventDefault(); document.exitPointerLock();}
      });
    
      document.addEventListener('keyup', (e)=>{
        if (!(e.altKey || e.ctrlKey)) {this.altOrCtrlKeyPressed = false;}
      });
    
      this.selectedRobotMaterial = new THREE.MeshLambertMaterial({ color: 0xff9999, opacity: 0.9, transparent: true });
      this.selectedRobotMesh = new THREE.Mesh(this.cubeGeo, this.selectedRobotMaterial);
      this.scene.add(this.selectedRobotMesh);
      this.robotMaterial = new THREE.MeshLambertMaterial({color:0xffcccc});
    
      this.hardnessToColorMap = {
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
    
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
  
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
     * Only renders if there isn't too much activity to prevent excessive numbers of renders.
     */
    requestRender() {
      let now = new Date().getTime();
      let lastRenderTooRecent = now - this.lastRender < this.framerate;
      if (!this.controls.enabled && this.gameLoop && !lastRenderTooRecent) {
        requestAnimationFrame(this.render);
        this.lastRender = new Date().getTime();
      }
    }

    /**
     * Used to resume rendering when the tab becomes visible.
     */
    startGameLoop() {
      return setInterval(()=>{
        if (this.controls.enabled) {
          requestAnimationFrame(this.render);
          this.controls.update(this.framerate);
        }
      }, this.framerate);
    }

    /**
     * Places the hover guide, listens for the camera controls, and draws the scene.
     */
    render() {
      this.placeSelector();
      this.renderer.render(this.scene, this.camera);
    }

    /**
     * Determines where to place the hover guide.
     */
    placeSelector() {
    
      if (this.selectBox && !(this.prevRollOverMeshPos.equals(this.rollOverMesh.position))) {
        this.removeSelectBox();
      }
    
      this.prevRollOverMeshPos = this.rollOverMesh.position.clone();
    
      let fromScreenCenter = new THREE.Vector2(
        ((this.renderer.domElement.clientWidth / 2) / this.renderer.domElement.clientWidth) * 2 - 1,
        -(((this.renderer.domElement.clientHeight / 2) / this.renderer.domElement.clientHeight) * 2 - 1)
      );
    
      this.raycaster.setFromCamera(fromScreenCenter, this.camera);
    
      let intersects = this.raycaster.intersectObjects(this.voxels);
      if (intersects.length > 0) {
    
        let intersect = intersects[0];
        let normal = intersect.face.normal.clone();
        normal.multiplyScalar(this.voxelSideLength);
    
        this.rollOverMesh.position.copy(intersect.object.position);
        if (!this.altOrCtrlKeyPressed) {
          this.rollOverMesh.position.add(normal);
        }
    
        let rollOverPoint = new WorldAndScenePoint(this.rollOverMesh.position, false);
    
        if (this.selectStart.isComplete() && !this.selectEnd.isComplete()) {
          this.scene.remove(this.rollOverMesh);
          if (!this.selectBox) {
            this.selectBox = makeBoxAround(this.selectStart.getPoint(), rollOverPoint, this.rollOverMaterial);
            this.scene.add(this.selectBox);
          }
        }
        else if (!this.selectStart.isComplete() && this.selectEnd.isComplete()) {
          this.scene.remove(this.rollOverMesh);
          if (!this.selectBox) {
            this.selectBox = makeBoxAround(rollOverPoint, this.selectEnd.getPoint(), this.rollOverMaterial);
            this.scene.add(this.selectBox);
          }
        }
        else {
          this.scene.add(this.rollOverMesh);
        }
    
      }
    
      if (this.selectStart.isComplete() && this.selectEnd.isComplete()) {
        if (!this.selectBox) {
          this.selectBox = makeBoxAround(this.selectStart.getPoint(), this.selectEnd.getPoint(), this.rollOverMaterial);
          this.scene.add(this.selectBox);
        }
      }
    
      let worldCoords = new WorldAndScenePoint(this.rollOverMesh.position, false).world();
      let hoverCoordDiv = document.getElementById('hoverGuideCoordinates');
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
  
  }