var net = require('net');

// connect to local instance or production instance
var port = 3001;
var host = '127.0.0.1';

var testInventory1 = {
	'size': 64,
	'side': -1,
	'selected': 1
};

var testInventory1Slots = [
	{
		side: -1,
		slotNum: 1,
		contents: {
			'damage': 0,
			'hasTag': false,
			'label': "Dirt",
			'maxDamage': 0,
			'maxSize': 64,
			'name': "minecraft:dirt",
			'size': 64
		}
	},
	{
		side: -1,
		slotNum: 2,
		contents: {
			'damage': 0,
			'hasTag': false,
			'label': "Dirt",
			'maxDamage': 0,
			'maxSize': 64,
			'name': "minecraft:dirt",
			'size': 37
		}
	},
	{
		side: -1,
		slotNum: 5,
		contents: {
			'damage': 0,
			'hasTag': false,
			'label': "Stone",
			'maxDamage': 0,
			'maxSize': 64,
			'name': "minecraft:stone",
			'size': 3
		}
	},
	{
		side: -1,
		slotNum: 7,
		contents: {
			'damage': 0,
			'hasTag': false,
			'label': "Wooden Sword?",
			'maxDamage': 100,
			'maxSize': 1,
			'name': "minecraft:wooden_sword?",
			'size': 1
		}
	}
];

var testInventory2 = {
	'size': 27,
	'side': 3
};

var testInventory2Slots = [
	{
		side: 3,
		slotNum: 1,
		contents: {
			'damage': 0,
			'hasTag': false,
			'label': "Dirt",
			'maxDamage': 0,
			'maxSize': 64,
			'name': "minecraft:dirt",
			'size': 4
		}
	},
	{
		side: 3,
		slotNum: 2,
		contents: {
			'damage': 0,
			'hasTag': false,
			'label': "Dirt",
			'maxDamage': 0,
			'maxSize': 64,
			'name': "minecraft:dirt",
			'size': 7
		}
	},
	{
		side: 3,
		slotNum: 5,
		contents: {
			'damage': 0,
			'hasTag': false,
			'label': "Stone",
			'maxDamage': 0,
			'maxSize': 64,
			'name': "minecraft:stone",
			'size': 25
		}
	}
];

var testScan = {
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
};

// let's add some noise to testScan
var mapData = testScan.data;
for (var key in mapData) {
	if (mapData[key] == 1) {
		mapData[key] = Math.random() * 6;
	}
}

var client = new net.Socket();
var power = 1;

function send(key, value) {
	
	const writeBufferLength = Infinity;

	var data = {};
	data[key] = value;
	serializedData = JSON.stringify(data) + '\r\n';

	if (serializedData.length > writeBufferLength) {
		
	}

	client.write(serializedData);

}

function decreasePower() {
	power -= .02 * Math.random();
	send('power level', power);
}

function sendWithCost(key, value) {
	send(key, value);
	decreasePower();
}


client.connect(port, host, function() {

	sendWithCost('id', {robot: process.argv[2], account: process.argv[3]});
	send('message', 'hi');
	console.log('Connected');

});

var pos = {
	x: parseInt(process.argv[4]) || 4,
	y: parseInt(process.argv[5]) || 4,
	z: parseInt(process.argv[6]) || 4
}

client.on('data', (rawMessages)=>{
	console.log('Received: ' + rawMessages);
	messages = String(rawMessages).split('\r\n').filter(s=>s).map(JSON.parse);
	for (var data of messages) {
		if (data.command) {
			
			if (data.command == 'for i=-2,5 do sendScan.volume(-3, -3, i, 8, 8, 1); end return true;') {
				console.log('sending map!');
				sendWithCost('map data', testScan);
			}
			else if (data.command == 'return int.sendInventoryData(-1);') {
				console.log('sending inventory!');
				sendWithCost('inventory data', testInventory1);
				for (slot of testInventory1Slots) {sendWithCost('slot data', slot);}
				sendWithCost('inventory data', testInventory2);
				for (slot of testInventory2Slots) {sendWithCost('slot data', slot);}
			}
			else if (data.command == 'return pos.sendLocation();') {
				console.log('sending location')
				sendWithCost('robot position', pos);
			}
			else if (data.command == "local conf = require('config'); require('tcp').write({['available components']=conf.get(conf.path).components});") {
				var components = process.argv[7] ? {raw:true} : {};
				sendWithCost('available components', components);
			}
			else {
				console.log('responding to command: ' + data.command);
				sendWithCost('command result', [true, 'received command: ' + data.command]);
			}

		}
		else if (data.message) {
			console.log(data.message);
		}
	}
});

client.on('close', function() {
	console.log('Connection closed');
});

var offset = 1;
setInterval(()=>{
	pos.y += offset;
	sendWithCost('robot position', pos);
	offset *= -1;
}, 1000 * 5);