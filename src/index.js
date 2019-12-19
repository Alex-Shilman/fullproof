const { app, session, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { isString } = require('lodash');
const inDebugMode = /debug/.test(process.argv[2]);
const PROTOCOL = 'fullproof';
const APP_NAME = 'FullProof App';
const QUIT_PATH = 'quit';
const headerOptions = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36' };
const KIOSK_MODE = false;

require('electron-reload')(__dirname);

(process.mas) && app.setName(APP_NAME);
app.setAsDefaultProtocolClient(PROTOCOL);
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let recorderWindow;

const createRecorderWindow = () => {
  recorderWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      additionalArguments: ['test'],
      session,
    }
  });
  if (inDebugMode) {
    recorderWindow.webContents.openDevTools();
  }
  recorderWindow.loadURL(`file://${__dirname}/recorder/index.html`);
  recorderWindow.on('closed', () => recorderWindow = null)
};

const createWindow = (externalUrl) => {
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
  const mainSession = mainWindow.webContents.session;
  
  mainWindow.webContents.on('dom-ready', () => {
    console.log('dom-ready');
  });
  
  mainWindow.once('ready-to-show', () => {
    console.log('ready-to-show')
    mainWindow.show();
  });
  
  mainWindow.on('show', () => {
    console.log('showing');
    mainWindow.webContents.session.cookies.get({})
      .then(cookies => {
        // console.log('------on show cookies');
        // console.log(cookies);
        // console.log('------on show cookies');
      })
      .catch(error => {
        console.log('on show error');
      });
 });
  
  if (isString(externalUrl)) {
    const { pathname, query: { token } } = url.parse(externalUrl, true);
    const cookie = {
      url : `https://${pathname}`,
      name : 'test',
      value : token,
      domain: '.i-ready.com'
    };
    console.log(cookie);
    const cookies = {
      AWSALB:"2IHa8aoWfHIw5KLAP2XcwJ5icaWyaDp5z5uTj9EtQB8DH1ukA1gCtgwZl13QMA9aOoiD8Hj3Bx+KJPPMn5P3YxijpM3eBZLSN5JgLgXKUUyaGJq/WviJwratHCm0",
      JSESSIONID:"6E61BE62E1046ADE1E816160A55E5809"
    };
    const filter = {
      urls: [`http://*/`, 'http://electra.i-ready.com/*', 'https://electra.i-ready.com/*']
    };
    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      details.requestHeaders['User-Agent'] = headerOptions.userAgent;
      details.requestHeaders['Cookie'] = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';');
      callback({ requestHeaders: details.requestHeaders })
    });
    mainWindow.loadURL(`http://${externalUrl}`);
    // mainWindow.loadURL(`http://${externalUrl}`, headerOptions)
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`)
    // mainWindow.loadURL(`about:blank`)
  }
  
  // and load the index.html of the app.
  session.defaultSession.cookies.get({})
    .then((cookies) => {
      // console.log('-------defaultSession---------')
      // console.log(cookies)
      // console.log('-------defaultSession---------')
    }).catch((error) => {
    console.log(error)
  });
  mainSession.cookies.get({})
    .then((cookies) => {
      // console.log('------cookies------');
      // console.log(cookies);
      // console.log('------cookies------');
    }).catch((error) => {
      console.log('error');
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
app.on('ready', () => {
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
