class WebClient {

  constructor() {

    this.socket = io();

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