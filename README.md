
---

# Aether OS

> An immersive, dual-mode operating system shell built with React, Vite, and Electron — blending console aesthetics with modern productivity tools. Designed for local AI integration, customization, and cross-platform deployment.

✨ **Features**

### 🎮 Dual Mode Interface
- **XMB Mode**: Gamepad-friendly horizontal media bar for launching apps/games.
- **Desktop Mode**: Mac-style dock + window management for productivity.

### 💻 System Applications
- **Nucleus Files**: File explorer with context menus and manipulation tools.
- **Aether AI**: Local LLM via Ollama — private, offline AI assistance [1].
- **User Management**: Multi-user support with admin privileges, custom themes, profile pictures.
- **Security**: Custom pattern-based lock screens for profiles.
- **Web Browser**: Integrated secure browser.
- **Productivity Suite**: Text Editor, Calculator, Paint, System Monitor.

### 🎨 Immersive Visuals
- Dynamic wave backgrounds reacting to system state [1].
- Fully responsive animations powered by Framer Motion [1].

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Ollama (Optional for AI features — run on `localhost:11434`)

### Installation
```bash
git clone https://github.com/DeltaEpiales/aether.git
cd aether-os
npm install
```

### Run in Development Mode
```bash
npm run dev:app
```
> Starts React dev server + Electron window.

---

## 🛠️ Building Executables

Package for distribution:

```bash
# Build for current OS
npm run dist

# Build specifically for Windows
npm run dist:win

# Build specifically for Mac (requires macOS)
npm run dist:mac

# Build specifically for Linux
npm run dist:linux
```

> Output files located in `release/`.

---

## 🎮 Controls

| Key        | Action                     |
|------------|----------------------------|
| F1         | Toggle XMB ↔ Desktop Mode  |
| H          | Toggle Dock visibility     |
| Arrow Keys | Navigate XMB Interface     |
| Enter      | Launch App / Select Item   |
| Backspace  | Go Back / Close App        |
| Right Click| Open Context Menu          |

---

## 📊 System & File Management (via IPC)

### System Specs
```js
ipcMain.handle('system:specs', async () => {
    // Returns CPU, RAM, OS, GPU info [2]
});
```

### File Operations
- `fs:create-dir`, `fs:write-file`, `fs:rename`, `fs:delete` — all handled via IPC with error handling and safe paths [2].
- Trash support (`trashItem`) and home directory access (`getHomeDir`) included.

---

## 📡 Network & Updates

### Auto Update Check
The app checks GitHub for the latest commit on `main` branch:

```js
const checkForUpdates = async () => {
    setUpdateStatus('checking');
    try {
        const res = await fetch('https://api.github.com/repos/DeltaEpiales/aether/commits/main');
        if (res.ok) {
            const data = await res.json();
            setRemoteCommit(data);
            setTimeout(() => setUpdateStatus('uptodate'), 1500);
        } else {
            setUpdateStatus('error');
        }
    } catch (e) {
        setUpdateStatus('error');
    }
};
```

> Status shown in UI: `Up to Date`, `Checking`, or `Connection Failed`.

---

## 📁 File System API (Exposed via preload.cjs)

```js
contextBridge.exposeInMainWorld('aetherSystem', {
  getSpecs: () => ipcRenderer.invoke('system:specs'),
  createDir: (path) => ipcRenderer.invoke('fs:create-dir', path),
  delete: (path) => ipcRenderer.invoke('fs:delete', path),
  readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
  getHomeDir: () => ipcRenderer.invoke('fs:get-home'),
  trashItem: (path) => ipcRenderer.invoke('fs:trash-item', path),
});
```

---

## 🧩 Shell Commands & Events

### OS Shell
- `shutdown`, `reboot`, `minimize` — exposed via IPC.
- `notification(title, body)` for system alerts.

### Game Activity
```js
onGameActivity(callback) => ipcRenderer.on('game:activity', (event, data) => callback(data));
```

---

## 📄 License

MIT License  
Copyright (c) 2025 R.O. - Aether Dev  

Permission is hereby granted to any person obtaining a copy of this software and associated documentation files (“Software”) to use, copy, modify, merge, publish, distribute, sublicense, or sell copies of the Software, subject to conditions.

---

## 📎 Contributing

Fork → Clone → Commit → Push → PR.  
All contributions welcome — especially for AI integration, UI polish, and cross-platform stability.

---

## 🌐 GitHub Repo

[https://github.com/DeltaEpiales/aether](https://github.com/DeltaEpiales/aether)

---

## ✅ Notes

- Built with React + Vite + Electron.
- Uses `si` (system info) for hardware detection [2].
- Audio control via `loudness` module — fallback to 100% if unavailable.
- File system operations sandboxed in user’s `Documents/AetherOS_Files`.

---
