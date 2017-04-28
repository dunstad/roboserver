main();

function main() {

  // socket connection to http server
  socket = io();
  socket.on('message', console.dir);
  socket.send('ping');

  // display command results received from robot
  socket.on('command result', (result)=>{
    console.dir(result);
    addMessage(result.data, false);
  });

  // render map data received from robot
  socket.on('map data', (mapData)=>{
    console.dir(mapData);
    addShapeVoxels(mapData.data, mapData.robot);
  });

  // render block data received from robot
  socket.on('block data', (blockData)=>{
    console.dir(blockData);
    var pos = new WorldAndScenePoint(blockData.data.point, true);
    if (!(blockData.data.name == "minecraft:air")) {
      addVoxel(pos, colorFromHardness(blockData.data.hardness));
    }
    else {removeVoxel(pos);}
  });

  // render map data received from robot
  socket.on('robot position', (pos)=>{
    console.dir(pos);
    moveRobotVoxel(new WorldAndScenePoint(pos.data, true), pos.robot);
    allRobotInfo[pos.robot].removeAllExternalInventories();
    if (pos.robot == document.getElementById('robotSelect').value) {
      var robotData = allRobotInfo[pos.robot];
      if (robotData) {
        selectedRobotMesh.position.copy(robotData.getPosition().scene());
        requestRender();
      }
    }
  });

  // remove selection because its task has been completed
  socket.on('delete selection', (index)=>{
    console.dir(index);
    deleteSelection(selections, index.data);
  });

  // remove voxels corresponding to successfully dug blocks
  socket.on('dig success', (pos)=>{
    console.dir(pos);
    removeVoxel(new WorldAndScenePoint(pos.data, true));
  });

  // render inventory data received from robot
  socket.on('inventory data', (inventoryData)=>{
    console.dir(inventoryData);
    var inv = new Inventory(inventoryData.data);
    allRobotInfo[inventoryData.robot].addInventory(inv);
    if (document.getElementById('robotSelect').value == inventoryData.robot) {
      inv.addToDisplay(document.getElementById('inventoryContainer'));
    }
  });

  // todo
  socket.on('slot data', (slot)=>{
    console.dir(slot);
    
  });

  // add listening robots to select
  socket.on('listen start', (data)=>{
    console.dir(data);
    var robotSelect = document.getElementById('robotSelect');
    var option = document.createElement('option');
    option.text = data.robot;
    option.value = data.robot;
    if (!allRobotInfo[data.robot]) {allRobotInfo[data.robot] = new Robot();}
    if (robotSelect.options.length == 0) {
      switchToRobot(data.robot);
    }
    robotSelect.add(option);
  });
  
  // remove robots that stop listening from select
  socket.on('listen end', (data)=>{
    console.dir(data);
    var robotSelect = document.getElementById('robotSelect');
    var option = robotSelect.querySelector('[value=' + data.robot + ']');
    robotSelect.removeChild(option);
    allRobotInfo[data.robot] = undefined;
  });
  
  // keep track of how much power robots have left
  socket.on('power level', (power)=>{
    console.dir(power);
    allRobotInfo[power.robot].setPower(power.data);
    var currentRobot = document.getElementById('robotSelect').value;
    if (power.robot == currentRobot) {
      document.getElementById('powerLevel').innerHTML = Math.round(power.data * 100) + "%";
    }
  });

  selectStart.addEventListener('input', ()=>{removeSelectBox(); requestRender()});
  selectEnd.addEventListener('input', ()=>{removeSelectBox(); requestRender()});

  var toolButtonListeners = [
    {buttonID: 'moveTool', eventListener: clearSelection},
    {buttonID: 'interactTool', eventListener: clearSelection},
    {buttonID: 'inspectTool', eventListener: clearSelection},
    {buttonID: 'digTool', eventListener: slowRender},
    {buttonID: 'placeTool', eventListener: slowRender}
  ];

  for (toolButtonInfo of toolButtonListeners) {
    var button = document.getElementById(toolButtonInfo.buttonID).parentElement;
    button.addEventListener('click', toolButtonInfo.eventListener);
  }

  initPointerLock();
  initCommandInput();
  initClickTools();
  initSelectAreaTools();
  initCraftSelect();
  initRobotSelect();
  initCutawayForm();

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
      var pos = new WorldAndScenePoint(rollOverMesh.position, false);
      if (!selectStart.isComplete()) {
        selectStart.setFromPoint(pos);
      }
      else if (!selectEnd.isComplete()) {
        selectEnd.setFromPoint(pos);
      }
      else {
        var startPoint = selectStart.getPoint();
        var endPoint = selectEnd.getPoint();

        var selection = makeBoxAround(startPoint, endPoint, rollOverMaterial);
        scene.add(selection);
        var selectionIndex = addSelection(selections, selection);
        
        var startPointLua = objectToLuaString(startPoint.world());
        var endPointLua = objectToLuaString(endPoint.world());
        var scanLevel = document.getElementById('scanWhileMoving').value;
        
        if (digToolActive) {
          var commandName = 'dig';
        }
        else if (placeToolActive) {
          var commandName = 'place';
        }
        var commandParameters = [startPointLua, endPointLua, selectionIndex, scanLevel];
        sendCommand(commandName, commandParameters);

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

      var commandName = 'raw';
      var commandParameters = [commandText];
      sendCommand(commandName, commandParameters, runInTerminal.checked);

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
      var coord = new WorldAndScenePoint(rollOverMesh.position, false).world();
      console.log(coord);
      var scanLevel = document.getElementById('scanWhileMoving').value;
      if (moveToolActive) {
        var commandName = 'move';
        var commandParameters = [coord.x, coord.y, coord.z, scanLevel];
      }
      else if (interactToolActive) {
        var commandName = 'interact';
        var commandParameters = [objectToLuaString(coord), scanLevel];
      }
      else if (inspectToolActive) {
        var commandName = 'inspect';
        var commandParameters = [objectToLuaString(coord), scanLevel];
      }
      sendCommand(commandName, commandParameters);
    }
  });
}

