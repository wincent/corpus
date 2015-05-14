// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import BrowserWindow from 'browser-window';
import Menu from 'menu';
import MenuItem from 'menu-item';
import app from 'app';
import ipc from 'ipc';
import path from 'path';

import menu from './menu';

let mainWindow = null; // global reference to avoid premature GC

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 800,
    'min-width': 400,
    'min-height': 200,
    show: false,
    width: 1200,
  });
  mainWindow.loadUrl('file://' + path.join(__dirname, '/../index.html'));
  mainWindow.webContents.on('did-finish-load', () => mainWindow.show());

  // TODO: extract this into a better place and make it more flexible
  var contextualMenu = new Menu();
  contextualMenu.append(
    new MenuItem({
      accelerator: 'Command+R',
      click: () => console.log('contextual-menu: rename'),
      label: 'Rename',
    })
  );
  ipc.on('context-menu', () => contextualMenu.popup(mainWindow));

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(menu)
  );

  mainWindow
    .on('blur', () => mainWindow.webContents.send('blur'))
    .on('closed', () => mainWindow = null) // allow GC
    .on('focus', () => mainWindow.webContents.send('focus'));
});
