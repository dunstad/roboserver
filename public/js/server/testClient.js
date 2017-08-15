const net = require('net');
const InventoryData = require('../shared/InventoryData');
const InventoryData = require('../shared/MapData');

/**
 * Used to make sure the server is working properly. Attempts to replicate
 * most of the function of the actual robot lua code. 
 */
class testClient {

	/**
	 * Set the test client's initial state based on testing data.
	 * @param {object} testData 
	 */
	constructor(testData) {
		
		this.testData = testData;
		this.inventory = new InventoryData(this.testData.internalInventory.meta);
		for (let slot of this.testData.internalInventory.slots) {
			this.inventory.setSlot(slot);
		}
		this.equipped;
		this.map = new MapData();
		this.map.setFromGeolyzerScan(this.testData.geolyzerScan);
		this.position = this.testData.position;
		this.components = this.testData.components;
		
		this.power = 1;
		this.writeBufferLength = 20;
		this.delimiter = '\r\n';

		this.socket = new net.Socket();
		this.socket.on('close', function() {
			console.log('Connection closed');
		});

		this.commandMap = {

			scanArea: (scanLevel)=>{
				this.sendWithCost('map data', this.testData.geolyzerScan);
			},

			viewInventory: ()=>{
				this.sendWithCost('inventory data', this.serializeMeta());
				for (let slotNum in this.inventory.slots) {
					this.sendWithCost('slot data', this.serializeSlot(slotNum));
				}
			},

			equip: ()=>{
				let temporarySlot = this.equipped;
				this.equipped = this.inventory.slots[this.inventory.selected];
				this.inventory.slots[this.inventory.selected] = temporarySlot;
				this.sendWithCost('inventory data', this.serializeMeta());
				this.sendWithCost(
					'slot data',
					this.serializeSlot(this.inventory.selected)
				);
			},
			
			dig: (v1, v2, selectionIndex, scanLevel)=>{},
			
			place: (v1, v2, selectionIndex, scanLevel)=>{},
			
			move: (x, y, z, scanLevel)=>{},
			
			interact: (coord, scanLevel)=>{},
			
			inspect: (coord, scanLevel)=>{},
			
			select: (slotNum)=>{
				this.inventory.selected = slotNum;
			},

			transfer: (fromSlot, fromSide, toSlot, toSide, amount)=>{},
			
			craft: (itemName)=>{},
			
			raw: (commandString)=>{
				this.sendWithCost('command result', [true, 'received command: ' + commandString]);
			},
			
			sendPosition: ()=>{
				this.sendWithCost('robot position', this.position);
			},
			
			sendComponents: ()=>{
				this.sendWithCost('available components', this.components);
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

	/**
	 * Used to make sending the test client's inventory data to the
	 * server easier.
	 * @param {number} slotNum 
	 */
	serializeMeta() {
		let inventoryMeta = {
			size: this.inventory.size,
			side: -1,
			selected: this.inventory.selected,
		};
		return inventoryMeta;
	}
	/**
	 * Used to make sending the test client's slot data to the
	 * server easier.
	 * @param {number} slotNum 
	 */
	serializeSlot(slotNum) {
		let inventorySlot = {
			side: -1,
			slotNum: slotNum,
			contents: this.inventory.slots[slotNum],
		};
		return inventorySlot;
	}

	/**
	 * Used to send data to the server, such as power level or position.
	 * @param {string} key 
	 * @param {object} value 
	 */
	send(key, value) {

		const data = {
			[key]: value,
		};
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

	/**
	 * Used to simulate power consumption.
	 * Sends a message and also a power level update.
	 * @param {string} key 
	 * @param {object} value 
	 */
	sendWithCost(key, value) {
		this.send(key, value);
		this.decreasePower();
	}

	/**
	 * Used to identify the test client to the server and open the socket connection.
	 */
	connect() {
		this.socket.connect(this.testData.port, this.testData.host, ()=>{
			this.sendWithCost('id', {robot: this.testData.robotName, account: this.testData.accountName});
			this.send('message', 'hi');
			console.log('Connected');
		});
	}

	/**
	 * Used to make the test map data a little more like real geolyzer scans.
	 * @param {object} geolyzerScan 
	 */
	addNoise(geolyzerScan) {
		let mapData = this.testData.geolyzerScan.data;
		for (var key in mapData) {
			if (mapData[key] == 1) {
				mapData[key] = Math.random() * 6;
			}
		}
	}

	/**
	 * Used to tell the server the test client now has less power than it did before.
	 */
	decreasePower() {
		this.power -= .02 * Math.random();
		this.send('power level', this.power);
	}

}

module.exports = testClient;