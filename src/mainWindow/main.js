const APP_NAME = 'FullProof App';
const headerOptions = {
  // need to spoof the userAgent for i-ready not to display black list message
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
};
const KIOSK_MODE = false;

module.exports = createMainWindowCreator = ({
  inDebugMode, BrowserWindow, session, verifyToken, url, path, isString
}) => {
  return async (
    externalUrl
  ) => {
    const mainWindow = new BrowserWindow({
      show: false,
      width: 800,
      height: 600,
      fullscreen: true,
      title: APP_NAME,
      kiosk: KIOSK_MODE,
      icon: path.join(__dirname, '..','assets', 'icons', 'fp-logo-64.png'),
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
      const { error, decoded: { payload = {}} = {} } = await verifyToken(token);
      (error) && console.log('error', error);
      // only open the following urls
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
      console.log('opening', externalUrl);
      mainWindow.loadURL(`http://${externalUrl}`);
    } else {
      mainWindow.loadURL(`file://${__dirname}/index.html`)
    }
  
    // and load the index.html of the app.
    // Open the DevTools.
    if (inDebugMode) {
      mainWindow.webContents.openDevTools();
    }
    return mainWindow;
  }
};