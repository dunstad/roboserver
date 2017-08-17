testData = require('./testData');
testClient = new (require('./testClient'))(testData);
validators = require('../shared/fromRobotSchemas.js');
testClient.connect();