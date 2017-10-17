const net = require('net');
const InventoryData = require('../shared/InventoryData');
const MapData = require('../shared/MapData');
const validators = require('../shared/fromRobotSchemas.js');

/**
 * Used to make sure the server is working properly. Attempts to replicate
 * most of the function of the actual robot lua code. 
 */
class TestClient {

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
			[3]: new InventoryData(this.testData.externalInventory.meta),
		};
		for (let slot of this.testData.internalInventory.slots) {
			this.inventories[3].setSlot(slot);
		}

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
				let scan = this.geolyzerScan(-3, -3, -2, 8, 8, 8);
				this.sendWithCost('map data', scan);
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

				this.equip();

				let inventoryMeta = this.serializeMeta();
				this.sendWithCost('inventory data', inventoryMeta);

				let slotData = this.inventory.serializeSlot(this.inventory.selected);
				this.sendWithCost('slot data', slotData);

			},
			
			dig: (x1, y1, z1, x2, y2, z2, selectionIndex, scanLevel)=>{
				let points = this.getBoxPoints(x1, y1, z1, x2, y2, z2);
				for (let point of points) {
					this.dig(point.x, point.y, point.z);
					this.sendWithCost('dig success', point);
				}
				this.sendWithCost('delete selection', selectionIndex);
			},
			
			place: (x1, y1, z1, x2, y2, z2, selectionIndex, scanLevel)=>{
				let points = this.getBoxPoints(x1, y1, z1, x2, y2, z2);
				for (let point of points) {
					let blockData = this.place(point.x, point.y, point.z);
					this.sendWithCost('block data', blockData);
				}
				this.sendWithCost('delete selection', selectionIndex);
			},
			
			move: (x, y, z, scanLevel)=>{
				let result = this.move(x, y, z);
				if (result) {
					this.commandMap.sendPosition();
					this.commandMap.scanArea();
				}
				else {
					this.sendWithCost('command result', [false, "position already occupied"]);
				}
			},
			
			interact: (x, y, z, scanLevel)=>{},
			
			inspect: (x, y, z, scanLevel)=>{
				let blockData = this.inspect(x, y, z);
				this.sendWithCost('block data', blockData);
				if (blockData.name == 'minecraft:chest') {
					this.sendWithCost('inventory data', this.testData.externalInventory.meta);
					for (let slot of this.testData.externalInventory.slots) {
						this.sendWithCost('slot data', slot);
					}
				}
			},
			
			select: (slotNum)=>{
				this.select(slotNum);
			},

			transfer: (fromSlotIndex, fromSide, toSlotIndex, toSide, amount)=>{

				amount = parseInt(amount);
				
				let fromInv = this.inventories[fromSide];
				let toInv = this.inventories[toSide];

				let fromSlotSer = fromInv.serializeSlot(fromSlotIndex);		
				let toSlotSer = toInv.serializeSlot(toSlotIndex);

				let fromInvValid = fromInv.validateTransfer(fromSlotSer, toSlotSer, amount);
				
				let result = this.moveItems(fromInv, fromSlotIndex, toInv, toSlotIndex, fromInvValid);
				
				if (result) {
					let fromSlotData = fromInv.serializeSlot(fromSlotIndex);
					this.sendWithCost('slot data', fromSlotData);
					
					let toSlotData = toInv.serializeSlot(toSlotIndex);
					this.sendWithCost('slot data', toSlotData);
				}
				else {
					this.sendWithCost('command result', [false, "transfer failed"]);
				}
			
			},
			
			craft: (itemName)=>{},
			
			raw: (commandString)=>{
				let resultData = [true, 'received command: ' + commandString];
				this.sendWithCost('command result', resultData);
			},
			
			sendPosition: ()=>{
				let position = this.getPosition();
				this.sendWithCost('robot position', position);
			},
			
			sendComponents: ()=>{
				let components = this.getComponents();
				this.sendWithCost('available components', components);
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
	 * 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} z 
	 * @return {object}
	 */
	inspect(x, y, z) {
		let blockData = this.map.get(x, y, z) || {name: 'minecraft:air', hardness: 0};
		blockData.point = {x: x, y: y, z: z};
		return blockData;
	}

	/**
	 * Used when the place command is received to alter
	 * the map in a way that obeys Minecraft's rules.
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} z 
	 * @return {object | false}
	 */
	place(x, y, z) {
		let result = false;
		if (!this.map.get(x, y, z)) {
			let blockData = {name: 'minecraft:dirt', hardness: .5}
			this.map.set(x, y, z, blockData);
			blockData.point = {x: x, y: y, z: z};
			result = blockData;
		}
		return result;
	}

	/**
	 * Used by unit tests as well as the command map
	 */
	getPosition() {
		return this.position;
	}

	/**
	 * Used by unit tests as well as the command map
	 */
	getComponents() {
		return this.components;
	}

	/**
	 * Used when receiving the select command to alter the map state
	 * in a way that obeys Minecraft's rules.
	 * @param {number} slotNum 
	 */
	select(slotNum) {
		this.inventory.selected = slotNum;
	}

	/**
	 * Used when receiving the move command to alter the map state
	 * in a way that obeys Minecraft's rules.
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} z 
	 * @return {boolean}
	 */
	move(x, y, z) {
		let result = true;
		if (!this.map.get(x, y, z)) {
			this.map.set(this.position.x, this.position.y, this.position.z);
			this.map.set(x, y, z, {hardness: 2});
			this.position = {x: x, y: y, z: z};
		}
		else {
			result = false;
		}
		return result;
	}

	/**
	 * Used when the dig command is received to alter the map
	 * in a way that obeys Minecraft's rules.
	 * @param {number} x 
	 * @param {number} y
	 * @param {number} z
	 */
	dig(x, y, z) {
		this.map.set(x, y, z);
	}

	/**
	 * Used when the equip command is received. Changes the inventory to equip the item.
	 */
	equip() {
		let temporarySlot = this.equipped;
		this.equipped = this.inventory.slots[this.inventory.selected];
		this.inventory.slots[this.inventory.selected] = temporarySlot;
	}

	/**
	 * Used to get all the points we perform area
	 * actions like dig and place on.
	 * @param {number} x1 
	 * @param {number} y1 
	 * @param {number} z1 
	 * @param {number} x2
	 * @param {number} y2
	 * @param {number} z2
	 * @return {object[]}
	 */
	getBoxPoints(x1, y1, z1, x2, y2, z2) {
		let v1 ={x: x1, y: y1, z: z1};
		let v2 ={x: x2, y: y2, z: z2};
		let minPoint = {
			x: Math.min(v1.x, v2.x),
			y: Math.min(v1.y, v2.y),
			z: Math.min(v1.z, v2.z),
		};
		let maxPoint = {
			x: Math.max(v1.x, v2.x),
			y: Math.max(v1.y, v2.y),
			z: Math.max(v1.z, v2.z),
		};
		let points = [];
		for (let x = minPoint.x; x <= maxPoint.x; x++) {
			for (let y = minPoint.y; y <= maxPoint.y; y++) {
				for (let z = minPoint.z; z <= maxPoint.z; z++) {
					points.push({x:x,y:y,z:z});
				}
			}
		}
		return points;
	}

	/**
	 * Change the contents of the two inventories in a way that
	 * obeys how Minecraft inventories are supposed to work.
	 * @param {object} fromInv
	 * @param {number} fromSlotIndex 
	 * @param {object} toInv
	 * @param {number} toSlotIndex 
	 * @param {number} amount 
	 * @return {boolean}
	 */
	moveItems(fromInv, fromSlotIndex, toInv, toSlotIndex, amount) {
		let fromSlotSer = fromInv.serializeSlot(fromSlotIndex);		
		let toSlotSer = toInv.serializeSlot(toSlotIndex);
		
		let fromInvValid = fromInv.validateTransfer(fromSlotSer, toSlotSer, amount);
		let toInvValid = toInv.validateTransfer(fromSlotSer, toSlotSer, amount);

		let result = false;
		if (fromInvValid && toInvValid && fromInvValid == toInvValid) {
			result = true;
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
				toInv.slots[toSlotIndex] = Object.assign({}, fromInv.slots[fromSlotIndex]); 
				fromInv.slots[fromSlotIndex].size -= amount;
				toInv.slots[toSlotIndex].size = amount;
				if (fromInv.slots[fromSlotIndex].size == 0) {
					fromInv.slots[fromSlotIndex] = undefined;
				}
			}
		}
		return result;
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

		return newScan;

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
			'dig success': validators.digSuccess,
			'delete selection': validators.deleteSelection,
			'block data': validators.blockData,
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

		if (this.socket) {
			if (serializedData.length > this.writeBufferLength) {
				const chunkRegExp = new RegExp('[\\s\\S]{1,' + this.writeBufferLength + '}', 'g');
				const dataChunks = serializedData.match(chunkRegExp) || [];
				dataChunks.map(this.socket.write, this.socket);
			}
			else {
				this.socket.write(serializedData);
			}
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
		this.sendDecreasedPower();
	}

	/**
	 * Used when initially connecting to the server. Separated out
	 * so it can be checked in the unit tests.
	 */
	getID() {
		return {robot: this.testData.robotName, account: this.testData.accountName};
	}

	/**
	 * Used to identify the test client to the server and open the socket connection.
	 */
	connect() {
		this.socket.connect(this.testData.port, this.testData.host, ()=>{
			this.sendWithCost('id', this.getID());
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
	 * 
	 */
	decreasePower() {
		this.power -= .02 * Math.random();
		// magical power reset
		if (this.power < 0) {this.power = 1}
		return this.power;
	}

	/**
	 * Used to tell the server the test client now has less power than it did before.
	 */
	sendDecreasedPower() {
		this.send('power level', this.decreasePower());
	}

}

module.exports = TestClient;
