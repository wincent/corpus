/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

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
let revealEnabled = false;

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
        click: () => mainWindow.webContents.send('rename'),
        enabled: renameEnabled,
        label: 'Rename',
      })
    );
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Command+Backspace',
        click: () => mainWindow.webContents.send('delete'),
        enabled: deleteEnabled,
        label: 'Delete...',
      })
    );
    contextualMenu.append(
      new MenuItem({type: 'separator'})
    );
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Shift+Command+R',
        click: () => mainWindow.webContents.send('reveal'),
        enabled: revealEnabled,
        label: 'Show in Finder',
      })
    );
    contextualMenu.popup(mainWindow);
  });

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  ipc.on('selection-count-changed', (event, newCount) => {
    const deleteItem = menu.items[1].submenu.items[1];
    const renameItem = menu.items[1].submenu.items[0];
    const revealItem = menu.items[1].submenu.items[5];
    if (newCount === 0) {
      deleteItem.enabled = deleteEnabled = false;
      renameItem.enabled = renameEnabled = false;
      revealItem.enabled = revealEnabled = false;
    } else if (newCount === 1) {
      deleteItem.enabled = deleteEnabled = true;
      renameItem.enabled = renameEnabled = true;
      revealItem.enabled = revealEnabled = true;
    } else {
      deleteItem.enabled = deleteEnabled = true;
      renameItem.enabled = renameEnabled = false;
      revealItem.enabled = revealEnabled = false;
    }
  });

  mainWindow
    .on('blur', () => mainWindow.webContents.send('blur'))
    .on('closed', () => {
      // Allow GC:
      mainWindow = null;
      menu = null;
    })
    .on('focus', () => mainWindow.webContents.send('focus'));
});
