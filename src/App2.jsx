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
  Search, AppWindow, Activity, Info, GitBranch, Volume1, WifiOff, Signal,
  Sun, Moon, Triangle, Scaling, Divide, Percent, Delete
} from 'lucide-react';

/* --- 0. ERROR BOUNDARY --- */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Kernel Panic:", error, errorInfo); }
  handleFactoryReset = () => { localStorage.clear(); window.location.reload(); };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-black text-red-500 font-mono p-10 z-[9999] fixed inset-0">
          <AlertCircle size={64} className="mb-6 animate-pulse" />
          <h1 className="text-4xl mb-4 tracking-widest uppercase border-b border-red-900 pb-2">Kernel Panic</h1>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="px-6 py-3 border border-white/20 text-white rounded hover:bg-white/10 transition-all uppercase tracking-widest text-xs">Attempt Reboot</button>
            <button onClick={this.handleFactoryReset} className="px-6 py-3 bg-red-900/20 border border-red-500 text-red-400 rounded hover:bg-red-900/40 transition-all uppercase tracking-widest text-xs">Factory Reset</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* --- 1. HOOKS & UTILS --- */
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
    playLogin: () => { playTone(200, 'sine', 0.4); setTimeout(() => playTone(400, 'sine', 0.8), 150); },
    playSuccess: () => { playTone(600, 'sine', 0.1); setTimeout(() => playTone(800, 'sine', 0.15), 50); },
    playFail: () => { playTone(100, 'sawtooth', 0.05); setTimeout(() => playTone(80, 'sawtooth', 0.1), 50); },
    setVolume, volume
  };
};

const useDraggable = (initialPosition = { x: 100, y: 100 }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null); 
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    if (dragRef.current && dragRef.current.contains(e.target)) {
      setIsDragging(true);
      offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { position, setPosition, dragRef, handleMouseDown, isDragging };
};

const useMenuNav = (itemCount, orientation = 'vertical', isActive = true) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { playNav } = useSound();

    useEffect(() => {
        if (!isActive) return;
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
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
    if (!hex || hex.length !== 7) return 210;
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
    if(!color) return '#000000';
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

const useIdleTimer = (timeout, onIdle) => {
  useEffect(() => {
    let timer;
    const reset = () => { clearTimeout(timer); timer = setTimeout(onIdle, timeout); };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    reset();
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      clearTimeout(timer);
    };
  }, [timeout, onIdle]);
};

/* --- 2. WAVE ENGINE --- */
const WaveBackground = ({ bgColor, waveHue, dynamicWave, speedMultiplier = 1 }) => {
  const canvasRef = useRef(null);
  const currentWaveHue = useRef(waveHue);
  const currentBgColor = useRef(bgColor);
  const particlesRef = useRef(Array.from({length: 60}, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2,
    angle: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.002 + 0.001,
    opacity: Math.random() * 0.15
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
      gradient.addColorStop(0.5, shadeColor(currentBgColor.current, -0.6));
      gradient.addColorStop(1, '#050505');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      particlesRef.current.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed * speedMultiplier;
        p.y += Math.sin(p.angle) * p.speed * speedMultiplier;
        if (p.x > 1) p.x = 0; if (p.x < 0) p.x = 1;
        if (p.y > 1) p.y = 0; if (p.y < 0) p.y = 1;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(p.x * w, p.y * h, p.size, p.size);
      });
      ctx.globalAlpha = 1.0;

      ctx.globalCompositeOperation = 'screen';
      const lines = 12;
      const centerY = h * 0.6;
      let waveBaseHue = dynamicWave ? currentWaveHue.current : getHueFromHex(currentBgColor.current);

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const hue = waveBaseHue + (i * 2);
        const alpha = (Math.sin(t * 0.1 + i * 0.2) * 0.5 + 0.5) * 0.2;
        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
        ctx.lineWidth = 2;
        for (let x = 0; x <= w + 100; x += 30) {
            const yOffset = Math.sin(x * 0.001 + t * 0.3 + i * 0.1) * (100 + i * 10) + Math.cos(x * 0.002 - t * 0.1) * 50;
            const y = centerY + yOffset;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.008 * speedMultiplier;
      animationFrameId = requestAnimationFrame(drawWave);
    };
    drawWave();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, [speedMultiplier, dynamicWave]);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

/* --- 3. INTERNAL APPS (FULL IMPLEMENTATIONS) --- */

const NetworkApp = () => {
    const [url, setUrl] = useState('https://www.wikipedia.org');
    const [inputUrl, setInputUrl] = useState('https://www.wikipedia.org');
    const [isLoading, setIsLoading] = useState(false);
    const [isElectron, setIsElectron] = useState(false);
    useEffect(() => { if(window.aetherSystem?.platform) setIsElectron(true); }, []);
    
    const navigate = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setUrl(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
        setTimeout(() => setIsLoading(false), 1500);
    };

    const handleExternal = () => {
        if(window.aetherSystem?.openExternal) window.aetherSystem.openExternal(url);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#121212] text-white">
            <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#1e1e1e]">
                <button className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><ArrowLeft size={14}/></button>
                <button className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button>
                <form onSubmit={navigate} className="flex-1 flex items-center bg-black/40 rounded-full px-3 py-1.5 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                    <Lock size={10} className="text-green-500 mr-2" />
                    <input className="flex-1 bg-transparent text-xs font-mono outline-none text-white/80" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} />
                </form>
                <button onClick={handleExternal} className="p-1.5 hover:bg-white/10 rounded text-xs font-bold px-3 ml-2 flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Globe size={12}/> EXT
                </button>
            </div>
            <div className="flex-1 relative bg-white overflow-hidden">
                {isElectron ? (
                    React.createElement('webview', { src: url, style: { width: '100%', height: '100%' }, allowpopups: 'true' })
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-black bg-gray-100 z-0">
                        <iframe src={url} className="absolute inset-0 w-full h-full z-10" title="browser-preview" />
                    </div>
                )}
            </div>
        </div>
    );
};

