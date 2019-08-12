/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import {app, BrowserWindow} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {promisify} from 'util';

const exists = promisify(fs.exists);

function onReady() {
  createWindow();
  loadReactDevTools();
}

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

async function loadReactDevTools() {
  // TODO: make this less crude (ie. maybe search for latest version or
  // something)
  const extension = path.join(
    os.homedir(),
    'Library',
    'Application Support',
    'Google',
    'Chrome',
    'Profile 1',
    'Extensions',
    'fmkadmapgofadopljbjfkapdkoienihi',
    '3.6.0_0',
  );

  const extensionExists = await exists(extension);

  if (extensionExists) {
    BrowserWindow.addDevToolsExtension(extension);
  }
}

app.on('ready', onReady);
