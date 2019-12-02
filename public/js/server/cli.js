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
            name: 'map data',
            callback: (robotResponse, socket)=>{

                this.hardnessToLetterMap = {
                    // bedrock
                    '-1': {
                        letter: 'b',
                        color: '',
                    },
                    // air
                    0: {
                        letter: '.',
                        color: '',
                    },
                    // leaves
                    0.2: {
                        letter: 'l',
                        color: '',
                    },
                    // glowstone
                    0.3: {
                        letter: 'G',
                        color: '',
                    },
                    // netherrack
                    0.4: {
                        letter: 'n',
                        color: '',
                    },
                    // dirt or sand
                    0.5: {
                        letter: 'd',
                        color: '',
                    },
                    // grass block
                    0.6: {
                        letter: 'g',
                        color: '',
                    },
                    // sandstone
                    0.8: {
                        letter: 's',
                        color: '',
                    },
                    // pumpkins or melons
                    1.0: {
                        letter: 'p',
                        color: '',
                    },
                    // smooth stone
                    1.5: {
                        letter: 'C',
                        color: '',
                    },
                    // cobblestone
                    2.0: {
                        letter: 'c',
                        color: '',
                    },
                    // ores
                    3.0: {
                        letter: '!',
                        color: '',
                    },
                    // cobwebs
                    4.0: {
                        letter: 'w',
                        color: '',
                    },
                    // ore blocks
                    5.0: {
                        letter: 'O',
                        color: '',
                    },
                    // obsidian
                    50: {
                        letter: 'o',
                        color: '',
                    },
                    // water or lava
                    100: {
                        letter: 'W',
                        color: '',
                    },
                };

                let letterFromHardness = (hardness)=>{
                    let closestMatch = 999; // arbitrarily high number
                    let oldDifference = Math.abs(closestMatch - hardness);
                    for (let key in this.hardnessToLetterMap) {
                        let newDifference = Math.abs(key - hardness);
                        if (newDifference < oldDifference) {
                            closestMatch = key;
                            oldDifference = newDifference;
                        }
                    }
                    return this.hardnessToLetterMap[closestMatch].letter;
                };

                let terrainMap = [];
                for (let y = 0; y < (robotResponse.data.data.n / (robotResponse.data.w * robotResponse.data.d)); y++) {
                    terrainMap.push([]);
                    for (let z = 0; z < robotResponse.data.d; z++) {
                        terrainMap[y].push([]);
                        for (let x = 0; x < robotResponse.data.w; x++) {
    
                            let xWithOffset = x + robotResponse.data.x;
                            let yWithOffset = y + robotResponse.data.y;
                            let zWithOffset = z + robotResponse.data.z;
            
                            // this is how the geolyzer reports 3d data in a 1d array
                            // also lua is indexed from 1
                            let index = (x + 1) + z*robotResponse.data.w + y*robotResponse.data.w*robotResponse.data.d;

                            terrainMap[y][z].push(letterFromHardness(robotResponse.data.data[index]));

                        }
                    }
                }

                console.log(`${robotResponse.robot}:`);
                for (let i = terrainMap.length - 1; i >= 0; i--) {
                    console.log()
                    for (let row of terrainMap[i]) {
                        console.log(row.reduce((a, b)=>a+b));
                    }
                }
                socket.done = true;
            },
        }],
        errorStrings: {
            usage: 'scanLevel',
            example: '1',
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
        let commandObject = {
            command: {
                name: commandName,
                parameters: commandParameters.map((parameter)=>{
                    let converted = parseInt(parameter);
                    return isNaN(converted) ? parameter : converted;
                }),
            },
            robot: robot,
        };
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

/**
 * Prints all the commands and their arguments.
 * @param {Object} commandToResponseMap 
 */
function printCommands(commandToResponseMap) {
    console.log('Commands: ');
    for (let commandName of Object.keys(commandToResponseMap)) {
        let parameterString = '';
        if (commandToResponseMap[commandName].errorStrings) {
            parameterString = commandToResponseMap[commandName].errorStrings.usage;
        }
        console.log(`  ${commandName} ${parameterString}`);
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