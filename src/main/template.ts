/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import {BrowserWindow, MenuItemConstructorOptions, app} from 'electron';

function getWebContents() {
  return BrowserWindow.getFocusedWindow()!.webContents;
}

const template: MenuItemConstructorOptions[] = [
  {
    label: 'Corpus',
    submenu: [
      {
        label: 'About Corpus',
        role: 'about',
      },
      {type: 'separator'},
      {
        role: 'services',
      },
      {type: 'separator'},
      {
        label: 'Hide Corpus',
        role: 'hide',
      },
      {
        role: 'hideothers',
      },
      {
        role: 'unhide',
      },
      {type: 'separator'},
      {
        accelerator: 'Command+Q',
        // TODO: don't quit immediately if file system operation is pending
        click: () => app.quit(),
        label: 'Quit Corpus',
      },
    ],
  },
  {
    label: 'Note',
    submenu: [
      {
        accelerator: 'Alt+Command+R',
        click: () => getWebContents().send('rename'),
        enabled: false,
        id: 'rename',
        label: 'Rename',
      },
      {
        accelerator: 'Command+Backspace',
        click: () => getWebContents().send('delete'),
        enabled: false,
        id: 'delete',
        label: 'Delete...',
      },
      {type: 'separator'},
      {
        accelerator: 'Command+L',
        label: 'Search or Create...', // TODO: use a real ellipsis?
        click: () => getWebContents().send('search'),
      },
      {type: 'separator'},
      {
        accelerator: 'Shift+Command+P',
        click: () => getWebContents().send('preview'),
        id: 'preview',
        label: 'Preview',
      },
      {
        accelerator: 'Shift+Command+R',
        click: () => getWebContents().send('reveal'),
        id: 'reveal',
        label: 'Show in Finder',
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {type: 'separator'},
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
      {type: 'separator'},
      {
        role: 'selectall',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        accelerator: 'Command+J',
        click: () => getWebContents().send('next'),
        label: 'Next Note',
      },
      {
        accelerator: 'Command+K',
        click: () => getWebContents().send('previous'),
        label: 'Previous Note',
      },
    ],
  },
  {
    label: 'Debug',
    submenu: [
      {
        role: 'reload',
      },
      {
        role: 'toggledevtools',
      },
    ],
  },
  {
    label: 'Window',
    submenu: [
      {
        role: 'minimize',
      },
      {
        role: 'close',
      },
      {type: 'separator'},
      {
        role: 'front',
      },
    ],
  },
  {
    label: 'Help',
    submenu: [],
  },
];

export default template;
