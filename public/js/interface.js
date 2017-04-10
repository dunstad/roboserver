main();

function main() {

  // socket connection to http server
  socket = io();
  socket.on('message', console.dir);
  socket.send('ping');

  // display command results received from robot
  socket.on('command result', (data)=>{
    console.dir(data);
    addMessage(data, false);
  });

  // render map data received from robot
  socket.on('map data', (data)=>{
    console.dir(data);
    addShapeVoxels(data);
  });

  // render block data received from robot
  socket.on('block data', (data)=>{
    console.dir(data);
    if (!(data.name == "minecraft:air")) {
      addVoxel(
        data.point.x * voxelSideLength, 
        data.point.y * voxelSideLength, 
        data.point.z * voxelSideLength,
        colorFromHardness(data.hardness)
      );
    }
    else {
      removeVoxel(
        data.point.x,
        data.point.y,
        data.point.z,
        voxelMap.get(data.point.x, data.point.y, data.point.z)
      );
    }
  });

  // render map data received from robot
  socket.on('robot position', (pos)=>{
    console.dir(pos);
    moveRobotVoxel(pos);
    removeAllExternalInventories();
  });

  // remove selection because its task has been completed
  socket.on('delete selection', (index)=>{
    console.dir(index);
    deleteSelection(selections, index);
  });

  // remove voxels corresponding to successfully dug blocks
  socket.on('dig success', (pos)=>{
    console.dir(pos);
    var voxel = voxelMap.get(pos.x, pos.y, pos.z);
    removeVoxel(pos.x, pos.y, pos.z, voxel);
  });

  // render inventory data received from robot
  socket.on('inventory data', (data)=>{
    console.dir(data);
    renderInventory(data);
  });

  // add listening robots to select
  socket.on('listen start', (data)=>{
    console.dir(data);
    var robotSelect = document.getElementById('robotSelect');
    var option = document.createElement('option');
    option.text = data.robot;
    option.value = data.robot;
    robotSelect.add(option);
  });
  
  // remove from select robots that stop listening
  socket.on('listen end', (data)=>{
    console.dir(data);
    var robotSelect = document.getElementById('robotSelect');
    var option = robotSelect.querySelector('[value=' + data.robot + ']');
    robotSelect.removeChild(option);
  });

  selectStart.addEventListener('input', ()=>{removeSelectBox(); requestRender()});
  selectEnd.addEventListener('input', ()=>{removeSelectBox(); requestRender()});

  var moveToolLabel = document.getElementById('moveTool').parentElement;
  moveToolLabel.addEventListener('click', clearSelection);

  var interactToolLabel = document.getElementById('interactTool').parentElement;
  interactToolLabel.addEventListener('click', clearSelection);
  
  var inspectToolLabel = document.getElementById('inspectTool').parentElement;
  inspectToolLabel.addEventListener('click', clearSelection);

  var digToolLabel = document.getElementById('digTool').parentElement;
  digToolLabel.addEventListener('click', slowRender);

  var placeToolLabel = document.getElementById('placeTool').parentElement;
  placeToolLabel.addEventListener('click', slowRender);

  initPointerLock();
  initCommandInput();
  initClickTools();
  initSelectAreaTools();
  initCraftSelect();

}

function clearSelection() {
  selectStart.clear();
  selectEnd.clear();
  removeSelectBox();
  slowRender();
}

  // for some reason the click event fires before the checked attribute changes
  // can't find an event for when that attribute changes, so we use setTimeout  
function slowRender() {
  setTimeout(requestRender, 10);
}

/**
 * Allows specifying an area of voxels. Used for digging.
 */
function initSelectAreaTools() {
  renderer.domElement.addEventListener('click', ()=>{
    var digToolActive = document.getElementById('digTool').checked;
    var placeToolActive = document.getElementById('placeTool').checked;
    if (controls.enabled && (digToolActive || placeToolActive)) {
      if (!selectStart.isComplete()) {
        selectStart.setFromVector(rollOverMesh.position);
      }
      else if (!selectEnd.isComplete()) {
        selectEnd.setFromVector(rollOverMesh.position);
      }
      else {
        var v1 = selectStart.getVector();
        var v2 = selectEnd.getVector();

        var selection = makeBoxAround(v1, v2, rollOverMaterial);
        scene.add(selection);
        var selectionIndex = addSelection(selections, selection);
        
        var v1Lua = vectorToLuaString(getWorldCoord(v1));
        var v2Lua = vectorToLuaString(getWorldCoord(v2));
        var scanLevel = document.getElementById('scanWhileMoving').value;
        
        if (digToolActive) {
          var luaString = 'return dta.digArea(' + [v1Lua, v2Lua, selectionIndex, scanLevel] + ');';
        }
        else if (placeToolActive) {
          var luaString = 'return dta.placeArea(' + [v1Lua, v2Lua, selectionIndex, scanLevel] + ');';
        }
        addMessage(luaString, true);
        socket.emit('command', luaString);

        selectStart.clear();
        selectEnd.clear();
      }
    }
  });
}

