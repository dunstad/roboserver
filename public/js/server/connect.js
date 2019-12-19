testData = require('./robotTestData');
testClient = new (require('./TestClient'))(testData);
testClient.connect();