const CalculatorApp = () => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    
    // Safer calculation method to avoid direct eval warnings
    const safeCalculate = (expr) => {
        try {
            // eslint-disable-next-line no-new-func
            return new Function('return ' + expr)();
        } catch {
            return 'Error';
        }
    };

    const handlePress = (val) => {
        if(val === 'C') { setDisplay('0'); setEquation(''); return; }
        if(val === '=') {
            try { 
                // Strict validation before execution
                if(/^[0-9+\-*/.() ]+$/.test(equation + display)) {
                    const res = safeCalculate(equation + display).toString();
                    setDisplay(res.substring(0, 10));
                    setEquation('');
                }
            } catch(e) { setDisplay('Error'); }
            return;
        }
        if(['+', '-', '*', '/'].includes(val)) {
            setEquation(equation + display + val);
            setDisplay('0');
            return;
        }
        setDisplay(display === '0' ? val : display + val);
    };

    const buttons = [
        ['C', '(', ')', '/'],
        ['7', '8', '9', '*'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=', '']
    ];

    return (
        <div className="flex flex-col h-full bg-[#121212] p-4 text-white">
            <div className="h-24 flex flex-col items-end justify-end mb-4 pr-2 bg-white/5 rounded-xl border border-white/5">
                <div className="text-xs text-white/40 font-mono mb-1">{equation}</div>
                <div className="text-4xl font-light tracking-wider">{display}</div>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2">
                {buttons.flat().map((btn, i) => (
                    btn === '' ? <div key={i}></div> :
                    <button 
                        key={i} 
                        onClick={() => handlePress(btn)}
                        className={`rounded-lg text-lg font-bold transition-all active:scale-95 flex items-center justify-center
                            ${btn === 'C' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                              btn === '=' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 col-span-2 w-full' : 
                              ['+', '-', '*', '/'].includes(btn) ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                              'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                    >
                        {btn === '*' ? <X size={18}/> : btn === '/' ? <Divide size={18}/> : btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

const SystemMonitorApp = () => {
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
    <div className="flex flex-col h-full w-full p-6 text-white font-mono overflow-y-auto">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 p-4 rounded border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
           <div className="absolute top-0 right-0 p-2 opacity-20"><Cpu size={48}/></div>
           <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Processor Load</div>
           <div className="text-4xl font-light mb-4">{stats.cpu}%</div>
           <div className="flex items-end gap-1 h-10">
              {history.map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-500/50" style={{ height: `${h}%` }}></div>
              ))}
           </div>
        </div>
        <div className="bg-white/5 p-4 rounded border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
           <div className="absolute top-0 right-0 p-2 opacity-20"><Zap size={48}/></div>
           <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Memory Usage</div>
           <div className="text-4xl font-light mb-4">{stats.ram}%</div>
           <div className="w-full h-2 bg-white/10 rounded-full mt-auto">
               <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${stats.ram}%` }}></div>
           </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 p-4 rounded flex flex-col gap-2 border border-white/10">
              <Battery size={20} className={stats.battery < 20 ? 'text-red-500' : 'text-green-400'} />
              <div><div className="text-lg">{stats.battery}%</div><div className="text-[9px] uppercase opacity-50">Power</div></div>
          </div>
          <div className="bg-white/5 p-4 rounded flex flex-col gap-2 border border-white/10">
              <HardDrive size={20} className="text-orange-400" />
              <div><div className="text-lg">{stats.disk} GB</div><div className="text-[9px] uppercase opacity-50">Drive</div></div>
          </div>
          <div className="bg-white/5 p-4 rounded flex flex-col gap-2 border border-white/10">
              <Shield size={20} className="text-blue-400" />
              <div><div className="text-lg">SECURE</div><div className="text-[9px] uppercase opacity-50">Kernel</div></div>
          </div>
      </div>
    </div>
  );
};

const FileManagerApp = () => {
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
               className={`flex items-center gap-4 p-2 border rounded cursor-pointer transition-all ${i === selectedIndex ? 'bg-white/20 border-white/30 scale-[1.01]' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
            <div className={`${f.isDirectory ? 'text-yellow-400' : 'text-blue-400'}`}>{f.isDirectory ? <Folder size={16} /> : <File size={16} />}</div>
            <div className="flex-1 text-sm font-mono tracking-wide truncate text-slate-300 group-hover:text-white">{f.name}</div>
            {!f.isDirectory && <div className="text-[10px] opacity-40 font-mono">{f.size} KB</div>}
          </div>
        ))}
        {files.length === 0 && !loading && <div className="p-4 text-white/30 text-xs font-mono">Directory Empty</div>}
      </div>
    </div>
  );
};

const InstalledApps = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
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
    }

    return (
        <div className="flex flex-col h-full p-6 text-white overflow-y-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6">Local Applications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
                {loading && <div className="text-xs animate-pulse">Scanning Drive C:...</div>}
                {apps.map((app, i) => (
                    <div key={i} onClick={() => launch(app)} 
                         className={`p-3 rounded border cursor-pointer flex items-center gap-3 transition-all bg-white/5 border-white/5 hover:bg-white/20 hover:border-white/40 hover:scale-105`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-black rounded flex items-center justify-center text-xs font-bold">{app.name.charAt(0)}</div>
                        <span className="text-xs font-medium truncate">{app.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const SettingsApp = ({ settings, updateSetting, systemVolume, setSystemVolume, brightness, setBrightness, wifiState, setWifiState }) => {
    return (
        <div className="p-6 text-white space-y-6 overflow-y-auto h-full">
            <h2 className="text-xl font-light border-b border-white/10 pb-4">System Configuration</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded border border-white/10">
                    <span>Background Color</span>
                    <input type="color" value={settings.bgColor} onChange={(e) => updateSetting('bgColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none" />
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded border border-white/10">
                    <span>Wave Style</span>
                    <button onClick={() => updateSetting('dynamicWave', !settings.dynamicWave)} className="text-xs uppercase bg-white/10 px-3 py-1 rounded">{settings.dynamicWave ? 'Dynamic' : 'Static'}</button>
                </div>
                <div className="p-4 bg-white/5 rounded border border-white/10">
                    <div className="flex justify-between mb-2 text-xs uppercase opacity-70"><span>Screen Brightness</span><span>{Math.round(brightness*100)}%</span></div>
                    <input type="range" min="0.1" max="1" step="0.1" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-full accent-blue-500"/>
                </div>
                <div className="p-4 bg-white/5 rounded border border-white/10">
                    <div className="flex justify-between mb-2 text-xs uppercase opacity-70"><span>System Volume</span><span>{Math.round(systemVolume*100)}%</span></div>
                    <input type="range" min="0" max="1" step="0.05" value={systemVolume} onChange={(e) => setSystemVolume(parseFloat(e.target.value))} className="w-full accent-green-500"/>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded border border-white/10">
                    <span>WiFi Connection</span>
                    <button onClick={() => setWifiState(p => !p)} className={`text-xs uppercase px-3 py-1 rounded ${wifiState ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{wifiState ? 'Connected' : 'Disabled'}</button>
                </div>
            </div>
        </div>
    );
};

const UserManagementApp = ({ users, currentUser, updateUsers, updateLockPattern }) => {
    const [newUser, setNewUser] = useState('');
    const [mode, setMode] = useState('list');
    
    return (
        <div className="p-6 text-white h-full overflow-y-auto font-mono">
            <h2 className="text-xl uppercase tracking-widest border-b border-white/10 pb-4 mb-4 text-blue-400">User Management</h2>
            <div className="flex flex-col gap-2">
                {users.map((u, i) => (
                    <div key={u.id} className="flex items-center justify-between p-4 rounded border bg-white/5 border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-black" style={{backgroundColor: u.color || '#ccc'}}>{u.name.charAt(0)}</div>
                            <div><div className="text-sm font-bold uppercase tracking-wider">{u.name}</div><div className="text-[10px] opacity-50">{u.id === currentUser.id ? 'ACTIVE SESSION' : 'OFFLINE'}</div></div>
                        </div>
                        {u.id !== currentUser.id && <Trash2 size={16} className="text-red-400 cursor-pointer" onClick={() => updateUsers(users.filter(user => user.id !== u.id))} />}
                    </div>
                ))}
                <div className="mt-4 flex gap-2">
                    <input value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="New User Name" className="flex-1 bg-white/10 p-2 rounded text-sm outline-none" />
                    <button onClick={() => { if(newUser) { updateUsers([...users, { id: `u${Date.now()}`, name: newUser, color: '#10b981', pattern: '' }]); setNewUser(''); }}} className="px-4 bg-blue-600 rounded text-xs uppercase font-bold">Add</button>
                </div>
            </div>
        </div>
    );
};

const TextEditorApp = () => {
    const [content, setContent] = useState(localStorage.getItem('aether_editor_content') || 'Welcome to Aether Text Editor.');
    const [filename, setFilename] = useState(localStorage.getItem('aether_editor_filename') || 'NewDocument.txt');
    const [status, setStatus] = useState('');

    const saveFile = async () => {
        if (!window.aetherSystem?.writeFile) {
            localStorage.setItem('aether_editor_content', content);
            localStorage.setItem('aether_editor_filename', filename);
            setStatus('Saved Locally');
            setTimeout(() => setStatus(''), 2000);
            return;
        }
        const res = await window.aetherSystem.writeFile({ filename, content });
        if (res.success) { setStatus(`Saved`); window.aetherSystem?.sendNotification('File Saved', `Document saved.`); } else { setStatus(`Error`); }
        setTimeout(() => setStatus(''), 2000);
    };

    return (
        <div className="flex flex-col h-full w-full p-4 text-white">
          <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2"><FileText size={16} className="text-blue-400"/><input value={filename} onChange={(e) => setFilename(e.target.value)} className="bg-transparent text-sm border-b border-transparent focus:border-white/20 outline-none w-40 font-mono" placeholder="filename.txt" /></div>
            <div className="flex items-center gap-4"><span className="text-[10px] opacity-50 font-mono">{status}</span><button onClick={saveFile} className="p-1 hover:bg-white/10 rounded" title="Save File"><Save size={16}/></button></div>
          </div>
          <textarea className="flex-1 bg-transparent text-white text-sm font-mono resize-none focus:outline-none p-2" value={content} onChange={e => setContent(e.target.value)} />
        </div>
    );
};

const AboutSystemApp = () => {
    const [specs, setSpecs] = useState(null);
    useEffect(() => {
        const loadSpecs = async () => {
            if (window.aetherSystem?.getSpecs) {
                setSpecs(await window.aetherSystem.getSpecs());
            } else {
                setSpecs({ cpu: 'Web Environment (Simulated)', ram: 'N/A', os: 'Browser', gpu: 'WebGL' });
            }
        };
        loadSpecs();
    }, []);

    return (
        <div className="flex flex-col h-full p-8 text-white">
            <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl"><Activity size={40} className="text-white" /></div>
                <div><h1 className="text-3xl font-thin">Aether OS</h1><div className="text-sm opacity-60 font-mono">v1.2.1 Stable</div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10"><div className="text-[10px] uppercase opacity-40 mb-1">Processor</div><div className="font-mono text-sm text-blue-200">{specs?.cpu || 'Loading...'}</div></div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10"><div className="text-[10px] uppercase opacity-40 mb-1">Memory</div><div className="font-mono text-sm text-purple-200">{specs?.ram || '...'}</div></div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10"><div className="text-[10px] uppercase opacity-40 mb-1">GPU</div><div className="font-mono text-sm text-green-200">{specs?.gpu || '...'}</div></div>
            </div>
        </div>
    )
}

const PlaceholderApp = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-white/40">
        <Package size={48} className="mb-4 opacity-20"/>
        <div className="text-lg font-light tracking-widest uppercase">{title}</div>
        <div className="text-[10px] font-mono mt-2 opacity-50">Application Module Loaded</div>
    </div>
);

/* --- 4. WINDOW SYSTEM --- */

const WindowFrame = ({ windowState, onClose, onMinimize, onFocus, children }) => {
  const { position, setPosition, dragRef, handleMouseDown, isDragging } = useDraggable(windowState.position || { x: 100, y: 100 });
  const [size, setSize] = useState(windowState.size || { w: 800, h: 500 });
  const [isMaximized, setIsMaximized] = useState(false);
  const resizeRef = useRef(null);

  const handleResizeMouseDown = (e) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = size.w;
      const startH = size.h;

      const onMouseMove = (moveEvent) => {
          setSize({
              w: Math.max(400, startW + (moveEvent.clientX - startX)),
              h: Math.max(300, startH + (moveEvent.clientY - startY))
          });
      };
      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  if (windowState.minimized) return null;

  return (
    <div 
        className={`absolute flex flex-col overflow-hidden text-white bg-[#0a0a0a]/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/10 rounded-xl transition-transform duration-75 ease-out`}
        style={{ 
            left: isMaximized ? 0 : position.x, 
            top: isMaximized ? 0 : position.y, 
            width: isMaximized ? '100vw' : size.w, 
            height: isMaximized ? '100vh' : size.h, 
            zIndex: windowState.zIndex,
            transform: isDragging ? 'scale(1.005)' : 'scale(1)',
            borderRadius: isMaximized ? 0 : '12px'
        }}
        onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div 
          ref={dragRef}
          onMouseDown={!isMaximized ? handleMouseDown : undefined}
          onDoubleClick={() => setIsMaximized(!isMaximized)}
          className="h-10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-between px-4 select-none shrink-0 border-b border-white/5 cursor-default"
      >
        <div className="flex items-center gap-4">
            <span className="text-white/90 font-bold tracking-wide text-[11px] uppercase font-mono shadow-black drop-shadow-md flex items-center gap-2">
                <AppWindow size={12} className="text-blue-400"/> {windowState.title}
            </span>
        </div>
        <div className="flex items-center gap-2">
           {/* Windows Only Controls - Does NOT affect OS shell */}
           <button onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }} className="p-1 hover:bg-white/10 rounded group"><Minus size={12} className="text-white/50 group-hover:text-white"/></button>
           <button onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }} className="p-1 hover:bg-white/10 rounded group"><Maximize2 size={12} className="text-white/50 group-hover:text-white"/></button>
           <button onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} className="p-1 hover:bg-red-500/80 rounded group"><X size={12} className="text-white/50 group-hover:text-white"/></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-black/20">
         {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
          <div 
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-end justify-end p-0.5 opacity-50 hover:opacity-100"
          >
              <div className="w-1.5 h-1.5 bg-white/30 rounded-br"></div>
          </div>
      )}
    </div>
  );
};

