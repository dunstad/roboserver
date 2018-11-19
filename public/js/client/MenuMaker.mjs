/**
 * Used to create various menu arrangements easily.
 */
export class MenuMaker {

  /**
   * Used to give the class the information it needs to make menus.
   * @param {MapRender} mapRender 
   */
  constructor(mapRender) {

    this.tileGeo = mapRender.tileGeo;
    this.tileWireGeo = mapRender.tileWireGeo;
    this.tileMaterial = mapRender.tileMaterial;
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

    let mat1 = this.mapRender.tileFaceMaterial.clone();
    
    
    let img = new Image();
    img.onload = ()=>{
      
      let drawingCanvas = document.createElement('canvas');
      const canvasSize = 128;
      drawingCanvas.width = canvasSize;
      drawingCanvas.height = canvasSize;
      let ctx = drawingCanvas.getContext('2d');
      
      ctx.fillStyle = "#003366";
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      console.dir(img);
      let imageSize = canvasSize * 3 / 4
      ctx.drawImage(img, (canvasSize / 2) - (imageSize / 2), 0, imageSize, imageSize);
      
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      let text = '1';
      let textMeasure = ctx.measureText(text);
      ctx.fillText(text, (canvasSize / 2) - textMeasure.width / 2, canvasSize * 4 / 5);

      mat1.map = new THREE.CanvasTexture(drawingCanvas);

    }
    img.src = '/assets/icons/ios-add.svg';

    
    let mat2 = this.tileMaterial.clone();

    let groupMaterial = [
      mat2,
      mat2,
      mat2,
      mat2,
      mat1,
      mat2,
    ];

    // make all the menu's tiles fade out
    group.fadeOut = ()=>{

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

    };

    group.position.copy(menuPos);
    group.lookAt(lookPos);

    for (let tileOffset of this.arrangements[numTiles]) {

      let tile = new THREE.Mesh(this.tileGeo, groupMaterial);

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

    // fade menu in
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

    return group;

  }

}