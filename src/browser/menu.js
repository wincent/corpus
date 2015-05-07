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
    label: 'Edit',
    submenu: [
      {
        accelerator: 'Command+Z',
        label: 'Undo',
        selector: 'undo:',
      },
      {
        accelerator: 'Shift+Command+Z',
        label: 'Redo',
        selector: 'redo:',
      },
      {type: 'separator'},
      {
        accelerator: 'Command+X',
        label: 'Cut',
        selector: 'cut:',
      },
      {
        accelerator: 'Command+C',
        label: 'Copy',
        selector: 'copy:',
      },
      {
        accelerator: 'Command+V',
        label: 'Paste',
        selector: 'paste:',
      },
      {type: 'separator',},
      {
        accelerator: 'Command+A',
        label: 'Select All',
        selector: 'selectAll:',
      },
    ]
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
