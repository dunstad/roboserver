const request = require('request');
const io = require('socket.io-client');
const config = require('../config/config');
const validators = require('../shared/fromClientSchemas.js');

let commandToResponseMap = {
    sendPosition: {
        name: 'robot position',
        callback: (robotResponse)=>{
            return `${robotResponse.robot}: ${JSON.stringify(robotResponse.data)}`;
        },
    },
    scanArea: {
        name: '',
        callback: ()=>{

        },
    },
    viewInventory: {
        name: '',
        callback: ()=>{

        },
    },
    equip: {
        name: '',
        callback: ()=>{

        },
    },
    dig: {
        name: '',
        callback: ()=>{

        },
    },
    place: {
        name: '',
        callback: ()=>{

        },
    },
    move: {
        name: '',
        callback: ()=>{

        },
    },
    interact: {
        name: '',
        callback: ()=>{

        },
    },
    inspect: {
        name: '',
        callback: ()=>{

        },
    },
    select: {
        name: '',
        callback: ()=>{

        },
    },
    transfer: {
        name: '',
        callback: ()=>{

        },
    },
    craft: {
        name: '',
        callback: ()=>{

        },
    },
    raw: {
        name: '',
        callback: ()=>{

        },
    },
    sendComponents: {
        name: '',
        callback: ()=>{

        },
    },
}

/**
 * Sends a command to the server.
 * @param {string} commandName 
 * @param {any[]} commandParameters
 * @param {string} robot
 * @returns {Promise}
 */
function sendCommand(commandName, commandParameters, robot) {
    return new Promise((resolve, reject)=>{

        commandParameters = Array.isArray(commandParameters) ? commandParameters : [];  
        let commandObject = {command: {name: commandName, parameters: commandParameters}, robot: robot};
        if (validators[commandName](commandObject)) {

            request.post(
                `http://localhost:${config.webServerPort}/login`,
                { json: {
                    username: 'admin',
                    password: 'admin',
                } },
                function (error, response, body) {
                    let cookie = response.headers['set-cookie'];
                    let socket = io.connect('http://localhost:8080', {
                        reconnect: true,
                        extraHeaders: {
                            'Cookie': cookie,
                        },
                    });
                    socket.on('connect', function () {
                        // console.log('Connected!');
                    });
            
                    socket.on('message', console.log);

                    socket.on(commandToResponseMap[commandName].name, (robotResponse)=>{
                        socket.disconnect();
                        let result = commandToResponseMap[commandName].callback(robotResponse);
                        resolve(result);
                    });

                    socket.emit('command', commandObject);
                }
            );

        }
        else {
            reject(new Error('Command failed to validate.'));
        }
        
    });
}

sendCommand('sendPosition', [], 'rob').then(console.log).catch(console.error);