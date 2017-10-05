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
        this.addMessage(result.data, false);
      },

      'map data': (mapData)=>{
        console.dir('map data');
        console.dir(mapData);
        this.game.mapRender.addShapeVoxels(mapData.data, mapData.robot);
      },

      'block data': (blockData)=>{
        console.dir('block data');
        console.dir(blockData);
        let pos = new WorldAndScenePoint(blockData.data.point, true);
        if (!(blockData.data.name == 'minecraft:air')) {
          this.game.mapRender.addVoxel(pos, this.game.mapRender.colorFromHardness(blockData.data.hardness));
        }
        else {this.game.mapRender.removeVoxel(pos);}
      },

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

      'delete selection': ()=>{

        

      },

      'dig success': ()=>{

        

      },

      'inventory data': ()=>{

        

      },

      'slot data': ()=>{

        

      },

      'listen start': ()=>{

        

      },

      'listen end': ()=>{

        

      },

      'power level': ()=>{

        

      },

      'available components': ()=>{

        

      },


    };

  }

}