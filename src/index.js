const { app, session, BrowserWindow } = require('electron');
const { isString } = require('lodash');
const inDebugMode = /debug/.test(process.argv[2]);
const PROTOCOL = 'fullproof';
const APP_NAME = 'FullProof App';
const KIOSK_MODE = false;
(process.mas) && app.setName(APP_NAME);
app.setAsDefaultProtocolClient(PROTOCOL);
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = (url) => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    fullscreen: true,
    title: APP_NAME,
    kiosk: KIOSK_MODE,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  const mainSession = mainWindow.webContents.session;
  
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  });
  // and load the index.html of the app.
  mainWindow.loadURL(isString(url) ? `http://${url}` : `file://${__dirname}/index.html`);
  session.defaultSession.cookies.get({})
    .then((cookies) => {
      console.log(cookies)
    }).catch((error) => {
    console.log(error)
  })
  mainSession.cookies.get({}, (error, cookies) => {
    console.log('cookies', cookies);
  });
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
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
    createWindow();
  }
});

app.on('open-url', (event, url) => {
  let urlToLoad;
  if (isString(url)) {
    urlToLoad = url.split(`${PROTOCOL}://`)[1];
  }
 
  if (mainWindow === null) {
    createWindow(urlToLoad);
  }
  // dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
