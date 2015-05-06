var BrowserWindow = require('browser-window');

var app = require('app');

var mainWindow = null; // global reference to avoid premature GC

var Corpus = {
  start() {
    app.on('ready', () => {
      global.node_modules = 'file://' + __dirname + '/../../node_modules';
      mainWindow = new BrowserWindow({height: 800, show: false, width: 1200});
      mainWindow.loadUrl('file://' + __dirname + '/../index.html');
      mainWindow.show();

      mainWindow.on('closed', () => {
        mainWindow = null; // allow GC
      });
    });
  }
};

module.exports = Corpus;
