import { Tile } from '/js/client/Tile.mjs';

export class Menu {

  /**
   * Used to organize Tiles and animate them in unison.
   */
  constructor(menuPos, lookPos, numTiles, mapRender) {

    this.mapRender = mapRender;
    this.groupMaterial = mapRender.tileMaterial.clone();

    this.group = new THREE.Group();
    this.group.position.copy(menuPos);
    this.group.lookAt(lookPos);
    this.mapRender.scene.add(this.group);

    let tilePadding = .5;

    let arrangements = {
      
      1: [
        new THREE.Vector2(0, 0),
      ],
      
      2: [
        new THREE.Vector2(-.5 - tilePadding / 2, 0),
        new THREE.Vector2(.5 + tilePadding / 2, 0),
      ],
      
      3: [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(-1 - tilePadding, 0),
        new THREE.Vector2(1 + tilePadding, 0),
      ],
      
      4: [
        new THREE.Vector2(0, 1 + tilePadding),
        new THREE.Vector2(-1 - tilePadding, 0),
        new THREE.Vector2(1 + tilePadding, 0),
        new THREE.Vector2(0, -1 - tilePadding),
      ],
      
      5: [
        new THREE.Vector2(0, 1 + tilePadding),
        new THREE.Vector2(-1 - tilePadding, 0),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1 + tilePadding, 0),
        new THREE.Vector2(0, -1 - tilePadding),
      ],
      
      6: [
        new THREE.Vector2(-1 - tilePadding, -1 - tilePadding),
        new THREE.Vector2(-1 - tilePadding, 1 + tilePadding),
        new THREE.Vector2(0, -1 - tilePadding),
        new THREE.Vector2(0, 1 + tilePadding),
        new THREE.Vector2(1 + tilePadding, -1 - tilePadding),
        new THREE.Vector2(1 + tilePadding, 1 + tilePadding),
      ],
      
      7: [
        new THREE.Vector2(-1 - tilePadding, -1 - tilePadding),
        new THREE.Vector2(-1 - tilePadding, 1 + tilePadding),
        new THREE.Vector2(0, -1 - tilePadding),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1 + tilePadding),
        new THREE.Vector2(1 + tilePadding, -1 - tilePadding),
        new THREE.Vector2(1 + tilePadding, 1 + tilePadding),
      ],

      8: [
        new THREE.Vector2(-1 - tilePadding, -1 - tilePadding),
        new THREE.Vector2(-1 - tilePadding, 1 + tilePadding),
        new THREE.Vector2(0, -1 - tilePadding),
        new THREE.Vector2(-1 - tilePadding, 0),
        new THREE.Vector2(1 + tilePadding, 0),
        new THREE.Vector2(0, 1 + tilePadding),
        new THREE.Vector2(1 + tilePadding, -1 - tilePadding),
        new THREE.Vector2(1 + tilePadding, 1 + tilePadding),
      ],

      9: [
        new THREE.Vector2(-1 - tilePadding, -1 - tilePadding),
        new THREE.Vector2(-1 - tilePadding, 1 + tilePadding),
        new THREE.Vector2(0, -1 - tilePadding),
        new THREE.Vector2(-1 - tilePadding, 0),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1 + tilePadding, 0),
        new THREE.Vector2(0, 1 + tilePadding),
        new THREE.Vector2(1 + tilePadding, -1 - tilePadding),
        new THREE.Vector2(1 + tilePadding, 1 + tilePadding),
      ],

    }

    let arrangement = arrangements[numTiles];

    this.tiles = [];

    // convert offset to tile space
    for (let [index, tileOffset] of Object.entries(arrangement)) {
      let offset3D = new THREE.Vector3(tileOffset.x, tileOffset.y, 0);
      // same as voxelSideLength
      offset3D.multiplyScalar(this.mapRender.tileGeo.parameters.height);
      this.tiles.push(new Tile(offset3D, 'add', index, undefined, this));
    }

  }

  /**
   * Fades the menu into visibility.
   */
  fadeIn() {

    let fadeInKeyFrame = new THREE.NumberKeyframeTrack('.opacity', [0, .5], [0, 1]);
    let fadeInClip = new THREE.AnimationClip('FadeInMenu', .5, [fadeInKeyFrame]);
    
    // loop this for tile face materials
    let materials = this.tiles.map(e=>e.faceMaterial);
    materials.push(this.groupMaterial);
    for (let material of materials) {
      
      let fadeInMixer = new THREE.AnimationMixer(material);
      this.mapRender.mixers.menuFadeIn = fadeInMixer;
      let fadeInClipAction = fadeInMixer.clipAction( fadeInClip );
      fadeInClipAction.setLoop( THREE.LoopOnce );
      fadeInClipAction.clampWhenFinished = true;
      fadeInClipAction.play();
      
      fadeInMixer.addEventListener('finished', (event)=>{
        delete this.mapRender.mixers.menuFadeIn;
      });
      
    }

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
    let materials = this.tiles.map(e=>e.faceMaterial);
    materials.push(this.groupMaterial);
    for (let material of materials) {
     
      let fadeMixer = new THREE.AnimationMixer(this.groupMaterial);
      this.mapRender.mixers.menuFade = fadeMixer;
      let fadeClipAction = fadeMixer.clipAction( fadeClip );
      fadeClipAction.setLoop( THREE.LoopOnce );
      fadeClipAction.clampWhenFinished = true;
      fadeClipAction.play();

      fadeMixer.addEventListener('finished', (event)=>{
        this.mapRender.scene.remove(this.group);
        delete this.mapRender.mixers.menuFade;
      });

    }

    this.mapRender.scene.fog = undefined;

  }

}