const verifyToken = require('./utils');
const createRecorderWindowCreator = require('./recorderWindow/main');
const createMainWindowCreator = require('./mainWindow/main');
const { app, session, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { isString } = require('lodash');
const inDebugMode = /debug/.test(process.argv[2]);
const PROTOCOL = 'fullproof';
const QUIT_PATH = 'quit';
const APP_NAME = 'FullProof App';

(process.mas) && app.setName(APP_NAME);
app.setAsDefaultProtocolClient(PROTOCOL);
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let recorderWindow = null;

const createRecorderWindow = createRecorderWindowCreator({
  inDebugMode, BrowserWindow, session, app
});

const createMainWindow = createMainWindowCreator({
  inDebugMode, BrowserWindow, session, verifyToken, url, path, isString
});

const recorderWindowCreator = () => {
  recorderWindow = createRecorderWindow();
  recorderWindow.on('closed', () => recorderWindow = null);
};

const mainWindowCreator = async (externalUrl) => {
  mainWindow = await createMainWindow(externalUrl);
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
    recorderWindow && recorderWindow.close();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // remove this if only want to open app from URL
  mainWindowCreator();
  recorderWindowCreator();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    // mainWindowCreator();
  }
  
  if (recorderWindow === null) {
    // recorderWindowCreator();
  }
});

app.on('open-url', (event, url) => {
  console.log('open-url', url);
  let urlToLoad;
  if (isString(url)) {
    urlToLoad = url.split(`${PROTOCOL}://`)[1];
    if (urlToLoad === QUIT_PATH) {
      return app.quit();
    }
  }
 
  if (mainWindow === null) {
    mainWindowCreator(urlToLoad);
  }
  
  if (recorderWindow === null) {
    recorderWindowCreator();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
