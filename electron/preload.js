// Preload script for Electron
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
});
