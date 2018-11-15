/**
 * Used to create various menu arrangements easily.
 */
export class MenuMaker {

  /**
   * Used to give the class the information it needs to make menus.
   * @param {THREE.Geometry} tileGeo 
   * @param {THREE.Material} tileMat 
   * @param {THREE.Scene} scene 
   */
  constructor(mapRender) {

    this.tileGeo = mapRender.tileGeo;
    this.tileWireGeo = mapRender.tileWireGeo;
    this.tileMat = mapRender.tileMaterial;
    this.wireMat = mapRender.wireMat;
    this.scene = mapRender.scene;
    this.simple = mapRender.simple;
    this.mapRender = mapRender;

    let tilePadding = .5;

    this.arrangements = {
      
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

  }

  /**
   * Used to add a new menu to the scene.
   * @param {THREE.Vector3} menuPos 
   * @param {THREE.Vector3} lookPos 
   * @param {number} numTiles 
   * @returns {THREE.Group}
   */
  create(menuPos, lookPos, numTiles) {
    
    let group = new THREE.Group();

    // make all the menu's tiles fade out
    group.fadeOut = ()=>{

        // prevent tiles from being clicked as they fade out
        // also allows a new menu to be created immediately 
        this.mapRender.menuTiles = [];

        let fadeOutMaterial = group.children[0].material.clone();
        for (let menuTile of group.children) {
          menuTile.material = fadeOutMaterial;
        }
        let opacityKeyFrame = new THREE.NumberKeyframeTrack('.material.opacity', [0, .5], [1, 0]);
        let fadeClip = new THREE.AnimationClip('FadeMenu', .5, [opacityKeyFrame]);
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

    };

    group.position.copy(menuPos);
    group.lookAt(lookPos);

    for (let tileOffset of this.arrangements[numTiles]) {

      let tile = new THREE.Mesh(this.tileGeo, this.tileMat);

      this.mapRender.menuTiles.push(tile);

      tile.animateClick = ()=>{

        // make the clicked tile move back and forth
        let positionKeyFrame = new THREE.VectorKeyframeTrack('.position', [0, .25, .5], [
          tile.position.x, tile.position.y, tile.position.z,
          tile.position.x, tile.position.y, -10,
          tile.position.x, tile.position.y, tile.position.z,
        ]);
        let clickClip = new THREE.AnimationClip('Clicked', .5, [positionKeyFrame]);
        let clickMixer = new THREE.AnimationMixer(tile);
        this.mapRender.mixers.tileClick = clickMixer;
        let clickClipAction = clickMixer.clipAction( clickClip );
        clickClipAction.setLoop( THREE.LoopOnce );
        clickClipAction.clampWhenFinished = true;
        clickClipAction.play();

        clickMixer.addEventListener('finished', (event)=>{
          delete this.mapRender.mixers.tileClick;
        });

        group.fadeOut();

      }
  
      group.add(tile);
      
      if (this.simple) {
        tile.add(new THREE.LineSegments(this.tileWireGeo, this.wireMat));
      }
      
      // convert offset to tile space
      let offset3D = new THREE.Vector3(tileOffset.x, tileOffset.y, 0);
      offset3D.multiplyScalar(this.tileGeo.parameters.height); // same as voxelSideLength
      
      // apply offset
      tile.position.copy(offset3D);
      
    }

    this.scene.add(group);

    return group;

  }

}