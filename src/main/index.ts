/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import {app, BrowserWindow} from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    height: 800,
    minHeight: 200,
    minWidth: 200,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1200,
  });
  win.loadFile('index.html');
}

app.on('ready', createWindow);
