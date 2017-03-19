main();

function main() {

  // socket connection to http server
  var socket = io();
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

  // render map data received from robot
  socket.on('robot position', (pos)=>{
    console.dir(pos);
    moveRobotVoxel(pos);
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

  selectStart.addEventListener('input', render);
  selectEnd.addEventListener('input', render);

  // for some reason the click event fires before the checked attribute changes
  // can't find an event for when that attribute changes, so we use setTimeout
  var moveToolLabel = document.getElementById('moveTool').parentElement;
  moveToolLabel.addEventListener('click', (e)=>{
    selectStart.clear();
    selectEnd.clear();
    removeSelectBox();
    setTimeout(render, 10);
  });
  var moveToolLabel = document.getElementById('selectTool').parentElement;
  moveToolLabel.addEventListener('click', (e)=>{
    setTimeout(render, 10);
  });

  initPointerLock();
  initCommandInput();
  initMoveOnClick();
  initSelectArea();

}

/**
 * Allows specifying an area of voxels. Used for digging.
 */
function initSelectArea() {
  renderer.domElement.addEventListener('click', ()=>{
    var selectToolActive = document.getElementById('selectTool').checked;
    if (controls.enabled && selectToolActive) {
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
        
        var luaString = 'return dig.digArea(' + [v1Lua, v2Lua, selectionIndex, scanLevel] + ');';
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
function initMoveOnClick() {
  renderer.domElement.addEventListener('click', ()=>{
    var moveToolActive = document.getElementById('moveTool').checked;
    if (controls.enabled && moveToolActive) {
      var coord = getWorldCoord(rollOverMesh.position);
      console.log(coord);
      var scanLevel = document.getElementById('scanWhileMoving').value;
      var luaString = 'return mas.to(' + [coord.x, coord.y, coord.z, scanLevel] + ');'
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