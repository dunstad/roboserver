/**
 * Used to display and track inventories.
 */
class Inventory {

  /**
   * Used to display and track inventories.
   */
  constructor(inventoryData) {
    this.inventory = inventoryData;
    this.inventory.contents = {};
    this.table = renderInventory(inventoryData);
  }

  /**
   * Tells you about the item in the given slot. First item is at 1, just like in game.
   * @param {number} slotNum 
   * @returns {object}
   */
  getSlot(slotNum) {
    return this.inventory.contents[slotNum - 1];
  }

  /**
   * Change what's in a slot. First item is at 1, just like in game.
   * @param {number} slotNum 
   * @param {object} slotData 
   * @returns {object}
   */
  setSlot(slotNum, slotData) {
    this.inventory.contents[slotNum - 1] = slotData;
    var slotCell = this.table.rows[Math.trunc((slotNum - 1) / 4) + 1].cells[(slotNum - 1) % 4];
    if (slotCell.firstChild) {slotCell.firstChild.remove();}
    if (slotData) {slotCell.appendChild(renderItem(slotData));}
    return slotData;
  }

  /**
   * Gets the side this inventory is on. Used to tell if it's internal or external.
   * @returns {number}
   */
  getSide() {
    return this.inventory.side;
  }

  /**
   * Adds the table to an existing element to be displayed.
   * @param {HTMLElement} display 
   */
  addToDisplay(display) {
    display.appendChild(this.table);
  }

  /**
   * Removes the table from its parent display element.
   */
  removeFromDisplay() {
    this.table.remove();
  }

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
    }
  }

  var inventoryLabel = document.createElement('span');
  var inventoryType = inventoryData.side == -1 ? 'Robot' : 'External';
  inventoryLabel.innerText = inventoryType + ' Inventory';

  var header = table.createTHead();
  var headerRow = document.createElement('tr');
  var headerCell = document.createElement('th');
  header.appendChild(headerRow);
  headerRow.appendChild(headerCell);
  headerCell.appendChild(inventoryLabel);

  return table;
}

/**
 * Removes inventories from the display.
 * Used when the robot moves or when you select a new robot.
 * @param {boolean} includeInternal
 */
function removeInventories(includeInternal) {
  var inventoryContainer = document.getElementById("inventoryContainer");
  if (includeInternal) {
    for (elem of Array.from(inventoryContainer.childNodes)) {
      elem.remove();
    }
  }
  else {
    var inventories = inventoryContainer.querySelectorAll('[data-side]:not([data-side="-1"])');
    for (var inventory of inventories) {
      inventoryContainer.removeChild(inventory);
    }
  }
}

/**
 * Creates a visual representation of an item.
 * @param {object} itemData 
 * @returns {HTMLDivElement}
 */
function renderItem(itemData) {
  var itemDiv = document.createElement('div');
  itemDiv.setAttribute('title', itemData.label + ', ' + itemData.size);

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
  var commandName = 'select';
  var commandParameters = [this.getAttribute('data-slotnumber')];
  sendCommand(commandName, commandParameters);
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

    var commandParameters = [
      fromCell.getAttribute('data-slotnumber'),
      getSide(fromCell),
      toCell.getAttribute('data-slotnumber'),
      getSide(toCell),
      amount
    ];
    var commandName = 'transfer';
    sendCommand(commandName, commandParameters);
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

    var commandParameters = [
      cell1.getAttribute('data-slotnumber'),
      getSide(cell1),
      cell2.getAttribute('data-slotnumber'),
      getSide(cell2),
    ];
    var commandName = 'transfer';
    sendCommand(commandName, commandParameters);
  }
}