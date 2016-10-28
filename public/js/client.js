var net = require('net');

// connect to local instance or production instance
var prod = false;
var port = 3001;
var host = '127.0.0.1';

var client = new net.Socket();
client.connect(port, host, function() {
	console.log('Connected');
});

client.on('data', (data)=>{
	console.log('Received: ' + data);
	// if the data is probably a command
	if (data.indexOf('command') != -1) {
		data = JSON.parse(data);
		console.log('responding to command: ' + data.command)
		client.write(JSON.stringify({
			'command result': 'response to command: ' + data.command
		}));
	}
});

client.on('close', function() {
	console.log('Connection closed');
});
