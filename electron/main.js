const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  return;
}

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Live reload functionality
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../node_modules/.bin/electron`),
      hardResetMethod: 'exit'
    });
  } catch (error) {
    console.log('electron-reload not installed, skipping...');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow external URL
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: '29 Jewellery - Sales Management',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('https://saleapp.29jewellery.com');
    // mainWindow.loadURL('http://localhost:5174');

    mainWindow.webContents.openDevTools();
  } else {
    // Load live website in production mode
    mainWindow.loadURL('https://saleapp.29jewellery.com');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
