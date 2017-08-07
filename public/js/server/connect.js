let testData = require('./testData');
testClient = new (require('./testClient'))(testData);
testClient.connect();