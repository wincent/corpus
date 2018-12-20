/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import '@babel/polyfill';
import {BrowserWindow, Menu, MenuItem, app, ipcMain} from 'electron';
import nullthrows from '../app/nullthrows';
import path from 'path';

import template from './menu/template';

import OperationsQueue from '../app/OperationsQueue';

// Global references to avoid premature GC.
let menu = null;
let mainWindow = null;

let deleteEnabled = false;
let previewEnabled = false;
let renameEnabled = false;
let revealEnabled = false;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 800,
    minWidth: 200,
    minHeight: 200,
    show: false,
    width: 1200,
    titleBarStyle: 'hidden',
  });
  mainWindow.loadURL('file://' + path.join(__dirname, '/../index.html'));
  mainWindow.webContents.on('did-finish-load', () =>
    nullthrows(mainWindow).show(),
  );

  ipcMain.on('title-menu', () => {
    const menu = new Menu();
    menu.append(
      new MenuItem({
        label: 'Switch notes', // if there are other notes directories
      }),
    );
    menu.popup(mainWindow);
  });

  // TODO: extract this into a better place and make it more flexible
  ipcMain.on('context-menu', () => {
    const contextualMenu = new Menu();
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Shift+Command+P',
        click: () => nullthrows(mainWindow).webContents.send('preview'),
        enabled: previewEnabled,
        label: 'Preview',
      }),
    );
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Shift+Command+R',
        click: () => nullthrows(mainWindow).webContents.send('reveal'),
        enabled: revealEnabled,
        label: 'Show in Finder',
      }),
    );
    contextualMenu.append(new MenuItem({type: 'separator'}));
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Command+R',
        click: () => nullthrows(mainWindow).webContents.send('rename'),
        enabled: renameEnabled,
        label: 'Rename',
      }),
    );
    contextualMenu.append(
      new MenuItem({
        accelerator: 'Command+Backspace',
        click: () => nullthrows(mainWindow).webContents.send('delete'),
        enabled: deleteEnabled,
        label: 'Delete...',
      }),
    );
    contextualMenu.popup(mainWindow);
  });

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  ipcMain.on('selection-count-changed', (event, newCount) => {
    const deleteItem = nullthrows(menu).items[1].submenu.items[1];
    const renameItem = nullthrows(menu).items[1].submenu.items[0];
    const previewItem = nullthrows(menu).items[1].submenu.items[5];
    const revealItem = nullthrows(menu).items[1].submenu.items[6];
    if (newCount === 0) {
      deleteItem.enabled = deleteEnabled = false;
      previewItem.enabled = previewEnabled = false;
      renameItem.enabled = renameEnabled = false;
      revealItem.enabled = revealEnabled = false;
    } else if (newCount === 1) {
      deleteItem.enabled = deleteEnabled = true;
      previewItem.enabled = previewEnabled = true;
      renameItem.enabled = renameEnabled = true;
      revealItem.enabled = revealEnabled = true;
    } else {
      deleteItem.enabled = deleteEnabled = true;
      previewItem.enabled = previewEnabled = false;
      renameItem.enabled = renameEnabled = false;
      revealItem.enabled = revealEnabled = false;
    }
  });

  mainWindow
    .on('blur', () => nullthrows(mainWindow).webContents.send('blur'))
    .on('closed', () => {
      // Allow GC:
      mainWindow = null;
      menu = null;

      // TODO: wait for queue to empty and exit; possibly show UI
      if (!OperationsQueue.size) {
        app.quit();
      }
    })
    .on('focus', () => nullthrows(mainWindow).webContents.send('focus'));
});
