/**
 * An organized collection of all important data about a connected robot.
 */
class Robot {

  /**
   * An organized collection of all important data about a connected robot.
   */
  constructor() {
    this.showInventories = false;
    this.inventories = {};
    this.components = [];
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
   * Receive an updated inventory from the robot. Will overwrite existing inventories from the same side.
   * @param {number} side 
   * @param {Inventory} inventory 
   */
  addInventory(inventory) {
    var oldInventory = this.inventories[inventory.inventory.side];
    if (oldInventory) {oldInventory.removeFromDisplay();}
    this.inventories[inventory.inventory.side] = inventory;
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

  /**
   * Used when we want to remove all a robot's external inventories when it moves.
   */
  removeAllExternalInventories() {
    var internalInventories = {};
    for (var inventory of Object.values(this.inventories)) {
      var side = inventory.getSide()
      if (side == -1) {internalInventories[side] = inventory;}
      else {inventory.removeFromDisplay();}
    }
    this.inventories = internalInventories;
  }

  /**
   * The robot's available components are used to customize the GUI to each robot's abilities.
   */
  getComponents() {
    return this.components;
  }
  
  /**
   * The robot's available components are set when it connects.
   * @param {string[]} components
   */
  setComponents(components) {
    this.components = components;
  }

  /**
   * Used to tell the UI whether this robot's inventories should be displayed or not.
   * @returns {boolean}
   */
  getShowInventories() {
    return this.showInventories;
  }

  /**
   * Used when the inventory button is pressed. The UI reads this and changes accordingly.
   */
  toggleShowInventories() {
    this.showInventories = !this.showInventories;
  }

}