class GUI {

  constructor(game) {

    this.game = game;

    this.componentElementMap = {
      'raw': ['commandInput', 'runInTerminalDiv']
    };

    this.selections = {};

    this.selectStart = new CoordForm(
      document.getElementById('selectStartX'),
      document.getElementById('selectStartY'),
      document.getElementById('selectStartZ')
    );

    this.selectEnd = new CoordForm(
      document.getElementById('selectEndX'),
      document.getElementById('selectEndY'),
      document.getElementById('selectEndZ')
    );

    this.cutawayForm = new CutawayForm(
      document.getElementById('axisButton'),
      document.getElementById('operationButton'),
      document.getElementById('cutawayValue')
    );

    this.container = document.createElement('div');
    document.body.appendChild( this.container );
    this.container.appendChild(this.game.mapRender.renderer.domElement);

    document.addEventListener('keydown', (e)=>{
      const questionMarkCode = 191;      
      if (e.keyCode == questionMarkCode && e.shiftKey) {e.preventDefault(); $('#controlsDisplay').modal('toggle');}
    });

    // stop key events triggering inside text fields
    Array.from(document.querySelectorAll('input[type=text]')).map((elem)=>{
      elem.addEventListener('keydown', (e)=>{e.stopPropagation();});
    });

    this.selectStart.addEventListener('input', ()=>{this.game.mapRender.removeSelectBox(); this.game.mapRender.requestRender()});
    this.selectEnd.addEventListener('input', ()=>{this.game.mapRender.removeSelectBox(); this.game.mapRender.requestRender()});
  
    let toolButtonListeners = [
      {buttonID: 'moveTool', eventListener: this.clearSelection.bind(this)},
      {buttonID: 'interactTool', eventListener: this.clearSelection.bind(this)},
      {buttonID: 'inspectTool', eventListener: this.clearSelection.bind(this)},
      {buttonID: 'digTool', eventListener: ()=>{this.clearSelection(); this.slowRender(this);}},
      {buttonID: 'placeTool', eventListener: ()=>{this.clearSelection(); this.slowRender(this);}}
    ];
  
    for (let toolButtonInfo of toolButtonListeners) {
      let button = document.getElementById(toolButtonInfo.buttonID).parentElement;
      button.addEventListener('click', toolButtonInfo.eventListener);
    }
  
    this.initPointerLock();
    this.initCommandInput();
    this.initClickTools();
    this.initSelectAreaTools();
    this.initCraftSelect();
    this.initRobotSelect();
    this.initCutawayForm();
    this.initModal();

    /**
     * Transfers the specified number of items when the button in the modal is clicked.
     */
    document.getElementById('itemTransferAmountForm').addEventListener('submit', (e)=>{
      let transferAmountInput = document.getElementById('transferAmountInput');
      InventoryRender.validateTransfer(
        GLOBALS.inProgressTransfer.start,
        GLOBALS.inProgressTransfer.end,
        transferAmountInput.value,
        this
      );
      $('#itemTransferAmountModal').modal('hide');
      transferAmountInput.value = '';
    });

  }

  /**
   * Serializes objects to Lua tables. Makes sending commands to robots easier.
   * @param {object} object 
   * @returns {string}
   */
  objectToLuaString(object) {
    let luaString = '{';
    for (let prop in object) {
      if (object.hasOwnProperty(prop)) {
        luaString = luaString + prop + '=' + object[prop] + ',';
      }
    }
    luaString = luaString + '}';
    return luaString;
  }

  /**
   * Stores a selection so it can be shown until the task it's for is completed.
   * @param {object} selections 
   * @param {THREE.Mesh} selection 
   * @returns {number}
   */
  addSelection(selections, selection) {
    this.game.mapRender.removeSelectBox();
    let counter = 0;
    while (this.selections[counter]) {counter++;}
    this.selections[counter] = selection;
    return counter;
  }
  
  /**
   * Used to get rid of a selection when the task it's for is completed.
   * @param {object} selections 
   * @param {number} index 
   */
  deleteSelection(selections, index) {
    let selection = this.selections[index];
    this.scene.remove(selection);
    selection.geometry.dispose();
    delete this.selections[index];
    this.game.mapRender.requestRender();
  }

  /**
   * Used to erase input from the coordinate forms.
   */
  clearSelection() {
    this.selectStart.clear();
    this.selectEnd.clear();
    this.game.mapRender.removeSelectBox();
    this.slowRender(this);
  }