/**
 * Sends a command for the selected robot to the server.
 * @param {string} commandString 
 * @param {boolean} runInTerminal
 * @returns {boolean}
 */
function sendCommand(commandName, commandParameters, runInTerminal) {
  var result = false;
  var robotSelect = document.getElementById('robotSelect');
  if (!robotSelect.value) {
    console.dir('No robot selected!');
  }
  else {
    var commandString = commandName + "(" + (commandParameters || "") + ")"
    addMessage(commandString, true, runInTerminal);
    socket.emit('command', {command: {name: commandName, parameters: commandParameters}, robot: robotSelect.value});
    result = true;
  }
  return result;
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
  for (var line of text.split('\n')) {
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
function initPointerLock() {
  // locking/unlocking the cursor, enabling/disabling controls
  if ('pointerLockElement' in document) {

    var pointerLockElement = renderer.domElement;

    function pointerLockChangeCB(event) {
      if (document.pointerLockElement === pointerLockElement) {controls.enabled = true;}
      else {
        controls.enabled = false;
        document.getElementById('commandInput').focus();
      }
    }

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerLockChangeCB, false );
    document.addEventListener( 'pointerlockerror', console.dir, false );

    pointerLockElement.addEventListener('click', function(event) {
      pointerLockElement.requestPointerLock();
    }, false);

    var clickThroughElements = ['bottomLeftUI', 'messageContainer', 'inventoryContainer'];
    for (elemName of clickThroughElements) {
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
function initCraftSelect() {
  var craftSelect = document.getElementById("craftSelect");

  function addRecipes(recipes) {
    var recipeNames = [];
    for (var recipe of recipes) {
      for (var recipeName of getRecipeNames(recipe)) {
        if (recipeNames.indexOf(recipeName) == -1) {
          recipeNames.push(recipeName);
        }
      }
    }
    recipeNames.sort();
    for (var recipeName of recipeNames) {
      var option = document.createElement('option');
      option.textContent = recipeName;
      craftSelect.appendChild(option);
    }
    $('.selectpicker').selectpicker('refresh');
  }
  
  fetchPromise("/js/minecraftRecipes.json").then(addRecipes).catch(console.dir);
  fetchPromise("/js/OCRecipes.json").then(addRecipes).catch(console.dir);

  var craftButton = document.getElementById("craftButton");
  craftButton.addEventListener('click', (e)=>{
    
    var craftSelect = document.getElementById("craftSelect");
    var commandName = 'craft';
    var commandParameters = [craftSelect.value];
    sendCommand(commandName, commandParameters);

  });

}

/**
 * Update the UI to show the new robot's information.
 * @param {string} robotName 
 */
function switchToRobot(robotName) {
  var robotData = allRobotInfo[robotName];
  if (robotData) {
    document.getElementById('powerLevel').innerHTML = Math.round(robotData.getPower() * 100) + "%";
    
    var inventoryContainer = document.getElementById("inventoryContainer");
    for (elem of Array.from(inventoryContainer.childNodes)) {
      elem.remove();
    }

    allRobotInfo[robotName].getAllInventories().map(i=>i.addToDisplay(inventoryContainer));
    var robotPos = robotData.getPosition();
    if (robotPos) {
      selectedRobotMesh.position.copy(robotPos.scene());
      viewSelectedRobot();
    }
  }
}

/**
 * Makes sure the UI updates properly when we change the selected robot.
 */
function initRobotSelect() {
  var robotSelect = document.getElementById('robotSelect');
  robotSelect.addEventListener('change', (e)=>{
    console.log(e.target.value);
    switchToRobot(e.target.value);
  });
}

/**
 * Moves the camera above the selected robot and faces it.
 */
function viewSelectedRobot() {
  var robotData = allRobotInfo[document.getElementById('robotSelect').value];
  goToAndLookAt(controls, robotData.getPosition());
  requestRender();
}

/**
 * Used to update the map whenever we specify a new cutoff point.
 */
function initCutawayForm() {
  cutawayForm.addChangeListener((e)=>{
    voxelMap.forEach((voxel)=>{
      voxel.visible = cutawayForm.shouldBeRendered(new WorldAndScenePoint(voxel.position, false));
    });
    requestRender();
  });
}