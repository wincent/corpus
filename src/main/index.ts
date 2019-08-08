/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import * as os from 'os';

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

  // TODO in dev only, add existence checks
  BrowserWindow.addDevToolsExtension(
    path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Google',
      'Chrome',
      'Profile 1',
      'Extensions',
      'fmkadmapgofadopljbjfkapdkoienihi',
      '3.6.0_0',
    ),
  );
}

app.on('ready', createWindow);
