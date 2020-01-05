
module.exports = createRecorderWindowCreator = ({
  inDebugMode, BrowserWindow, session, app
}) => {
  return _ => {
      const recorderWindow = new BrowserWindow({
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
      // recorderWindow.setVisibleOnAllWorkspaces(true);
      recorderWindow.setFullScreenable(false);
      app.dock.show();
      recorderWindow.loadURL(`file://${__dirname}/index.html`);
      return recorderWindow;
  }
}