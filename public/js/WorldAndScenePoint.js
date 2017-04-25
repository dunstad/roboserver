/**
 * Now I don't have to worry about whether functions accept scene points or world points.
 */
class WorldAndScenePoint {

  /**
   * Now I don't have to worry about whether functions accept scene points or world points.
   * @param {object} point 
   * @param {boolean} isWorldPoint 
   */
  constructor(point, isWorldPoint) {

    this.voxelSideLength = 50;

    if (isWorldPoint) {
      this.worldPoint = new THREE.Vector3(point.x, point.y, point.z);
      this.scenePoint = new THREE.Vector3(
        point.x * this.voxelSideLength,
        point.y * this.voxelSideLength,
        point.z * this.voxelSideLength
      );
    }

    else {
      this.scenePoint = new THREE.Vector3(point.x, point.y, point.z);
      this.worldPoint = new THREE.Vector3(
        Math.round(point.x / this.voxelSideLength),
        Math.round(point.y / this.voxelSideLength),
        Math.round(point.z / this.voxelSideLength)
      );
    }

  }

  /**
   * The world point contains the coordinates of something in the Minecraft world.
   * @returns {object}
   */
  world() {
    return this.worldPoint;
  }

  /**
   * The scene point contains coordinates used by three.js to render meshes.
   * @returns {object}
   */
  scene() {
    return this.scenePoint;
  }

}