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

    let fadeInKeyFrame = new THREE.NumberKeyframeTrack('.material[4].opacity', [0, .5], [0, 1]);
    let fadeInKeyFrame2 = new THREE.NumberKeyframeTrack('.material[0].opacity', [0, .5], [0, 1]);
    let fadeInClip = new THREE.AnimationClip('FadeInMenu', .5, [fadeInKeyFrame, fadeInKeyFrame2]);
    let fadeInMixer = new THREE.AnimationMixer(group.children[0]);
    this.mapRender.mixers.menuFadeIn = fadeInMixer;
    let fadeInClipAction = fadeInMixer.clipAction( fadeInClip );
    fadeInClipAction.setLoop( THREE.LoopOnce );
    fadeInClipAction.clampWhenFinished = true;
    fadeInClipAction.play();

    fadeInMixer.addEventListener('finished', (event)=>{
      delete this.mapRender.mixers.menuFadeIn;
    });

    this.scene.fog = new THREE.Fog(this.mapRender.renderer.getClearColor().getHex(), 1);
    
  }

  /**
   * Fades the menu out of visibility.
   */
  fadeOut() {
    
    // prevent tiles from being clicked as they fade out
    // also allows a new menu to be created immediately 
    this.mapRender.menuTiles = [];

    let opacityKeyFrame = new THREE.NumberKeyframeTrack('.material[4].opacity', [0, .5], [1, 0]);
    let opacityKeyFrame2 = new THREE.NumberKeyframeTrack('.material[0].opacity', [0, .5], [1, 0]);
    let fadeClip = new THREE.AnimationClip('FadeMenu', .5, [opacityKeyFrame, opacityKeyFrame2]);
    let fadeMixer = new THREE.AnimationMixer(group.children[0]);
    this.mapRender.mixers.menuFade = fadeMixer;
    let fadeClipAction = fadeMixer.clipAction( fadeClip );
    fadeClipAction.setLoop( THREE.LoopOnce );
    fadeClipAction.clampWhenFinished = true;
    fadeClipAction.play();

    fadeMixer.addEventListener('finished', (event)=>{
      this.scene.remove(group);
      delete this.mapRender.mixers.menuFade;
    });

    this.scene.fog = undefined;

  }

}