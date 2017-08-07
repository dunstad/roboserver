const net = require('net');

// client.on('data', (rawMessages)=>{
// 	console.log('Received: ' + rawMessages);
// 	messages = String(rawMessages).split('\r\n').filter(s=>s).map(JSON.parse);
// 	for (var data of messages) {
// 		if (data.command) {
			
// 			if (data.command == 'for i=-2,5 do sendScan.volume(-3, -3, i, 8, 8, 1); end return true;') {
// 				console.log('sending map!');
// 				sendWithCost('map data', testData.scan);
// 			}
// 			else if (data.command == 'return int.sendInventoryData(-1);') {
// 				console.log('sending inventory!');
// 				sendWithCost('inventory data', testData.internalInventory.meta);
// 				for (slot of testData.internalInventory.slots) {sendWithCost('slot data', slot);}
// 				sendWithCost('inventory data', testData.externalInventory.meta);
// 				for (slot of testData.externalInventory.slots) {sendWithCost('slot data', slot);}
// 			}
// 			else if (data.command == 'return pos.sendLocation();') {
// 				console.log('sending location')
// 				sendWithCost('robot position', pos);
// 			}
// 			else if (data.command == "local conf = require('config'); require('tcp').write({['available components']=conf.get(conf.path).components});") {
// 				var components = process.argv[7] ? {raw:true} : {};
// 				sendWithCost('available components', components);
// 			}
// 			else {
// 				console.log('responding to command: ' + data.command);
// 				sendWithCost('command result', [true, 'received command: ' + data.command]);
// 			}

// 		}
// 		else if (data.message) {
// 			console.log(data.message);
// 		}
// 	}
// });

class testClient {

	constructor(testData) {
		
		this.testData = testData;
		
		this.power = 1;
		this.writeBufferLength = 20;
		this.delimiter = '\r\n';

		this.socket = new net.Socket();
		this.socket.on('close', function() {
			console.log('Connection closed');
		});

		this.commandMap = {

			scanArea: (scanLevel)=>{
				sendWithCost('map data', this.testData.scan);
			},

			viewInventory: ()=>{
				sendWithCost('inventory data', this.testData.internalInventory.meta);
				sendWithCost('slot data', this.testData.internalInventory.slots);
			},

			equip: ()=>{},
			
			dig: (v1, v2, selectionIndex, scanLevel)=>{},
			
			place: (v1, v2, selectionIndex, scanLevel)=>{},
			
			move: (x, y, z, scanLevel)=>{},
			
			interact: (coord, scanLevel)=>{},
			
			inspect: (coord, scanLevel)=>{},
			
			select: (slotNum)=>{},

			transfer: (fromSlot, fromSide, toSlot, toSide, amount)=>{},
			
			craft: (itemName)=>{},
			
			raw: (commandString)=>{
				sendWithCost('command result', [true, 'received command: ' + commandString]);
			},
			
			sendPosition: ()=>{
				sendWithCost('robot position', this.testData.position);
			},
			
			sendComponents: ()=>{
				sendWithCost('available components', this.testData.components);
			},

		};
		this.socket.on('data', (rawMessages)=>{
			let messages = String(rawMessages).split('\r\n').filter(s=>s).map(JSON.parse);
			for (let data of messages) {
				if (data.command) {
					console.log('Received:', data.command.name, data.command.parameters);
					this.commandMap[data.command.name](...data.command.parameters);
				}
				else if (data.message) {
					console.log(data.message);
				}
			}
		});

	}

	send(key, value) {

		let data = {};
		data[key] = value;
		const serializedData = JSON.stringify(data) + this.delimiter;

		if (serializedData.length > this.writeBufferLength) {
			const chunkRegExp = new RegExp('[\\s\\S]{1,' + this.writeBufferLength + '}', 'g');
			const dataChunks = serializedData.match(chunkRegExp) || [];
			dataChunks.map(this.socket.write, this.socket);
		}
		else {
			this.socket.write(serializedData);
		}

	}

	sendWithCost(key, value) {
		this.send(key, value);
		this.decreasePower();
	}

	connect() {
		this.socket.connect(this.testData.port, this.testData.host, ()=>{
			this.sendWithCost('id', {robot: this.testData.robotName, account: this.testData.accountName});
			this.send('message', 'hi');
			console.log('Connected');
		});
	}

	addNoise(scan) {
		let mapData = this.testData.scan.data;
		for (var key in mapData) {
			if (mapData[key] == 1) {
				mapData[key] = Math.random() * 6;
			}
		}
	}

	decreasePower() {
		this.power -= .02 * Math.random();
		this.send('power level', this.power);
	}

}

module.exports = testClient;