/**
 * Adds command sending functionality to the command input.
 */
function initCommandInput() {

  var commandInput = document.getElementById('commandInput');
  commandInput.addEventListener("keydown", (event)=>{
    var runInTerminal = document.getElementById('runInTerminal');
    if (event.keyCode == 13) { // enter
      event.preventDefault();
      var baseText = event.target.value;
      var commandText = baseText;
      if (runInTerminal.checked) {
        commandText = "runInTerminal('" + commandText + "')";
      }
      commandText = "return " + commandText;

      // display command
      addMessage(baseText, true, runInTerminal.checked);

      // send command to the web server
      socket.emit('command', commandText);

      // clear input text
      event.target.value = '';
    }
    else if (event.key == "Tab") {
      event.preventDefault();
      runInTerminal.checked = !runInTerminal.checked;
    }
  });

}

/**
 * Sends a command to robots telling them to move to the coordinate clicked on.
 */
function initClickTools() {
  renderer.domElement.addEventListener('click', ()=>{
    var moveToolActive = document.getElementById('moveTool').checked;
    var interactToolActive = document.getElementById('interactTool').checked;
    var inspectToolActive = document.getElementById('inspectTool').checked;
    if (controls.enabled && (moveToolActive || interactToolActive || inspectToolActive)) {
      var coord = getWorldCoord(rollOverMesh.position);
      console.log(coord);
      var scanLevel = document.getElementById('scanWhileMoving').value;
      if (moveToolActive) {
        var luaString = 'return mas.to(' + [coord.x, coord.y, coord.z, scanLevel] + ');'
      }
      else if (interactToolActive) {
        var luaString = 'return int.interact(' + [vectorToLuaString(coord), scanLevel] + ');'
      }
      else if (inspectToolActive) {
        var luaString = 'return int.inspect(' + [vectorToLuaString(coord), scanLevel] + ');'
      }
      addMessage(luaString, true);
      socket.emit('command', luaString);
    }
  });
}

/**
 * Used to display on the web client commands sent to and received from robots.
 * @param {string | any[]} data 
 * @param {boolean} isInput 
 * @param {boolean} checked 
 */
function addMessage(data, isInput, checked) {

  var element = document.createElement('div');
  element.classList.add('message');

  if (isInput) {
    var subClass = 'input';
    element.setAttribute("data-checked", checked);

    element.addEventListener('click', (event)=>{

      var commandInput = document.getElementById('commandInput');
      commandInput.value = event.target.firstChild.textContent;
      commandInput.focus();

      var checkData = event.target.getAttribute("data-checked");
      var wasChecked = checkData == "true" ? true : false;
      var runInTerminal = document.getElementById("runInTerminal");
      runInTerminal.checked = wasChecked;

    });

    element.appendChild(document.createTextNode(data));
  }

  else {
    var subClass = 'output';
    element.appendChild(renderCommandResponse(data));
  }

  element.classList.add(subClass);
  document.getElementById('messageContainer').insertBefore(element, commandInput);
  document.getElementById('messageContainer').insertBefore(document.createElement('br'), commandInput);

}

/**
 * Used by addMessage to ensure newlines in messages sent from robots display properly in the web client.
 * @param {any[]} data 
 * @returns {HTMLDivElement}
 */
function renderCommandResponse(data) {
  var outputMessageDiv = document.createElement('div');
  var text = data[0] + '\n' + data[1];
  for (line of text.split('\n')) {
    outputMessageDiv.appendChild(document.createTextNode(line));
    outputMessageDiv.appendChild(document.createElement('br'));
  }
  outputMessageDiv.lastChild.remove();
  return outputMessageDiv;
}


/**
 * Allows enabling and disabling of the camera controls.
 */
