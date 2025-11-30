const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aetherSystem', {
  // System Vital Statistics
  getStats: () => ipcRenderer.invoke('system:stats'),
  getSpecs: () => ipcRenderer.invoke('system:specs'),
  
  // Software Management
  getInstalledApps: () => ipcRenderer.invoke('system:get-installed-apps'),
  scanGames: () => ipcRenderer.invoke('system:scan-games'),
  
  // Execution
  launchGame: (game) => ipcRenderer.invoke('system:launch-game', game),
  launchApp: (path) => ipcRenderer.invoke('system:launch-app', path),
  openExternal: (url) => ipcRenderer.send('system:open-external', url),
  
  // Hardware Control
  getVolume: () => ipcRenderer.invoke('system:get-volume'),
  setVolume: (val) => ipcRenderer.send('system:set-volume', val),
  
  // File System
  readDir: (path) => ipcRenderer.invoke('fs:read-dir', path),
  writeFile: (data) => ipcRenderer.invoke('fs:write-file', data),
  createDir: (path) => ipcRenderer.invoke('fs:create-dir', path),
  rename: (data) => ipcRenderer.invoke('fs:rename', data),
  delete: (path) => ipcRenderer.invoke('fs:delete', path),
  readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
  getHomeDir: () => ipcRenderer.invoke('fs:get-home'),
  
  // Extended File System (New)
  trashItem: (path) => ipcRenderer.invoke('fs:trash-item', path),
  
  // Service Health (New)
  checkLocalService: (port) => ipcRenderer.invoke('system:check-service', port),

  // Events
  onGameActivity: (callback) => ipcRenderer.on('game:activity', (event, data) => callback(data)),
  
  // OS Shell Commands
  notification: (title, body) => ipcRenderer.send('os:notification', { title, body }),
  shutdown: () => ipcRenderer.send('system:shutdown'),
  reboot: () => ipcRenderer.send('system:reboot'),
  minimize: () => ipcRenderer.send('system:minimize'),
  
  // Environment Info
  platform: process.platform
});