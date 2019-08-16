/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import {app, BrowserWindow, Menu} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {promisify} from 'util';
import template from './template';

const exists = promisify(fs.exists);

// Global references to avoid premature GC.
let menu: Menu;
let mainWindow: BrowserWindow;

function onReady() {
  createWindow();
  buildMenu();
  loadReactDevTools();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 800,
    minHeight: 200,
    minWidth: 200,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1200,
  });

  mainWindow.loadFile('index.html');

  mainWindow
    .on('blur', () => mainWindow.webContents.send('blur'))
    .on('focus', () => mainWindow.webContents.send('focus'));
}

function buildMenu() {
  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

const REACT_DEVELOPER_TOOLS = 'React Developer Tools';

async function loadReactDevTools() {
  if (BrowserWindow.getExtensions().hasOwnProperty(REACT_DEVELOPER_TOOLS)) {
    BrowserWindow.removeExtension(REACT_DEVELOPER_TOOLS);
  }

  const base = path.join(
    os.homedir(),
    'Library',
    'Application Support',
    'Google',
    'Chrome',
    'Profile 1',
    'Extensions',
    'fmkadmapgofadopljbjfkapdkoienihi',
  );

  const versions = [
    '4.0.2_0',
    '3.6.0_0',
  ];

  for (const version of versions) {
    const extension = path.join(base, version);
    const extensionExists = await exists(extension);

    if (extensionExists) {
      // TODO: maybe only do this when NODE_ENV !== 'production'
      BrowserWindow.addDevToolsExtension(extension);
      return;
    }
  }
}

app.on('ready', onReady);
