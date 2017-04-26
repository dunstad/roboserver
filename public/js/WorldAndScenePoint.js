/**
 * This class allows for easy conversion between Three.js scene coordinates and Minecraft world coordinates.
 */
class WorldAndScenePoint {

  /**
   * This class allows for easy conversion between Three.js scene coordinates and Minecraft world coordinates.
   * @param {THREE.Vector3 | object} point 
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
   * @returns {THREE.Vector3}
   */
  world() {
    return this.worldPoint;
  }

  /**
   * The scene point contains coordinates used by three.js to render meshes.
   * @returns {THREE.Vector3}
   */
  scene() {
    return this.scenePoint;
  }

}