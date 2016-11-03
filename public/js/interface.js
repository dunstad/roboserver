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
socket.on('robot location', (data)=>{
  console.dir(data);
});

// add functionality to command input field
var commandInput = document.getElementById('commandInput');
commandInput.addEventListener("change", (event)=>{

  // display command
  addMessage(event.target.value, true);

  // send command to the web server
  socket.emit('command', event.target.value);

  // clear input text
  event.target.value = '';

});

function addMessage(text, isInput) {
  var subClass = isInput ? 'input' : 'output';
  var element = document.createElement('div');
  element.appendChild(document.createTextNode(text));
  element.classList.add('message');
  element.classList.add(subClass);
  document.getElementById('messageContainer').insertBefore(element, commandInput);
  document.getElementById('messageContainer').insertBefore(document.createElement('br'), commandInput);
}
