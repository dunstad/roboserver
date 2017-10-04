class WebClient {

  constructor(game) {

    this.game = game;

    this.socket = io();

    this.allRobotInfo = {};

    this.commandMap = {

      "message": console.dir,

      "command result": ()=>{

        

      },

      "map data": ()=>{

        

      },

      "block data": ()=>{

        

      },

      "robot position": ()=>{

        

      },

      "delete selection": ()=>{

        

      },

      "dig success": ()=>{

        

      },

      "inventory data": ()=>{

        

      },

      "slot data": ()=>{

        

      },

      "listen start": ()=>{

        

      },

      "listen end": ()=>{

        

      },

      "power level": ()=>{

        

      },

      "available components": ()=>{

        

      },


    };

  }

}