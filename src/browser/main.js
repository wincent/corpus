// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import BrowserWindow from 'browser-window';
import Menu from 'menu';
import MenuItem from 'menu-item';
import app from 'app';
import ipc from 'ipc';
import path from 'path';

import template from './menu/template';

// Global references to avoid premature GC.
let menu = null;
let mainWindow = null;

let deleteEnabled = false;
let renameEnabled = false;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 800,
    'min-width': 200,
    'min-height': 200,
    show: false,
    width: 1200,
  });
  mainWindow.loadUrl('file://' + path.join(__dirname, '/../index.html'));
  mainWindow.webContents.on('did-finish-load', () => mainWindow.show());

  // TODO: extract this into a better place and make it more flexible
  ipc.on('context-menu', () => {
    const contextualMenu = new Menu();
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Command+R',
        click: () => console.log('contextual-menu: rename'),
        enabled: renameEnabled,
        label: 'Rename',
      })
    );
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Command+Backspace',
        click: () => console.log('contextual-menu: delete'),
        enabled: deleteEnabled,
        label: 'Delete...',
      })
    );
    contextualMenu.popup(mainWindow);
  });

  menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu);

  ipc.on('selection-count-changed', (event, newCount) => {
    if (newCount === 0) {
      deleteEnabled = false;
      menu.items[1].submenu.items[1].enabled = false;
      renameEnabled = false;
      menu.items[1].submenu.items[0].enabled = false;
    } else if (newCount === 1) {
      deleteEnabled = true;
      menu.items[1].submenu.items[1].enabled = true;
      renameEnabled = true;
      menu.items[1].submenu.items[0].enabled = true;
    } else {
      deleteEnabled = true;
      menu.items[1].submenu.items[1].enabled = true;
      renameEnabled = false;
      menu.items[1].submenu.items[0].enabled = false;
    }
  });

  mainWindow
    .on('blur', () => mainWindow.webContents.send('blur'))
    .on('closed', () => {
      // Allow GC;
      mainWindow = null;
      menu = null;
    })
    .on('focus', () => mainWindow.webContents.send('focus'));
});
