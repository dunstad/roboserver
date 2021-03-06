const electron = require('electron')
// Module to control application life.
const electronApp = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// for making the refresh key work
const globalShortcut = electron.globalShortcut

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  
  // start the web server
  require('./bin/www')

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  // and load the index.html of the app.
  var webServerPort = require('./public/js/config/config.js').webServerPort;
  mainWindow.loadURL('http://127.0.0.1:' + webServerPort + '/login')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // make the refresh key work
  globalShortcut.register('f5', function() {
		console.log('f5 is pressed')
		mainWindow.reload()
	})
	globalShortcut.register('CommandOrControl+R', function() {
		console.log('CommandOrControl+R is pressed')
		mainWindow.reload()
	})

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electronApp.on('ready', ()=>{setTimeout(createWindow, 1000)})

// Quit when all windows are closed.
electronApp.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})