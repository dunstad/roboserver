/**
 * Used to display and track inventories.
 */
class InventoryRender {

  /**
   * Used to display and track inventories.
   * @param {object} inventoryData
   * @param {GUI} GUI
   */
  constructor(inventoryData, GUI) {
    this.inventory = inventoryData;
    this.inventory.contents = {};
    this.GUI = GUI;
    this.table = this.renderInventory(inventoryData);
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
    if (slotData && slotData.label) {
      slotCell.appendChild(InventoryRender.renderItem(slotData, this.GUI));
    }
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

  /**
   * Creates an interactive visual representation of an inventory.
   * @param {object} inventoryData 
   * @returns {HTMLTableElement}
   * @param {GUI} GUI
   */
  renderInventory(inventoryData) {
    var table = document.createElement('table');
    table.classList.add('mc-table');
    table.setAttribute('data-side', inventoryData.side);
    var numCols = 4;
    var numRows = inventoryData.size / 4;
    for (var i = 0; i < numRows; i++) {
      var row = table.insertRow(-1);
      for (var j = 0; j < numCols; j++) {
        if ((i * 4) + j < inventoryData.size) {
          var cell = row.insertCell(-1);
          cell.classList.add('mc-td');
          if (inventoryData.side == -1) {
            cell.addEventListener('click', this.changeSelectedSlot.bind(this.GUI));
          }
          
          cell.addEventListener('dragover', this.allowDrop);
          cell.addEventListener('drop', this.itemDrop.bind(this.GUI));

          var slotNumber = (i * numCols) + j + 1;
          cell.setAttribute('data-slotNumber', slotNumber);
          if (inventoryData.selected == slotNumber) {
            cell.setAttribute('data-selected', true);
          }
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
   * Creates a visual representation of an item.
   * @param {object} itemData 
   * @param {GUI} guiInstance 
   * @returns {HTMLDivElement}
   */
  static renderItem(itemData, guiInstance) {
    let itemDiv = document.createElement('div');
    let title = `${itemData.label}, ${itemData.size}`;
    itemDiv.setAttribute('title', title);
    itemDiv.setAttribute('style', "text-align: center;");
    GUI.addToolTip(itemDiv, title);

    itemDiv.addEventListener('dragstart', InventoryRender.itemDragStart);
    itemDiv.setAttribute('draggable', true);

    let svgCube;
    let shortName = itemData.name.replace('minecraft:', '');
    if (shortName in guiInstance.namesToHardness) {

      let hardness = guiInstance.namesToHardness[shortName];
      let colorNumber = guiInstance.game.mapRender.hardnessToColorData[hardness];

      function darken(colorNumber) {
        let percent = -.15;
        let t=percent<0?0:255,p=percent<0?percent*-1:percent,R=colorNumber>>16,G=colorNumber>>8&0x00FF,B=colorNumber&0x0000FF;
        return parseInt((0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1), 16);
      }

      function colorNumberToString(colorNumber) {
        return `#${colorNumber.toString(16)}`;
      }

      svgCube = InventoryRender.makeCubeSVG(
        colorNumberToString(colorNumber),
        colorNumberToString(darken(colorNumber)),
        colorNumberToString(darken(darken(colorNumber))),
      );

    }
    else {
      svgCube = InventoryRender.makeCubeSVG('white', 'gray', 'black')
    }
    itemDiv.appendChild(svgCube);

    let numberDiv = document.createElement('div');
    numberDiv.classList.add('itemStackNumber');
    numberDiv.innerText = itemData.size;
    itemDiv.appendChild(numberDiv);

    itemDiv.itemData = itemData;

    return itemDiv;
  }

  /**
   * Stores item data for transfer.
   * @param {Event} e 
   */
  static itemDragStart(e) {
    let cell = e.target;
    $(cell).tooltip('hide');
    GLOBALS.dragStartElement = cell.parentElement;
    if (e.ctrlKey || e.altKey) {
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
  itemDrop(e) {
    e.preventDefault();
    let cell = e.target;
    while (cell.tagName != "TD") {cell = cell.parentElement;}
    if (GLOBALS.dragStartElement != cell) {
      let operation = e.dataTransfer.getData('text');
      if (operation == 'move') {
        InventoryRender.validateTransfer(GLOBALS.dragStartElement, cell, undefined, this);
      }
      else if (operation == 'split') {
        $('#itemTransferAmountModal').modal('show');
        GLOBALS.inProgressTransfer = {};
        GLOBALS.inProgressTransfer.start = GLOBALS.dragStartElement;
        GLOBALS.inProgressTransfer.end = cell;
        this.transferAmountInput.focus();
      }
    }
    return false;
  }

  /**
   * Allows table cells to receive drops.
   * @param {Event} e 
   */
  allowDrop(e) {
    e.preventDefault();
     return false;
  }

  /**
   * Changes which inventory slot is selected.
   * @param {Event} e 
   */
  changeSelectedSlot(e) {
    let cell = e.target;
    while (cell.tagName != "TD") {cell = cell.parentElement;}
    cell.parentElement.parentElement.querySelector('[data-selected=true]').removeAttribute('data-selected');
    cell.setAttribute('data-selected', true);
    var commandName = 'select';
    var commandParameters = [parseInt(cell.getAttribute('data-slotnumber'))];
    this.sendCommand(commandName, commandParameters);
  }

  /**
   * Ensures transfers initiated on the client side are possible before attempting to execute them.
   * @param {HTMLTableCellElement} fromCell 
   * @param {HTMLTableCellElement} toCell 
   * @param {number} amount 
   * @param {GUI} GUI
   */
  static validateTransfer(fromCell, toCell, amount, GUI) {
    amount = parseInt(amount);
    var success = false;
    
    if (!fromCell.firstChild ||
        InventoryRender.getSide(fromCell) !== -1 && InventoryRender.getSide(toCell) !== -1) {;}
    else {
      var data1 = fromCell.firstChild.itemData;
      if (amount > data1.size || amount < 1) {;}
      else if (!toCell.firstChild) {
        InventoryRender.transferAndUpdate(fromCell, toCell, amount || data1.size, GUI);
        success = true;
      }
      else {
        var data2 = toCell.firstChild.itemData;
        if (data1.name == data2.name &&
            !data1.damage && !data2.damage &&
            !data1.hasTag && !data2.hasTag) {
          var data2Space = data2.maxSize - data2.size;
          if (amount) {
            var amountToTransfer = Math.min(amount, data2Space);
          }
          else {
            var amountToTransfer = Math.min(data1.size, data2Space);
          }
          InventoryRender.transferAndUpdate(fromCell, toCell, amountToTransfer, GUI);
          success = true;
        }
        else {
          if (!amount) {
            InventoryRender.swapCells(fromCell, toCell, GUI);
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
  static getSide(cell) {
    return parseInt(cell.parentElement.parentElement.parentElement.getAttribute('data-side'));
  }

  /**
   * Moves items from one slot to another.
   * @param {HTMLTableCellElement} fromCell 
   * @param {HTMLTableCellElement} toCell 
   * @param {number} amount 
   * @param {GUI} GUI
   */
  static transferAndUpdate(fromCell, toCell, amount, GUI) {
    amount = parseInt(amount);
    if (amount) {
      var data1 = fromCell.firstChild.itemData;
      data1.size -= amount;
      fromCell.removeChild(fromCell.firstChild);
      if (data1.size) {fromCell.appendChild(InventoryRender.renderItem(data1, GUI));}
      if (toCell.firstChild) {
        var data2 = toCell.firstChild.itemData;
        data2.size += amount;
        toCell.removeChild(toCell.firstChild);
      }
      else {
        var data2 = Object.assign({}, data1);
        data2.size = amount;
      }
      let newItem = InventoryRender.renderItem(data2, GUI);
      toCell.appendChild(newItem);
      $(newItem).tooltip('destroy');

      var commandParameters = [
        parseInt(fromCell.getAttribute('data-slotnumber')),
        InventoryRender.getSide(fromCell),
        parseInt(toCell.getAttribute('data-slotnumber')),
        InventoryRender.getSide(toCell),
        amount,
      ];
      var commandName = 'transfer';
      GUI.sendCommand(commandName, commandParameters);
    }
  }

  /**
   * Exchanges the children of two table cells. Used to swap item slots.
   * @param {HTMLTableCellElement} cell1 
   * @param {HTMLTableCellElement} cell2
   * @param {GUI} GUI
   */
  static swapCells(cell1, cell2, GUI) {
    if (cell1.firstChild) {
      let amount = cell1.firstChild.itemData.size;
      let itemSwapStorage = cell1.firstChild;
      cell1.removeChild(cell1.firstChild);
      if (cell2.firstChild) {cell1.appendChild(cell2.firstChild);}
      if (itemSwapStorage) {cell2.appendChild(itemSwapStorage);}

      var commandParameters = [
        parseInt(cell1.getAttribute('data-slotnumber')),
        InventoryRender.getSide(cell1),
        parseInt(cell2.getAttribute('data-slotnumber')),
        InventoryRender.getSide(cell2),
        amount,
      ];
      var commandName = 'transfer';
      GUI.sendCommand(commandName, commandParameters);
    }
  }

  /**
   * Used to create cube images to represent items.
   * @param {string} topColor 
   * @param {string} leftColor 
   * @param {string} rightColor 
   */
  static makeCubeSVG(topColor, leftColor, rightColor) {

    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', '0 0 1732 2000');
    svg.setAttribute('style', 'height: inherit;');

    let top = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    top.setAttribute('points', '0,500 866,0 1732,500 866,1000');
    top.style.fill = topColor;

    let left = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    left.setAttribute('points', '0,500 867,1000 867,2000 0,1500');
    left.style.fill = leftColor;

    let right = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    right.setAttribute('points', '1732,500 866,999 866,2000 1732,1500');
    right.style.fill = rightColor;

    svg.appendChild(top);
    svg.appendChild(left);
    svg.appendChild(right);

    return svg;

  }

}