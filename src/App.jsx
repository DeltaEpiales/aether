import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Settings, Image as ImageIcon, Music, Video, Gamepad2, Globe, Users, 
  Folder, Power, Wifi, Battery, Clock, Monitor, HardDrive, FileText, X, 
  Maximize2, Minimize2, Play, Star, Trophy, MoreHorizontal, Volume2, 
  Bluetooth, Shield, Smartphone, Cpu, Zap, Disc, Code, Terminal, 
  Brush, Calculator, Layout, Package, CloudRain, User, Plus, Trash2,
  Bot, Send, User as UserIcon, RefreshCw, ArrowLeft, File, Save,
  Layers, Download, Calendar, Command, Minus, Palette, Copy, Link, Lock,
  ArrowUp, ArrowDown, ArrowRight, Check, AlertCircle, LogOut, Home, Menu,
  Search, AppWindow, Activity, Info, GitBranch
} from 'lucide-react';

/* --- 1. UTILITIES & HOOKS --- */

const useSound = () => {
  const audioCtx = useRef(null);
  const [volume, setVolume] = useState(0.15); 

  const playTone = useCallback((freq, type, duration) => {
    if (typeof window === 'undefined') return;
    try {
        if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration); 
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) { }
  }, [volume]);

  return { 
    playNav: () => playTone(250, 'sine', 0.08),
    playSelect: () => playTone(500, 'triangle', 0.1),
    playBack: () => playTone(150, 'sine', 0.15),
    playError: () => playTone(80, 'sawtooth', 0.2),
    playLogin: () => {
      playTone(200, 'sine', 0.4);
      setTimeout(() => playTone(400, 'sine', 0.8), 150);
      setTimeout(() => playTone(800, 'sine', 1.5), 300);
    },
    playSuccess: () => {
        playTone(600, 'sine', 0.1);
        setTimeout(() => playTone(800, 'sine', 0.15), 50);
    },
    playFail: () => {
        playTone(100, 'sawtooth', 0.05);
        setTimeout(() => playTone(80, 'sawtooth', 0.1), 50);
    },
    setVolume, volume
  };
};

// Internal Navigation Hook for Apps
const useMenuNav = (itemCount, orientation = 'vertical', isActive = true) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { playNav } = useSound();

    useEffect(() => {
        if (!isActive) return;
        const handleKeyDown = (e) => {
            e.stopPropagation(); 
            if (orientation === 'vertical') {
                if (e.key === 'ArrowUp') { setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount); playNav(); }
                if (e.key === 'ArrowDown') { setSelectedIndex(prev => (prev + 1) % itemCount); playNav(); }
            } else {
                if (e.key === 'ArrowLeft') { setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount); playNav(); }
                if (e.key === 'ArrowRight') { setSelectedIndex(prev => (prev + 1) % itemCount); playNav(); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [itemCount, orientation, isActive, playNav]);
    return { selectedIndex, setSelectedIndex };
};

const getHueFromHex = (hex) => {
    if (hex.length !== 7 || hex === '#000000') return 210;
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
        const d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return Math.round(h * 360);
};

const shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    R = Math.min(255, Math.max(0, R * (1 + percent)));
    G = Math.min(255, Math.max(0, G * (1 + percent)));
    B = Math.min(255, Math.max(0, B * (1 + percent)));
    const rr = ((R.toFixed(0).length === 1) ? "0" + R.toFixed(0) : R.toFixed(0));
    const gg = ((G.toFixed(0).length === 1) ? "0" + G.toFixed(0) : G.toFixed(0));
    const bb = ((B.toFixed(0).length === 1) ? "0" + B.toFixed(0) : B.toFixed(0));
    return `#${rr}${gg}${bb}`;
}

