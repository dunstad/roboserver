// For easy use from the dev console

var commandInput = document.getElementById("commandInput");
var runInTerminal = document.getElementById("runInTerminal");
var craftButton = document.getElementById("craftButton");
var craftSelect = document.getElementById("craftSelect");

function sendEnter(elem) {
  var e = new Event("keydown");
  e.keyCode = 13;
  elem.dispatchEvent(e);
}

function send(command, asShell) {
  if (asShell) {runInTerminal.checked = true;}
  else {runInTerminal.checked = false;}
  commandInput.value = command;
  sendEnter(commandInput);
}

function craft(itemName) {
  $('.selectpicker').selectpicker('val', itemName);
  craftButton.click();
}