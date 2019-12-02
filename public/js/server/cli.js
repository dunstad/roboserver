const request = require('request');
const io = require('socket.io-client');
const config = require('../config/config');
const validators = require('../shared/fromClientSchemas.js');

let validationErrorString = 'Command failed to validate.';

let commandToResponseMap = {
    sendPosition: {
        callbacks: [{
            name: 'robot position',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}: ${JSON.stringify(robotResponse.data)}`);
                socket.done = true;
            },
        }],
    },
    scanArea: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    viewInventory: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    equip: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    dig: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    place: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    move: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    interact: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    inspect: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    select: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    transfer: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    craft: {
        callbacks: [{
            name: '',
            callback: (robotResponse, socket)=>{

            },
        }],
        errorStrings: {
            usage: '',
            example: '',
        }
    },
    raw: {
        callbacks: [{
            name: 'command result',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}: ${robotResponse.data[1] || robotResponse.data[0]}`);
                socket.done = true;
            },
        }],
        errorStrings: {
            usage: 'someLuaCode',
            example: '"cat /bin/sh.lua"',
        }
    },
    sendComponents: {
        callbacks: [{
            name: 'available components',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}: ${JSON.stringify(robotResponse.data)}`);
                socket.done = true;
            },
        }],
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
                        query: 'cli=true',
                    });
                    socket.on('connect', function () {
                        // console.log('Connected!');
                    });
            
                    socket.on('message', console.log);

                    socket.done = false;
                    for (let handlerObject of commandToResponseMap[commandName].callbacks) {
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
            reject(new Error(validationErrorString));
        }
        
    });
}

function printCommands(commandToResponseMap) {
    console.log('Commands: ');
    for (let commandName of Object.keys(commandToResponseMap)) {
        let parameterString = '';
        if (commandToResponseMap[commandName].errorStrings) {
            parameterString = commandToResponseMap[commandName].errorStrings.usage;
        }
        console.log(`${commandName} ${parameterString}`);
    }
}

let commandName = process.argv[2];
let args = process.argv.slice(3);
if (['help', '--help', '-h', '-help'].indexOf(commandName) != -1) {
    printCommands(commandToResponseMap);
}
else {
    sendCommand(commandName, args, 'rob').then().catch((error)=>{
        if (error.message == validationErrorString) {
            console.error(validationErrorString);
            let baseErrorString = `node cli.js ${commandName}`;
            let errorStrings = commandToResponseMap[commandName].errorStrings;
            if (errorStrings) {
                console.log(`Usage: ${baseErrorString} ${errorStrings.usage}`);
                console.log(`Example: ${baseErrorString} ${errorStrings.example}`);
            }
            else {
                console.log(`Usage: ${baseErrorString}`);
            }
        }
        else if (!commandToResponseMap[commandName]) {
            printCommands(commandToResponseMap);
        }
        else {
            console.dir(error);
        }
    });
}