function initPointerLock() {
  // locking/unlocking the cursor, enabling/disabling controls
  if ('pointerLockElement' in document) {

    var element = renderer.domElement;

    function pointerLockChangeCB(event) {
      if (document.pointerLockElement === element) {controls.enabled = true;}
      else {
        controls.enabled = false;
        document.getElementById('commandInput').focus();
      }
    }

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerLockChangeCB, false );
    document.addEventListener( 'pointerlockerror', console.dir, false );

    element.addEventListener('click', function(event) {
      element.requestPointerLock();
    }, false);

  }
  else {alert("Your browser doesn't seem to support Pointer Lock API");}
}


/**
 * Creates an interactive visual representation of an inventory.
 * @param {object} inventoryData 
 * @returns {HTMLTableElement}
 */
function renderInventory(inventoryData) {
  var table = document.createElement('table');
  table.setAttribute('data-side', inventoryData.side);
  var numCols = 4;
  var numRows = inventoryData.size / 4;
  for (var i = 0; i < numRows; i++) {
    var row = table.insertRow(-1);
    for (var j = 0; j < numCols; j++) {
      var cell = row.insertCell(-1);
      if (inventoryData.side == -1) {
        cell.addEventListener('click', changeSelectedSlot);
      }
      cell.addEventListener('dragover', allowDrop);
      cell.addEventListener('drop', itemDrop);
      cell.addEventListener('dragstart', itemDragStart);
      cell.setAttribute('draggable', true);
      var slotNumber = (i * numCols) + j + 1;
      cell.setAttribute('data-slotNumber', slotNumber);
      if (inventoryData.selected == slotNumber) {
        cell.setAttribute('data-selected', true);
      }
      var slotData = inventoryData.contents[slotNumber - 1];
      if (slotData) {
        cell.appendChild(renderItem(slotData));
      }
    }
  }

  var inventoryContainer = document.getElementById('inventoryContainer');
  var oldInventory = document.querySelector('[data-side="' + inventoryData.side + '"]');
  if (oldInventory) {inventoryContainer.removeChild(oldInventory);}
  inventoryContainer.appendChild(table);

  return table;
}

/**
 * Removes all external inventories. Used when the robot moves.
 */
function removeAllExternalInventories() {
  var inventoryContainer = document.getElementById("inventoryContainer");
  var inventories = inventoryContainer.querySelectorAll('[data-side]:not([data-side="-1"])');
  for (inventory of inventories) {
    inventoryContainer.removeChild(inventory);
  }
}

/**
 * Creates a visual representation of an item.
 * @param {object} itemData 
 * @returns {HTMLDivElement}
 */
function renderItem(itemData) {
  var itemDiv = document.createElement('div');

  itemDiv.appendChild(document.createTextNode(itemData.label));
  itemDiv.appendChild(document.createElement('br'));
  itemDiv.appendChild(document.createTextNode(itemData.size));
  itemDiv.itemData = itemData;

  return itemDiv;
}

var dragStartElement;
var itemSwapStorage;

/**
 * Stores item data for transfer.
 * @param {Event} e 
 */
function itemDragStart(e) {
  dragStartElement = this;
  if (e.ctrlKey) {
    e.dataTransfer.setData('text/plain', 'split');
  }
  else {
    e.dataTransfer.setData('text/plain', 'move');
  }
}

/**
 * Transfers item data.
 * @param {Event} e 
 */
function itemDrop(e) {
  if (dragStartElement != this) {
    var operation = e.dataTransfer.getData('text');
    if (operation == 'move') {
      validateTransfer(dragStartElement, this);
    }
    else if (operation == 'split') {
      validateTransfer(dragStartElement, this, parseInt(prompt('Number of items to move:')));
    }
  }
}

/**
 * Allows table cells to receive drops.
 * @param {Event} e 
 */
function allowDrop(e) {
  e.preventDefault();
}

/**
 * Changes which inventory slot is selected.
 * @param {Event} e 
 */
function changeSelectedSlot(e) {
  this.parentElement.parentElement.querySelector('[data-selected=true]').removeAttribute('data-selected');
  this.setAttribute('data-selected', true);
  var luaString = 'return robot.select(' + this.getAttribute('data-slotnumber') + ');';
  addMessage(luaString, true);
  socket.emit('command', luaString);
}

/**
 * Ensures transfers initiated on the client side are possible before attempting to execute them.
 * @param {HTMLTableCellElement} fromCell 
 * @param {HTMLTableCellElement} toCell 
 * @param {number} amount 
 */
