var net = require('net');

// connect to local instance or production instance
var port = 3001;
var host = '127.0.0.1';

var testInventory1 = {
	'inventory data': {
		'size': 16,
		'side': -1,
		'selected': 1,
		'contents': {
			1: {
				'damage': 0,
				'hasTag': false,
				'label': "Dirt",
				'maxDamage': 0,
				'maxSize': 64,
				'name': "minecraft:dirt",
				'size': 64
			},
			2: {
				'damage': 0,
				'hasTag': false,
				'label': "Dirt",
				'maxDamage': 0,
				'maxSize': 64,
				'name': "minecraft:dirt",
				'size': 37
			},
			5: {
				'damage': 0,
				'hasTag': false,
				'label': "Stone",
				'maxDamage': 0,
				'maxSize': 64,
				'name': "minecraft:stone",
				'size': 3
			}
		}
	}
};

var testInventory2 = {
	'inventory data': {
		'size': 27,
		'side': 3,
		'contents': {
			1: {
				'damage': 0,
				'hasTag': false,
				'label': "Dirt",
				'maxDamage': 0,
				'maxSize': 64,
				'name': "minecraft:dirt",
				'size': 4
			},
			2: {
				'damage': 0,
				'hasTag': false,
				'label': "Dirt",
				'maxDamage': 0,
				'maxSize': 64,
				'name': "minecraft:dirt",
				'size': 7
			},
			5: {
				'damage': 0,
				'hasTag': false,
				'label': "Stone",
				'maxDamage': 0,
				'maxSize': 64,
				'name': "minecraft:stone",
				'size': 25
			}
		}
	}
};

var testScan = {
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
};

// let's add some noise to testScan
var mapData = testScan['map data'].data;
for (var key in mapData) {
	if (mapData[key] == 1) {
		mapData[key] = Math.random() * 6;
	}
}

var client = new net.Socket();
client.connect(port, host, function() {

	// send identifying information
	client.write(JSON.stringify({
		id: {robot: 'rob', account: 'admin'}
	}) + '\r\n');

	client.write(JSON.stringify({
		message: 'hi'
	}) + '\r\n');

	console.log('Connected');

});

client.on('data', (data)=>{
	console.log('Received: ' + data);
	data = JSON.parse(data);
	if (data.command) {
		// hard coded test map
		if (data.command == 'for i=-2,5 do sendScan.volume(-3, -3, i, 8, 8, 1) end return true;') {
			console.log('sending map!')
			client.write(JSON.stringify(testScan) + '\r\n');
		}
		else if (data.command == 'return int.sendInventoryData(-1);') {
			console.log('sending inventory!')
			client.write(JSON.stringify(testInventory1) + '\r\n');
		}
		else if (data.command == 'inventory2') {
			console.log('sending inventory!')
			client.write(JSON.stringify(testInventory2) + '\r\n');
		}
		else {
			console.log('responding to command: ' + data.command)
			client.write(JSON.stringify({
				'command result': [true, 'received command: ' + data.command]
			}) + '\r\n');
		}
	}
});

client.on('close', function() {
	console.log('Connection closed');
});
