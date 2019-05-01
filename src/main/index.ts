import {app, BrowserWindow} from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    height: 800,
    minHeight: 200,
    minWidth: 200,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1200,
  });
  win.loadFile('index.html');
}

app.on('ready', createWindow);