/* --- 5. DOCK & SYSTEM KERNEL --- */

const DockItem = ({ icon: Icon, label, isActive, isRunning, onClick }) => (
    <button onClick={onClick} className={`group relative p-3 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110 focus:outline-none`}>
        <div className={`w-12 h-12 backdrop-blur-xl rounded-2xl flex items-center justify-center border transition-all ${isActive ? 'bg-white/20 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'bg-white/5 border-white/5 shadow-lg group-hover:bg-white/15'}`}>
            <Icon size={24} className="text-white/90 group-hover:text-white drop-shadow-md" />
        </div>
        {isRunning && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa] animate-pulse"></div>}
        <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1a1a1a]/90 backdrop-blur border border-white/10 text-white text-[10px] font-bold tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform translate-y-2 group-hover:translate-y-0">{label}</span>
    </button>
)

const SystemKernel = () => {
  // Desktop / XMB State
  const [colIndex, setColIndex] = useState(2);
  const [rowIndex, setRowIndex] = useState(null);
  
  // Window Manager State
  const [windows, setWindows] = useState([]); // [{ id, title, appType, minimized, zIndex, ... }]
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [nextZIndex, setNextZIndex] = useState(10);

  // System Settings & User
  const [users, setUsers] = useState([{ id: 'u1', name: 'User 1', pattern: 'up,up,down,down', color: '#3b82f6' }]);
  const [currentUser, setCurrentUser] = useState(null); // Assuming user login happens
  const [settings, setSettings] = useState({ hue: 210, speed: 1, bgColor: '#131c2e', dynamicWave: true });
  const [volume, setVolume] = useState(0.5);
  const [brightness, setBrightness] = useState(1);
  const [wifiState, setWifiState] = useState(true);
  const [time, setTime] = useState(new Date());
  
  // Game State
  const [gameList, setGameList] = useState([]);
  const [runningGameId, setRunningGameId] = useState(null);

  // Refs
  const { playNav, playSelect, playBack } = useSound();
  
  // Mock User Login for Demo
  useEffect(() => { setCurrentUser(users[0]); }, []);
  useEffect(() => { setInterval(() => setTime(new Date()), 1000); }, []);

  // -- Game Loading --
  useEffect(() => {
    const loadGames = async () => {
        let foundGames = [];
        if(window.aetherSystem?.scanGames) {
            const s = await window.aetherSystem.scanGames();
            foundGames = s.map(g => ({
                id: g.id, realId: g.realId, label: g.name, source: g.source,
                accent: g.source === 'Steam' ? '#1b2838' : '#333333',
                icon: g.source === 'Steam' ? Disc : Gamepad2,
                hero: g.source === 'Steam' ? `https://steamcdn-a.akamaihd.net/steam/apps/${g.realId}/library_hero.jpg` : `https://cdn2.unrealengine.com/Diesel%2Fproductv2%2F${g.name.replace(/\s+/g,'')}%2Fhome%2F${g.name.replace(/\s+/g,'')}-hero.jpg`,
                logo: '', path: g.path, timePlayed: Math.round(g.timePlayed), lastPlayed: g.lastPlayed
            }));
        } else {
             // Mock data
             foundGames = [
                 { id: '1091500', label: 'Cyberpunk 2077', source: 'Steam', accent: '#fcee0a', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_hero.jpg', logo: 'https://steamcdn-a.akamaihd.net/steam/apps/1091500/logo.png', icon: Disc, timePlayed: 124 },
                 { id: '1245620', label: 'Elden Ring', source: 'Steam', accent: '#cca362', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_hero.jpg', logo: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/logo.png', icon: Disc, timePlayed: 450 }
             ];
        }
        foundGames.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        setGameList(foundGames);
    };
    loadGames();
    if (window.aetherSystem?.onGameActivity) {
        window.aetherSystem.onGameActivity((data) => {
            setRunningGameId(data.id);
            setGameList(prev => prev.map(g => { if (g.id === data.id) return { ...g, timePlayed: data.timePlayed }; return g; }));
        });
    }
  }, []);

  // -- Window Actions --
  
  const launchApp = (id, title, appType) => {
      const existing = windows.find(w => w.id === id);
      if (existing) {
          setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: nextZIndex } : w));
          setActiveWindowId(id);
          setNextZIndex(p => p + 1);
      } else {
          const newWindow = { id, title, appType, minimized: false, zIndex: nextZIndex, position: { x: 100 + (windows.length * 30), y: 100 + (windows.length * 30) } };
          setWindows(prev => [...prev, newWindow]);
          setActiveWindowId(id);
          setNextZIndex(p => p + 1);
      }
      playSelect();
  };

  const closeWindow = (id) => {
      setWindows(prev => prev.filter(w => w.id !== id));
      if (activeWindowId === id) setActiveWindowId(null);
      playBack();
  };

  const minimizeWindow = (id) => {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
      setActiveWindowId(null);
      playBack();
  };

  const focusWindow = (id) => {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
      setActiveWindowId(id);
      setNextZIndex(p => p + 1);
  };

  const toggleApp = (id, title, appType) => {
      const w = windows.find(w => w.id === id);
      if (w) {
          if (w.minimized) {
              setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: nextZIndex } : w));
              setNextZIndex(p => p + 1);
              setActiveWindowId(id);
          } else if (activeWindowId === id) {
              minimizeWindow(id);
          } else {
              focusWindow(id);
          }
      } else {
          launchApp(id, title, appType);
      }
  };

  // -- XMB Logic --
  // XMB only visible if ALL windows are closed or minimized
  const isDesktopVisible = windows.length === 0 || windows.every(w => w.minimized);

  // -- Render Content --
  const renderAppContent = (appType) => {
      switch(appType) {
          case 'settings': return <SettingsApp settings={settings} updateSetting={(k, v) => setSettings(p => ({...p, [k]: v}))} brightness={brightness} setBrightness={setBrightness} wifiState={wifiState} setWifiState={setWifiState} systemVolume={volume} setSystemVolume={setVolume} />;
          case 'browser': return <NetworkApp />;
          case 'files': return <FileManagerApp />;
          case 'monitor': return <SystemMonitorApp />;
          case 'apps': return <InstalledApps />;
          case 'users': return <UserManagementApp users={users} currentUser={currentUser} updateUsers={setUsers} />;
          case 'notepad': return <TextEditorApp />;
          case 'about': return <AboutSystemApp />;
          case 'paint': return <PlaceholderApp title="Canvas Paint" />;
          case 'calc': return <CalculatorApp />;
          default: return <PlaceholderApp title={appType} />;
      }
  };

  // -- XMB Navigation --
  const handleXmbNav = (direction) => {
      if (!isDesktopVisible) return;
      if (direction === 'right') setColIndex(p => Math.min(p + 1, SYSTEM_DATA.length - 1));
      if (direction === 'left') setColIndex(p => Math.max(p - 1, 0));
      if (direction === 'down') setRowIndex(p => p === null ? 0 : Math.min(p + 1, SYSTEM_DATA[colIndex].items.length - 1));
      if (direction === 'up') setRowIndex(p => p === 0 ? null : Math.max(p - 1, 0));
      if (direction === 'enter' && rowIndex !== null) {
          const item = SYSTEM_DATA[colIndex].items[rowIndex];
          if (item.action) item.action();
          else if (item.appId) launchApp(item.appId, item.label, item.appType);
          else if (item.source) { if(window.aetherSystem?.launchGame) window.aetherSystem.launchGame(item); }
      }
      playNav();
  };

  useEffect(() => {
      const onKey = (e) => {
          if (!isDesktopVisible) return;
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
              e.preventDefault();
              handleXmbNav(e.key.replace('Arrow', '').toLowerCase());
          }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
  }, [isDesktopVisible, colIndex, rowIndex]);


  // -- Data --
  const SYSTEM_DATA = [
      { id: 'user', icon: Users, label: 'USER', items: [
          { label: 'Manage Users', appId: 'users', appType: 'users', icon: User },
          { label: 'Log Out', action: () => window.location.reload(), icon: LogOut },
          { label: 'Shutdown', action: () => window.aetherSystem?.shutdown(), icon: Power }
      ]},
      { id: 'settings', icon: Settings, label: 'SETTINGS', items: [
          { label: 'System Config', appId: 'settings', appType: 'settings', icon: Settings },
          { label: 'Installed Apps', appId: 'apps', appType: 'apps', icon: Package },
          { label: 'About Aether', appId: 'about', appType: 'about', icon: Info }
      ]},
      { id: 'games', icon: Gamepad2, label: 'LIBRARY', items: gameList.length > 0 ? gameList : [{ label: 'Scanning...', icon: RefreshCw }] },
      { id: 'media', icon: Globe, label: 'APPS', items: [
          { label: 'Web Browser', appId: 'browser', appType: 'browser', icon: Globe },
          { label: 'File Manager', appId: 'files', appType: 'files', icon: Folder },
          { label: 'Text Editor', appId: 'notepad', appType: 'notepad', icon: FileText },
          { label: 'Calculator', appId: 'calc', appType: 'calc', icon: Calculator },
          { label: 'System Monitor', appId: 'monitor', appType: 'monitor', icon: Cpu }
      ]},
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden text-white font-sans bg-black select-none">
        
        {/* Dynamic Background */}
        <div style={{ filter: isDesktopVisible ? 'none' : 'blur(20px) brightness(0.4)', transition: 'all 0.5s ease' }} className="absolute inset-0">
            <WaveBackground bgColor={settings.bgColor} waveHue={getHueFromHex(settings.bgColor)} dynamicWave={settings.dynamicWave} speedMultiplier={settings.speed} />
        </div>

        {/* --- DESKTOP (XMB) --- */}
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isDesktopVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
            <div className="absolute top-[20%] left-0 w-full flex flex-col items-center">
                {/* Horizontal Categories */}
                <div className="flex items-center gap-16 mb-12" style={{ transform: `translateX(${(2 - colIndex) * 140}px)`, transition: 'transform 0.3s ease-out' }}>
                    {SYSTEM_DATA.map((cat, idx) => (
                        <div key={idx} className={`flex flex-col items-center gap-2 transition-all duration-300 ${idx === colIndex ? 'opacity-100 scale-110' : 'opacity-40 scale-90'}`}>
                            <cat.icon size={idx === colIndex ? 48 : 32} />
                            <span className="text-[10px] font-bold tracking-[0.2em]">{cat.label}</span>
                        </div>
                    ))}
                </div>
                {/* Vertical Items */}
                <div className="flex flex-col items-center gap-4 h-[400px]">
                    {SYSTEM_DATA[colIndex].items.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${rowIndex === idx ? 'bg-white/20 scale-110 border border-white/20 shadow-lg' : 'opacity-50'}`} style={{ width: '350px' }}>
                            <div className="w-12 h-12 rounded flex items-center justify-center bg-black/20 text-white">
                                {item.icon && <item.icon size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="text-xl font-light tracking-wide">{item.label}</div>
                                {item.timePlayed && <div className="text-[10px] opacity-60 flex gap-2"><span>{(item.timePlayed/60).toFixed(1)} hrs</span> {item.id === runningGameId && <span className="text-green-400">RUNNING</span>}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- WINDOW MANAGER --- */}
        {windows.map(w => (
            <WindowFrame 
                key={w.id} 
                windowState={w} 
                onClose={closeWindow} 
                onMinimize={minimizeWindow} 
                onFocus={() => focusWindow(w.id)}
            >
                {renderAppContent(w.appType)}
            </WindowFrame>
        ))}

        {/* --- DOCK --- */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 h-20 px-4 bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center gap-2 shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-[9999] hover:scale-[1.01] transition-transform">
            <DockItem icon={Home} label="Desktop" onClick={() => windows.forEach(w => minimizeWindow(w.id))} />
            <div className="w-[1px] h-8 bg-white/10 mx-1" />
            <DockItem icon={Globe} label="Browser" isRunning={windows.some(w => w.id === 'browser')} isActive={activeWindowId === 'browser'} onClick={() => toggleApp('browser', 'Hypernet', 'browser')} />
            <DockItem icon={Folder} label="Files" isRunning={windows.some(w => w.id === 'files')} isActive={activeWindowId === 'files'} onClick={() => toggleApp('files', 'Nucleus Files', 'files')} />
            <DockItem icon={Settings} label="Settings" isRunning={windows.some(w => w.id === 'settings')} isActive={activeWindowId === 'settings'} onClick={() => toggleApp('settings', 'System Config', 'settings')} />
            
            {/* Dynamic Apps in Dock */}
            {windows.filter(w => !['browser', 'files', 'settings'].includes(w.id)).map(w => (
                 <DockItem key={w.id} icon={AppWindow} label={w.title} isRunning={true} isActive={activeWindowId === w.id} onClick={() => toggleApp(w.id, w.title, w.appType)} />
            ))}

            <div className="w-[1px] h-8 bg-white/10 mx-1" />
            <div className="text-[10px] font-mono opacity-50 px-2">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>

    </div>
  );
};

export default function App() { return <ErrorBoundary><SystemKernel /></ErrorBoundary>; }