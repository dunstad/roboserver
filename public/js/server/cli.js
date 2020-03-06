const request = require('request');
const io = require('socket.io-client');
const config = require('../config/config');
const validators = require('../shared/fromClientSchemas.js');

let validationErrorString = 'Command failed to validate.';

let printCommandResult = (robotResponse, socket)=>{
    console.log(`${robotResponse.robot}: ${robotResponse.data[1]}`);
    socket.done = true;
};

let handleInventoryData = (robotResponse, socket)=>{
    socket.selected = robotResponse.data.selected;
    socket.slotCount = robotResponse.data.size;
    socket.side = robotResponse.data.side;
    socket.slots = {};
};

let handleSlotData = (robotResponse, socket)=>{
    if (robotResponse.data.contents) {
        socket.slots[robotResponse.data.slotNum] = robotResponse.data.contents;
    }
};

let printInventory = (robotResponse, socket)=>{
    if (socket.slots) {
        console.log(`${robotResponse.robot}:`);
        console.log(`  slots: ${socket.slotCount}`);
        console.log(`  side: ${socket.side}`);
        for (let slotNum in socket.slots) {
            let selected = slotNum == socket.selected ? ' *' : '';
            let contents = socket.slots[slotNum];
            console.log(`${String(slotNum).padStart(2)}. ${contents.label} (${contents.size})${selected}`);
        }
    }
    socket.done = true;
};

let handleBlockData = (robotResponse, socket)=>{
    console.log(`${robotResponse.robot}:`);
    console.log(`  hardness: ${Math.round(robotResponse.data.hardness * 100) / 100}`);
    console.log(`  name: ${robotResponse.data.name}`);
};

