const { app, BrowserWindow, ipcMain, shell, Notification, clipboard, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const si = require('systeminformation');
const { exec, spawn } = require('child_process');

// --- SYSTEM MODULES ---
let loudness;
try { loudness = require('loudness');
} catch (e) { console.warn("Loudness module not loaded:", e.message); }

const isDev = !app.isPackaged;
let mainWindow;

// --- PERSISTENCE LAYER ---
const USER_DATA_PATH = app.getPath('userData');
const GAME_DB_PATH = path.join(USER_DATA_PATH, 'aether_gamestats.json');

// --- GAME MANAGER CLASS ---
class GameManager {
  constructor() {
    this.games = [];
    this.monitorInterval = null;
    this.loadDb();
  }

  loadDb() {
    try {
      if (fs.existsSync(GAME_DB_PATH)) {
        const data = fs.readFileSync(GAME_DB_PATH, 'utf-8');
        this.savedStats = JSON.parse(data);
      } else {
        this.savedStats = {};
      }
    } catch (e) { 
      console.error("Failed to load game DB:", e);
      this.savedStats = {}; 
    }
  }

  saveDb() {
    const data = {};
    this.games.forEach(g => {
      data[g.id] = { timePlayed: g.timePlayed, lastPlayed: g.lastPlayed };
    });
    try {
      fs.writeFileSync(GAME_DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) { console.error("Failed to save game DB:", e); }
  }

  async scan() {
    this.games = [];
    // 1. STEAM SCANNER
    const steamPaths = [
      path.join('C:', 'Program Files (x86)', 'Steam'),
      path.join('C:', 'Program Files', 'Steam'),
      path.join('D:', 'SteamLibrary'),
      path.join('E:', 'SteamLibrary')
    ];

    for (const root of steamPaths) {
      const appsPath = path.join(root, 'steamapps');
      if (fs.existsSync(appsPath)) {
        try {
          const files = fs.readdirSync(appsPath).filter(f => f.endsWith('.acf'));
          for (const file of files) {
            const content = fs.readFileSync(path.join(appsPath, file), 'utf-8');
            const nameMatch = content.match(/"name"\s+"([^"]+)"/);
            const idMatch = content.match(/"appid"\s+"(\d+)"/);
            const installDirMatch = content.match(/"installdir"\s+"([^"]+)"/);
            
            if (nameMatch && idMatch) {
              const id = `steam_${idMatch[1]}`;
              let exe = `${nameMatch[1]}.exe`;
              if (installDirMatch) {
                 const gamePath = path.join(appsPath, 'common', installDirMatch[1]);
                 if(fs.existsSync(gamePath)) {
                    const exes = fs.readdirSync(gamePath)
                        .filter(f => f.endsWith('.exe'))
                        .map(f => ({ name: f, size: fs.statSync(path.join(gamePath, f)).size }))
                        .sort((a,b) => b.size - a.size);
                    if(exes.length > 0) exe = exes[0].name; 
                 }
              }

              this.games.push({
                id: id,
                realId: idMatch[1],
                name: nameMatch[1],
                source: 'Steam',
                path: installDirMatch ? path.join(appsPath, 'common', installDirMatch[1]) : '',
                exe: exe.toLowerCase(),
                timePlayed: this.savedStats[id]?.timePlayed || 0,
                lastPlayed: this.savedStats[id]?.lastPlayed || null
              });
            }
          }
        } catch (e) { console.error(`Error scanning Steam at ${root}:`, e); }
      }
    }

    // 2. EPIC GAMES SCANNER
    const epicManifestPath = path.join(process.env.ProgramData || 'C:\\ProgramData', 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests');
    if (fs.existsSync(epicManifestPath)) {
        try {
            const files = fs.readdirSync(epicManifestPath).filter(f => f.endsWith('.item'));
            for(const file of files) {
                const content = JSON.parse(fs.readFileSync(path.join(epicManifestPath, file), 'utf-8'));
                const id = `epic_${content.AppName}`;
                this.games.push({
                    id: id,
                    realId: content.AppName,
                    name: content.DisplayName,
                    source: 'Epic',
                    path: content.InstallLocation,
                    exe: path.basename(content.LaunchExecutable).toLowerCase(),
                    timePlayed: this.savedStats[id]?.timePlayed || 0,
                    lastPlayed: this.savedStats[id]?.lastPlayed || null
                });
            }
        } catch(e) { console.error("Epic Scan Error", e); }
    }
    return this.games;
  }

  startMonitoring(win) {
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    this.monitorInterval = setInterval(() => {
      exec('tasklist /FO CSV /NH', (err, stdout, stderr) => {
        if (err || !stdout) return;
        const runningProcs = stdout.toLowerCase();
        let found = false;

        this.games.forEach(game => {
          if (game.exe && runningProcs.includes(`"${game.exe.toLowerCase()}"`)) {
            game.timePlayed += (5 / 60); 
            game.lastPlayed = Date.now();
            found = true;
            win.webContents.send('game:activity', { 
                id: game.id, 
                status: 'running', 
                timePlayed: Math.round(game.timePlayed) 
            });
          }
        });
        if (found) this.saveDb();
      });
    }, 5000);
  }
}

const gameManager = new GameManager();

// --- WINDOW CREATION ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false, 
    fullscreen: true,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false 
    }
  });
  
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  gameManager.startMonitoring(mainWindow);
}

