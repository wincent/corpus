'use strict';

import BrowserWindow from 'browser-window';
import app from 'app';

const menu = [
  {
    label: 'Corpus',
    submenu: [
      {
        label: 'About Corpus',
        selector: 'orderFrontStandardAboutPanel:',
      },
      {type: 'separator'},
         {
        label: 'Services',
        submenu: [],
      },
      {type: 'separator'},
      {
        accelerator: 'Command+H',
        label: 'Hide Corpus',
        selector: 'hide:',
      },
      {
        accelerator: 'Alt+Command+H',
        label: 'Hide Others',
        selector: 'hideOtherApplications:',
      },
      {
        label: 'Show All',
        selector: 'unhideAllApplications:',
      },
      {type: 'separator'},
      {
        accelerator: 'Command+Q',
        click: () => app.quit(),
        label: 'Quit Corpus',
      },
    ],
  },
  {
    label: 'Debug',
    submenu: [
      {
        accelerator: 'Command+R',
        click: () => BrowserWindow.getFocusedWindow().reloadIgnoringCache(),
        label: 'Reload',
      },
      {
        accelerator: 'Alt+Command+I',
        click: () => BrowserWindow.getFocusedWindow().toggleDevTools(),
        label: 'Toggle Developer Tools',
      },
    ],
  }
];

export default menu;
