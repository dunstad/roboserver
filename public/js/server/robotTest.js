let testData = require('./testData');
let testClient = new (require('./testClient'))(testData);
let validators = require('../shared/fromRobotSchemas.js');

testClient.commandMap.scanArea(1);
testClient.commandMap.viewInventory();
testClient.commandMap.equip();
testClient.commandMap.dig(0, 0, 0, 1, 1, 1, 0, 0);
testClient.commandMap.place(0, 0, 0, 1, 1, 1, 0, 0);
testClient.commandMap(2, 2, 2, 1);
