import { Tile } from '/js/client/Tile.mjs';

export class Menu {

  /**
   * Used to organize Tiles and animate them in unison.
   * @param {THREE.Vector3} menuPos 
   * @param {THREE.Vector3} lookPos 
   * @param {Object[]} tileCodeAndImages 
   * @param {MapRender} mapRender 
   * @param {Boolean} wait 
   */
  constructor(menuPos, lookPos, tileCodeAndImages, mapRender, wait) {

    this.mapRender = mapRender;
    this.groupMaterial = mapRender.tileMaterial.clone();

    this.group = new THREE.Group();
    this.group.position.copy(menuPos);
    this.lookPos = lookPos.clone();
    this.group.lookAt(this.lookPos);
    this.menuPos = menuPos.clone();
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
        new THREE.Vector2(-1 - tilePadding, 0),
        new THREE.Vector2(0, 0),
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

    let arrangement = arrangements[tileCodeAndImages.length];

    this.tiles = [];

    // convert offset to tile space
    for (let [index, tileCodeAndImage] of Object.entries(tileCodeAndImages)) {
      let tileOffset = arrangement[index];
      let offset3D = new THREE.Vector3(tileOffset.x, tileOffset.y, 0);
      // same as voxelSideLength
      offset3D.multiplyScalar(this.mapRender.tileGeo.parameters.height);
      this.tiles.push(new Tile(offset3D, tileCodeAndImage.imageString, Number(index) + 1, tileCodeAndImage.onClick, this));
    }

    this.fadeIn(wait);

  }

  /**
   * Fades the menu into visibility.
   */
  fadeIn(wait) {

    let fadeInKeyFrame;
    let fadeInClip;

    if (wait) {
      fadeInKeyFrame = new THREE.NumberKeyframeTrack('.opacity', [0, .25, .5], [0, 0, 1]);
      fadeInClip = new THREE.AnimationClip('FadeInMenu', .5, [fadeInKeyFrame]);
    }
    else {
      fadeInKeyFrame = new THREE.NumberKeyframeTrack('.opacity', [0, .25], [0, 1]);
      fadeInClip = new THREE.AnimationClip('FadeInMenu', .25, [fadeInKeyFrame]);
    }
    
    let materials = this.tiles.map(e=>e.faceMaterial);
    materials.push(this.groupMaterial);
    for (let material of materials) {
      
      let mixerKey = `fadeIn-${material.uuid}`
      this.mapRender.animate(fadeInClip, material, mixerKey);
      
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
    
    let opacityKeyFrame = new THREE.NumberKeyframeTrack('.opacity', [0, .25], [1, 0]);
    let fadeClip = new THREE.AnimationClip('FadeMenu', .25, [opacityKeyFrame]);
    
    let materials = this.tiles.map(e=>e.faceMaterial);
    materials.push(this.groupMaterial);
    for (let material of materials) {
     
      let mixerKey = `fadeOut-${material.uuid}`;
      this.mapRender.animate(fadeClip, material, mixerKey);
      
    }
    
    let mixerKey = `fadeOut-${this.groupMaterial.uuid}`;
    this.mapRender.mixers[mixerKey].addEventListener('finished', (event)=>{
      this.mapRender.scene.remove(this.group);
    });

    this.mapRender.scene.fog = undefined;

  }

}