  /**
   * For some reason the click event fires before the checked attribute changes.
   * Can't find an event for when that attribute changes, so we use setTimeout.
   */
  slowRender() {
    setTimeout(this.game.mapRender.requestRender.bind(this.game.mapRender), 10);
  }

    
  /**
   * Allows specifying an area of voxels. Used for digging and placing blocks.
   */
  initSelectAreaTools() {
    this.game.mapRender.renderer.domElement.addEventListener('click', (e)=>{
      // left click
      if (e.button == 0) {
        let digToolActive = document.getElementById('digTool').checked;
        let placeToolActive = document.getElementById('placeTool').checked;
        if (this.game.mapRender.controls.enabled && (digToolActive || placeToolActive)) {
          let pos = new WorldAndScenePoint(this.game.mapRender.rollOverMesh.position, false);
          if (!this.selectStart.isComplete()) {
            this.selectStart.setFromPoint(pos);
          }
          else if (!this.selectEnd.isComplete()) {
            this.selectEnd.setFromPoint(pos);
          }
          else {
            let startPoint = this.selectStart.getPoint();
            let endPoint = this.selectEnd.getPoint();

            let selection = this.game.mapRender.makeBoxAround(startPoint, endPoint, rollOverMaterial);
            this.game.mapRender.scene.add(selection);
            let selectionIndex = this.addSelection(selections, selection);
            
            let startPointLua = this.objectToLuaString(startPoint.world());
            let endPointLua = this.objectToLuaString(endPoint.world());
            let scanLevel = document.getElementById('scanLevelSelect').value;
            
            if (digToolActive) {
              let commandName = 'dig';
            }
            else if (placeToolActive) {
              let commandName = 'place';
            }
            let commandParameters = [startPointLua, endPointLua, selectionIndex, scanLevel];
            this.sendCommand(commandName, commandParameters);

            this.selectStart.clear();
            this.selectEnd.clear();
          }
        }
      }
      // right click
      else if (e.button == 2) {
        this.clearSelection();
      }
    });
  }