/* --- 2. WAVE ENGINE --- */
const WaveBackground = ({ bgColor, waveHue, dynamicWave, speedMultiplier = 1 }) => {
  const canvasRef = useRef(null);
  const ambientColor = 'rgba(100, 100, 150, 0.08)';
  const currentWaveHue = useRef(waveHue);
  const currentBgColor = useRef(bgColor);
  const particlesRef = useRef(Array.from({length: 80}, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2 + 1,
    angle: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.004 + 0.001,
    opacity: Math.random() * 0.1
  })));

  useEffect(() => { currentWaveHue.current = waveHue; currentBgColor.current = bgColor; }, [waveHue, bgColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;
    let t = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const drawWave = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
      gradient.addColorStop(0, currentBgColor.current);
      gradient.addColorStop(0.6, shadeColor(currentBgColor.current, -0.4));
      gradient.addColorStop(1, '#000000');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = ambientColor;
      particlesRef.current.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed * speedMultiplier * 0.5;
        p.y += Math.sin(p.angle) * p.speed * speedMultiplier * 0.5;
        if (p.x > 1) p.x = 0; if (p.x < 0) p.x = 1;
        if (p.y > 1) p.y = 0; if (p.y < 0) p.y = 1;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(p.x * w, p.y * h, p.size, p.size);
      });
      ctx.globalAlpha = 1.0;

      ctx.globalCompositeOperation = 'screen';
      const lines = 28;
      const centerY = h * 0.65;
      let waveBaseHue = dynamicWave ? currentWaveHue.current : getHueFromHex(currentBgColor.current);

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const hue = waveBaseHue + (i * 1.5);
        const alpha = (Math.sin(t * 0.1 + i * 0.1) * 0.5 + 0.5) * 0.15;
        ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${alpha})`;
        ctx.lineWidth = 3;
        for (let blur = -1; blur <= 1; blur += 1) {
            ctx.globalAlpha = alpha * (1 - Math.abs(blur) * 0.5);
            for (let x = 0; x <= w + 50; x += 15) {
                const yOffset = Math.sin(x * 0.0015 + t * 0.25 + i * 0.08) * 100 + Math.cos(x * 0.003 - t * 0.15) * 40;
                const y = centerY + yOffset + blur * 2;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }
      t += 0.006 * speedMultiplier;
      animationFrameId = requestAnimationFrame(drawWave);
    };
    drawWave();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, [speedMultiplier, dynamicWave]);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

/* --- 3. INTERNAL APPS (System Apps) --- */

const AboutSystemApp = ({ close }) => {
    const [specs, setSpecs] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('idle'); // idle, checking, available, updating, restarting
    const [progress, setProgress] = useState(0);
    const repoUrl = "YOUR_USERNAME/YOUR_REPO"; // User to configure

    useEffect(() => {
        const loadSpecs = async () => {
            if (window.aetherSystem?.getSpecs) {
                const s = await window.aetherSystem.getSpecs();
                setSpecs(s);
            } else {
                setSpecs({ cpu: 'Simulated CPU', ram: '16 GB', os: 'Web Browser', gpu: 'WebGL Renderer' });
            }
        };
        loadSpecs();
    }, []);

    const checkForUpdates = () => {
        setUpdateStatus('checking');
        setTimeout(() => {
            // Mocking a successful check. In production, fetch(`https://api.github.com/repos/${repoUrl}/releases/latest`)
            setUpdateStatus('available');
        }, 1500);
    };

    const installUpdate = () => {
        setUpdateStatus('updating');
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 10;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setUpdateStatus('restarting');
                setTimeout(() => {
                    if (window.aetherSystem?.restartShell) window.aetherSystem.restartShell();
                    else window.location.reload();
                }, 2000);
            }
            setProgress(p);
        }, 300);
    };

    return (
        <div className="flex flex-col h-full p-8 text-white">
            <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity size={48} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-light tracking-tight">Aether OS</h1>
                    <div className="text-sm opacity-50 font-mono mt-1">Version 1.2.0 (Stable)</div>
                    <div className="text-xs opacity-30 mt-1 uppercase tracking-widest">Kernel: {window.aetherSystem?.platform || 'Web'}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded border border-white/5">
                    <div className="text-xs uppercase opacity-40 mb-1">Processor</div>
                    <div className="font-mono text-sm truncate" title={specs?.cpu}>{specs?.cpu || 'Loading...'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded border border-white/5">
                    <div className="text-xs uppercase opacity-40 mb-1">Memory</div>
                    <div className="font-mono text-sm">{specs?.ram || 'Loading...'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded border border-white/5">
                    <div className="text-xs uppercase opacity-40 mb-1">Graphics</div>
                    <div className="font-mono text-sm truncate" title={specs?.gpu}>{specs?.gpu || 'Loading...'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded border border-white/5">
                    <div className="text-xs uppercase opacity-40 mb-1">System Type</div>
                    <div className="font-mono text-sm">{specs?.os || 'Loading...'}</div>
                </div>
            </div>

            <div className="mt-auto bg-black/40 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-blue-400"/>
                        <span className="text-sm font-bold">System Update</span>
                    </div>
                    {updateStatus === 'idle' && (
                        <button onClick={checkForUpdates} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors">Check Now</button>
                    )}
                </div>

                {updateStatus === 'checking' && <div className="text-xs opacity-50 animate-pulse">Contacting update server...</div>}
                
                {updateStatus === 'available' && (
                    <div className="flex items-center justify-between bg-green-500/10 p-2 rounded border border-green-500/20">
                        <div className="text-xs text-green-400">New patch available via GitHub</div>
                        <button onClick={installUpdate} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold shadow-lg shadow-green-500/20">Install & Restart</button>
                    </div>
                )}

                {updateStatus === 'updating' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs opacity-50">
                            <span>Downloading patch...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
                        </div>
                    </div>
                )}

                {updateStatus === 'restarting' && <div className="text-xs text-blue-400 animate-pulse">Rebooting Kernel...</div>}
            </div>
        </div>
    )
}

const SystemMonitorApp = ({ close }) => {
  const [stats, setStats] = useState({ cpu: 0, ram: 0, battery: 100, disk: 0 });
  const [history, setHistory] = useState(new Array(20).fill(0));

  useEffect(() => {
    const fetchStats = async () => {
      if (window.aetherSystem?.getStats) {
        const s = await window.aetherSystem.getStats();
        setStats(s);
        setHistory(prev => [...prev.slice(1), s.cpu]);
      } else {
        const mockCpu = Math.floor(Math.random() * 30) + 10;
        setStats({ cpu: mockCpu, ram: 45, battery: 98, disk: 120 });
        setHistory(prev => [...prev.slice(1), mockCpu]);
      }
    };
    const interval = setInterval(fetchStats, 1000);
    fetchStats();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-full p-8 text-white font-mono">
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white/5 p-6 rounded border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
           <div className="absolute top-0 right-0 p-2 opacity-20"><Cpu size={48}/></div>
           <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Processor Load</div>
           <div className="text-5xl font-light mb-4">{stats.cpu}%</div>
           <div className="flex items-end gap-1 h-12">
              {history.map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-500/50" style={{ height: `${h}%` }}></div>
              ))}
           </div>
        </div>
        <div className="bg-white/5 p-6 rounded border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
           <div className="absolute top-0 right-0 p-2 opacity-20"><Zap size={48}/></div>
           <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Memory Usage</div>
           <div className="text-5xl font-light mb-4">{stats.ram}%</div>
           <div className="w-full h-2 bg-white/10 rounded-full mt-auto">
               <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${stats.ram}%` }}></div>
           </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/5 p-4 rounded flex items-center gap-4 border border-white/10">
              <Battery size={24} className={stats.battery < 20 ? 'text-red-500' : 'text-green-400'} />
              <div><div className="text-xl">{stats.battery}%</div><div className="text-[10px] uppercase opacity-50">Power Cell</div></div>
          </div>
          <div className="bg-white/5 p-4 rounded flex items-center gap-4 border border-white/10">
              <HardDrive size={24} className="text-orange-400" />
              <div><div className="text-xl">{stats.disk} GB</div><div className="text-[10px] uppercase opacity-50">Primary Vol</div></div>
          </div>
          <div className="bg-white/5 p-4 rounded flex items-center gap-4 border border-white/10">
              <Shield size={24} className="text-blue-400" />
              <div><div className="text-xl">SECURE</div><div className="text-[10px] uppercase opacity-50">Kernel Status</div></div>
          </div>
      </div>
    </div>
  );
};

const FileManagerApp = ({ close }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selectedIndex, setSelectedIndex } = useMenuNav(files.length > 0 ? files.length : 1, 'vertical', true);
  const { playSelect } = useSound();

  useEffect(() => {
    const init = async () => {
      if (window.aetherSystem?.getHomeDir) {
        const home = await window.aetherSystem.getHomeDir();
        loadDir(home);
      } else {
        setFiles([{name: 'Simulated C:', isDirectory: true, path: 'C:'}]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
        if (e.key === 'Enter') {
            const file = files[selectedIndex];
            if (file && file.isDirectory) {
                playSelect();
                loadDir(file.path);
            }
        }
        if (e.key === 'Backspace') {
             goUp();
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [files, selectedIndex, playSelect, currentPath]);

  const loadDir = async (path) => {
    setLoading(true);
    try {
      const items = await window.aetherSystem.readDir(path);
      if (!items.error) {
        setFiles(items);
        setCurrentPath(path);
        setSelectedIndex(0); 
      }
    } catch (e) {}
    setLoading(false);
  };

  const goUp = () => {
    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parent = currentPath.substring(0, currentPath.lastIndexOf(separator));
    if (parent) loadDir(parent);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 text-white">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2 bg-black/20 p-2 rounded">
        <button onClick={goUp} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={16} /></button>
        <span className="text-xs font-mono opacity-70 truncate select-all">{currentPath || 'ROOT'}</span>
      </div>
      <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-1 pr-2">
        {loading ? <div className="text-xs animate-pulse p-4">ACCESSING DISK...</div> : files.map((f, i) => (
          <div key={i} 
               onClick={() => f.isDirectory ? loadDir(f.path) : null} 
               className={`flex items-center gap-4 p-3 border rounded cursor-pointer transition-all ${i === selectedIndex ? 'bg-white/20 border-white/30 scale-[1.01]' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
            <div className={`${f.isDirectory ? 'text-yellow-400' : 'text-blue-400'}`}>{f.isDirectory ? <Folder size={18} /> : <File size={18} />}</div>
            <div className="flex-1 text-sm font-mono tracking-wide truncate text-slate-300 group-hover:text-white">{f.name}</div>
            {!f.isDirectory && <div className="text-[10px] opacity-40 font-mono">{f.size} KB</div>}
          </div>
        ))}
        {files.length === 0 && !loading && <div className="p-4 text-white/30 text-xs font-mono">Directory Empty</div>}
      </div>
      <div className="h-6 border-t border-white/10 flex items-center justify-end px-2 gap-4 text-[10px] text-white/40 font-mono mt-2">
          <span>[ARROWS] Navigate</span>
          <span>[ENTER] Open</span>
          <span>[BACKSPACE] Up</span>
      </div>
    </div>
  );
};

