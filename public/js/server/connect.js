testData = require('./testData');
testClient = new (require('./testClient'))(testData);
validators = require('../shared/fromRobotSchemas.js');
testClient.connect();

inv = testClient.inventory;

console.log(inv.validateTransfer(inv.serializeSlot(2), inv.serializeSlot(3)));