testData = require('./testData');
testClient = new (require('./testClient'))(testData);
validators = require('./fromRobotSchemas.js');
testClient.connect();