  /**
   * Adds command sending functionality to the command input.
   */
  initCommandInput() {

    let commandInput = document.getElementById('commandInput');
    commandInput.addEventListener("keydown", (event)=>{
      let runInTerminal = document.getElementById('runInTerminal');
      if (event.keyCode == 13) { // enter
        event.preventDefault();
        let baseText = event.target.value;
        let commandText = baseText;
        if (runInTerminal.checked) {
          commandText = "runInTerminal('" + commandText + "')";
        }
        commandText = "return " + commandText;

        let commandName = 'raw';
        let commandParameters = [commandText];
        this.sendCommand(commandName, commandParameters, runInTerminal.checked);

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
   * Sends a command to robots telling them to move to the coordinate clicked on,
   * and then do something depending on the selected tool.
   */
  initClickTools() {
    this.game.mapRender.renderer.domElement.addEventListener('click', ()=>{
      let moveToolActive = document.getElementById('moveTool').checked;
      let interactToolActive = document.getElementById('interactTool').checked;
      let inspectToolActive = document.getElementById('inspectTool').checked;
      if (this.game.mapRender.controls.enabled && (moveToolActive || interactToolActive || inspectToolActive)) {
        let coord = new WorldAndScenePoint(this.game.mapRender.rollOverMesh.position, false).world();
        console.log(coord);
        let scanLevel = document.getElementById('scanLevelSelect').value;
        let commandName;
        let commandParameters;
        if (moveToolActive) {
          commandName = 'move';
          commandParameters = [coord.x, coord.y, coord.z, scanLevel];
        }
        else if (interactToolActive) {
          commandName = 'interact';
          commandParameters = [coord.x, coord.y, coord.z, scanLevel];
        }
        else if (inspectToolActive) {
          commandName = 'inspect';
          commandParameters = [coord.x, coord.y, coord.z, scanLevel];
        }
        this.sendCommand(commandName, commandParameters);
      }
    });
  }

  /**
   * Sends a command for the selected robot to the server.
   * @param {string} commandName 
   * @param {any[]} commandParameters
   * @param {boolean} runInTerminal
   * @returns {boolean}
   */
  sendCommand(commandName, commandParameters, runInTerminal) {
    let result = false;
    let robotSelect = document.getElementById('robotSelect');
    if (!robotSelect.value) {
      console.dir('No robot selected!');
    }
    else {
      let commandString = commandName + "(" + (commandParameters || "") + ")"
      commandParameters = Array.isArray(commandParameters) ? commandParameters : [];
      this.addMessage(commandString, true, runInTerminal, commandName, commandParameters);
      this.game.webClient.socket.emit('command', {command: {name: commandName, parameters: commandParameters}, robot: robotSelect.value});
      result = true;
    }
    return result;
  }

  /**
   * Used to display on the web client commands sent to and received from robots.
   * @param {string | any[]} message 
   * @param {boolean} isInput 
   * @param {boolean} checked 
   * @param {string} commandName
   * @param {any[]} commandParameters
   */
  addMessage(message, isInput, checked, commandName, commandParameters) {

    let element = document.createElement('div');
    element.classList.add('message');

    let subClass;
    if (isInput) {
      subClass = 'input';
      element.setAttribute("data-checked", checked);
      element.setAttribute("data-command-name", commandName);
      element.setAttribute("data-command-parameters", JSON.stringify(commandParameters));

      element.addEventListener('click', (event)=>{

        let commandInput = document.getElementById('commandInput');

        let checkData = event.target.getAttribute("data-checked");
        let wasChecked = checkData == "true" ? true : false;
        let runInTerminal = document.getElementById("runInTerminal");
        runInTerminal.checked = wasChecked;

        let commandName = event.target.getAttribute("data-command-name");
        let commandParameters = JSON.parse(event.target.getAttribute("data-command-parameters"));
        if (commandName) {this.sendCommand(commandName, commandParameters);}

      });

      element.appendChild(document.createTextNode(message));
    }

    else {
      subClass = 'output';
      element.appendChild(this.renderCommandResponse(message));
    }

    element.classList.add(subClass);
    let messageContainer = document.getElementById('messageContainer');
    messageContainer.insertBefore(element, messageContainer.firstChild);
    messageContainer.insertBefore(document.createElement('br'), messageContainer.firstChild);

  }

  /**
   * Used by addMessage to ensure newlines in messages sent from robots display properly in the web client.
   * @param {any[]} data 
   * @returns {HTMLDivElement}
   */
  renderCommandResponse(data) {
    let outputMessageDiv = document.createElement('div');
    let text = data[0] + '\n' + data[1];
    for (let line of text.split('\n')) {
      line = line.replace(/\s/g, '\u00A0')
      outputMessageDiv.appendChild(document.createTextNode(line));
      outputMessageDiv.appendChild(document.createElement('br'));
    }
    outputMessageDiv.lastChild.remove();
    return outputMessageDiv;
  }

  /**
   * Allows enabling and disabling of the camera controls.
   */
  initPointerLock() {
    // locking/unlocking the cursor, enabling/disabling controls
    if ('pointerLockElement' in document) {

      let pointerLockElement = this.game.mapRender.renderer.domElement;

      function pointerLockChangeCB(event) {
        if (document.pointerLockElement === pointerLockElement) {this.game.mapRender.controls.enabled = true;}
        else {this.game.mapRender.controls.enabled = false;}
      }

      // Hook pointer lock state change events
      document.addEventListener( 'pointerlockchange', pointerLockChangeCB.bind(this), false );
      document.addEventListener( 'pointerlockerror', console.dir, false );

      pointerLockElement.addEventListener('click', function(event) {
        pointerLockElement.requestPointerLock();
      }, false);

      let clickThroughElements = ['bottomLeftUI', 'messageContainer', 'inventoryContainer', 'buttonContainer'];
      for (let elemName of clickThroughElements) {
        let clickThroughElem = document.getElementById(elemName);
        clickThroughElem.addEventListener('click', function(event) {
          if (event.target == clickThroughElem) {
            pointerLockElement.requestPointerLock();
          }
        }, false);
      }

    }
    else {alert("Your browser doesn't seem to support Pointer Lock API");}
  }

  /**
   * Makes the crafting button tell the robot to craft whatever's selected.
   */
  initCraftSelect() {
    let craftSelect = document.getElementById("craftSelect");

    function addRecipes(recipes) {
      let recipeNames = [];
      for (let recipe of recipes) {
        for (let recipeName of getRecipeNames(recipe)) {
          if (recipeNames.indexOf(recipeName) == -1) {
            recipeNames.push(recipeName);
          }
        }
      }
      recipeNames.sort();
      for (let recipeName of recipeNames) {
        let option = document.createElement('option');
        option.textContent = recipeName;
        craftSelect.appendChild(option);
      }
      $('.selectpicker').selectpicker('refresh');
    }
    
    fetchPromise("/js/recipes/minecraftRecipes.json").then(addRecipes).catch(console.dir);
    fetchPromise("/js/recipes/OCRecipes.json").then(addRecipes).catch(console.dir);

    // prevent hotkeys from working here
    craftSelect.parentElement.addEventListener('keydown', (e)=>{e.stopPropagation();});

    let craftButton = document.getElementById("craftButton");
    craftButton.addEventListener('click', (e)=>{
      
      let craftSelect = document.getElementById("craftSelect");
      let commandName = 'craft';
      let commandParameters = [craftSelect.value];
      this.sendCommand(commandName, commandParameters);

    });

  }

  /**
   * Update the UI to show the new robot's information.
   * @param {string} robotName 
   */
  switchToRobot(robotName) {
    let robotData = this.game.webClient.allRobotInfo[robotName];
    if (robotData) {

      let powerLevel = robotData.getPower();
      if (powerLevel) {
        this.setPower(powerLevel);
      }
      
      let inventoryContainer = document.getElementById("inventoryContainer");
      if (robotData.getShowInventories()) {
        inventoryContainer.classList.remove('hidden');
        this.sendCommand('viewInventory');
      }
      else {
        inventoryContainer.classList.add('hidden');
      }

      for (let elem of Array.from(inventoryContainer.childNodes)) {
        elem.remove();
      }
      this.game.webClient.allRobotInfo[robotName].getAllInventories().map(i=>i.addToDisplay(inventoryContainer));

      let robotPos = robotData.getPosition();
      if (robotPos) {
        this.game.mapRender.selectedRobotMesh.position.copy(robotPos.scene());
        this.game.mapRender.selectedRobotMesh.visible = true;
        this.game.mapRender.requestRender();
      }

      this.hideComponentGUI();
      for (let componentName in robotData.getComponents()) {
        let componentElementIDs = this.componentElementMap[componentName];
        componentElementIDs.map((componentElementID)=>{
          document.getElementById(componentElementID).classList.remove('hidden');
        });
      }

    }
    else {
      this.game.mapRender.selectedRobotMesh.visible = false;
      this.game.mapRender.requestRender();
    }
  }

  /**
   * Used when robots update their power level and when we switch robots.
   * Takes a number from 0 to 1.
   * @param {number} powerLevel
   */
  setPower(powerLevel) {
    document.getElementById('powerLevelDisplay').classList.remove('hidden');
    document.getElementById('powerLevel').innerHTML = Math.round(powerLevel * 100) + "%";
  }

  /**
   * Hides certain GUI elements when a robot that can't make use of them is selected.
   */
  hideComponentGUI() {
    for (let componentElementIDs of Object.values(this.componentElementMap)) {
      componentElementIDs.map((componentElementID)=>{
        let componentElement = document.getElementById(componentElementID);
        if (!componentElement.classList.contains('hidden')) {
          componentElement.classList.add('hidden');
        }
      });
    }
  }

  /**
   * Makes sure the UI updates properly when we change the selected robot.
   */
  initRobotSelect() {
    let robotSelect = document.getElementById('robotSelect');
    robotSelect.addEventListener('change', (e)=>{
      console.log(e.target.value);
      this.switchToRobot(e.target.value);
    });
  }

  /**
   * Moves the camera above the selected robot and faces it.
   */
  viewSelectedRobot() {
    let robotData = this.game.webClient.allRobotInfo[document.getElementById('robotSelect').value];
    this.game.mapRender.goToAndLookAt(this.game.mapRender.controls, robotData.getPosition());
    this.game.mapRender.requestRender();
  }

  /**
   * Used to update the map whenever we specify a new cutoff point.
   */
  initCutawayForm() {
    this.cutawayForm.addChangeListener((e)=>{
      this.game.mapRender.voxelMap.forEach((voxel)=>{
        voxel.visible = this.cutawayForm.shouldBeRendered(new WorldAndScenePoint(voxel.position, false));
      });
      this.game.mapRender.requestRender();
    });
  }

  /**
   * Display the controls if the user hasn't visited the page before.
   */
  initModal() {
    if (!localStorage.getItem('controlsHaveBeenShown')) {
      $('#controlsDisplay').modal('show');
      localStorage.setItem('controlsHaveBeenShown', 'true');
    }
  }

}