let commandToResponseMap = {
    sendPosition: {
        callbacks: [{
            name: 'robot position',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}:`);
                console.log(`  x: ${robotResponse.data.x}`);
                console.log(`  y: ${robotResponse.data.y}`);
                console.log(`  z: ${robotResponse.data.z}`);
                socket.done = true;
            },
        }],
    },
    scanArea: {
        callbacks: [{
            name: 'map data',
            callback: (robotResponse, socket)=>{
                if (!socket.mapData) {
                    socket.mapData = {
                        // these only work when every map piece is a whole plane
                        w: robotResponse.data.w,
                        d: robotResponse.data.d,
                        data: [],
                    };
                }
                for (let i = 1; i <= robotResponse.data.data.n; i++) {
                    socket.mapData.data.push(robotResponse.data.data[i]);
                }
            },
        }, {
            name: 'command result',
            callback: (robotResponse, socket)=>{

                mapDataObject = {n: socket.mapData.data.length};
                for (let i = 0; i < socket.mapData.data.length; i++) {
                    mapDataObject[i + 1] = socket.mapData.data[i];
                }
                socket.mapData.data = mapDataObject;

                hardnessToLetterMap = {
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
                    hardness = hardness || 0;
                    let closestMatch = 999; // arbitrarily high number
                    let oldDifference = Math.abs(closestMatch - hardness);
                    for (let key in hardnessToLetterMap) {
                        let newDifference = Math.abs(key - hardness);
                        if (newDifference < oldDifference) {
                            closestMatch = key;
                            oldDifference = newDifference;
                        }
                    }
                    return hardnessToLetterMap[closestMatch].letter;
                };

                let robotScanCoordX;
                let robotScanCoordY;
                let robotScanCoordZ;
                if (mapDataObject.n == 512) {
                    robotScanCoordX = 3;
                    robotScanCoordY = 2;
                    robotScanCoordZ = 3;
                }
                else {
                    socket.mapData.w = 64;
                    socket.mapData.d = 64;
                    robotScanCoordX = 32;
                    robotScanCoordY = 1;
                    robotScanCoordZ = 32;
                }

                let terrainMap = [];
                let topDownLayers = [[], []];
                let leftRight = [];
                let frontBack = [];
                for (let y = 0; y < (socket.mapData.data.n / (socket.mapData.w * socket.mapData.d)); y++) {
                    terrainMap.push([]);
                    leftRight.push([]);
                    frontBack.push([]);
                    for (let z = 0; z < socket.mapData.d; z++) {
                        terrainMap[y].push([]);
                        if (y == robotScanCoordY) {
                            topDownLayers[0].push([]);
                        }
                        if (y == (robotScanCoordY - 1)) {
                            topDownLayers[1].push([]);
                        }
                        for (let x = 0; x < socket.mapData.w; x++) {
    
                            // this is how the geolyzer reports 3d data in a 1d array
                            // also lua is indexed from 1
                            let index = (x + 1) + z*socket.mapData.w + y*socket.mapData.w*socket.mapData.d;

                            terrainMap[y][z].push(letterFromHardness(socket.mapData.data[index]));

                            if (x == robotScanCoordX) {
                                frontBack[y].push(letterFromHardness(socket.mapData.data[index]));
                            }
                            if (y == robotScanCoordY) {
                                topDownLayers[0][topDownLayers[0].length - 1].push(letterFromHardness(socket.mapData.data[index]));
                            }
                            if (y == (robotScanCoordY - 1)) {
                                topDownLayers[1][topDownLayers[1].length - 1].push(letterFromHardness(socket.mapData.data[index]));
                            }
                            if (z == robotScanCoordZ) {
                                leftRight[y].push(letterFromHardness(socket.mapData.data[index]));
                            }

                        }
                    }
                }

                // merge the two top down layers
                let topDown = [];
                for (let rowIndex = 0; rowIndex < topDownLayers[0].length; rowIndex++) {
                    topDown.push([]);
                    for (let colIndex = 0; colIndex < topDownLayers[0].length; colIndex++) {
                        if (topDownLayers[0][rowIndex][colIndex] != letterFromHardness(0)) {
                            topDown[rowIndex].push(topDownLayers[0][rowIndex][colIndex]);
                        }
                        else {
                            // gray colored
                            topDown[rowIndex].push(`\x1b[1;30m${topDownLayers[1][rowIndex][colIndex]}\x1b[0m`);
                        }
                    }
                }

                console.log(`${robotResponse.robot}:`);
                if (mapDataObject.n == 512) {
                    console.log(` ${'Z'.padEnd((topDown.length + 1) * 2)}    ${'Y'.padEnd((topDown.length + 1) * 2)}    Y`);
                    for (let rowIndex = topDown.length - 1; rowIndex >= 0; rowIndex--) {
    
                        let firstRow = topDown[rowIndex].reduce((a, b)=>a+' '+b);
                        let secondRow = leftRight[rowIndex].reduce((a, b)=>a+' '+b);
                        let thirdRow = frontBack[rowIndex].reduce((a, b)=>a+' '+b);
    
                        let firstString = `${String(rowIndex - robotScanCoordZ).padStart(2)} ${firstRow}    `;
                        let secondString = `${String(rowIndex - robotScanCoordY).padStart(2)} ${secondRow}    `;
                        let thirdString = `${String(rowIndex - robotScanCoordY).padStart(2)} ${thirdRow}`;
                        console.log(`${firstString}${secondString}${thirdString}`);
                    }
                    let colString = '  ';
                    for (let colIndex = 0; colIndex < topDown.length; colIndex++) {
                        colString += `${String(colIndex - robotScanCoordX).padStart(2)}`;
                    }
                    console.log(`${colString} X  ${colString} X  ${colString} Z`)
                }
                else {
                    console.log(' Z');
                    for (let rowIndex = topDown.length - 1; rowIndex >= 0; rowIndex--) {
    
                        let firstRow = topDown[rowIndex].reduce((a, b)=>a+'  '+b);
    
                        let firstString = `${String(rowIndex - robotScanCoordZ).padStart(3)} ${firstRow}`;
                        console.log(`${firstString}`);
                    }
                    let colString = '  ';
                    for (let colIndex = 0; colIndex < topDown.length; colIndex++) {
                        colString += `${String(colIndex - robotScanCoordX).padStart(3)}`;
                    }
                    console.log(`${colString} X`)
                }
                socket.done = true;
            },
        }],
        errorStrings: {
            usage: 'scanLevel [times]',
            example: '1 1',
        },
    },
    viewInventory: {
        callbacks: [{
            name: 'inventory data',
            callback: handleInventoryData,
        }, {
            name: 'slot data',
            callback: handleSlotData,
        }, {
            name: 'command result',
            callback: printInventory,
        }],
    },
    equip: {
        callbacks: [{
            name: 'command result',
            callback: (robotResponse, socket)=>{
                let receivedString = 'nothing';
                if (robotResponse.data[1]) {
                    receivedString = `${robotResponse.data[1].label} (${robotResponse.data[1].size})`;
                }
                console.log(`${robotResponse.robot}: equip successful, received ${receivedString}`);
                socket.done = true;
            },
        }],
    },
    dig: {
        callbacks: [{
            name: 'command result',
            callback: printCommandResult,
        }, {
            name: 'dig success',
            callback: (robotResponse, socket)=>{
                if (!socket.blocksDug) {socket.blocksDug = 0;}
                socket.blocksDug += 1;
                console.log(`blocks dug: ${socket.blocksDug}`);
            },
        }],
        errorStrings: {
            usage: 'x1 y1 z1 x2 y2 z2 [relative] [selectionIndex] [scanLevel]',
            example: '2 2 2 0 2 0 false 0 0',
        },
    },
    place: {
        callbacks: [{
            name: 'command result',
            callback: printCommandResult,
        }],
        errorStrings: {
            usage: 'x1 y1 z1 x2 y2 z2 [relative] [selectionIndex] [scanLevel]',
            example: '2 3 2 0 3 0 false 0 0',
        },
    },
    move: {
        callbacks: [{
            name: 'robot position',
            callback: (robotResponse, socket)=>{
                socket.finalPosition = robotResponse.data;
            },
        }, {
            name: 'command result',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}: move ${robotResponse.data[1] ? 'success' : 'failure'}`);
                if (socket.finalPosition) {
                    console.log(`final position: (${socket.finalPosition.x}, ${socket.finalPosition.y}, ${socket.finalPosition.z})`);
                }
                socket.done = true;
            },
        }],
        errorStrings: {
            usage: 'x y z [relative] [scanLevel]',
            example: 'x y z false 0',
        },
    },
    interact: {
        callbacks: [{
            name: 'inventory data',
            callback: handleInventoryData,
        }, {
            name: 'slot data',
            callback: handleSlotData,
        }, {
            name: 'command result',
            callback: (robotResponse, socket)=>{
                if (socket.slots) {
                    printInventory(robotResponse, socket);
                }
                else {
                    console.log(`${robotResponse.robot}: ${robotResponse.data[1]}`);
                    socket.done = true;
                }
            },
        }],
        errorStrings: {
            usage: 'x y z [relative] [scanLevel]',
            example: '2 2 2 false 0',
        },
    },
    inspect: {
        callbacks: [{
            name: 'block data',
            callback: handleBlockData,
        }, {
            name: 'command result',
            callback: printCommandResult,
        }],
        errorStrings: {
            usage: 'x y z [relative] [scanLevel]',
            example: '2 2 2 false 0',
        },
    },
    select: {
        callbacks: [{
            name: 'command result',
            callback: printCommandResult,
        }],
        errorStrings: {
            usage: 'slotNum',
            example: '2',
        },
    },
    transfer: {
        callbacks: [{
            name: 'command result',
            callback: printCommandResult,
        }],
        errorStrings: {
            usage: 'fromSlot fromSide toSlot toSide amount',
            example: '2 -1 10 -1 7',
        },
    },
    craft: {
        callbacks: [{
            name: 'command result',
            callback: printCommandResult,
        }],
        errorStrings: {
            usage: 'itemName',
            example: '"Wooden Pickaxe"',
        },
    },
    raw: {
        callbacks: [{
            name: 'command result',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}: ${robotResponse.data[0]} ${robotResponse.data[1]}`);
                socket.done = true;
            },
        }, {
            name: 'message', // hacky but stops the cli from hanging at least
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot} failed to serialize the command result`);
                socket.done = true;
            },
        }],
        errorStrings: {
            usage: 'someLuaCode',
            example: '"cat /bin/sh.lua"',
        },
    },
    sendComponents: {
        callbacks: [{
            name: 'available components',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}:`);
                for (let componentAddress in robotResponse.data) {
                    let componentType = robotResponse.data[componentAddress];
                    console.log(`  ${componentType}`);
                }
                socket.done = true;
            },
        }],
    },
    config: {
        callbacks: [{
            name: 'config',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}:`);
                for (let optionName in robotResponse.data) {
                    let optionValue = robotResponse.data[optionName];
                    console.log(`  ${optionName}: ${optionValue}`);
                }
                socket.done = true;
            },
        }, {
            name: 'command result',
            callback: (robotResponse, socket)=>{
                if (!socket.done) { // this is only for setting config options
                    console.log(`${robotResponse.robot}: ${robotResponse.data[0]} ${robotResponse.data[1]}`);
                    socket.done = true;
                }
            },
        }],
        errorStrings: {
            usage: 'optionName [value]',
            example: '"raw" "true"',
        },
    },
    remember: {
        callbacks: [{
                name: 'block data',
                callback: handleBlockData,
            }, {
                name: 'inventory data',
                callback: handleInventoryData,
            }, {
                name: 'slot data',
                callback: handleSlotData,
            }, {
                name: 'command result',
                callback: printInventory,
        }],
        errorStrings: {
            usage: 'x y z [relative] [scanLevel]',
            example: '2 2 2 false 0',
        },
    },
    locate: {
        callbacks: [{
            name: 'command result',
            callback: (robotResponse, socket)=>{
                console.log(`${robotResponse.robot}:`);
                if (robotResponse.data[1]) {
                    console.log(`  located at ${robotResponse.data[1].x} ${robotResponse.data[1].y} ${robotResponse.data[1].z}`);
                }
                else {
                    console.log('  failed to locate');
                }
                socket.done = true;
            },
        }],
        errorStrings: {
            usage: 'name [amount]',
            example: '"Dirt" 1',
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
        let commandObject = {
            command: {
                name: commandName,
                parameters: commandParameters.map((parameter)=>{
                    let result = parameter;
                    let converted = parseInt(parameter);
                    if (!isNaN(converted)) {
                        result = converted;
                    }
                    else if (parameter.toLowerCase() ==  'true') {
                        result = true;
                    }
                    else if (parameter.toLowerCase() ==  'false') {
                        result = false;
                    }
                    return result;
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
                            socket.disconnect(true);
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