testData = require('./testData');
testClient = new (require('./TestClient'))(testData);
validators = require('../shared/fromRobotSchemas.js');
testClient.connect();