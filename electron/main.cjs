const { app, BrowserWindow, ipcMain, shell, Notification, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const si = require('systeminformation'); 

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false, 
    fullscreen: true, // OS Shell Mode
    kiosk: true,      
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false 
    },
    backgroundColor: '#000000',
  });

  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- KERNEL MODULES ---

// 1. Hardware Stats (Dynamic)
ipcMain.handle('system:stats', async () => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const battery = await si.battery();
    const disk = await si.fsSize();
    const mainDrive = disk.length > 0 ? disk[0] : { use: 0 };
    return {
      cpu: Math.round(cpu.currentLoad),
      ram: Math.round((mem.active / mem.total) * 100),
      battery: battery.hasBattery ? battery.percent : 100,
      charging: battery.isCharging,
      disk: Math.round(mainDrive.use)
    };
  } catch (e) { return { cpu: 0, ram: 0, battery: 100, disk: 0 }; }
});

// 2. Hardware Specs (Static Info for "About")
ipcMain.handle('system:specs', async () => {
    try {
        const cpu = await si.cpu();
        const mem = await si.mem();
        const osInfo = await si.osInfo();
        const graphics = await si.graphics();
        return {
            cpu: `${cpu.manufacturer} ${cpu.brand}`,
            ram: `${Math.round(mem.total / 1024 / 1024 / 1024)} GB`,
            os: `${osInfo.distro} ${osInfo.release}`,
            gpu: graphics.controllers.length > 0 ? graphics.controllers[0].model : 'Integrated Graphics'
        };
    } catch (e) {
        return { cpu: 'Unknown', ram: '0 GB', os: 'Aether OS', gpu: 'Generic' };
    }
});

// 3. Power Management & Updates
ipcMain.on('system:shutdown', () => require('child_process').exec('shutdown /s /t 0'));
ipcMain.on('system:reboot', () => require('child_process').exec('shutdown /r /t 0'));
ipcMain.on('system:restart-shell', () => {
    app.relaunch();
    app.exit(0);
});

// 4. App Discovery
ipcMain.handle('system:get-installed-apps', async () => {
  const appList = [];
  const startMenuPaths = [
    path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];
  const scanDir = (dir) => {
    try {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) scanDir(fullPath);
        else if (file.toLowerCase().endsWith('.lnk')) {
          const name = file.slice(0, -4);
          if (!name.toLowerCase().includes('uninstall') && !name.toLowerCase().includes('help')) {
            appList.push({ name: name, path: fullPath });
          }
        }
      }
    } catch (e) { }
  };
  startMenuPaths.forEach(p => scanDir(p));
  return appList.sort((a, b) => a.name.localeCompare(b.name));
});

// 5. Steam Scan
ipcMain.handle('system:scan-steam', async () => {
  const games = [];
  const steamPaths = [
    path.join('C:', 'Program Files (x86)', 'Steam', 'steamapps'),
  ];
  for (const steamPath of steamPaths) {
    if (fs.existsSync(steamPath)) {
      try {
        const files = fs.readdirSync(steamPath);
        const acfFiles = files.filter(f => f.endsWith('.acf'));
        for (const file of acfFiles) {
          const content = fs.readFileSync(path.join(steamPath, file), 'utf-8');
          const nameMatch = content.match(/"name"\s+"([^"]+)"/);
          const idMatch = content.match(/"appid"\s+"(\d+)"/);
          if (nameMatch && idMatch) games.push({ name: nameMatch[1], id: idMatch[1] });
        }
      } catch (e) {}
    }
  }
  return games;
});

// 6. File System (REAL IO)
ipcMain.handle('fs:read-dir', async (event, dirPath) => {
  try {
    const target = dirPath || os.homedir();
    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
         return { error: `Path not found or not a directory: ${target}` }; 
    }
    const items = fs.readdirSync(target, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(target, item.name),
      size: item.isDirectory() ? 0 : (fs.statSync(path.join(target, item.name)).size / 1024).toFixed(1) // KB
    })).filter(i => !i.name.startsWith('.'));
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('fs:write-file', async (event, { filename, content }) => {
  try {
    const documentsPath = path.join(os.homedir(), 'Documents');
    if (!fs.existsSync(documentsPath)) fs.mkdirSync(documentsPath, { recursive: true });
    
    const targetPath = path.join(documentsPath, filename);
    fs.writeFileSync(targetPath, content, 'utf-8');
    return { success: true, path: targetPath };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('fs:read-file', async (event, filePath) => {
    try {
        if (!fs.existsSync(filePath)) return { error: 'File not found' };
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
    } catch (e) {
        return { success: false, error: e.message };
    }
});


ipcMain.handle('fs:get-home', () => os.homedir());

// 7. Native Launchers
ipcMain.handle('system:launch-app', async (event, appPath) => {
  try { shell.openPath(appPath); return { success: true }; } catch (e) { return { success: false, error: e.message }; }
});
ipcMain.handle('system:launch-steam', async (event, appId) => { shell.openExternal(`steam://run/${appId}`); });
ipcMain.on('system:open-external', (event, url) => shell.openExternal(url));

// 8. OS Functions
ipcMain.handle('os:read-clipboard', () => clipboard.readText());
ipcMain.on('os:write-clipboard', (event, text) => clipboard.writeText(text));

ipcMain.on('os:notification', (event, { title, body }) => {
    new Notification({ title, body, silent: false }).show();
});

// Window Controls
ipcMain.on('window:minimize', () => BrowserWindow.getFocusedWindow()?.minimize());
ipcMain.on('window:close', () => app.quit());