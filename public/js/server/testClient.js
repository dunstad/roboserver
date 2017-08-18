const net = require('net');
const InventoryData = require('../shared/InventoryData');
const MapData = require('../shared/MapData');
const validators = require('../shared/fromRobotSchemas.js');

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
		this.inventories = {
			[-1]: this.inventory,
		};
		this.equipped;
		this.map = new MapData();
		this.map.setFromMapData(this.testData.map);
		this.position = this.testData.position;
		this.map.set(this.position.x, this.position.y, this.position.z, {"hardness": 2});		
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
				this.geolyzerScan(-3, -3, -2, 8, 8, 8);
			},

			viewInventory: ()=>{

				let inventoryMeta = this.serializeMeta();
				this.sendWithCost('inventory data', inventoryMeta);

				for (let slotNum in this.inventory.slots) {
					let slotData = this.inventory.serializeSlot(slotNum);
					this.sendWithCost('slot data', slotData);
				}

			},

			equip: ()=>{

				let temporarySlot = this.equipped;
				this.equipped = this.inventory.slots[this.inventory.selected];
				this.inventory.slots[this.inventory.selected] = temporarySlot;

				let inventoryMeta = this.serializeMeta();
				this.sendWithCost('inventory data', inventoryMeta);

				let slotData = this.inventory.serializeSlot(this.inventory.selected);
				this.sendWithCost('slot data', slotData);

			},
			
			dig: (v1, v2, selectionIndex, scanLevel)=>{},
			
			place: (v1, v2, selectionIndex, scanLevel)=>{},
			
			move: (x, y, z, scanLevel)=>{
				let result = true;
				if (!this.map.get(x, y, z)) {
					this.map.set(this.position.x, this.position.y, this.position.z);
					this.map.set(x, y, z, {"hardness": 2});
					this.position = {x:x,y:y,z:z};
					this.commandMap.sendPosition();
					this.commandMap.scanArea();
				}
				else {
					this.sendWithCost('command result', [false, "position already occupied"]);
					result = false;
				}
				return result;
			},
			
			interact: (coord, scanLevel)=>{},
			
			inspect: (coord, scanLevel)=>{},
			
			select: (slotNum)=>{
				this.inventory.selected = slotNum;
			},

			transfer: (fromSlotIndex, fromSide, toSlotIndex, toSide, amount)=>{
				
				let fromInv = this.inventories[fromSide];
				let fromSlotSer = fromInv.serializeSlot(fromSlotIndex);
				
				let toInv = this.inventories[toSide];
				let toSlotSer = toInv.serializeSlot(toSlotIndex);
				
				let fromInvValid = fromInv.validateTransfer(fromSlotSer, toSlotSer, amount);
				let toInvValid = toInv.validateTransfer(fromSlotSer, toSlotSer, amount);

				if (fromInvValid && toInvValid && fromInvValid == toInvValid) {
					this.moveItems(fromInv, fromSlotIndex, toInv, toSlotIndex, fromInvValid);
				}
				
			},
			
			craft: (itemName)=>{},
			
			raw: (commandString)=>{
				let resultData = [true, 'received command: ' + commandString];
				this.sendWithCost('command result', resultData);
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
	 * Used after a transfer is validated to actually change
	 * the contents of the two inventories in a way that
	 * obeys how Minecraft inventories are supposed to work.
	 * If this is used without first testing the validity of
	 * the transfer, you might break your inventory.
	 * @param {object} fromInv
	 * @param {number} fromSlotIndex 
	 * @param {object} toInv
	 * @param {number} toSlotIndex 
	 * @param {number} amount 
	 */
	moveItems(fromInv, fromSlotIndex, toInv, toSlotIndex, amount) {
		let fromItemStack = fromInv.slots[fromSlotIndex];
		let toItemStack = toInv.slots[toSlotIndex];
		if (toItemStack) {
			if (fromInv.canStack(fromItemStack, toItemStack)) {
				fromInv.slots[fromSlotIndex].size -= amount;
				toInv.slots[toSlotIndex].size += amount;
				if (!fromInv.slots[fromSlotIndex].size) {
					fromInv.slots[fromSlotIndex] = undefined;
				}
			}
			else {
				let temporaryItemStack = toItemStack;
				toInv.slots[toSlotIndex] = fromItemStack;
				fromInv.slots[fromSlotIndex] = temporaryItemStack;
			}
		}
		else {
			toInv.slots[toSlotIndex] = fromItemStack;
			fromInv.slots[fromSlotIndex] = undefined;
		}
	}

	/**
	 * Used to send map data as the geolyzer would.
	 * @param {number} x 
	 * @param {number} z 
	 * @param {number} y 
	 * @param {number} w 
	 * @param {number} d 
	 * @param {number} h 
	 */
	geolyzerScan(xOffset, zOffset, yOffset, w, d, h) {

		let newScan = {
			x: xOffset + this.position.x,
			y: yOffset + this.position.y,
			z: zOffset + this.position.z,
			w: w,
			d: d,
			data: {
				n: w * d * h,
			},
		};

		for (let x = 0; x < w; x++) {
			for (let z = 0; z < d; z++) {
				for (let y = 0; y < (newScan.data.n / (w * d)); y++) {

					let xWithOffset = x + newScan.x;
					let yWithOffset = y + newScan.y;
					let zWithOffset = z + newScan.z;
	
					// this is how the geolyzer reports 3d data in a 1d array
					// also lua is indexed from 1
					let index = (x + 1) + z*w + y*w*d;
					
					let blockData = this.map.get(xWithOffset, yWithOffset, zWithOffset);
					newScan.data[index] = blockData && blockData.hardness ? blockData.hardness : 0;
	
				}
			}
		}

		this.sendWithCost('map data', newScan);

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
	 * Used to make sure we're sending messages the server can understand.
	 * @param {string} key 
	 * @param {any} value 
	 */
	validate(key, value) {
		let keyToValidatorMap = {
			'inventory data': validators.inventoryMeta,
			'slot data': validators.inventorySlot,
			'command result': validators.commandResult,
			'robot position': validators.position,
			'available components': validators.components,
			'map data': validators.geolyzerScan,
			'id': validators.id,
			'message': validators.message,
			'power level': validators.powerLevel,
		};
		keyToValidatorMap[key](value);
	}

	/**
	 * Used to send data to the server, such as power level or position.
	 * @param {string} key 
	 * @param {object} value 
	 */
	send(key, value) {

		this.validate(key, value);

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
		// magical power reset
		if (this.power < 0) {this.power = 1}
		this.send('power level', this.power);
	}

}

module.exports = testClient;