const request = require('request');
const io = require('socket.io-client');
const config = require('../config/config');
const validators = require('../shared/fromClientSchemas.js');

let commandToResponseMap = {
    sendPosition: [{
        name: 'robot position',
        callback: (robotResponse, socket)=>{
            console.log(`${robotResponse.robot}: ${JSON.stringify(robotResponse.data)}`);
            socket.done = true;
        },
    }],
    scanArea: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    viewInventory: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    equip: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    dig: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    place: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    move: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    interact: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    inspect: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    select: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    transfer: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    craft: [{
        name: '',
        callback: (robotResponse, socket)=>{

        },
    }],
    raw: [{
        name: 'command result',
        callback: (robotResponse, socket)=>{
            return `${robotResponse.robot}: ${robotResponse.data}`;
        },
    }],
    sendComponents: [{
        name: 'available components',
        callback: (robotResponse, socket)=>{
            return `${robotResponse.robot}: ${robotResponse.data}`;
        },
    }],
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
                        query: 'cli=true',
                    });
                    socket.on('connect', function () {
                        // console.log('Connected!');
                    });
            
                    socket.on('message', console.log);

                    socket.done = false;
                    for (let handlerObject of commandToResponseMap[commandName]) {
                        socket.on(handlerObject.name, (robotResponse)=>{
                            handlerObject.callback(robotResponse, socket);
                        });
                    }
                    
                    socket.on('power level', (robotResponse)=>{
                        if (socket.done) {
                            socket.disconnect();
                            console.log(`power: ${Math.round(robotResponse.data * 100)}%`);
                            resolve(true);
                        }
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

sendCommand('sendPosition', [], 'rob').then().catch(console.error);