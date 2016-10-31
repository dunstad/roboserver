var net = require('net');

// connect to local instance or production instance
var prod = false;
var port = 3001;
var host = '127.0.0.1';

var client = new net.Socket();
client.connect(port, host, function() {
	client.write(JSON.stringify({
		'message': 'hi'
	}));
	console.log('Connected');
});

client.on('data', (data)=>{
	console.log('Received: ' + data);
	data = JSON.parse(data);
	// if the data is probably a command
	if (data.command) {
		// hard coded test map
		if (data.command == 'map') {
			console.log('sending map!')
			client.write(JSON.stringify({
				'map data': {
					x: 0,
					z: 0,
					y: 0,
					w: 3,
					d: 3,
					data: {
						1: 1,
						2: 1,
						3: 1,
						4: 1,
						5: 1,
						6: 1,
						7: 1,
						8: 1,
						9: 1,
						10: 1,
						11: 1,
						12: 1,
						13: 1,
						14: 0,
						15: 1,
						16: 1,
						17: 1,
						18: 1,
						19: 1,
						20: 1,
						21: 1,
						22: 1,
						23: 0,
						24: 1,
						25: 1,
						26: 1,
						27: 1,
						n: 27
					}
				}
			}
		));
		}
		else {
			console.log('responding to command: ' + data.command)
			client.write(JSON.stringify({
				'command result': 'response to command: ' + data.command
			}));
		}
	}
});

client.on('close', function() {
	console.log('Connection closed');
});
