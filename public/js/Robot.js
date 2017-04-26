/**
 * An organized collection of all important data about a connected robot.
 */
class Robot {

  /**
   * An organized collection of all important data about a connected robot.
   */
  constructor() {
    this.inventories = {};
  }

  /**
   * Used to display how much power remains in the GUI.
   * @returns {number}
   */
  getPower() {
    return this.power;
  }

  /**
   * Receive an updated power value from the robot.
   * @param {number} power 
   */
  setPower(power) {
    this.power = power;
  }

  /**
   * Used to know where to look when this robot is selected, where to put the select highlight,
   * and to make sure the robot material isn't overwritten to the stone material by terrain scans.
   * @returns {WorldAndScenePoint}
   */
  getPosition() {
    return this.position;
  }

  /**
   * Receive an updated location from the robot.
   * @param {WorldAndScenePoint} point 
   */
  setPosition(point) {
    this.position = point;
  }

  /**
   * Needed so we can call methods of the robot's inventories.
   * @param {number} side 
   * @returns {Inventory}
   */
  getInventory(side) {
    return this.inventories[side];
  }

  /**
   * Receive an updated inventory from the robot.
   * @param {number} side 
   * @param {Inventory} inventory 
   */
  setInventory(side, inventory) {
    this.inventories[side] = inventory;
  }

  /**
   * Used when we want to toggle the visibility of all a robot's inventories.
   * @returns {Inventory[]}
   */
  getAllInventories() {
    return Object.values(this.inventories);
  }

  /**
   * Used when we want to remove all a robot's external inventories when it moves.
   * @returns {Inventory[]}
   */
  getAllExternalInventories() {
    return Object.keys(this.inventories)
      .filter(side => side != -1)
      .map(side => this.inventories[side]);
  }

}