function validateTransfer(fromCell, toCell, amount) {
  var success = false;
  
  if (!fromCell.firstChild ||
      getSide(fromCell) !== -1 && getSide(toCell) !== -1) {;}
  else {
    var data1 = fromCell.firstChild.itemData;
    if (amount > data1.size || amount < 1) {;}
    else if (!toCell.firstChild) {
      console.dir(data1.size)
      console.dir(amount)
      transferAndUpdate(fromCell, toCell, amount || data1.size);
      success = true;
    }
    else {
      var data2 = toCell.firstChild.itemData;
      if (data1.name == data2.name &&
          !data1.damage && !data2.damage &&
          !data1.hasTag && !data2.hasTag) {
        var data2Space = data2.maxSize - data2.size;
        if (data1.size <= data2Space) {
          var amountToTransfer = amount || data1.size;
        }
        else {
          var amountToTransfer = amount || data2Space;
        }
        transferAndUpdate(fromCell, toCell, amountToTransfer);
        success = true;
      }
      else {
        if (!amount) {
          swapCells(fromCell, toCell);
        }
      }
    }
  }

  return success;
}

/**
 * Tells you which inventory a cell is in.
 * @param {HTMLTableCellElement} cell 
 */
function getSide(cell) {
  return parseInt(cell.parentElement.parentElement.parentElement.getAttribute('data-side'));
}

/**
 * Moves items from one slot to another.
 * @param {HTMLTableCellElement} fromCell 
 * @param {HTMLTableCellElement} toCell 
 * @param {number} amount 
 */
function transferAndUpdate(fromCell, toCell, amount) {
  if (amount) {
    var data1 = fromCell.firstChild.itemData;
    data1.size -= amount;
    fromCell.removeChild(fromCell.firstChild);
    if (data1.size) {fromCell.appendChild(renderItem(data1));}
    if (toCell.firstChild) {
      var data2 = toCell.firstChild.itemData;
      data2.size += amount;
      toCell.removeChild(toCell.firstChild);
    }
    else {
      var data2 = Object.assign({}, data1);
      data2.size = amount;
    }
    toCell.appendChild(renderItem(data2));

    var luaArgs = [
      fromCell.getAttribute('data-slotnumber'),
      getSide(fromCell),
      toCell.getAttribute('data-slotnumber'),
      getSide(toCell),
      amount
    ];
    var luaString = 'return int.transfer(' + luaArgs + ');'
    addMessage(luaString, true);
    socket.emit('command', luaString);
  }
}

/**
 * Exchanges the children of two table cells. Used to swap item slots.
 * @param {HTMLTableCellElement} cell1 
 * @param {HTMLTableCellElement} cell2 
 */
function swapCells(cell1, cell2) {
  if (cell1.firstChild) {
    var itemSwapStorage = cell1.firstChild;
    cell1.removeChild(cell1.firstChild);
    if (cell2.firstChild) {cell1.appendChild(cell2.firstChild);}
    if (itemSwapStorage) {cell2.appendChild(itemSwapStorage);}

    var luaArgs = [
      cell1.getAttribute('data-slotnumber'),
      getSide(cell1),
      cell2.getAttribute('data-slotnumber'),
      getSide(cell2),
    ];
    var luaString = 'return int.transfer(' + luaArgs + ');';
    addMessage(luaString, true);
    socket.emit('command', luaString);
  }
}

/**
 * Makes the crafting button tell the robot to craft whatever's selected.
 */
function initCraftSelect() {
  var craftSelect = document.getElementById("craftSelect");
  
  fetchPromise("/js/minecraftRecipes.json").then((minecraftRecipes)=>{
    var recipeNames = [];
    for (recipe of minecraftRecipes) {
      for (recipeName of getRecipeNames(recipe)) {
        if (recipeNames.indexOf(recipeName) == -1) {
          recipeNames.push(recipeName);
        }
      }
    }
    recipeNames.sort();
    for (recipeName of recipeNames) {
      var option = document.createElement('option');
      option.textContent = recipeName;
      craftSelect.appendChild(option);
    }
    $('.selectpicker').selectpicker('refresh')
  }).catch(console.dir);

  var craftButton = document.getElementById("craftButton");
  craftButton.addEventListener('click', (e)=>{
    
    var craftSelect = document.getElementById("craftSelect");
    var luaString = "local c = craft.craft('" + craftSelect.value + "'); int.sendInventoryData(-1); return c;";
    addMessage(luaString, true);
    socket.emit('command', luaString);

  });

}