const InstalledApps = ({ close }) => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const { selectedIndex, setSelectedIndex } = useMenuNav(apps.length, 'vertical', true);
    const { playSelect } = useSound();

    useEffect(() => {
        const load = async () => {
            if (window.aetherSystem?.getInstalledApps) {
                const list = await window.aetherSystem.getInstalledApps();
                setApps(list);
            } else {
                setApps([{name: 'Chrome', path: ''}, {name: 'Spotify', path: ''}]);
            }
            setLoading(false);
        }
        load();
    }, []);

    const launch = (app) => {
        playSelect();
        if(window.aetherSystem?.launchApp) window.aetherSystem.launchApp(app.path);
        window.aetherSystem?.sendNotification('App Launched', `Starting ${app.name}`);
        close(); 
    }

    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === 'Enter' && apps.length > 0) {
                launch(apps[selectedIndex]);
            }
        };
        window.addEventListener('keydown', handleEnter);
        return () => window.removeEventListener('keydown', handleEnter);
    }, [selectedIndex, apps, close]);

    return (
        <div className="flex flex-col h-full p-6 text-white">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6">Local Applications</h2>
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2 content-start">
                {loading && <div className="text-xs animate-pulse">Scanning Drive C:...</div>}
                {apps.map((app, i) => (
                    <div key={i} onClick={() => launch(app)} 
                         className={`p-3 rounded border cursor-pointer flex items-center gap-3 transition-all ${i === selectedIndex ? 'bg-white/20 border-white/40 scale-105 shadow-lg' : 'bg-white/5 border-white/5 opacity-80'}`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-black rounded flex items-center justify-center text-xs font-bold">{app.name.charAt(0)}</div>
                        <span className="text-xs font-medium truncate">{app.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const SettingsApp = ({ currentUser, settings, updateSetting, close }) => {
    const menuItems = ['color', 'wave', 'speed', 'back'];
    const { selectedIndex } = useMenuNav(menuItems.length, 'vertical', true);
    const { playSelect } = useSound();

    useEffect(() => {
        const handleAdjust = (e) => {
            const item = menuItems[selectedIndex];
            if (item === 'speed') {
                if (e.key === 'ArrowRight' || e.key === 'Enter') updateSetting('speed', Math.min(3, settings.speed + 0.5));
                if (e.key === 'ArrowLeft') updateSetting('speed', Math.max(0.5, settings.speed - 0.5));
            }
            if (item === 'wave') {
                if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') updateSetting('dynamicWave', !settings.dynamicWave);
            }
            if (item === 'back' && e.key === 'Enter') { playSelect(); close(); }
        };
        window.addEventListener('keydown', handleAdjust);
        return () => window.removeEventListener('keydown', handleAdjust);
    }, [selectedIndex, settings, updateSetting, close, playSelect]);

    return (
        <div className="p-8 text-white h-full overflow-y-auto flex flex-col">
            <h2 className="text-xl uppercase tracking-widest border-b border-white/10 pb-4 mb-6 text-blue-400">System Configuration</h2>
            <div className="space-y-6 flex-1">
                <section className={`p-4 rounded border transition-all ${selectedIndex === 0 ? 'bg-white/10 border-blue-400/50' : 'bg-transparent border-transparent opacity-60'}`}>
                    <h3 className="text-xs uppercase opacity-50 mb-2">Primary Background Color</h3>
                    <div className="flex items-center gap-4">
                        <input type="color" value={settings.bgColor} onChange={(e) => updateSetting('bgColor', e.target.value)} className="w-10 h-10 p-0 border-none rounded-full overflow-hidden cursor-pointer" />
                        <span className="font-mono text-sm">{settings.bgColor}</span>
                    </div>
                </section>
                <section className={`p-4 rounded border transition-all ${selectedIndex === 1 ? 'bg-white/10 border-blue-400/50' : 'bg-transparent border-transparent opacity-60'}`}>
                    <h3 className="text-xs uppercase opacity-50 mb-2">Wave Dynamics</h3>
                    <div className="flex justify-between items-center">
                        <span>{settings.dynamicWave ? 'Dynamic (XMB Style)' : 'Static (Mono Style)'}</span>
                        <div className={`w-4 h-4 rounded-full ${settings.dynamicWave ? 'bg-green-400 shadow-[0_0_10px_lime]' : 'bg-slate-600'}`}></div>
                    </div>
                    <div className="text-[10px] opacity-40 mt-1">[ENTER] to Toggle</div>
                </section>
                <section className={`p-4 rounded border transition-all ${selectedIndex === 2 ? 'bg-white/10 border-blue-400/50' : 'bg-transparent border-transparent opacity-60'}`}>
                    <h3 className="text-xs uppercase opacity-50 mb-2">Animation Speed</h3>
                    <div className="flex items-center gap-4">
                        <input type="range" min="0.5" max="3" step="0.5" value={settings.speed} onChange={(e) => updateSetting('speed', parseFloat(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        <span className="font-mono">{settings.speed}x</span>
                    </div>
                    <div className="text-[10px] opacity-40 mt-1">[LEFT/RIGHT] to Adjust</div>
                </section>
            </div>
            <button onClick={close} className={`mt-4 p-4 rounded border text-center font-bold tracking-widest uppercase transition-all ${selectedIndex === 3 ? 'bg-red-500/20 border-red-500 text-white' : 'border-white/10 text-white/50'}`}>Close Settings</button>
        </div>
    )
}

const UserManagementApp = ({ close, users, currentUser, updateUsers, updateLockPattern }) => {
    const [mode, setMode] = useState('list');
    const [newUser, setNewUser] = useState('');
    const [newUserColor, setNewUserColor] = useState('#3b82f6');
    const [status, setStatus] = useState('');
    const [tempPattern, setTempPattern] = useState([]);
    const { selectedIndex, setSelectedIndex } = useMenuNav(users.length + 1, 'vertical', mode === 'list');
    const { playSelect, playError, playSuccess } = useSound();
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (mode === 'list') {
                if (e.key === 'Enter') {
                    if (selectedIndex === users.length) { setMode('add'); playSelect(); } 
                }
                if (e.key === 'Delete') {
                    const userToDelete = users[selectedIndex];
                    if (userToDelete) handleDeleteUser(userToDelete.id, userToDelete.name);
                }
            } else if (mode === 'add') {
                if (e.key === 'Escape') setMode('list');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, selectedIndex, users]);

    const handleAddUser = () => {
        if (newUser.trim() === '' || users.find(u => u.name === newUser)) { setStatus('Error: Invalid name'); playError(); return; }
        const user = { id: `u${Date.now()}`, name: newUser, pattern: '', color: newUserColor }; 
        updateUsers([...users, user]);
        setNewUser('');
        setMode('list');
        playSuccess();
    };

    const handleDeleteUser = (id, name) => {
        if (id === currentUser.id) { setStatus("Cannot delete active user"); playError(); } 
        else if (users.length === 1) { setStatus("Cannot delete last user"); playError(); } 
        else { updateUsers(users.filter(u => u.id !== id)); setStatus(`Deleted ${name}`); playSuccess(); }
        setTimeout(() => setStatus(''), 2000);
    };

    const keyMap = { 'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right', 'Enter': 'enter' };
    const handlePatternRecord = (e) => {
        e.stopPropagation();
        if (mode !== 'pattern') return;
        if (keyMap[e.key]) { if (tempPattern.length < 8) setTempPattern(p => [...p, keyMap[e.key]]); }
    };
    
    useEffect(() => {
        if (mode === 'pattern') {
            window.addEventListener('keydown', handlePatternRecord);
            return () => window.removeEventListener('keydown', handlePatternRecord);
        }
    }, [mode, tempPattern]);

    const savePattern = () => {
        if (tempPattern.length >= 4) {
            updateLockPattern(currentUser.id, tempPattern.join(','));
            setMode('list'); setTempPattern([]); playSuccess();
        } else { setStatus('Min 4 moves required'); playError(); }
    }

    return (
        <div className="p-8 text-white h-full overflow-y-auto font-mono flex flex-col">
            <h2 className="text-xl uppercase tracking-widest border-b border-white/10 pb-4 mb-4 text-blue-400 flex justify-between">
                <span>User Management</span>
                <span className="text-xs text-red-400">{status}</span>
            </h2>
            {mode === 'list' && (
                <div className="flex flex-col gap-2">
                    {users.map((u, i) => (
                        <div key={u.id} className={`flex items-center justify-between p-4 rounded border transition-all ${i === selectedIndex ? 'bg-white/20 border-white/40 scale-[1.02]' : 'bg-white/5 border-transparent opacity-70'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-black" style={{backgroundColor: u.color || '#ccc'}}>{u.name.charAt(0)}</div>
                                <div><div className="text-sm font-bold uppercase tracking-wider">{u.name}</div><div className="text-[10px] opacity-50">{u.id === currentUser.id ? 'ACTIVE SESSION' : 'OFFLINE'}</div></div>
                            </div>
                            {u.id === currentUser.id ? (<button onClick={() => setMode('pattern')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] uppercase tracking-widest">Change Pattern</button>) : (<Trash2 size={16} className="text-red-400" />)}
                        </div>
                    ))}
                    <div className={`mt-4 p-3 border-2 border-dashed border-white/20 rounded flex items-center justify-center gap-2 cursor-pointer transition-all ${selectedIndex === users.length ? 'bg-blue-500/20 border-blue-500 text-white' : 'text-white/30'}`}><Plus size={16} /> <span className="uppercase tracking-widest text-xs">Register New User</span></div>
                    <div className="mt-8 text-[10px] text-white/30 flex justify-between"><span>[ARROWS] Select</span><span>[ENTER] Action</span><span>[DEL] Remove User</span></div>
                </div>
            )}
            {mode === 'add' && (
                <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-sm uppercase tracking-widest opacity-70">New User Registration</h3>
                    <input value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="User Name" className="bg-transparent border-b border-white/50 py-2 text-2xl outline-none focus:border-blue-500 transition-colors" autoFocus onKeyDown={(e) => e.stopPropagation()} />
                    <div className="flex gap-4">{colors.map(c => (<div key={c} onClick={() => setNewUserColor(c)} className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${newUserColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-50'}`} style={{backgroundColor: c}} />))}</div>
                    <div className="flex gap-4 mt-4"><button onClick={handleAddUser} className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors">Confirm</button><button onClick={() => setMode('list')} className="px-6 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors">Cancel</button></div>
                </div>
            )}
            {mode === 'pattern' && (
                <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-in fade-in zoom-in-95">
                    <div className="text-sm uppercase tracking-widest text-yellow-400">Recording Pattern for {currentUser.name}</div>
                    <div className="flex gap-2 h-12 items-center bg-black/40 p-2 rounded-lg border border-white/10 min-w-[200px] justify-center">
                        {tempPattern.map((move, index) => {
                            const rotation = move === 'down' ? 'rotate-180' : move === 'left' ? '-rotate-90' : move === 'right' ? 'rotate-90' : 'rotate-0';
                            const Icon = move === 'enter' ? Check : ArrowUp;
                            return (<div key={index} className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded border border-blue-500/50 animate-in zoom-in duration-200"><Icon size={16} className={`text-white transform ${rotation}`} /></div>);
                        })}
                    </div>
                    <div className="flex gap-4"><button onClick={() => setTempPattern([])} className="text-xs text-red-400">RESET</button><button onClick={savePattern} className="px-6 py-2 bg-green-600 rounded text-sm font-bold tracking-widest">SAVE</button><button onClick={() => setMode('list')} className="px-6 py-2 bg-white/10 rounded text-sm">CANCEL</button></div>
                    <div className="text-[10px] opacity-40">Use Arrow Keys + Enter</div>
                </div>
            )}
        </div>
    );
};

const PlaceholderApp = ({ title, close }) => (
    <div className="flex items-center justify-center h-full text-white/50 font-mono text-xs tracking-widest p-8">{title} Component Initialized. Functionality must be implemented via Electron I/O.</div>
);

const TextEditorApp = ({ close }) => {
    const [content, setContent] = useState(localStorage.getItem('aether_editor_content') || 'Welcome to Aether Text Editor.');
    const [filename, setFilename] = useState(localStorage.getItem('aether_editor_filename') || 'NewDocument.txt');
    const [status, setStatus] = useState('');
    const handleTypingKeyDown = (e) => e.stopPropagation();

    const saveFile = async () => {
        if (!window.aetherSystem?.writeFile) {
            setStatus('Simulated Save Success');
            localStorage.setItem('aether_editor_content', content);
            localStorage.setItem('aether_editor_filename', filename);
            setTimeout(() => setStatus(''), 3000);
            return;
        }
        setStatus('Saving...');
        const res = await window.aetherSystem.writeFile({ filename, content });
        if (res.success) { setStatus(`Saved`); window.aetherSystem?.sendNotification('File Saved', `Document "${filename}" saved successfully.`); } else { setStatus(`Error`); }
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <div className="flex flex-col h-full w-full p-4 text-white">
          <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2"><FileText size={16} className="text-blue-400"/><input value={filename} onChange={(e) => setFilename(e.target.value)} onKeyDown={handleTypingKeyDown} className="bg-transparent text-sm border-b border-transparent focus:border-white/20 outline-none w-40 font-mono" placeholder="filename.txt" /></div>
            <div className="flex items-center gap-4"><span className="text-[10px] opacity-50 font-mono">{status}</span><button onClick={saveFile} className="p-1 hover:bg-white/10 rounded" title="Save File"><Save size={16}/></button><button onClick={close} className="p-1 hover:bg-red-500/20 rounded"><X size={16}/></button></div>
          </div>
          <textarea className="flex-1 bg-transparent text-white text-sm font-mono resize-none focus:outline-none p-2" value={content} onChange={e => setContent(e.target.value)} onKeyDown={handleTypingKeyDown} />
        </div>
    );
};

const WindowedApp = ({ title, onClose, children }) => {
  useEffect(() => {
    const handleGlobalClose = (e) => {
        if (e.key === 'Escape' || e.key === 'Backspace') { e.stopPropagation(); onClose(); }
    };
    window.addEventListener('keydown', handleGlobalClose);
    return () => window.removeEventListener('keydown', handleGlobalClose);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#0b0e14]/90 w-[85%] h-[80%] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white relative ring-1 ring-white/10 rounded-lg">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70"></div>
        <div className="h-10 bg-[#161b22] flex items-center justify-between px-4 border-b border-white/5 select-none shrink-0">
          <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div><span className="text-white font-bold tracking-[0.2em] text-[10px] uppercase font-mono">{title}</span></div>
          <div className="flex items-center gap-2"><span className="text-[9px] uppercase opacity-30 mr-2 tracking-widest hidden md:block">Press ESC to Close</span><button onClick={onClose} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all bg-white/5 hover:bg-white/10 p-1.5 rounded"><X size={14} /></button></div>
        </div>
        <div className="flex-1 overflow-hidden bg-[#050505]/80 relative backdrop-blur-xl">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
          <div className="relative z-10 h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

const LockScreen = ({ users, currentUser, onUnlock, onSwitchUser, playSuccess, playFail, updateLockPattern }) => {
    const isSetupMode = !currentUser.pattern || currentUser.pattern === '';
    const isNoLock = currentUser.pattern === 'none';
    const [status, setStatus] = useState(isSetupMode ? 'CREATE PASSCODE' : (isNoLock ? 'PRESS ENTER' : 'ENTER PASSCODE'));
    const [inputMode, setInputMode] = useState(isSetupMode); 
    const [patternInput, setPatternInput] = useState([]);
    const [errorCount, setErrorCount] = useState(0);
    const patternRef = useRef(patternInput);
    patternRef.current = patternInput;
    
    const keyMap = { 'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right', 'Enter': 'enter' };
    const userPattern = currentUser.pattern ? currentUser.pattern.split(',') : ['up', 'up', 'down', 'down'];
    
    const handleKeydown = useCallback((e) => {
        e.preventDefault(); e.stopPropagation(); 
        if (isSetupMode) {
            if (e.key === ' ') { 
                if (patternRef.current.length < 4) { setStatus('MIN 4 MOVES REQUIRED'); playFail(); return; }
                updateLockPattern(currentUser.id, patternRef.current.join(','));
                playSuccess(); setStatus('PATTERN SAVED'); setTimeout(onUnlock, 600); return;
            }
            if (e.key.toLowerCase() === 'n' && patternRef.current.length === 0) { updateLockPattern(currentUser.id, 'none'); playSuccess(); onUnlock(); return; }
            if (keyMap[e.key]) { if (patternRef.current.length < 8) setPatternInput(prev => [...prev, keyMap[e.key]]); }
            return;
        }
        if (isNoLock) { if (e.key === 'Enter') { playSuccess(); onUnlock(); } return; }
        if (!keyMap[e.key] || !inputMode) { if(!inputMode) { setInputMode(true); setStatus(`ENTER PATTERN FOR ${currentUser.name}`); } return; }
        
        if (keyMap[e.key]) {
            const newPattern = [...patternRef.current, keyMap[e.key]];
            setPatternInput(newPattern);
            setStatus('VERIFYING...');
            if (newPattern.length === userPattern.length) {
                if (newPattern.join(',') === userPattern.join(',')) { playSuccess(); setStatus('ACCESS GRANTED'); setTimeout(onUnlock, 400); } 
                else { playFail(); setErrorCount(p => p + 1); setStatus('ACCESS DENIED'); setPatternInput([]); if (errorCount >= 2) { setStatus('SYSTEM LOCKED. RESTARTING SESSION...'); setTimeout(onSwitchUser, 1500); } }
            } else if (newPattern.length > userPattern.length) { setPatternInput([]); playFail(); setStatus('INVALID LENGTH'); }
        }
    }, [inputMode, currentUser, userPattern, onUnlock, onSwitchUser, playSuccess, playFail, errorCount, keyMap, isSetupMode, isNoLock, updateLockPattern]);

    useEffect(() => { document.addEventListener('keydown', handleKeydown); return () => document.removeEventListener('keydown', handleKeydown); }, [handleKeydown]);
    
    return (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 transition-all duration-300">
             <div className="relative"><div className={`absolute -inset-4 bg-blue-500/20 blur-xl rounded-full ${isSetupMode ? 'animate-pulse' : ''}`}></div><Lock size={64} className={isSetupMode ? 'text-yellow-400' : 'text-white'} /></div>
             <div className="text-2xl font-mono uppercase tracking-[0.3em] text-white mt-8 mb-2">{currentUser.name}</div>
             <div className="text-[10px] uppercase tracking-[0.2em] text-blue-400 mb-16">{status}</div>
             {(inputMode || isSetupMode) && !isNoLock && (
                 <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                    {(isSetupMode ? patternInput : userPattern).map((_, index) => {
                        const move = patternInput[index];
                        const showColor = move ? 'text-white' : 'text-white/20';
                        const rotation = move === 'down' ? 'rotate-180' : move === 'left' ? '-rotate-90' : move === 'right' ? 'rotate-90' : 'rotate-0';
                        const Icon = move === 'enter' ? Check : ArrowUp;
                        if (isSetupMode && !move) return null;
                        return (<div key={index} className={`w-12 h-12 flex items-center justify-center rounded-xl bg-black/50 transition-all duration-300 ${move ? 'scale-110 border border-white/20' : ''}`}><Icon size={20} className={`${showColor} transform ${rotation} transition-all duration-200`} /></div>);
                    })}
                    {isSetupMode && patternInput.length === 0 && <span className="text-white/30 text-xs">USE ARROW KEYS</span>}
                 </div>
             )}
             {isSetupMode && <div className="mt-8 flex flex-col items-center gap-2 text-[10px] text-white/50 tracking-widest"><div>[ ARROWS ] to Create Pattern</div><div>[ SPACE ] to Save Password</div><div>[ N ] for No Password</div></div>}
             {isNoLock && <div className="mt-8 text-[10px] text-white/30 tracking-widest">[ PRESS ENTER TO UNLOCK ]</div>}
             {!isSetupMode && !isNoLock && (<div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50"><span className="text-[10px] uppercase tracking-widest">Authorized Access Only</span><span className="text-[10px] text-red-400 cursor-pointer hover:underline" onClick={onSwitchUser}>[ Switch User ]</span></div>)}
        </div>
    );
}

const DockItem = ({ icon: Icon, label, onClick, isActive, className = '' }) => (
    <button onClick={onClick} className={`group relative p-2.5 rounded-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-125 focus:outline-none ${className}`}>
        <div className={`w-10 h-10 backdrop-blur-md rounded-xl flex items-center justify-center border transition-all ${isActive ? 'bg-white/20 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/10 border-white/5 shadow-lg group-hover:bg-white/20'}`}>
            <Icon size={20} className="text-white/90 group-hover:text-white" />
        </div>
        {isActive && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_5px_#60a5fa]"></div>}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] font-bold tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{label}</span>
    </button>
)

const MacDock = ({ time, activeApp, closeApp, currentUser, visible, onLaunch, appRefMap }) => {
  return (
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 h-20 px-6 bg-black/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-50 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${visible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
          <DockItem icon={Home} label="Home" onClick={closeApp} />
          <DockItem icon={Globe} label="Browser" onClick={() => onLaunch('network')} isActive={activeApp === appRefMap.NETWORK} />
          <DockItem icon={Folder} label="Files" onClick={() => onLaunch('files')} isActive={activeApp === appRefMap.FILES} />
          <DockItem icon={Terminal} label="Settings" onClick={() => onLaunch('settings')} isActive={activeApp === appRefMap.SETTINGS} />
          
          {/* Dynamic Container for Running Apps that aren't pinned */}
          {activeApp && !['network', 'files', 'settings'].includes(Object.keys(appRefMap).find(key => appRefMap[key] === activeApp)?.toLowerCase()) && (
              <>
                <div className="w-[1px] h-8 bg-white/10 mx-1" />
                <DockItem icon={Activity} label="Active Task" onClick={() => {}} isActive={true} />
              </>
          )}

          <div className="w-[1px] h-8 bg-white/10 mx-2" />
          <DockItem icon={Info} label="About System" onClick={() => onLaunch('about')} isActive={activeApp === 'about'} />
          <DockItem icon={Minimize2} label="Minimize" onClick={() => window.aetherSystem?.minimize()} />
          <DockItem icon={Power} label="Shutdown" onClick={() => window.aetherSystem?.shutdown()} className="hover:text-red-400" />
          <div className="w-[1px] h-8 bg-white/10 mx-2" />
          <div className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-default px-2">
               <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs" style={{backgroundColor: currentUser.color}}>{currentUser.name.charAt(0)}</div>
               <span className="text-[9px] font-mono tracking-tighter text-white/50">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
      </div>
  );
};

export default function HybridOS() {
  const [colIndex, setColIndex] = useState(2);
  const [rowIndex, setRowIndex] = useState(null);
  const [time, setTime] = useState(new Date());
  const [activeApp, setActiveApp] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showTaskbar, setShowTaskbar] = useState(false); 

  const [users, setUsers] = useState(() => {
    try { const storedUsers = JSON.parse(localStorage.getItem('aether_users')); if (storedUsers && storedUsers.length > 0) return storedUsers; } catch {}
    return [{ id: 'u1', name: 'User 1', pattern: 'up,up,down,down', color: '#3b82f6' }, { id: 'u2', name: 'Admin', pattern: 'left,right,left,right,up,down,enter', color: '#ef4444' }];
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loginSelection, setLoginSelection] = useState(0);
  const [gameList, setGameList] = useState([]);
  const [globalTransitionState, setGlobalTransitionState] = useState('booting');
  const [isLocked, setIsLocked] = useState(false); 
  
  const updateUsers = (newUsers) => { setUsers(newUsers); localStorage.setItem('aether_users', JSON.stringify(newUsers)); };
  
  const updateLockPattern = (userId, newPattern) => {
      const updatedUsers = users.map(u => u.id === userId ? { ...u, pattern: newPattern } : u);
      updateUsers(updatedUsers);
      if (currentUser && currentUser.id === userId) setCurrentUser({ ...currentUser, pattern: newPattern });
  }

  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aether_settings')) || { hue: 210, speed: 1, bgColor: '#131c2e', dynamicWave: true }; }
    catch { return { hue: 210, speed: 1, bgColor: '#131c2e', dynamicWave: true }; }
  });

  const updateSetting = (key, value) => {
    setSettings(p => { const newSettings = {...p, [key]: value}; localStorage.setItem('aether_settings', JSON.stringify(newSettings)); return newSettings; });
  };

  const containerRef = useRef(null);
  const { playNav, playSelect, playBack, playLogin, playSuccess, playFail } = useSound();
  const stateRef = useRef({ colIndex, rowIndex, activeApp, isFocused, currentUser, isLocked });
  const scrollTimeoutRef = useRef(null); 

  const closeApp = useCallback(() => { playBack(); setActiveApp(null); }, [playBack]);

  useEffect(() => {
    const handleToggle = (e) => { if (e.key.toLowerCase() === 'h') { setShowTaskbar(prev => !prev); } };
    window.addEventListener('keydown', handleToggle);
    return () => window.removeEventListener('keydown', handleToggle);
  }, []);

  useEffect(() => {
    let animationFrameId; let lastButtonState = { toggle: false };
    const checkGamepad = () => {
        const gamepads = navigator.getGamepads();
        if (gamepads[0]) { 
            const gp = gamepads[0];
            const togglePressed = gp.buttons[8]?.pressed || gp.buttons[16]?.pressed; 
            if (togglePressed && !lastButtonState.toggle) { setShowTaskbar(prev => !prev); }
            lastButtonState = { toggle: togglePressed };
        }
        animationFrameId = requestAnimationFrame(checkGamepad);
    };
    checkGamepad();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const bootTimer = setTimeout(() => { setGlobalTransitionState('login'); }, 1500);
    const loadGames = async () => {
        let foundGames = [];
        if(window.aetherSystem?.scanSteamGames) {
            const s = await window.aetherSystem.scanSteamGames();
            foundGames = s.map(g => ({ id: g.id, label: g.name, source: 'Steam', accent: '#3b82f6', icon: Disc, hero: `https://steamcdn-a.akamaihd.net/steam/apps/${g.id}/library_hero.jpg`, logo: `https://steamcdn-a.akamaihd.net/steam/apps/${g.id}/logo.png` }));
        } else {
            foundGames = [ { id: '1091500', label: 'Cyberpunk 2077', source: 'Steam', accent: '#fcee0a', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_hero.jpg', logo: 'https://steamcdn-a.akamaihd.net/steam/apps/1091500/logo.png', icon: Disc }, { id: '1245620', label: 'Elden Ring', source: 'Steam', accent: '#cca362', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_hero.jpg', logo: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/logo.png', icon: Disc }];
        }
        setGameList(foundGames);
    };
    loadGames();
    return () => { clearInterval(timer); clearTimeout(bootTimer); };
  }, []);

  useEffect(() => {
      stateRef.current = { colIndex, rowIndex, activeApp, isFocused, currentUser, isLocked };
      if (currentUser && globalTransitionState === 'login') { setGlobalTransitionState('booting'); setTimeout(() => { setGlobalTransitionState('ready'); setIsFocused(true); }, 800); }
  }, [colIndex, rowIndex, activeApp, isFocused, currentUser, globalTransitionState, isLocked]);

  const handleUserSwitch = () => { setGlobalTransitionState('booting'); playBack(); setIsLocked(false); setTimeout(() => { setCurrentUser(null); setLoginSelection(0); setGlobalTransitionState('login'); }, 500); };
  const handleLockSystem = () => { setIsLocked(true); setIsFocused(false); playBack(); }
  const handleUnlockSystem = () => { setIsLocked(false); setIsFocused(true); }

  const APP_REFS = { FILES: 'files', MONITOR: 'monitor', SETTINGS: 'settings', APPS: 'apps', NETWORK: 'network', NOTEPAD: 'notepad', PAINT: 'paint', CALC: 'calc', USER_MANAGE: 'user_manage', ABOUT: 'about' };
  const getCurrentWaveHue = () => {
      const categoryHueMap = { 'user': 240, 'settings': 60, 'game': 210, 'apps': 280, 'network': 180 };
      return categoryHueMap[SYSTEM_DATA[colIndex]?.id] || getHueFromHex(settings.bgColor);
  };

  const SYSTEM_DATA = [
    {
      id: 'user', icon: Users, label: 'USERS', hue: 240,
      items: [
        { id: 'u1', label: 'Switch User', icon: RefreshCw, type: 'action', action: handleUserSwitch },
        { id: 'u4', label: 'Manage Users', icon: User, type: 'app', app: APP_REFS.USER_MANAGE, subtext: 'Configure' }, 
        { id: 'u2', label: 'Standby', icon: Lock, type: 'action', action: handleLockSystem, subtext: 'Lock System' },
        { id: 'u5', label: 'Minimize', icon: Minus, type: 'action', action: () => window.aetherSystem?.minimize() },
        { id: 'u3', label: 'Shutdown', icon: Power, type: 'action', action: () => window.aetherSystem?.shutdown() },
        { id: 'u6', label: 'About Aether', icon: Info, type: 'app', app: APP_REFS.ABOUT, subtext: 'System Info' }
      ]
    },
    {
      id: 'settings', icon: Settings, label: 'SETTINGS', hue: 60,
      items: [
        { id: 's1', label: 'Configuration', icon: Settings, type: 'app', app: APP_REFS.SETTINGS, subtext: 'System' },
        { id: 's2', label: 'Installed Apps', icon: Package, type: 'app', app: APP_REFS.APPS, subtext: 'Launch' },
        { id: 's3', label: 'File Manager', icon: Folder, type: 'app', app: APP_REFS.FILES, subtext: 'Storage' }
      ]
    },
    { id: 'game', icon: Gamepad2, label: 'GAMES', hue: 210, items: gameList.length > 0 ? gameList : [{ id: 'load', label: 'Scanning...', icon: Disc }] },
    {
        id: 'apps', icon: Package, label: 'TOOLS', hue: 280,
        items: [
            { id: 't2', label: 'System Status', icon: Cpu, type: 'app', app: APP_REFS.MONITOR, subtext: 'Telemetry' },
            { id: 't5', label: 'Text Editor', icon: FileText, type: 'app', app: APP_REFS.NOTEPAD },
            { id: 't3', label: 'Canvas Paint', icon: Brush, type: 'app', app: APP_REFS.PAINT },
            { id: 't4', label: 'Calculator', icon: Calculator, type: 'app', app: APP_REFS.CALC },
        ]
    },
    {
        id: 'network', icon: Globe, label: 'NETWORK', hue: 180,
        items: [
            { id: 'n1', label: 'Resources', icon: Globe, type: 'app', app: APP_REFS.NETWORK, subtext: 'Web' },
            { id: 'n2', label: 'Open URL', icon: Link, type: 'action', action: () => { const url = prompt("Enter URL:"); if (url) window.aetherSystem?.openExternal(url); }, subtext: 'Browser' },
        ]
    }
  ];

  const handleDockLaunch = (type) => {
      playSelect();
      if (type === 'network') setActiveApp(APP_REFS.NETWORK);
      if (type === 'files') setActiveApp(APP_REFS.FILES);
      if (type === 'settings') setActiveApp(APP_REFS.SETTINGS);
      if (type === 'about') setActiveApp(APP_REFS.ABOUT);
  };

  const handleNavigation = useCallback((direction) => {
    const { colIndex, rowIndex, activeApp, currentUser, isLocked } = stateRef.current;
    if (!currentUser || isLocked) {
        if (!currentUser && direction === 'left') { setLoginSelection(p => Math.max(0, p - 1)); playNav(); }
        if (!currentUser && direction === 'right') { setLoginSelection(p => Math.min(users.length - 1, p + 1)); playNav(); }
        if (!currentUser && direction === 'enter') { playLogin(); setCurrentUser(users[loginSelection]); }
        if (isLocked && direction === 'enter') handleUserSwitch();
        return;
    }
    if (activeApp) return;
    if (direction === 'right') { setColIndex(i => Math.min(i + 1, SYSTEM_DATA.length - 1)); playNav(); if (rowIndex !== null) setRowIndex(r => Math.min(r, (SYSTEM_DATA[Math.min(colIndex + 1, SYSTEM_DATA.length - 1)]?.items.length || 1) - 1)); }
    else if (direction === 'left') { setColIndex(i => Math.max(i - 1, 0)); playNav(); if (rowIndex !== null) setRowIndex(r => Math.min(r, (SYSTEM_DATA[Math.max(colIndex - 1, 0)]?.items.length || 1) - 1)); }
    else if (direction === 'down') { if (rowIndex === null) { setRowIndex(0); playNav(); } else { setRowIndex(prev => Math.min(prev + 1, SYSTEM_DATA[colIndex].items.length - 1)); playNav(); } }
    else if (direction === 'up') { if (rowIndex === 0) { setRowIndex(null); playNav(); } else if (rowIndex !== null) { setRowIndex(prev => Math.max(prev - 1, 0)); playNav(); } }
    else if (direction === 'enter') {
       if (rowIndex !== null) {
          playSelect();
          const item = SYSTEM_DATA[colIndex].items[rowIndex];
          if (item.source === 'Steam') window.aetherSystem?.launchSteam(item.id);
          else if (item.action) item.action();
          else if (item.app) setActiveApp(item.app);
       }
    } else if (direction === 'back') { if(rowIndex !== null) { setRowIndex(null); playBack(); } else if (colIndex !== 2) { setColIndex(2); playBack(); } }
  }, [users, loginSelection, SYSTEM_DATA, playNav, playLogin, playSelect, playBack]); 

  const handleKeyDown = useCallback((e) => {
    if (stateRef.current.isLocked) { if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) e.preventDefault(); return; }
    if (stateRef.current.activeApp) { if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); return; }
    const isNavKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape'].includes(e.key);
    if (!stateRef.current.isFocused && !isNavKey) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowRight') handleNavigation('right');
    if (e.key === 'ArrowLeft') handleNavigation('left');
    if (e.key === 'ArrowDown') handleNavigation('down');
    if (e.key === 'ArrowUp') handleNavigation('up');
    if (e.key === 'Enter') handleNavigation('enter');
    if (e.key === 'Backspace' || e.key === 'Escape') handleNavigation('back');
  }, [handleNavigation]);

  const handleScroll = useCallback((e) => {
    if (stateRef.current.isLocked || stateRef.current.activeApp || !stateRef.current.isFocused || scrollTimeoutRef.current) return;
    e.preventDefault(); 
    const direction = Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 5 ? (e.deltaY > 0 ? 'down' : 'up') : (Math.abs(e.deltaX) > 5 ? (e.deltaX > 0 ? 'right' : 'left') : null);
    if (direction) { handleNavigation(direction); scrollTimeoutRef.current = setTimeout(() => { scrollTimeoutRef.current = null; }, 150); }
  }, [handleNavigation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown); containerRef.current.addEventListener('wheel', handleScroll, { passive: false });
    return () => { window.removeEventListener('keydown', handleKeyDown); if (containerRef.current) containerRef.current.removeEventListener('wheel', handleScroll); if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); };
  }, [handleKeyDown, handleScroll]);
  
  const activateSystem = () => { setIsFocused(true); if(containerRef.current) containerRef.current.focus(); };
  const ITEM_WIDTH = 140; const LEFT_OFFSET = window.innerWidth * 0.20;
  const currentCategory = SYSTEM_DATA[colIndex]; const activeItem = rowIndex !== null ? currentCategory.items[rowIndex] : null;

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden text-white font-sans select-none bg-transparent outline-none" tabIndex={0} onClick={activateSystem} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} >
      <WaveBackground bgColor={settings.bgColor} waveHue={getCurrentWaveHue()} dynamicWave={settings.dynamicWave} speedMultiplier={settings.speed} />
      
      {currentUser && !isLocked && globalTransitionState === 'ready' && (
         <MacDock time={time} activeApp={activeApp} closeApp={closeApp} currentUser={currentUser} visible={showTaskbar} onLaunch={handleDockLaunch} appRefMap={APP_REFS} />
      )}
      
      {isLocked && currentUser && ( <LockScreen users={users} currentUser={currentUser} onUnlock={handleUnlockSystem} onSwitchUser={handleUserSwitch} playSuccess={playSuccess} playFail={playFail} updateLockPattern={updateLockPattern} /> )}

      {activeItem?.hero && isFocused && currentUser && globalTransitionState === 'ready' && !isLocked && !activeApp && (
         <div className="fixed inset-0 -z-0 animate-in fade-in duration-700">
             <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out scale-105" style={{ backgroundImage: `url(${activeItem.hero})` }} />
             <div className="absolute inset-0 bg-black/60" />
             <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #000 0%, #000 25%, transparent 60%, transparent 100%)' }} />
         </div>
      )}

      <div className={`absolute top-0 left-0 w-full h-16 flex items-center justify-between px-10 transition-transform duration-500 z-30 ${isFocused && globalTransitionState === 'ready' && !isLocked ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-6"><span className="text-xs font-bold tracking-[0.25em] text-blue-400 uppercase">Aether</span><div className="w-[1px] h-4 bg-white/20"></div>{currentUser && <span className="text-xs font-medium tracking-widest text-slate-300 uppercase animate-in slide-in-from-left-4">{currentCategory.label}</span>}</div>
      </div>

      {globalTransitionState === 'login' && !currentUser && (
         <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-1000">
             <div className="text-4xl font-light tracking-[0.5em] uppercase text-white mb-20 animate-in fade-in zoom-in duration-1000">Select User</div>
             <div className="flex gap-16 items-center">
                 {users.map((u, i) => (
                     <div key={u.id} className={`flex flex-col items-center gap-6 transition-all duration-500 ease-out ${i === loginSelection ? 'scale-125 opacity-100' : 'scale-90 opacity-40 grayscale'}`}>
                         <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${i === loginSelection ? 'border-white shadow-[0_0_50px_rgba(255,255,255,0.2)]' : 'border-white/10'}`} style={{borderColor: i===loginSelection ? u.color : 'rgba(255,255,255,0.1)'}}>{i === loginSelection && <div className="absolute inset-0 opacity-20 animate-pulse" style={{backgroundColor: u.color}}></div>}<div className="text-4xl font-bold" style={{color: u.color}}>{u.name.charAt(0)}</div></div>
                         <div className="text-sm font-bold tracking-[0.3em] uppercase">{u.name}</div>
                     </div>
                 ))}
             </div>
         </div>
      )}

      {globalTransitionState !== 'ready' && (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-all duration-700 ${globalTransitionState === 'booting' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-8"></div>
             <div className="text-[10px] uppercase tracking-[0.5em] text-white/50 animate-pulse">Initializing Kernel...</div>
        </div>
      )}

      {currentUser && (
        <div className={`absolute w-full h-full transition-all duration-500 cubic-bezier(0.2, 0.0, 0.2, 1) ${isFocused && globalTransitionState === 'ready' && !isLocked && !activeApp ? 'opacity-100 blur-0' : 'opacity-0 blur-lg scale-110 pointer-events-none'}`} style={{ transform: `translateX(${LEFT_OFFSET - (colIndex * ITEM_WIDTH)}px)` }}>
            <div className="absolute top-[20%] left-0 flex items-center h-32 w-[2000px]">
            {SYSTEM_DATA.map((cat, idx) => {
                const isActive = idx === colIndex; const catHue = SYSTEM_DATA[idx]?.hue || 210;
                return ( <div key={cat.id} className={`flex flex-col items-center justify-center transition-all duration-500 ease-out ${isActive ? 'opacity-100 scale-110' : 'opacity-30 scale-90 blur-[1px]'}`} style={{ width: ITEM_WIDTH }}><cat.icon size={isActive ? 52 : 36} strokeWidth={1.5} className={`transition-all duration-300 mb-6 ${isActive ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-slate-500'}`} /><span className={`text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ color: `hsl(${catHue}, 80%, 70%)` }}>{cat.label}</span></div> );
            })}
            </div>
            <div className="absolute top-[20%] left-0 flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)" style={{ left: `${colIndex * ITEM_WIDTH}px`, transform: `translateY(${rowIndex === null ? 160 : 160 - rowIndex * 90}px)` }}>
            {SYSTEM_DATA.map((cat, cIdx) => {
                if (cIdx !== colIndex) return null; const catHue = SYSTEM_DATA[cIdx]?.hue || 210;
                return ( <div key={cat.id} className="flex flex-col items-center w-[140px]"> {cat.items.map((item, rIdx) => { const isActiveItem = rowIndex === rIdx; const itemAccent = item.accent || `hsl(${catHue}, 80%, 50%)`; return ( <div key={item.id} className={`relative flex items-center gap-6 transition-all duration-300 ease-out ${isActiveItem ? 'opacity-100 translate-x-12 z-10 scale-105' : 'opacity-40 translate-x-4 scale-95 blur-[0.5px]'} my-3 whitespace-nowrap`} style={{ width: '600px', height: '70px' }}> {isActiveItem && <div className="absolute -left-6 top-0 bottom-0 w-[500px] bg-gradient-to-r from-white/10 to-transparent border-l-4 -z-10 animate-in slide-in-from-left-8 fade-in duration-300" style={{ borderColor: itemAccent }}></div>} <div className={`w-16 h-16 flex items-center justify-center rounded-lg transition-all duration-300 ${isActiveItem ? 'bg-black/40 border border-white/20 shadow-lg backdrop-blur-sm' : 'bg-transparent border border-transparent'}`}> <item.icon size={28} strokeWidth={1.5} className={`transition-all duration-300 ${isActiveItem ? 'text-white' : 'text-slate-500'}`} /> </div> <div className="flex flex-col gap-1"> <span className={`text-2xl font-light tracking-tight uppercase transition-all duration-300 ${isActiveItem ? 'text-white' : 'text-slate-400'}`}>{item.label}</span> {isActiveItem && item.subtext && <span className="text-[10px] font-bold uppercase tracking-widest drop-shadow-md opacity-80" style={{ color: itemAccent }}>{item.subtext}</span>} </div> </div> ) })} </div> );
            })}
            </div>
        </div>
      )}

      {activeApp === APP_REFS.MONITOR && <WindowedApp title="System Status" onClose={closeApp}><SystemMonitorApp close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.FILES && <WindowedApp title="Nucleus Files" onClose={closeApp}><FileManagerApp close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.APPS && <WindowedApp title="Installed Applications" onClose={closeApp}><InstalledApps close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.SETTINGS && <WindowedApp title="Settings" onClose={closeApp}><SettingsApp currentUser={currentUser} settings={settings} updateSetting={updateSetting} close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.USER_MANAGE && <WindowedApp title="User Management" onClose={closeApp}><UserManagementApp close={closeApp} users={users} currentUser={currentUser} updateUsers={updateUsers} updateLockPattern={updateLockPattern}/></WindowedApp>}
      {activeApp === APP_REFS.NETWORK && <WindowedApp title="Network Resources" onClose={closeApp}><NetworkApp close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.NOTEPAD && <WindowedApp title="Text Editor" onClose={closeApp}><TextEditorApp close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.PAINT && <WindowedApp title="Canvas Paint" onClose={closeApp}><PlaceholderApp title="Canvas Paint" close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.CALC && <WindowedApp title="Calculator" onClose={closeApp}><PlaceholderApp title="Calculator" close={closeApp}/></WindowedApp>}
      {activeApp === APP_REFS.ABOUT && <WindowedApp title="About System" onClose={closeApp}><AboutSystemApp close={closeApp}/></WindowedApp>}
    </div>
  );
}