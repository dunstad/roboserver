class WebClient {

  constructor(game) {

    this.game = game;

    this.socket = io();

    this.allRobotInfo = {};

    this.commandMap = {

      'message': console.dir,

      /**
       * Used to display command results received from robots.
       * @param {object} result
       */
      'command result': (result)=>{
        console.dir('command result');
        console.dir(result);
        this.game.GUI.addMessage(result.data, false);
      },

      /**
       * Used to render map data received from robots.
       * @param {object} mapData
       */
      'map data': (mapData)=>{
        console.dir('map data');
        console.dir(mapData);
        this.game.mapRender.addShapeVoxels(mapData.data, mapData.robot);
      },

      /**
       * Used to render block data received from robots.
       * @param {object} blockData
       */
      'block data': (blockData)=>{
        console.dir('block data');
        console.dir(blockData);
        let pos = new WorldAndScenePoint(blockData.data.point, true);
        if (!(blockData.data.name == 'minecraft:air' || !blockData.data.name)) {
          this.game.mapRender.addVoxel(pos, this.game.mapRender.colorFromHardness(blockData.data.hardness));
        }
        else {this.game.mapRender.removeVoxel(pos);}
        this.game.GUI.addMessage([`name: ${blockData.data.name}`, `hardness: ${blockData.data.hardness}`]);
      },

      /**
       * Used to render the robot's position.
       * @param {object} pos
       */
      'robot position': (pos)=>{
        console.dir('robot position');
        console.dir(pos);
        this.game.mapRender.moveRobotVoxel(new WorldAndScenePoint(pos.data, true), pos.robot);
        this.game.webClient.allRobotInfo[pos.robot].removeAllExternalInventories();
        if (pos.robot == document.getElementById('robotSelect').value) {
          let robotData = this.game.webClient.allRobotInfo[pos.robot];
          if (robotData) {
            this.game.mapRender.selectedRobotMesh.position.copy(robotData.getPosition().scene());
            this.game.mapRender.requestRender();
          }
        }
      },

      /**
       * Used to get rid of selection areas when their task is done.
       * @param {object} index
       */
      'delete selection': (index)=>{
        console.dir('delete selection');
        console.dir(index);
        this.game.GUI.deleteSelection(selections, index.data);
      },

      /**
       * Used to remove voxels after successfully digging the
       * corresponding block in the world.
       * @param {object} pos
       */
      'dig success': (pos)=>{
        console.dir('dig success');
        console.dir(pos);
        this.game.mapRender.removeVoxel(new WorldAndScenePoint(pos.data, true));
      },

      /**
       * Used to render inventory data received from robots.
       * @param {object} inventoryData
       */
      'inventory data': (inventoryData)=>{
        
        console.dir('inventory data');
        console.dir(inventoryData);
        
        let inventoryContainer = document.getElementById('inventoryContainer');
        let inventorySide = inventoryData.data.side;
        if (!this.allRobotInfo[inventoryData.robot].getInventory(inventorySide)) {
          let inv = new Inventory(inventoryData.data, this.game.GUI);
          this.allRobotInfo[inventoryData.robot].addInventory(inv);
          if (document.getElementById('robotSelect').value == inventoryData.robot) {
            inv.addToDisplay(inventoryContainer);
          }
        }
    
        // reveal inventories when any change occurs
        if (!this.allRobotInfo[inventoryData.robot].getShowInventories()) {
          this.allRobotInfo[inventoryData.robot].toggleShowInventories();
        }
        inventoryContainer.classList.remove('hidden');
        // get the robot's inventory if we didn't have it yet
        if (!this.allRobotInfo[inventoryData.robot].getInventory(-1)) {
          this.game.GUI.sendCommand('viewInventory');
        }
    
      },

      /**
       * Used to render inventory slot data received from robots.
       * @param {object} slot
       */
      'slot data': (slot)=>{
        console.dir('slot data');
        console.dir(slot);
        this.allRobotInfo[slot.robot]
          .getInventory(slot.data.side)
          .setSlot(slot.data.slotNum, slot.data.contents);
      },

      /**
       * Used to add listening robots to the select field.
       * @param {object} data
       */
      'listen start': (data)=>{
        console.dir('listen start');
        console.dir(data);
        let robotSelect = document.getElementById('robotSelect');
        if (!robotSelect.querySelector('[value=' + data.robot + ']')) {
          
          let option = document.createElement('option');
          option.text = data.robot;
          option.value = data.robot;
          
          robotSelect.add(option);
          if (robotSelect.options.length <= 2) {
            option.selected = true;
          }
    
        }
        if (!this.allRobotInfo[data.robot]) {this.allRobotInfo[data.robot] = new Robot();}
      },

      /**
       * Used to remove robots that stop listening from the select field.
       * @param {object} data
       */
      'listen end': (data)=>{
        console.dir('listen end');
        console.dir(data);
        let robotSelect = document.getElementById('robotSelect');
        let option = robotSelect.querySelector('[value=' + data.robot + ']');
        this.allRobotInfo[data.robot] = undefined;
        // if the disconnecting robot is the currently selected robot
        if (robotSelect.value == data.robot) {
          robotSelect.value = '';
          this.game.mapRender.selectedRobotMesh.visible = false;
          this.game.mapRender.requestRender();
        }
        robotSelect.removeChild(option);
      },

      /**
       * Used to display power levels received from robots.
       * @param {object} power
       */
      'power level': (power)=>{
        console.dir('power level');
        console.dir(power);
        this.allRobotInfo[power.robot].setPower(power.data);
        let currentRobot = document.getElementById('robotSelect').value;
        if (power.robot == currentRobot) {
          this.game.GUI.setPower(power.data);
        }
      },

      /**
       * Used to change the GUI based on what components robots have available.
       * @param {object} components
       */
      'available components': (components)=>{
        console.dir('available components');
        console.dir(components);
        this.allRobotInfo[components.robot].setComponents(components.data);
        if (components.robot == document.getElementById('robotSelect').value) {
          this.game.GUI.hideComponentGUI();
          for (let componentName in this.allRobotInfo[components.robot].getComponents()) {
            let componentElementIDs = this.game.GUI.componentElementMap[componentName];
            componentElementIDs.map((componentElementID)=>{
              document.getElementById(componentElementID).classList.remove('hidden');
            });
          }
        }
      },

    };

    for (let messageName in this.commandMap) {
      this.socket.on(messageName, this.commandMap[messageName]);
    }

  }

}