// --- APP LIFECYCLE ---
app.whenReady().then(async () => {
    nativeTheme.themeSource = 'dark';
    createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC API HANDLERS ---

// 1. HARDWARE STATS
ipcMain.handle('system:stats', async () => {
  try {
    const [cpuLoad, mem, battery, fsSize] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.battery(),
        si.fsSize()
    ]);
    const mainDrive = fsSize.length > 0 ? fsSize[0] : { use: 0 };
    return {
      cpu: Math.round(cpuLoad.currentLoad),
      ram: Math.round((mem.active / mem.total) * 100),
      battery: battery.hasBattery ? battery.percent : 100,
      charging: battery.isCharging,
      disk: Math.round(mainDrive.use)
    };
  } catch (e) {
    return { cpu: 0, ram: 0, battery: 100, disk: 0 };
  }
});

ipcMain.handle('system:specs', async () => {
    try {
        const [cpu, mem, osInfo, graphics] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.osInfo(),
            si.graphics()
        ]);
        return {
            cpu: `${cpu.manufacturer} ${cpu.brand}`,
            ram: `${Math.round(mem.total / 1024 / 1024 / 1024)} GB`,
            os: `${osInfo.distro} ${osInfo.release}`,
            gpu: graphics.controllers.length > 0 ? graphics.controllers[0].model : 'Integrated Graphics'
        };
    } catch (e) {
        return { cpu: 'Unknown', ram: 'Unknown', os: 'Windows (Unknown)', gpu: 'Generic' };
    }
});

// 2. AUDIO CONTROL
ipcMain.handle('system:get-volume', async () => {
    if (!loudness) return 100;
    try { return await loudness.getVolume(); } catch (e) { return 100; }
});

ipcMain.on('system:set-volume', async (event, volume) => {
    if (!loudness) return;
    try { await loudness.setVolume(Math.round(volume)); } catch (e) { console.error("Volume Error:", e); }
});

// 3. POWER & SHELL
ipcMain.on('system:shutdown', () => exec('shutdown /s /t 0'));
ipcMain.on('system:reboot', () => exec('shutdown /r /t 0'));
ipcMain.on('system:minimize', () => mainWindow.minimize());

// 4. APP DISCOVERY
ipcMain.handle('system:get-installed-apps', async () => {
  if (process.platform !== 'win32') return []; 
  
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
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.toLowerCase().endsWith('.lnk')) {
          const name = file.slice(0, -4);
          if (!name.toLowerCase().includes('uninstall') && !name.toLowerCase().includes('readme') && !name.toLowerCase().includes('help')) {
             appList.push({ name: name, path: fullPath });
          }
        }
      }
    } catch (e) { console.error("Start menu scan error:", e); }
  };

  startMenuPaths.forEach(p => scanDir(p));
  return [...new Map(appList.map(item => [item['name'], item])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
});

// 5. GAME LAUNCHER
ipcMain.handle('system:scan-games', async () => {
  return await gameManager.scan();
});

ipcMain.handle('system:launch-game', async (event, game) => {
    try {
        if (game.source === 'Steam') {
            shell.openExternal(`steam://run/${game.realId}`);
        } else if (game.source === 'Epic') {
            shell.openExternal(`com.epicgames.launcher://apps/${game.realId}?action=launch&silent=true`);
        } else {
            shell.openPath(game.path);
        }
        return true;
    } catch (e) { return false; }
});

// 6. FILE SYSTEM
ipcMain.handle('fs:read-dir', async (event, dirPath) => {
  try {
    const target = dirPath || os.homedir();
    if (!fs.existsSync(target)) return { error: 'Path does not exist' };
    const items = fs.readdirSync(target, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(target, item.name),
      size: item.isDirectory() ? 0 : (fs.statSync(path.join(target, item.name)).size / 1024).toFixed(1)
    })).filter(i => !i.name.startsWith('.') && !i.name.startsWith('$')); 
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('fs:write-file', async (event, { filename, content }) => {
  try {
    const safeDir = path.join(os.homedir(), 'Documents', 'AetherOS_Files');
    if (!fs.existsSync(safeDir)) fs.mkdirSync(safeDir, { recursive: true });
    const targetPath = path.join(safeDir, filename);
    fs.writeFileSync(targetPath, content, 'utf-8');
    return { success: true, path: targetPath };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('fs:create-dir', async (event, dirPath) => {
  try {
      if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          return { success: true };
      }
      return { success: false, error: 'Directory already exists' };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('fs:rename', async (event, { oldPath, newPath }) => {
  try {
      fs.renameSync(oldPath, newPath);
      return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('fs:delete', async (event, targetPath) => {
    try {
        if (fs.existsSync(targetPath)) {
            // Use shell trash first, fallback to force delete
            try {
                await shell.trashItem(targetPath);
                return { success: true };
            } catch {
                fs.rmSync(targetPath, { recursive: true, force: true });
                return { success: true };
            }
        }
        return { success: false, error: 'Path not found' };
    } catch (e) { return { success: false, error: e.message }; }
});


ipcMain.handle('fs:get-home', () => os.homedir());

// 7. NATIVE LAUNCHER
ipcMain.handle('system:launch-app', async (event, appPath) => {
  try { 
      if (appPath === 'calc') { exec('calc.exe'); return { success: true }; }
      if (appPath === 'paint') { exec('mspaint.exe'); return { success: true }; }
      if (appPath === 'cmd') { spawn('start', ['cmd.exe'], { shell: true }); return { success: true }; }
      shell.openPath(appPath); 
      return { success: true }; 
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.on('system:open-external', (event, url) => shell.openExternal(url));

// 8. OS UTILS
ipcMain.on('os:notification', (event, { title, body }) => {
    new Notification({ title, body }).show();
});

// 9. EXTENDED FILE SYSTEM (Recycle Bin)
ipcMain.handle('fs:trash-item', async (event, filePath) => {
  try {
    await shell.trashItem(filePath);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 10. SERVICE HEALTH CHECK
ipcMain.handle('system:check-service', async (event, port) => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    return response.ok || response.status === 404;
  } catch (e) {
    return false;
  }
});