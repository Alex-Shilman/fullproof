const verifyToken = require('./utils');
const { app, session, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { isString } = require('lodash');
const inDebugMode = /debug/.test(process.argv[2]);
const PROTOCOL = 'fullproof';
const APP_NAME = 'FullProof App';
const QUIT_PATH = 'quit';
const headerOptions = {
  // need to spoof the userAgent for i-ready not to display black list message
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36' };
const KIOSK_MODE = false;

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

const createRecorderWindow = () => {
  recorderWindow = new BrowserWindow({
    width: 335,
    height: 320,
    modal: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      additionalArguments: ['test'],
      session,
    }
  });
  if (inDebugMode) {
    recorderWindow.webContents.openDevTools();
  }
  app.dock.hide();
  recorderWindow.setAlwaysOnTop(true, 'floating');
  recorderWindow.setVisibleOnAllWorkspaces(true);
  recorderWindow.setFullScreenable(false);
  app.dock.show();
  recorderWindow.loadURL(`file://${__dirname}/recorder/index.html`);
  recorderWindow.on('closed', () => recorderWindow = null)
};

const createWindow = async externalUrl => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    fullscreen: true,
    title: APP_NAME,
    kiosk: KIOSK_MODE,
    icon: path.join(__dirname, 'assets/fp-logo.png'),
    webPreferences: {
      nodeIntegration: true,
    }
  });
  mainWindow.setFullScreenable(true);
  mainWindow.webContents.on('dom-ready', () => {
    console.log('dom-ready');
  });
  
  mainWindow.once('ready-to-show', () => {
    console.log('ready-to-show');
    mainWindow.show();
  });
  
  mainWindow.on('show', () => {
    console.log('showing');
 });
  
  if (isString(externalUrl)) {
    const { pathname, query: { token } } = url.parse(externalUrl, true);
    const { error, decoded: { payload } = {} } = await verifyToken(token);
    (error) && console.log('error', error);
    
    const filter = {
      urls: [
        `http://*/`,
        'http://electra.i-ready.com/*',
        'https://electra.i-ready.com/*',
        'http://dev.i-ready.com:3000/*'
      ]
    };
    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      details.requestHeaders['User-Agent'] = headerOptions.userAgent;
      details.requestHeaders['Cookie'] = Object.keys(payload).map(key => `${key}=${payload[key]}`).join(';');
      callback({ requestHeaders: details.requestHeaders })
    });
    mainWindow.loadURL(`http://${externalUrl}`);
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`)
  }
  
  // and load the index.html of the app.
  // Open the DevTools.
  if (inDebugMode) {
    mainWindow.webContents.openDevTools();
  }
  
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    recorderWindow && recorderWindow.close();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // remove this if only want to open app from URL
  createWindow();
  createRecorderWindow();
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
    // createWindow();
  }
  
  if (recorderWindow === null) {
    // createRecorderWindow();
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
    createWindow(urlToLoad);
  }
  
  if (recorderWindow === null) {
    createRecorderWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
