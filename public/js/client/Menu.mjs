class Menu {

  /**
   * Used to organize Tiles and animate them in unison.
   */
  constructor(menuPos, mapRender) {
    this.mapRender = mapRender;
    this.groupMaterial = mapRender.tileMaterial.clone();

    this.group = new THREE.Group();
    this.group.position.copy(menuPos);

    this.tiles = [];
    this.arrangement;
  }

  /**
   * Fades the menu into visibility.
   */
  fadeIn() {

    let fadeInKeyFrame = new THREE.NumberKeyframeTrack('.opacity', [0, .5], [0, 1]);
    let fadeInClip = new THREE.AnimationClip('FadeInMenu', .5, [fadeInKeyFrame]);
    
    // loop this for tile face materials
    let fadeInMixer = new THREE.AnimationMixer(this.groupMaterial);
    this.mapRender.mixers.menuFadeIn = fadeInMixer;
    let fadeInClipAction = fadeInMixer.clipAction( fadeInClip );
    fadeInClipAction.setLoop( THREE.LoopOnce );
    fadeInClipAction.clampWhenFinished = true;
    fadeInClipAction.play();

    fadeInMixer.addEventListener('finished', (event)=>{
      delete this.mapRender.mixers.menuFadeIn;
    });

    this.mapRender.scene.fog = new THREE.Fog(this.mapRender.renderer.getClearColor().getHex(), 1);
    
  }

  /**
   * Fades the menu out of visibility.
   */
  fadeOut() {
    
    // prevent tiles from being clicked as they fade out
    // also allows a new menu to be created immediately 
    this.mapRender.menuTiles = [];

    let opacityKeyFrame = new THREE.NumberKeyframeTrack('.opacity', [0, .5], [1, 0]);
    let fadeClip = new THREE.AnimationClip('FadeMenu', .5, [opacityKeyFrame]);
    
    // loop this for tile face materials
    let fadeMixer = new THREE.AnimationMixer(this.groupMaterial);
    this.mapRender.mixers.menuFade = fadeMixer;
    let fadeClipAction = fadeMixer.clipAction( fadeClip );
    fadeClipAction.setLoop( THREE.LoopOnce );
    fadeClipAction.clampWhenFinished = true;
    fadeClipAction.play();

    fadeMixer.addEventListener('finished', (event)=>{
      this.scene.remove(group);
      delete this.mapRender.mixers.menuFade;
    });

    this.mapRender.scene.fog = undefined;

  }

}