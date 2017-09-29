class MapRender {
  
    constructor() {
  
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
      this.scene = new THREE.Scene();
      this.controls = new PointerLockControls(camera);
      this.scene.add(this.controls.getObject());
      this.raycaster = new THREE.Raycaster();
  
    }
  
  }