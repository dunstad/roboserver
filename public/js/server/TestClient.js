const net = require('net');
const InventoryData = require('../shared/InventoryData');
const MapData = require('../shared/MapData');
const keyToValidatorMap = require('../shared/fromRobotSchemas.js').keyToValidatorMap;

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
		for (let slot of this.testData.externalInventory.slots) {
			this.inventories[3].setSlot(slot);
		}

		this.equipped;
		this.map = new MapData();
		this.map.setFromMapData(this.testData.map);
		this.position = {
			x: this.testData.config.posX,
			y: this.testData.config.posY,
			z: this.testData.config.posZ,
		};
		this.config = this.testData.config;
		this.map.set(this.position.x, this.position.y, this.position.z, {"hardness": 2});		
		this.components = this.testData.components;
		
		this.power = 1;
		this.writeBufferLength = 20;
		this.delimiter = '\n';

		this.socket = new net.Socket();
		this.socket.on('close', function() {
			console.log('Connection closed');
		});
		this.socket.on('error', (error)=>{
			console.log(error.code);
			console.log('trying again...');
			setTimeout(this.connect.bind(this), 1000);
		});
		this.socket.on('connect', ()=>{
			this.sendWithCost('id', this.getID());
			this.send('message', 'hi');
			console.log('Connected');
		});

		this.commandMap = {

			scanArea: (scanLevel, times)=>{
				if (scanLevel == 1) {
					for (let i = -2; i <= 5; i++) {
						this.geolyzerScan(-3, -3, i, 8, 8, 1);
					}
				}
				else if (scanLevel == 2) {
					for (let i = -1; i <= 7; i++) {
						this.geolyzerPlane(i);
					}
				}
				this.sendWithCost('command result', ['map data', true]);
			},

			viewInventory: ()=>{

				let inventoryMeta = this.serializeMeta();
				this.send('inventory data', inventoryMeta);

				for (let slotNum in this.inventory.slots) {
					let slotData = this.inventory.serializeSlot(parseInt(slotNum));
					this.send('slot data', slotData);
				}

				this.sendWithCost('command result', ['inventory data', true]);

			},

			equip: ()=>{

				this.equip();

				let inventoryMeta = this.serializeMeta();
				this.send('inventory data', inventoryMeta);

				let slotData = this.inventory.serializeSlot(this.inventory.selected);
				this.send('slot data', slotData);

				this.sendWithCost('command result', ['equip', {label: 'test object', size: 4}]);

			},
			
			dig: (x1, y1, z1, x2, y2, z2, relative, scanLevel, selectionIndex,)=>{
				if (relative) {
					x1 += this.position.x;
					y1 += this.position.y;
					z1 += this.position.z;
					x2 += this.position.x;
					y2 += this.position.y;
					z2 += this.position.z;
				}
				let points = this.getBoxPoints(x1, y1, z1, x2, y2, z2);
				for (let point of points) {
					this.dig(point.x, point.y, point.z);
					this.send('dig success', point);
				}
				if (selectionIndex !== undefined) {
					this.send('delete selection', selectionIndex);
				}
				this.sendWithCost('command result', ['dig', true]);
			},
			
			place: (x1, y1, z1, x2, y2, z2, relative, scanLevel, selectionIndex,)=>{
				if (relative) {
					x1 += this.position.x;
					y1 += this.position.y;
					z1 += this.position.z;
					x2 += this.position.x;
					y2 += this.position.y;
					z2 += this.position.z;
				}
				let points = this.getBoxPoints(x1, y1, z1, x2, y2, z2);
				for (let point of points) {
					let blockData = this.place(point.x, point.y, point.z);
					this.send('block data', blockData);
				}
				if (selectionIndex !== undefined) {
					this.send('delete selection', selectionIndex);
				}
				this.sendWithCost('command result', ['place', true]);
			},
			
			move: (x, y, z, relative, scanLevel)=>{
				if (relative) {
					x += this.position.x;
					y += this.position.y;
					z += this.position.z;
				}
				let result = this.move(x, y, z);
				if (result) {
					this.commandMap.scanArea();
					this.commandMap.sendPosition();
					this.sendWithCost('command result', ['move', true]);
				}
				else {
					this.commandMap.sendPosition();
					this.sendWithCost('command result', ['move', false]);
				}
			},
			
			interact: (x, y, z, relative, scanLevel)=>{
				if (relative) {
					x += this.position.x;
					y += this.position.y;
					z += this.position.z;
				}
				let blockData = this.inspect(x, y, z);
				if (blockData.name == 'minecraft:chest') {
					this.send('inventory data', this.testData.externalInventory.meta);
					for (let slotNum in this.inventories[3].slots) {
						let slot = this.inventories[3].serializeSlot(parseInt(slotNum));
						this.send('slot data', slot);
					}
				}
				this.sendWithCost('command result', ['interact', true]);
			},
			
			inspect: (x, y, z, relative, scanLevel)=>{
				if (relative) {
					x += this.position.x;
					y += this.position.y;
					z += this.position.z;
				}
				let blockData = this.inspect(x, y, z);
				this.send('block data', blockData);
				this.sendWithCost('command result', ['inspect', true]);
			},
			
			select: (slotNum)=>{
				this.select(slotNum);
				this.sendWithCost('command result', ['select', true]);
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
					this.send('slot data', fromSlotData);
					
					let toSlotData = toInv.serializeSlot(toSlotIndex);
					this.send('slot data', toSlotData);
					
					this.sendWithCost('command result', ['transfer', true]);
				}
				else {
					this.sendWithCost('command result', ['transfer', false]);
				}
			
			},
			
			craft: (itemName)=>{
				this.sendWithCost('command result', ['craft', 'crafting not implemented']);
			},
			
			raw: (commandString)=>{
				let resultData = ['raw', 'received command: ' + commandString];
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

			config: (optionName, optionValue)=>{
				if (optionName && (optionValue !== undefined)) {
					this.config[optionName] = optionValue;
					this.sendWithCost('command result', ['config', true]);
				}
				else if (optionName) {
					let result = {};
					result[optionName] = this.config[optionName];
					this.sendWithCost('config', result);
				}
				else {
					this.sendWithCost('config', this.config);
				}
			},

			remember: (x, y, z, relative, scanLevel)=>{
				if (relative) {
					x += this.position.x;
					y += this.position.y;
					z += this.position.z;
				}

				// inspect
				let blockData = this.inspect(x, y, z);
				this.send('block data', blockData);

				// interact
				if (blockData.name == 'minecraft:chest') {
					this.send('inventory data', this.testData.externalInventory.meta);
					for (let slotNum in this.inventories[3].slots) {
						let slot = this.inventories[3].serializeSlot(parseInt(slotNum));
						this.send('slot data', slot);
					}
				}

				this.sendWithCost('command result', ['remember', true]);
			},

			locate: (name, amount)=>{

				this.sendWithCost('command result', ['locate', false]);

			},

		};

		this.socket.on('data', (rawMessages)=>{
			let messages = String(rawMessages).split(this.delimiter).filter(s=>s).map(JSON.parse);
			for (let commandInfo of messages) {
				if (commandInfo.name != 'message') {
					console.log('Received:', commandInfo.name, commandInfo.parameters);
					this.commandMap[commandInfo.name](...commandInfo.parameters);
				}
				else {
					console.log(commandInfo.parameters[0]);
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
		amount = parseInt(amount);
		let fromSlotSer = fromInv.serializeSlot(fromSlotIndex);		
		let toSlotSer = toInv.serializeSlot(toSlotIndex);
		
		let fromInvValid = fromInv.validateTransfer(fromSlotSer, toSlotSer, amount);
		let toInvValid = toInv.validateTransfer(fromSlotSer, toSlotSer, amount);

		let result = false;
		if (fromInvValid && toInvValid) {
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

		this.send('map data', newScan);
		return newScan;

	}

	/**
	 * Used to send map data as the geolyzer would, but in a plane shape.
	 * @param {number} y 
	 */
	geolyzerPlane(y) {
		for (let x = -32; x <= 32; x++) {
			this.geolyzerScan(x, -32, y, 1, 64, 1);
		}
		// max shape volume is 64, but we can scan from -32 to 32, inclusive
		// that's 65, so we have one row we miss in the previous loop to scan
		// still missing one cube after this final row, but oh well
		this.geolyzerScan(-32, 32, y, 64, 1, 1);
		return true;
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
		return keyToValidatorMap[key](value);
	}

	/**
	 * Used to send data to the server, such as power level or position.
	 * @param {string} key 
	 * @param {object} value 
	 */
	send(key, value) {

		if (!this.validate(key, value)) {
			throw Error(`command ${key} failed to validate with value ${JSON.stringify(value)}`);
		};

		const data = {
			[key]: value,
		};
		const serializedData = JSON.stringify(data) + this.delimiter;

		function writeError(error) {if (error) {console.dir(error);}}

		if (this.socket) {
			if (serializedData.length > this.writeBufferLength) {
				const chunkRegExp = new RegExp('[\\s\\S]{1,' + this.writeBufferLength + '}', 'g');
				const dataChunks = serializedData.match(chunkRegExp) || [];
				dataChunks.map((data)=>{this.socket.write(data, writeError);}, this.socket);
			}
			else {
				this.socket.write(serializedData, writeError);
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
		return {robot: this.testData.config.robotName, account: this.testData.config.accountName};
	}

	/**
	 * Used to identify the test client to the server and open the socket connection.
	 */
	connect() {
		this.socket.connect(this.testData.config.tcpPort, this.testData.config.serverIP);
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
