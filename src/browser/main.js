'use strict';

import BrowserWindow from 'browser-window';
import Menu from 'menu';
import app from 'app';

import menu from './menu';

let mainWindow = null; // global reference to avoid premature GC

app.on('ready', () => {
  mainWindow = new BrowserWindow({height: 800, show: false, width: 1200});
  mainWindow.loadUrl('file://' + __dirname + '/../index.html');
  mainWindow.show();

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(menu)
  );

  mainWindow.on('closed', () => {
    mainWindow = null; // allow GC
  });
});
