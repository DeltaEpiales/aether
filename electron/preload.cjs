const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aetherSystem', {
  getStats: () => ipcRenderer.invoke('system:stats'),
  getSpecs: () => ipcRenderer.invoke('system:specs'), // NEW
  getInstalledApps: () => ipcRenderer.invoke('system:get-installed-apps'),
  scanSteamGames: () => ipcRenderer.invoke('system:scan-steam'),
  
  // File System (Enhanced)
  readDir: (path) => ipcRenderer.invoke('fs:read-dir', path),
  writeFile: (data) => ipcRenderer.invoke('fs:write-file', data),
  readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
  getHomeDir: () => ipcRenderer.invoke('fs:get-home'),
  
  // App Launchers
  launchApp: (path) => ipcRenderer.invoke('system:launch-app', path),
  launchSteam: (id) => ipcRenderer.invoke('system:launch-steam', id),
  openExternal: (url) => ipcRenderer.send('system:open-external', url),
  
  // OS Functions
  readClipboard: () => ipcRenderer.invoke('os:read-clipboard'),
  writeClipboard: (text) => ipcRenderer.send('os:write-clipboard', text),
  sendNotification: (title, body) => ipcRenderer.send('os:notification', { title, body }),
  
  // Window/Power
  shutdown: () => ipcRenderer.send('system:shutdown'),
  reboot: () => ipcRenderer.send('system:reboot'),
  restartShell: () => ipcRenderer.send('system:restart-shell'), // NEW
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  
  platform: process.platform,
});