class MapRender {
  
    constructor() {
  
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
        if (e.altKey || e.ctrlKey) {e.preventDefault(); altOrCtrlKeyPressed = true;}
        // electron doesn't make esc cancel pointerlock like most browsers do by default
        else if (e.keyCode == escCode) {e.preventDefault(); document.exitPointerLock();}
      });
    
      document.addEventListener('keyup', (e)=>{
        if (!(e.altKey || e.ctrlKey)) {altOrCtrlKeyPressed = false;}
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
  
  }