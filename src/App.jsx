import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Image as ImageIcon, Music, Video, Gamepad2, Globe, Users, 
  Folder, Power, Wifi, Battery, Clock, Monitor, HardDrive, FileText, X, 
  Maximize2, Minimize2, Play, Star, Trophy, MoreHorizontal, Volume2, 
  Bluetooth, Shield, Smartphone, Cpu, Zap, Disc, Code, Terminal as TerminalIcon, 
  Brush, Calculator, Layout, Package, CloudRain, User, Plus, Trash2,
  Bot, Send, RefreshCw, ArrowLeft, File, Save,
  Layers, Download, Calendar, Command, Minus, Palette, Copy, Link, Lock,
  ArrowUp, Check, AlertCircle, Info, GitBranch, Volume1, Home, Grid,
  Maximize, MonitorUp, MousePointer2, MessageSquare, Sparkles, Activity,
  ChevronDown, Edit3, Camera, UserPlus, ShieldAlert, KeyRound, ArrowRight,
  Github, Database, Eraser, Gauge
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


/* --- LAUNCH OVERLAY ANIMATION --- */
const LaunchOverlay = ({ item }) => {
    if (!item) return null;
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none"
        >
            <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="flex flex-col items-center gap-6"
            >
                <div className="relative">
                    <div className="w-24 h-24 bg-[#1a1a1a] rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                        <item.icon size={48} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse z-0"></div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl font-light tracking-widest text-white uppercase">{item.title}</h2>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/50">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                        Initializing Kernel...
                    </div>
                </div>

                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

/* --- UTILS --- */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* --- 0. ERROR BOUNDARY (Recovery Mode) --- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Kernel Panic:", error, errorInfo);
  }

  handleFactoryReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-black text-red-500 font-mono p-10 z-[9999] fixed inset-0">
          <AlertCircle size={64} className="mb-6 animate-pulse" />
          <h1 className="text-4xl mb-4 tracking-widest uppercase border-b border-red-900 pb-2">Kernel Panic</h1>
          <p className="text-white/60 mb-8 text-center max-w-lg">
            System initialization failed. Data corruption detected in user partition.
            <br/><br/>
            <span className="text-red-400 opacity-50 text-xs">{this.state.error?.toString()}</span>
          </p>
          <div className="flex gap-4">
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-white/20 text-white rounded hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
            >
                Attempt Reboot
            </button>
            <button 
                onClick={this.handleFactoryReset}
                className="px-6 py-3 bg-red-900/20 border border-red-500 text-red-400 rounded hover:bg-red-900/40 transition-all uppercase tracking-widest text-xs"
            >
                Factory Reset (Clear Data)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const useMenuNav = (itemCount, orientation = 'vertical', isActive = true) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { playNav } = useSound();

    useEffect(() => {
        if (!isActive) return;
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
            if (e.key.startsWith('F')) return;
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

/* --- NEW: GAMEPAD HOOK --- */
const useGamepad = (onInput, active = true, deadzone = 0.5) => {
    const lastInputTime = useRef(0);
    const lastButtonState = useRef({}); 

    useEffect(() => {
        if (!active) return;
        let animationFrameId;

        const checkGamepad = () => {
            const gamepads = navigator.getGamepads();
            if (!gamepads) return;

            const gp = Array.from(gamepads).find(g => g !== null); // Get first active gamepad
            if (!gp) {
                animationFrameId = requestAnimationFrame(checkGamepad);
                return;
            }

            const now = Date.now();
            // Debounce speed (150ms for nav)
            if (now - lastInputTime.current < 150) { 
                 animationFrameId = requestAnimationFrame(checkGamepad);
                 return;
            }

            // Standard Mappings (Steam/XInput Standard)
            // 0: A (Enter), 1: B (Back), 12: Up, 13: Down, 14: Left, 15: Right
            let action = null;

            // D-Pad / Buttons
            if (gp.buttons[0].pressed) action = 'enter';
            else if (gp.buttons[1].pressed) action = 'back';
            else if (gp.buttons[12].pressed) action = 'up';
            else if (gp.buttons[13].pressed) action = 'down';
            else if (gp.buttons[14].pressed) action = 'left';
            else if (gp.buttons[15].pressed) action = 'right';
            
            // Analog Stick (Left Stick)
            else if (gp.axes[1] < -deadzone) action = 'up';
            else if (gp.axes[1] > deadzone) action = 'down';
            else if (gp.axes[0] < -deadzone) action = 'left';
            else if (gp.axes[0] > deadzone) action = 'right';

            if (action) {
                onInput(action);
                lastInputTime.current = now;
                
                // Haptic feedback if supported and not 'back' (too annoying)
                if (gp.vibrationActuator && action !== 'back') {
                    try { gp.vibrationActuator.playEffect("dual-rumble", { startDelay: 0, duration: 20, weakMagnitude: 0.2, strongMagnitude: 0.1 }); } catch(e){}
                }
            }

            animationFrameId = requestAnimationFrame(checkGamepad);
        };

        animationFrameId = requestAnimationFrame(checkGamepad);
        return () => cancelAnimationFrame(animationFrameId);
    }, [active, onInput, deadzone]);
};

const useDraggable = (initialPosition = { x: 0, y: 0 }) => {
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

  return { position, dragRef, handleMouseDown, isDragging };
};

const useIdleTimer = (timeout, onIdle) => {
  useEffect(() => {
    let timer;
    const reset = () => { clearTimeout(timer); timer = setTimeout(onIdle, timeout); };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('touchstart', reset);
    reset();
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('touchstart', reset);
      clearTimeout(timer);
    };
  }, [timeout, onIdle]);
};

const getHueFromHex = (hex) => {
    if (!hex || hex.length !== 7 || hex === '#000000') return 210;
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

/* --- 2. WAVE ENGINE --- */
const WaveBackground = ({ bgColor, waveHue, dynamicWave, speedMultiplier = 1, blur = false }) => {
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
    if (!canvas) return;
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
      if (!dynamicWave) {
          // Simple solid background for performance mode
          const w = window.innerWidth;
          const h = window.innerHeight;
          const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
          gradient.addColorStop(0, currentBgColor.current);
          gradient.addColorStop(1, '#000000');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);
          animationFrameId = requestAnimationFrame(drawWave);
          return;
      }

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
      let waveBaseHue = currentWaveHue.current;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const hue = waveBaseHue + (i * 1.5);
        const alpha = (Math.sin(t * 0.1 + i * 0.1) * 0.5 + 0.5) * 0.15;
        ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${alpha})`;
        ctx.lineWidth = 3;
        for (let blurVal = -1; blurVal <= 1; blurVal += 1) {
            ctx.globalAlpha = alpha * (1 - Math.abs(blurVal) * 0.5);
            for (let x = 0; x <= w + 50; x += 15) {
                const yOffset = Math.sin(x * 0.0015 + t * 0.25 + i * 0.08) * 100 + Math.cos(x * 0.003 - t * 0.15) * 40;
                const y = centerY + yOffset + blurVal * 2;
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
  
  return <canvas ref={canvasRef} className={cn("fixed top-0 left-0 w-full h-full -z-10 transition-all duration-1000", blur ? "blur-xl scale-110 opacity-60" : "blur-0 scale-100 opacity-100")} />;
};

/* --- 3. WINDOW MANAGER CONTEXT --- */
const WindowContext = createContext();

const WindowManagerProvider = ({ children }) => {
    const [windows, setWindows] = useState([]); 
    const [activeId, setActiveId] = useState(null);
    const [viewMode, setViewMode] = useState('xmb'); 
    
    // Global Settings
    const [settings, setSettings] = useState(() => {
        try { 
            const defaults = { hue: 210, speed: 1, bgColor: '#131c2e', dynamicWave: true, controllerVibration: true, controllerLayout: 'xbox' };
            const saved = JSON.parse(localStorage.getItem('aether_settings'));
            return { ...defaults, ...saved };
        }
        catch { return { hue: 210, speed: 1, bgColor: '#131c2e', dynamicWave: true, controllerVibration: true, controllerLayout: 'xbox' }; }
    });

    const updateSetting = (key, value) => {
        setSettings(p => { 
            const newSettings = {...p, [key]: value}; 
            localStorage.setItem('aether_settings', JSON.stringify(newSettings)); 
            return newSettings; 
        });
    };

    // User State with Default Admin Permissions
    const [users, setUsers] = useState(() => {
        try { 
            const storedUsers = JSON.parse(localStorage.getItem('aether_users')); 
            if (Array.isArray(storedUsers) && storedUsers.length > 0) return storedUsers;
        } catch {}
        return [
            { id: 'u1', name: 'User', pattern: 'up,up,down,down', color: '#3b82f6', pfp: null, isAdmin: false }, 
            { id: 'u2', name: 'Admin', pattern: 'left,right,left,right,up,down,enter', color: '#ef4444', pfp: null, isAdmin: true } 
        ];
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [xmbActiveApp, setXmbActiveApp] = useState(null);
    // Launch State
    const [launchingItem, setLaunchingItem] = useState(null);

    const triggerLaunch = async (title, icon, action) => {
        setLaunchingItem({ title, icon });
        // Play sound if available in context scope, otherwise UI handles it
        
        // Artificial delay for the "feel" of the OS loading resources
        setTimeout(async () => {
            await action();
            // Small delay before clearing overlay to ensure window is ready
            setTimeout(() => setLaunchingItem(null), 500); 
        }, 1500);
    };


    const [autoDesktop, setAutoDesktop] = useState(() => {
        try { return JSON.parse(localStorage.getItem('aether_auto_desktop') || 'false'); }
        catch { return false; }
    });

    const updateUsers = (newUsers) => { setUsers(newUsers); localStorage.setItem('aether_users', JSON.stringify(newUsers)); };

    const toggleAutoDesktop = () => {
        setAutoDesktop(prev => {
            const newVal = !prev;
            localStorage.setItem('aether_auto_desktop', JSON.stringify(newVal));
            return newVal;
        });
    };
    
    const openWindow = (appId, title, component, icon = Package, isProductive = false) => {
        setWindows(prev => {
            if (prev.find(w => w.id === appId)) {
                return prev.map(w => w.id === appId ? { ...w, isMinimized: false, zIndex: Date.now() } : w);
            }
            return [...prev, {
                id: appId,
                title,
                component,
                icon,
                isMinimized: false,
                isMaximized: false,
                zIndex: Date.now(),
                x: 100 + (prev.length * 30),
                y: 50 + (prev.length * 30),
                width: 900,
                height: 600
            }];
        });
        setActiveId(appId);
        if (autoDesktop && isProductive) {
            setViewMode('desktop');
        }
    };

    const closeWindow = (id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        if (activeId === id) setActiveId(null);
    };

    const minimizeWindow = (id) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
        setActiveId(null);
    };

    const maximizeWindow = (id) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized, zIndex: Date.now() } : w));
        setActiveId(id);
    };

    const focusWindow = (id) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: Date.now(), isMinimized: false } : w));
        setActiveId(id);
    };

    const toggleViewMode = () => setViewMode(prev => prev === 'xmb' ? 'desktop' : 'xmb');

    return (
        <WindowContext.Provider value={{ 
            windows, activeId, viewMode, autoDesktop, users, currentUser, xmbActiveApp, settings,
            setUsers, updateUsers, setCurrentUser, setXmbActiveApp, updateSetting,
            openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow,
            toggleViewMode, setViewMode, toggleAutoDesktop, 
            launchingItem, triggerLaunch // EXPOSED

        }}>
            {children}
        </WindowContext.Provider>
    );
};


/* --- 4. INTERNAL APPS --- */

const OllamaApp = ({ close }) => {
    const [messages, setMessages] = useState([{ role: 'assistant', content: 'Aether AI ready. Select a model to begin.'}]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await fetch('http://localhost:11434/api/tags');
                if(!res.ok) throw new Error('Ollama connection failed');
                const data = await res.json();
                setModels(data.models || []);
                if(data.models && data.models.length > 0) {
                    setSelectedModel(data.models[0].name);
                }
            } catch (err) {
                setError('Could not connect to local Ollama instance at http://localhost:11434. Ensure Ollama is running.');
            }
        };
        fetchModels();
    }, []);

    useEffect(() => {
        if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if(!input.trim() || !selectedModel) return;
        const userMsg = input;
        setInput('');
        setMessages(p => [...p, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel, 
                    prompt: userMsg,
                    stream: false 
                })
            });
            const data = await res.json();
            setMessages(p => [...p, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setMessages(p => [...p, { role: 'assistant', content: 'Error: Connection lost.' }]);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#111] text-white">
            <div className="p-2 border-b border-white/10 bg-[#1a1a1a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">Aether AI</span>
                </div>
                {error ? (
                    <span className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10}/> {error}</span>
                ) : (
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] opacity-50 uppercase">Model:</span>
                         <div className="relative">
                            <select 
                                className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs appearance-none pr-6 outline-none focus:border-blue-500"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                            >
                                {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                                {models.length === 0 && <option>Scanning...</option>}
                            </select>
                            <ChevronDown size={10} className="absolute right-2 top-1.5 pointer-events-none opacity-50"/>
                         </div>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-600' : 'bg-white/10 border border-white/5'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs opacity-50 animate-pulse ml-2">Thinking...</div>}
            </div>
            <form onSubmit={sendMessage} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                <input 
                    className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 outline-none focus:border-blue-500 transition-colors text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={error ? "AI Service Offline" : `Message ${selectedModel}...`}
                    disabled={!!error}
                />
                <button disabled={!!error} className="p-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Send size={18}/></button>
            </form>
        </div>
    );
};

const NetworkApp = ({ close }) => {
    const [url, setUrl] = useState('https://www.wikipedia.org');
    const [inputUrl, setInputUrl] = useState('https://www.wikipedia.org');
    const [isLoading, setIsLoading] = useState(false);
    const [isElectron, setIsElectron] = useState(false);
    
    useEffect(() => {
        if(window.aetherSystem?.platform) setIsElectron(true);
    }, []);

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
        <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-white">
            <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#2a2a2a]">
                <div className="flex gap-1">
                    <button onClick={close} className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"><ArrowLeft size={14}/></button>
                    <button className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button>
                </div>
                <form onSubmit={navigate} className="flex-1 flex items-center bg-black/40 rounded-full px-3 py-1.5 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                    <Lock size={10} className="text-green-500 mr-2" />
                    <input 
                        className="flex-1 bg-transparent text-xs font-mono outline-none text-white/80" 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()} 
                    />
                </form>
                <button onClick={handleExternal} className="p-1.5 hover:bg-white/10 rounded text-xs font-bold px-3 ml-2 flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Globe size={12}/> OPEN EXT
                </button>
            </div>
            <div className="flex-1 relative bg-white overflow-hidden">
                {isElectron ? (
                    React.createElement('webview', {
                        src: url,
                        style: { width: '100%', height: '100%' },
                        allowpopups: 'true'
                    })
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-black bg-gray-100 z-0">
                        <iframe src={url} className="absolute inset-0 w-full h-full z-10" title="browser-preview" />
                    </div>
                )}
            </div>
        </div>
    );
};

const AboutSystemApp = ({ close }) => {
    const [specs, setSpecs] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('idle');
    const [remoteCommit, setRemoteCommit] = useState(null);
    const currentVersion = "v1.2.1"; 

    useEffect(() => {
        const loadSpecs = async () => {
            if (window.aetherSystem?.getSpecs) {
                const s = await window.aetherSystem.getSpecs();
                setSpecs(s);
            } else {
                setSpecs({ cpu: 'Web Environment (Simulated)', ram: 'N/A', os: 'Browser', gpu: 'WebGL' });
            }
        };
        loadSpecs();
    }, []);

    const checkForUpdates = async () => {
        setUpdateStatus('checking');
        try {
            // Checking the provided GitHub repo for the latest commit
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

    return (
        <div className="flex flex-col h-full p-8 text-white">
            <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-1 ring-white/10">
                    <Activity size={48} className="text-white drop-shadow-md" />
                </div>
                <div>
                    <h1 className="text-4xl font-thin tracking-tight">Aether OS</h1>
                    <div className="text-sm opacity-60 font-mono mt-1 tracking-wider">{currentVersion} (Stable)</div>
                    <div className="text-[10px] opacity-40 mt-1 uppercase tracking-[0.2em]">Kernel: {window.aetherSystem?.platform || 'WEB'}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-[10px] uppercase opacity-40 mb-2 tracking-widest font-bold">Processor</div>
                    <div className="font-mono text-sm truncate text-blue-200" title={specs?.cpu}>{specs?.cpu || 'Initializing...'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-[10px] uppercase opacity-40 mb-2 tracking-widest font-bold">Memory</div>
                    <div className="font-mono text-sm text-purple-200">{specs?.ram || '...'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-[10px] uppercase opacity-40 mb-2 tracking-widest font-bold">Graphics Unit</div>
                    <div className="font-mono text-sm truncate text-green-200" title={specs?.gpu}>{specs?.gpu || '...'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-[10px] uppercase opacity-40 mb-2 tracking-widest font-bold">Build Distro</div>
                    <div className="font-mono text-sm text-yellow-200">{specs?.os || '...'}</div>
                </div>
            </div>

            <div className="mt-auto bg-[#0a0a0a] rounded-xl p-5 border border-white/10 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <GitBranch size={18} className="text-blue-400"/>
                        <div>
                            <div className="text-sm font-bold tracking-wide">System Update</div>
                            <div className="text-[10px] opacity-40 font-mono">Repo: DeltaEpiales/aether</div>
                        </div>
                    </div>
                    {updateStatus === 'idle' && (
                        <button onClick={checkForUpdates} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs uppercase tracking-widest transition-all hover:scale-105">Check for Updates</button>
                    )}
                    {updateStatus === 'uptodate' && (
                        <div className="text-right">
                            <span className="text-xs text-green-400 uppercase tracking-widest flex items-center gap-2 justify-end"><Check size={12}/> Up to Date</span>
                            {remoteCommit && <span className="text-[9px] opacity-40 font-mono">Commit: {remoteCommit.sha.substring(0,7)}</span>}
                        </div>
                    )}
                    {updateStatus === 'checking' && <div className="text-xs opacity-50 animate-pulse font-mono">&gt; Contacting GitHub...</div>}
                    {updateStatus === 'error' && <div className="text-xs text-red-400 font-mono">Connection Failed</div>}
                </div>
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
        close(); 
    }

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




const SettingsApp = ({ currentUser, close, systemVolume, setSystemVolume, brightness, setBrightness, wifiState, setWifiState }) => {
    const { viewMode, autoDesktop, toggleAutoDesktop, settings, updateSetting, users } = useContext(WindowContext);
    const [connectedPad, setConnectedPad] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); 

    // XMB Controller State
    const [xmbSection, setXmbSection] = useState('menu'); // 'menu' or 'control'
    const { selectedIndex: menuIndex, setSelectedIndex: setMenuIndex } = useMenuNav(3, 'vertical', xmbSection === 'menu');
    
    // Poll for gamepad
    useEffect(() => {
        const check = () => {
            const gps = navigator.getGamepads();
            const gp = Array.from(gps).find(g => g !== null);
            setConnectedPad(gp ? gp.id : null);
            requestAnimationFrame(check);
        };
        check();
    }, []);
    
    // Controller Input Handler
    useGamepad((action) => {
        // Only capture input if we are in XMB mode OR if this is the active window in desktop mode
        // (For simplicity in this patch, we assume XMB mode takes priority for gamepad)
        if (viewMode !== 'xmb') return;

        if (xmbSection === 'menu') {
            if (action === 'down') setMenuIndex(prev => (prev + 1) % 3);
            if (action === 'up') setMenuIndex(prev => (prev - 1 + 3) % 3);
            if (action === 'enter' || action === 'right') {
                setXmbSection('control');
                const tabs = ['general', 'controller', 'audio'];
                setActiveTab(tabs[menuIndex]);
            }
            if (action === 'back') close();
        } 
        else if (xmbSection === 'control') {
            if (action === 'back' || action === 'left') setXmbSection('menu');
            
            // Toggle Logic
            if (action === 'enter') {
                if (activeTab === 'general') {
                    // Simple toggle based on a fake "selected" item logic or just toggle the main switch
                    // For this refined UI, ENTER toggles the main feature of the page
                     if(autoDesktop) toggleAutoDesktop(); else toggleAutoDesktop(); // Toggle
                }
                if (activeTab === 'controller') updateSetting('controllerVibration', !settings.controllerVibration);
            }
        }
    }, true);

    const handleFactoryReset = () => {
        if(confirm("WARNING: This will clear all local user data. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    // SHARED RENDER LOGIC
    const isXmb = viewMode === 'xmb';
    
    // In XMB mode, we go full screen overlay. In Desktop, we fill the window.
    const containerClass = isXmb 
        ? "fixed inset-0 z-[100] bg-[#050505] text-white font-sans flex" 
        : "flex h-full w-full bg-[#050505] text-white font-sans";

    const menuItems = [
        { id: 'general', label: 'System', icon: Settings },
        { id: 'controller', label: 'Controller', icon: Gamepad2 },
        { id: 'audio', label: 'Audio', icon: Volume2 }
    ];

    // Helper to determine active tab based on input mode
    const currentTabId = isXmb ? menuItems[menuIndex].id : activeTab;

    return (
        <div className={containerClass}>
            {/* LEFT SIDEBAR */}
            <div className="w-1/3 max-w-xs h-full border-r border-white/10 bg-[#0a0a0a] flex flex-col pt-12 relative z-20">
                <div className="px-8 mb-8">
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500 mb-2">Configuration</div>
                    <div className="text-2xl font-light text-white">Settings</div>
                </div>
                
                <div className="flex-1 space-y-2 px-4">
                    {menuItems.map((item, i) => {
                        const isActive = isXmb ? i === menuIndex : activeTab === item.id;
                        const isFocused = isXmb && xmbSection === 'menu' && isActive;
                        
                        return (
                            <div 
                                key={item.id}
                                onClick={() => !isXmb && setActiveTab(item.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer ${isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'} ${isFocused ? 'ring-1 ring-blue-500 bg-blue-500/10' : ''}`}
                            >
                                <item.icon size={20} />
                                <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                                {isActive && xmbSection === 'control' && isXmb && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>}
                            </div>
                        );
                    })}
                </div>

                {isXmb && (
                    <div className="p-8 text-[10px] text-white/30 space-y-2 font-mono">
                        <div className="flex justify-between"><span>NAVIGATE</span> <span>D-PAD</span></div>
                        <div className="flex justify-between"><span>SELECT</span> <span>A / ENTER</span></div>
                        <div className="flex justify-between"><span>BACK</span> <span>B / ESC</span></div>
                    </div>
                )}
            </div>

            {/* RIGHT CONTENT PANEL */}
            {/* We removed opacity-30 and blur-sm to fix the visibility issue */}
            <div className={`flex-1 h-full bg-[#050505] relative flex flex-col px-12 py-12 transition-all duration-300 ${isXmb && xmbSection === 'menu' ? 'opacity-50 scale-95 origin-left' : 'opacity-100 scale-100'}`}>
                
                {/* GENERAL TAB */}
                {(isXmb ? menuItems[menuIndex].id : activeTab) === 'general' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-3xl font-thin border-b border-white/10 pb-6 mb-8">System Preferences</h2>
                        
                        {/* Option 1 */}
                        <div className={`flex items-center justify-between p-6 rounded-xl border transition-all ${isXmb && xmbSection === 'control' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <Monitor size={24} className="text-blue-400"/>
                                <div>
                                    <div className="text-lg font-medium">Auto-Desktop Mode</div>
                                    <div className="text-xs opacity-50">Switch to desktop view when launching productive apps</div>
                                </div>
                            </div>
                            {/* Toggle Switch */}
                            <div 
                                onClick={toggleAutoDesktop}
                                className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${autoDesktop ? 'bg-blue-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${autoDesktop ? 'left-8' : 'left-1'}`}></div>
                            </div>
                        </div>

                        {/* Option 2 */}
                        <div className="flex items-center justify-between p-6 rounded-xl border border-white/10 bg-white/5">
                            <div className="flex items-center gap-4">
                                <ImageIcon size={24} className="text-purple-400"/>
                                <div>
                                    <div className="text-lg font-medium">Dynamic Waves</div>
                                    <div className="text-xs opacity-50">Enable background particle simulation</div>
                                </div>
                            </div>
                            <div 
                                onClick={() => updateSetting('dynamicWave', !settings.dynamicWave)}
                                className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings.dynamicWave ? 'bg-purple-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${settings.dynamicWave ? 'left-8' : 'left-1'}`}></div>
                            </div>
                        </div>
                        
                        <div className="pt-8 mt-8 border-t border-white/10">
                             <button onClick={handleFactoryReset} className="flex items-center gap-3 px-6 py-3 bg-red-900/10 border border-red-500/30 text-red-400 hover:bg-red-900/30 rounded-lg text-sm font-bold uppercase tracking-wider transition-all">
                                <Eraser size={16} /> Factory Reset System
                            </button>
                        </div>
                    </div>
                )}

                {/* CONTROLLER TAB */}
                {(isXmb ? menuItems[menuIndex].id : activeTab) === 'controller' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-3xl font-thin border-b border-white/10 pb-6 mb-8">Input Devices</h2>
                        
                        <div className="p-8 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/10 flex items-center gap-8">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${connectedPad ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                                <Gamepad2 size={48} />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Status</div>
                                <div className="text-3xl font-bold uppercase tracking-widest mb-2">{connectedPad ? "Connected" : "No Device"}</div>
                                <div className="text-sm font-mono opacity-50">{connectedPad || "Plug in a USB or Bluetooth controller"}</div>
                            </div>
                        </div>

                         <div className={`flex items-center justify-between p-6 rounded-xl border transition-all ${isXmb && xmbSection === 'control' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <Zap size={24} className="text-yellow-400"/>
                                <div>
                                    <div className="text-lg font-medium">Haptic Feedback</div>
                                    <div className="text-xs opacity-50">Enable vibration for supported controllers</div>
                                </div>
                            </div>
                            <div 
                                onClick={() => updateSetting('controllerVibration', !settings.controllerVibration)}
                                className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings.controllerVibration ? 'bg-yellow-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${settings.controllerVibration ? 'left-8' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AUDIO TAB */}
                {(isXmb ? menuItems[menuIndex].id : activeTab) === 'audio' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-3xl font-thin border-b border-white/10 pb-6 mb-8">Master Audio</h2>
                        
                        <div className={`p-12 rounded-3xl border transition-all ${isXmb && xmbSection === 'control' ? 'bg-blue-600/10 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                             <div className="flex justify-between items-end mb-8">
                                <Volume2 size={48} className="text-white/80"/>
                                <span className="text-8xl font-thin tracking-tighter">{Math.round(systemVolume * 100)}<span className="text-2xl opacity-50">%</span></span>
                            </div>
                            
                            {/* Visual Bar */}
                            <div className="w-full h-6 bg-black/50 rounded-full overflow-hidden border border-white/10 p-1">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-out shadow-[0_0_20px_#3b82f6]" style={{ width: `${systemVolume * 100}%` }}></div>
                            </div>

                            {!isXmb && (
                                <input 
                                    type="range" min="0" max="100" 
                                    value={Math.round(systemVolume * 100)} 
                                    onChange={(e) => { const val = parseInt(e.target.value) / 100; setSystemVolume(val); if(window.aetherSystem?.setVolume) window.aetherSystem.setVolume(e.target.value); }}
                                    className="w-full mt-8"
                                />
                            )}

                            {isXmb && <div className="text-center mt-6 text-xs uppercase tracking-widest opacity-40">Use System Volume Keys to Adjust</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const UserManagementApp = ({ close, users, currentUser, updateUsers, updateLockPattern }) => {
    const userList = users || [{ id: 'u1', name: 'User', color: '#333' }];
    const curUser = currentUser || userList[0];
    const [editMode, setEditMode] = useState(null); // id of user being edited
    const [editData, setEditData] = useState({ name: '', color: '', pfp: '', isAdmin: false });
    const [patternRecordMode, setPatternRecordMode] = useState(false);
    const [newPattern, setNewPattern] = useState([]);

    const startEdit = (user) => {
        setEditMode(user.id);
        setEditData({ 
            name: user.name, 
            color: user.color || '#333333', 
            pfp: user.pfp || '',
            isAdmin: user.isAdmin || false
        });
        setPatternRecordMode(false);
        setNewPattern([]);
    };

    const handleCreateUser = () => {
        if (!curUser.isAdmin) return alert("Only Admins can create users.");
        const newUser = {
            id: `u${Date.now()}`,
            name: 'New User',
            color: '#808080',
            pattern: 'up,up,down,down',
            isAdmin: false,
            pfp: null
        };
        updateUsers([...users, newUser]);
    };

    const handleDeleteUser = (id) => {
        if (!curUser.isAdmin) return alert("Only Admins can delete users.");
        if (id === curUser.id) return alert("Cannot delete your own account while active.");
        if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
            updateUsers(users.filter(u => u.id !== id));
            setEditMode(null);
        }
    };

    const saveEdit = (id) => {
        const updatedUsers = users.map(u => {
            if (u.id === id) {
                return { 
                    ...u, 
                    name: editData.name, 
                    color: editData.color, 
                    pfp: editData.pfp,
                    isAdmin: editData.isAdmin,
                    pattern: newPattern.length > 0 ? newPattern.join(',') : u.pattern
                };
            }
            return u;
        });
        updateUsers(updatedUsers);
        setEditMode(null);
        setPatternRecordMode(false);
    };

    // Pattern Recording Logic
    useEffect(() => {
        if (!patternRecordMode) return;
        const handleRecordKey = (e) => {
            const keyMap = { 'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right', 'Enter': 'enter' };
            if (keyMap[e.key]) {
                e.preventDefault();
                e.stopPropagation();
                if (newPattern.length < 10) {
                    setNewPattern(prev => [...prev, keyMap[e.key]]);
                }
            } else if (e.key === 'Escape') {
                setPatternRecordMode(false);
                setNewPattern([]);
            }
        };
        window.addEventListener('keydown', handleRecordKey);
        return () => window.removeEventListener('keydown', handleRecordKey);
    }, [patternRecordMode, newPattern]);

    return (
        <div className="p-8 text-white h-full overflow-y-auto font-mono flex flex-col">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <h2 className="text-xl uppercase tracking-widest text-blue-400 flex items-center gap-3">
                    <Users size={24}/>
                    <span>User Management</span>
                </h2>
                {curUser.isAdmin && !editMode && (
                    <button onClick={handleCreateUser} className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded hover:bg-green-600/40 text-xs font-bold uppercase transition-all">
                        <UserPlus size={14}/> New User
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {userList.map((u) => (
                    <div key={u.id} className={`p-4 rounded border transition-all duration-300 ${editMode === u.id ? 'bg-white/10 border-blue-500/50 scale-[1.01] shadow-2xl' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                        {editMode === u.id ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-6">
                                     <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 shadow-lg shrink-0">
                                        {editData.pfp ? (
                                            <img src={editData.pfp} alt="pfp" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-black" style={{backgroundColor: editData.color}}>{editData.name.charAt(0)}</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white mb-1"/>
                                            <span className="text-[8px] uppercase tracking-wider">Change URL</span>
                                        </div>
                                     </div>
                                     
                                     <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase opacity-50 block mb-1 font-bold tracking-wider">Username</label>
                                                <input 
                                                    value={editData.name} 
                                                    onChange={e => setEditData({...editData, name: e.target.value})} 
                                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 focus:border-blue-500 outline-none text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase opacity-50 block mb-1 font-bold tracking-wider">Theme Color</label>
                                                <div className="flex gap-2 items-center h-[38px]">
                                                    {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff'].map(c => (
                                                        <button 
                                                            key={c}
                                                            onClick={() => setEditData({...editData, color: c})}
                                                            className={`w-6 h-6 rounded-full border-2 transition-transform ${editData.color === c ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                            style={{backgroundColor: c}}
                                                        />
                                                    ))}
                                                    <input type="color" value={editData.color} onChange={e => setEditData({...editData, color: e.target.value})} className="w-6 h-6 rounded-full border-none p-0 overflow-hidden ml-2 cursor-pointer" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] uppercase opacity-50 block mb-1 font-bold tracking-wider">Profile Image URL</label>
                                            <input 
                                                value={editData.pfp} 
                                                onChange={e => setEditData({...editData, pfp: e.target.value})} 
                                                placeholder="https://example.com/avatar.jpg"
                                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 focus:border-blue-500 outline-none text-xs font-mono text-white/70"
                                            />
                                        </div>
                                     </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {curUser.isAdmin ? (
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${editData.isAdmin ? 'bg-red-500' : 'bg-slate-700'}`}>
                                                        <input type="checkbox" className="hidden" checked={editData.isAdmin} onChange={e => setEditData({...editData, isAdmin: e.target.checked})} />
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editData.isAdmin ? 'left-6' : 'left-1'}`}></div>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${editData.isAdmin ? 'text-red-400' : 'text-white/50 group-hover:text-white'}`}>Administrator Privileges</span>
                                                </label>
                                            ) : (
                                                <div className="flex items-center gap-2 opacity-50" title="Only Admins can change privileges">
                                                    <Shield size={14} />
                                                    <span className="text-xs uppercase">Role: {editData.isAdmin ? 'Admin' : 'Standard'}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {patternRecordMode ? (
                                                <div className="flex items-center gap-3 bg-black/60 px-4 py-1.5 rounded-lg border border-yellow-500/30 animate-pulse">
                                                    <span className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold">Recording:</span>
                                                    <div className="flex gap-1">
                                                        {newPattern.map((k, i) => {
                                                            const R = k === 'up' ? ArrowUp : k === 'down' ? ArrowUp : k === 'left' ? ArrowLeft : k === 'right' ? ArrowLeft : Check;
                                                            const rot = k === 'down' ? 'rotate-180' : k === 'right' ? 'rotate-180' : 'rotate-0';
                                                            return <R key={i} size={12} className={`text-white ${rot}`} />;
                                                        })}
                                                        {newPattern.length === 0 && <span className="text-[10px] text-white/30">Use Arrow Keys...</span>}
                                                    </div>
                                                    <button onClick={() => setPatternRecordMode(false)} className="ml-2 text-[10px] underline hover:text-white text-white/50">Done</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => { setPatternRecordMode(true); setNewPattern([]); }} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs uppercase tracking-wider transition-all">
                                                    <KeyRound size={14} className="text-yellow-400"/> Change Passcode
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        {curUser.isAdmin && u.id !== curUser.id ? (
                                            <button onClick={() => handleDeleteUser(u.id)} className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded text-xs uppercase font-bold transition-all">
                                                <Trash2 size={14}/> Delete User
                                            </button>
                                        ) : <div></div>}
                                        
                                        <div className="flex gap-3">
                                            <button onClick={() => setEditMode(null)} className="px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-xs uppercase font-bold tracking-wider">Cancel</button>
                                            <button onClick={() => saveEdit(u.id)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs uppercase font-bold tracking-wider shadow-lg shadow-blue-900/20">Save Changes</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-black overflow-hidden relative shadow-lg" style={{backgroundColor: u.color || '#ccc'}}>
                                        {u.pfp ? <img src={u.pfp} className="w-full h-full object-cover" alt=""/> : u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                                            {u.name}
                                            {u.isAdmin && <Shield size={12} className="text-red-400" title="Administrator" />}
                                        </div>
                                        <div className="text-[10px] opacity-50 font-mono flex gap-2">
                                            <span>{u.id === curUser.id ? '● ACTIVE SESSION' : '○ OFFLINE'}</span>
                                            {u.isAdmin && <span className="text-red-400/70">ADMIN</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => curUser.isAdmin || u.id === curUser.id ? startEdit(u) : alert("Access Denied")} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* --- FUNCTIONAL APPS (REPLACING PLACEHOLDERS) --- */

const CalculatorApp = ({ close }) => {
    const [display, setDisplay] = useState('0');
    const [prev, setPrev] = useState(null);
    const [op, setOp] = useState(null);
    const [newNum, setNewNum] = useState(true);

    const handleNum = (num) => {
        if (newNum) {
            setDisplay(num.toString());
            setNewNum(false);
        } else {
            setDisplay(display === '0' ? num.toString() : display + num);
        }
    };

    const handleOp = (operation) => {
        setOp(operation);
        setPrev(parseFloat(display));
        setNewNum(true);
    };

    const calculate = () => {
        if (prev === null || op === null) return;
        const current = parseFloat(display);
        let result = 0;
        switch(op) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '×': result = prev * current; break;
            case '÷': result = prev / current; break;
        }
        setDisplay(result.toString());
        setPrev(null);
        setOp(null);
        setNewNum(true);
    };

    const clear = () => {
        setDisplay('0');
        setPrev(null);
        setOp(null);
        setNewNum(true);
    };

    const btnClass = "h-12 rounded-lg font-bold text-lg transition-all active:scale-95 flex items-center justify-center select-none";
    const numClass = `${btnClass} bg-white/10 hover:bg-white/20 text-white`;
    const opClass = `${btnClass} bg-blue-600 hover:bg-blue-500 text-white`;
    const actionClass = `${btnClass} bg-gray-500/50 hover:bg-gray-400/50 text-black`;

    return (
        <div className="flex flex-col h-full bg-[#111] p-4 text-white">
            <div className="flex-1 flex items-end justify-end text-5xl font-light font-mono mb-6 px-2 break-all">
                {display}
            </div>
            <div className="grid grid-cols-4 gap-3">
                <button onClick={clear} className={`${actionClass} col-span-3 text-white`}>AC</button>
                <button onClick={() => handleOp('÷')} className={opClass}>÷</button>
                <button onClick={() => handleNum(7)} className={numClass}>7</button>
                <button onClick={() => handleNum(8)} className={numClass}>8</button>
                <button onClick={() => handleNum(9)} className={numClass}>9</button>
                <button onClick={() => handleOp('×')} className={opClass}>×</button>
                <button onClick={() => handleNum(4)} className={numClass}>4</button>
                <button onClick={() => handleNum(5)} className={numClass}>5</button>
                <button onClick={() => handleNum(6)} className={numClass}>6</button>
                <button onClick={() => handleOp('-')} className={opClass}>-</button>
                <button onClick={() => handleNum(1)} className={numClass}>1</button>
                <button onClick={() => handleNum(2)} className={numClass}>2</button>
                <button onClick={() => handleNum(3)} className={numClass}>3</button>
                <button onClick={() => handleOp('+')} className={opClass}>+</button>
                <button onClick={() => handleNum(0)} className={`${numClass} col-span-2`}>0</button>
                <button onClick={() => setDisplay(display + '.')} className={numClass}>.</button>
                <button onClick={calculate} className={`${opClass} bg-green-600 hover:bg-green-500`}>=</button>
            </div>
        </div>
    );
};

const PaintApp = ({ close }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [ctx, setCtx] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.fillStyle = '#000000';
        context.fillRect(0,0, canvas.width, canvas.height);
        setCtx(context);
    }, []);

    const startDraw = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        if(ctx) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            setIsDrawing(true);
        }
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || !ctx) return;
        const { offsetX, offsetY } = nativeEvent;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDraw = () => {
        if(ctx) ctx.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#222]">
            <div className="flex items-center gap-4 p-2 bg-[#333] border-b border-white/10">
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    className="w-8 h-8 rounded cursor-pointer border-none"
                />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Size</span>
                    <input 
                        type="range" min="1" max="50" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(e.target.value)}
                        className="w-24 accent-blue-500"
                    />
                </div>
                <button onClick={clearCanvas} className="px-3 py-1 bg-white/10 text-white text-xs rounded hover:bg-white/20">Clear</button>
                <div className="flex-1"></div>
                <button onClick={() => {
                    const link = document.createElement('a');
                    link.download = `drawing_${Date.now()}.png`;
                    link.href = canvasRef.current.toDataURL();
                    link.click();
                }} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500">Save</button>
            </div>
            <div className="flex-1 relative cursor-crosshair overflow-hidden">
                <canvas 
                    ref={canvasRef}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                />
            </div>
        </div>
    );
};

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


const TerminalApp = ({ close }) => {
    const [history, setHistory] = useState(['AetherOS Kernel v1.2.1 [Secure Mode]', 'Type "help" for commands.']);
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('~');
    const bottomRef = useRef(null);

    useEffect(() => {
        if(bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        const cmd = input.trim();
        const newHistory = [...history, `${cwd} $ ${cmd}`];
        setInput('');
        
        if (cmd === 'clear') {
            setHistory([]);
            return;
        }
        if (cmd === 'help') {
            setHistory([...newHistory, 'Available commands: dir, cd, ipconfig, whoami, echo, clear, exit']);
            return;
        }
        if (cmd === 'exit') {
            close();
            return;
        }

        if (window.aetherSystem?.execCommand) {
            const output = await window.aetherSystem.execCommand(cmd);
            setHistory([...newHistory, output]);
        } else {
            setHistory([...newHistory, 'Terminal not available in web mode.']);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black text-green-500 font-mono p-4 text-sm overflow-hidden" onClick={() => document.getElementById('term-input').focus()}>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {history.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words">{line}</div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={handleCommand} className="mt-2 flex gap-2 items-center border-t border-green-900/30 pt-2">
                <span className="text-blue-400 font-bold">{cwd} $</span>
                <input 
                    id="term-input"
                    className="flex-1 bg-transparent outline-none text-green-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                    autoComplete="off"
                />
            </form>
        </div>
    );
};

/* --- 5. LEGACY XMB COMPONENTS (FOR ORIGINAL XMB MODE) --- */
const WindowedApp = ({ title, onClose, children, width = 'w-[85%]', height = 'h-[80%]' }) => {
  const { position, dragRef, handleMouseDown, isDragging } = useDraggable({ x: window.innerWidth/2 - 400, y: window.innerHeight/2 - 300 });

  useEffect(() => {
    const handleGlobalClose = (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    window.addEventListener('keydown', handleGlobalClose);
    return () => window.removeEventListener('keydown', handleGlobalClose);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none"> 
      <div 
        className={`pointer-events-auto absolute flex flex-col overflow-hidden text-white bg-[#0b0e14]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-lg animate-in zoom-in-95 duration-200 ${width} ${height} ${isDragging ? 'cursor-grabbing opacity-90 scale-[1.01]' : ''}`}
        style={{ left: position.x, top: position.y, width: '900px', height: '600px', maxWidth: '95vw', maxHeight: '90vh' }}
      >
        <div 
            ref={dragRef}
            onMouseDown={handleMouseDown}
            className="h-9 bg-[#161b22] flex items-center justify-between px-4 border-b border-white/5 select-none shrink-0 cursor-grab active:cursor-grabbing group"
        >
          <div className="flex items-center gap-3">
              <div className="flex gap-2">
                 <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 shadow-inner" />
                 <button onClick={() => window.aetherSystem?.minimize()} className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 shadow-inner" />
                 <button className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 shadow-inner" />
              </div>
              <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
              <span className="text-white/80 font-bold tracking-wider text-[11px] uppercase font-mono group-hover:text-white transition-colors">{title}</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative bg-[#050505]/50">
           {children}
        </div>
      </div>
    </div>
  );
};

const ContextMenu = ({ x, y, onClose, options }) => {
    useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    return (
        <div 
            className="fixed z-[9999] w-48 bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-75 flex flex-col"
            style={{ top: y, left: x }}
        >
            {options.map((opt, i) => (
                <button 
                    key={i} 
                    onClick={(e) => { e.stopPropagation(); opt.action(); onClose(); }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 text-left group transition-colors"
                >
                    <opt.icon size={14} className="text-white/50 group-hover:text-white" />
                    <span className="text-xs text-white/80 group-hover:text-white font-medium">{opt.label}</span>
                </button>
            ))}
        </div>
    );
};

const NotificationSystem = ({ notifications }) => {
    return (
        <div className="fixed bottom-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {notifications.map(n => (
                <div key={n.id} className="pointer-events-auto bg-[#1a1a1a]/90 backdrop-blur-md border-l-4 border-blue-500 text-white p-4 rounded shadow-2xl min-w-[300px] animate-in slide-in-from-right fade-in duration-300 flex items-start gap-3">
                    <div className="mt-1"><Info size={16} className="text-blue-400"/></div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">{n.title}</div>
                        <div className="text-sm opacity-80">{n.message}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const LockScreen = ({ users, currentUser, onUnlock, onSwitchUser, playSuccess, playFail, updateLockPattern }) => {
    const isSetupMode = !currentUser.pattern || currentUser.pattern === '';
    const isNoLock = currentUser.pattern === 'none';
    const [status, setStatus] = useState(isSetupMode ? 'CREATE PASSCODE (D-PAD)' : (isNoLock ? 'PRESS A / ENTER' : 'ENTER PASSCODE'));
    const [inputMode, setInputMode] = useState(isSetupMode); 
    const [patternInput, setPatternInput] = useState([]);
    const [errorCount, setErrorCount] = useState(0);
    const patternRef = useRef(patternInput);
    patternRef.current = patternInput;
    
    const keyMap = { 'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right', 'Enter': 'enter' };
    const userPattern = currentUser.pattern ? currentUser.pattern.split(',') : ['up', 'up', 'down', 'down'];
    
    // --- CONTROLLER INPUT ---
    useGamepad((action) => {
        if(action === 'back') {
             // If locked out or just want to switch
             onSwitchUser();
             return;
        }
        // Map controller actions to keyboard keys for the handler
        const simKey = { 'up': 'ArrowUp', 'down': 'ArrowDown', 'left': 'ArrowLeft', 'right': 'ArrowRight', 'enter': 'Enter' }[action];
        if(simKey) handleKeydown({ key: simKey, preventDefault: () => {}, stopPropagation: () => {} });
    }, true);

    const handleKeydown = useCallback((e) => {
        if(e.preventDefault) e.preventDefault(); 
        if(e.stopPropagation) e.stopPropagation(); 

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
                    {isSetupMode && patternInput.length === 0 && <span className="text-white/30 text-xs">USE D-PAD</span>}
                 </div>
             )}
             {isSetupMode && <div className="mt-8 flex flex-col items-center gap-2 text-[10px] text-white/50 tracking-widest"><div>[ D-PAD ] to Create Pattern</div><div>[ SPACE ] to Save</div></div>}
             {isNoLock && <div className="mt-8 text-[10px] text-white/30 tracking-widest">[ PRESS A / ENTER TO UNLOCK ]</div>}
             {!isSetupMode && !isNoLock && (<div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50"><span className="text-[10px] uppercase tracking-widest">Authorized Access Only</span><span className="text-[10px] text-red-400 cursor-pointer hover:underline" onClick={onSwitchUser}>[ Switch User (B) ]</span></div>)}
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
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 h-20 px-6 bg-black/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-[99999] transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${visible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
          <DockItem icon={Home} label="Home" onClick={closeApp} />
          <DockItem icon={Globe} label="Browser" onClick={() => onLaunch('network')} isActive={activeApp === appRefMap.NETWORK} />
          <DockItem icon={Folder} label="Files" onClick={() => onLaunch('files')} isActive={activeApp === appRefMap.FILES} />

          <DockItem icon={TerminalIcon} label="Terminal" onClick={() => onLaunch('term')} isActive={activeApp === 'term'} />
          <DockItem icon={TerminalIcon} label="Settings" onClick={() => onLaunch('settings')} isActive={activeApp === appRefMap.SETTINGS} />
          
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
               <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs overflow-hidden" style={{backgroundColor: currentUser.color}}>
                   {currentUser.pfp ? <img src={currentUser.pfp} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
               </div>
               <span className="text-[9px] font-mono tracking-tighter text-white/50">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
      </div>
  );
};

/* --- 6. DESKTOP COMPONENTS (NEW) --- */

const WindowFrame = ({ win }) => {
    const { closeWindow, minimizeWindow, maximizeWindow, focusWindow } = useContext(WindowContext);

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
                scale: win.isMinimized ? 0.5 : 1, 
                opacity: win.isMinimized ? 0 : 1, 
                width: win.isMaximized ? '100vw' : win.width,
                height: win.isMaximized ? 'calc(100vh - 48px)' : win.height,
                x: win.isMaximized ? 0 : win.x,
                y: win.isMinimized ? 500 : (win.isMaximized ? 0 : win.y),
                zIndex: win.zIndex,
                borderColor: "rgba(255,255,255,0.1)"
            }}
            whileTap={{ scale: win.isMaximized ? 1 : 0.995 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
                "absolute flex flex-col bg-[#0f1115]/90 backdrop-blur-2xl border shadow-2xl rounded-lg overflow-hidden active:border-white/20 transition-colors",
                win.isMaximized ? "rounded-none top-0 left-0" : ""
            )}
            onMouseDown={() => focusWindow(win.id)}
            drag={!win.isMaximized}
            dragMomentum={false}
            dragElastic={0.1}
        >
            <div 
                className="h-10 bg-white/5 border-b border-white/5 flex items-center justify-between px-3 select-none cursor-default"
                onDoubleClick={() => maximizeWindow(win.id)}
            >
                <div className="flex items-center gap-3">
                    <win.icon size={14} className="text-blue-400" />
                    <span className="text-xs font-bold tracking-wider text-white/80">{win.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><Minus size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><Maximize size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="p-1.5 hover:bg-red-500/50 hover:text-white rounded-full transition-colors text-white/50"><X size={12} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {win.component}
            </div>
            
            {!win.isMaximized && <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100" />}
        </motion.div>
    );
};

// Original Taskbar removed as requested

const DesktopIcons = () => {
    const { openWindow } = useContext(WindowContext);
    
    const handleTrash = () => {
        if (window.aetherSystem?.openExternal) {
            window.aetherSystem.openExternal('shell:RecycleBinFolder');
        }
    };

    const shortcuts = [
        { id: 'pc', label: 'My PC', icon: MonitorUp, action: () => openWindow('files', 'My PC', <FileManagerApp />, Folder, true) },
        { id: 'web', label: 'Browser', icon: Globe, action: () => openWindow('web', 'Aether Web', <NetworkApp />, Globe, true) },
        { id: 'settings', label: 'Settings', icon: Settings, action: () => openWindow('settings', 'System Configuration', <SettingsApp />, Settings) },
        { id: 'ollama', label: 'Aether AI', icon: MessageSquare, action: () => openWindow('ollama', 'Aether Intelligence', <OllamaApp />, MessageSquare, true) },
        { id: 'apps', label: 'Applications', icon: Package, action: () => openWindow('apps', 'Installed Apps', <InstalledApps />, Package) },
        { id: 'notepad', label: 'Text Editor', icon: FileText, action: () => openWindow('notepad', 'Text Editor', <TextEditorApp />, FileText, true) },
        { id: 'calc', label: 'Calculator', icon: Calculator, action: () => openWindow('calc', 'Calculator', <CalculatorApp />, Calculator) },
        { id: 'paint', label: 'Paint', icon: Brush, action: () => openWindow('paint', 'Canvas Paint', <PaintApp />, Brush) },
        
        { id: 'terminal', label: 'Terminal', icon: TerminalIcon, action: () => openWindow('term', 'Terminal', <TerminalApp />, TerminalIcon) },
{ id: 'trash', label: 'Recycle Bin', icon: Trash2, action: handleTrash },
    ];

    return (
        <div className="absolute top-0 left-0 bottom-12 w-full p-6 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] grid-rows-[repeat(auto-fill,minmax(80px,1fr))] gap-2 content-start justify-items-center pointer-events-none">
            {shortcuts.map(item => (
                <button 
                    key={item.id}
                    onClick={item.action}
                    className="w-20 h-24 flex flex-col items-center justify-center gap-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm border border-transparent hover:border-white/10 transition-all group pointer-events-auto"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <item.icon size={24} className="text-blue-200 drop-shadow-md" />
                    </div>
                    <span className="text-[10px] text-white font-medium drop-shadow-md text-center leading-tight bg-black/40 px-1.5 py-0.5 rounded-full">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

const DesktopEnvironment = () => {
    const { windows } = useContext(WindowContext);
    
    return (
        <div className="absolute inset-0 z-10 overflow-hidden">
            <DesktopIcons />
            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence>
                    {windows.map(win => (
                        <div key={win.id} className="pointer-events-auto">
                            <WindowFrame win={win} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
            {/* Taskbar removed, replaced by global MacDock */}
        </div>
    );
};

/* --- 7. SYSTEM KERNEL (ORIGINAL XMB LOGIC RESTORED) --- */
const SystemKernel = () => {
  const [colIndex, setColIndex] = useState(2);
  const [rowIndex, setRowIndex] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [wifiState, setWifiState] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [contextMenu, setContextMenu] = useState(null); 
  const [notifications, setNotifications] = useState([]);
  const [runningGameId, setRunningGameId] = useState(null); 
  
  // Touch Handling State
  const touchStartRef = useRef({ x: 0, y: 0 });
  
  const pushNotification = useCallback((title, message) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, title, message }]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
      window.aetherSystem?.sendNotification(title, message);
  }, []);

  const { users, currentUser, setCurrentUser, updateUsers, xmbActiveApp, setXmbActiveApp, setViewMode, autoDesktop, settings, updateSetting, triggerLaunch } = useContext(WindowContext);
  
  const [loginSelection, setLoginSelection] = useState(0);
  const [gameList, setGameList] = useState([]);
  const [globalTransitionState, setGlobalTransitionState] = useState('booting');
  const [isLocked, setIsLocked] = useState(false); 
  
  const updateLockPattern = (userId, newPattern) => {
      const updatedUsers = users.map(u => u.id === userId ? { ...u, pattern: newPattern } : u);
      updateUsers(updatedUsers);
      if (currentUser && currentUser.id === userId) setCurrentUser({ ...currentUser, pattern: newPattern });
  }

  const containerRef = useRef(null);
  const { playNav, playSelect, playBack, playLogin, playSuccess, playFail, setVolume, volume } = useSound();
  const stateRef = useRef({ colIndex, rowIndex, xmbActiveApp, isFocused, currentUser, isLocked });
  const scrollTimeoutRef = useRef(null); 

  const closeApp = useCallback(() => { playBack(); setXmbActiveApp(null); }, [playBack, setXmbActiveApp]);

  // --- ACTIVATE CONTROLLER FOR XMB ---
  useGamepad((action) => {
      // Pass gamepad actions directly to the navigation handler
      if (['up','down','left','right','enter','back'].includes(action)) {
          handleNavigation(action);
      }
  }, isFocused && !isLocked && !xmbActiveApp); // Only active when focused and not in an app

  useIdleTimer(300000, () => { 
      if (currentUser && !isLocked) {
          setIsLocked(true);
          pushNotification('Security', 'Session timed out due to inactivity.');
      }
  });

  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      const handleContextMenu = (e) => {
          e.preventDefault();
          if (!currentUser || isLocked) return;
          const defaultOptions = [
              { label: 'Refresh System', icon: RefreshCw, action: () => window.location.reload() },
              { label: 'System Settings', icon: Settings, action: () => setXmbActiveApp(APP_REFS.SETTINGS) },
              { label: 'Lock Terminal', icon: Lock, action: () => setIsLocked(true) },
              { label: 'Change Wallpaper', icon: ImageIcon, action: () => updateSetting('dynamicWave', !settings.dynamicWave) },
          ];
          setContextMenu({ x: e.clientX, y: e.clientY, options: defaultOptions });
          playSelect();
      };
      window.addEventListener('contextmenu', handleContextMenu);
      return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [currentUser, isLocked, settings, playSelect, setXmbActiveApp]);

  useEffect(() => {
    const bootTimer = setTimeout(() => { setGlobalTransitionState('login'); }, 1500);

    const loadGames = async () => {
        let foundGames = [];
        if(window.aetherSystem?.scanGames) {
            setIsBackendConnected(true);
            const s = await window.aetherSystem.scanGames();
            foundGames = s.map(g => {
                const heroUrl = g.source === 'Steam' 
                    ? `https://steamcdn-a.akamaihd.net/steam/apps/${g.realId}/library_hero.jpg` 
                    : `https://cdn2.unrealengine.com/Diesel%2Fproductv2%2F${g.name.replace(/\s+/g,'')}%2Fhome%2F${g.name.replace(/\s+/g,'')}-hero.jpg`;
                return { 
                    id: g.id, 
                    realId: g.realId,
                    label: g.name, 
                    source: g.source, 
                    accent: g.source === 'Steam' ? '#1b2838' : '#333333', 
                    icon: g.source === 'Steam' ? Disc : Gamepad2, 
                    hero: heroUrl, 
                    logo: '', 
                    path: g.path,
                    timePlayed: Math.round(g.timePlayed),
                    lastPlayed: g.lastPlayed
                };
            });
        } else {
             setIsBackendConnected(false);
             foundGames = [ 
                 { id: '1091500', label: 'Cyberpunk 2077', source: 'Steam', accent: '#fcee0a', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_hero.jpg', logo: 'https://steamcdn-a.akamaihd.net/steam/apps/1091500/logo.png', icon: Disc, timePlayed: 124, lastPlayed: 1 }, 
                 { id: '1245620', label: 'Elden Ring', source: 'Steam', accent: '#cca362', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_hero.jpg', logo: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/logo.png', icon: Disc, timePlayed: 450, lastPlayed: 2 },
                 { id: '271590', label: 'GTA V', source: 'Epic', accent: '#56B949', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/271590/library_hero.jpg', logo: '', icon: Gamepad2, timePlayed: 820, lastPlayed: 0 },
                 { id: '1172470', label: 'Apex Legends', source: 'Steam', accent: '#C2352E', hero: 'https://steamcdn-a.akamaihd.net/steam/apps/1172470/library_hero.jpg', logo: '', icon: Disc, timePlayed: 60, lastPlayed: 3 }
             ];
        }
        foundGames.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        setGameList(foundGames);
    };
    
    loadGames();

    if (window.aetherSystem?.onGameActivity) {
        if (window.aetherSystem?.onGameActivity) {
        window.aetherSystem.onGameActivity((data) => {
            if (data.status === 'stopped') {
                setRunningGameId(null);
            } else {
                setRunningGameId(data.id);
                setGameList(prev => prev.map(g => {
                    if (g.id === data.id) return { ...g, timePlayed: data.timePlayed };
                    return g;
                }));
            }
        });
    }
    }

    return () => { clearTimeout(bootTimer); };
  }, []);

  useEffect(() => {
      stateRef.current = { colIndex, rowIndex, xmbActiveApp, isFocused, currentUser, isLocked };
      if (currentUser && globalTransitionState === 'login') { setGlobalTransitionState('booting'); setTimeout(() => { setGlobalTransitionState('ready'); setIsFocused(true); }, 800); }
  }, [colIndex, rowIndex, xmbActiveApp, isFocused, currentUser, globalTransitionState, isLocked]);

  const handleUserSwitch = () => { setGlobalTransitionState('booting'); playBack(); setIsLocked(false); setTimeout(() => { setCurrentUser(null); setLoginSelection(0); setGlobalTransitionState('login'); }, 500); };
  const handleLockSystem = () => { setIsLocked(true); setIsFocused(false); playBack(); }
  const handleUnlockSystem = () => { setIsLocked(false); setIsFocused(true); }

  const APP_REFS = { FILES: 'files', MONITOR: 'monitor', SETTINGS: 'settings', APPS: 'apps', NETWORK: 'network', NOTEPAD: 'notepad', PAINT: 'paint', CALC: 'calc', USER_MANAGE: 'user_manage', ABOUT: 'about', OLLAMA: 'ollama' };
  const getCurrentWaveHue = () => {
      const categoryHueMap = { 'user': 240, 'settings': 60, 'game': 210, 'apps': 280, 'network': 180 };
      return categoryHueMap[SYSTEM_DATA[colIndex]?.id] || getHueFromHex(settings.bgColor);
  };

  const launchProductiveApp = (appKey) => {
      setXmbActiveApp(appKey);
      if (autoDesktop) setViewMode('desktop');
  };

  const SYSTEM_DATA = [
    {
      id: 'user', icon: Users, label: 'USERS', hue: 240,
      items: [
        { id: 'u1', label: 'Switch User', icon: RefreshCw, type: 'action', action: handleUserSwitch },
        { id: 'u_desktop', label: 'Switch to Desktop', icon: MonitorUp, type: 'action', action: () => setViewMode('desktop'), subtext: 'PC Mode' },
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
    { 
      id: 'game', icon: Gamepad2, label: 'LIBRARY', hue: 210, 
      items: gameList.length > 0 ? gameList : [{ id: 'scan', label: 'Scanning Drives...', icon: RefreshCw }] 
    },
    {
        id: 'apps', icon: Package, label: 'TOOLS', hue: 280,
        items: [
            { id: 't6', label: 'Aether AI', icon: Sparkles, type: 'app', app: APP_REFS.OLLAMA, subtext: 'Ollama' },
            { id: 't2', label: 'System Status', icon: Cpu, type: 'app', app: APP_REFS.MONITOR, subtext: 'Telemetry' },
            { id: 't5', label: 'Text Editor', icon: FileText, type: 'app', app: APP_REFS.NOTEPAD },
            { id: 't3', label: 'Canvas Paint', icon: Brush, type: 'app', app: APP_REFS.PAINT },
            { id: 't4', label: 'Calculator', icon: Calculator, type: 'app', app: APP_REFS.CALC },
        ]
    },
    {
        id: 'network', icon: Globe, label: 'NETWORK', hue: 180,
        items: [
            { id: 'n1', label: 'Web Browser', icon: Globe, type: 'app', app: APP_REFS.NETWORK, subtext: 'Secure' },
            { id: 'n2', label: 'Open URL', icon: Link, type: 'action', action: () => { const url = prompt("Enter URL:"); if (url) window.aetherSystem?.openExternal(url); }, subtext: 'Browser' },
        ]
    }
  ];

  const handleNavigation = useCallback((direction) => {
    const { colIndex, rowIndex, xmbActiveApp, currentUser, isLocked } = stateRef.current;
    if (!currentUser || isLocked) {
        if (!currentUser && direction === 'left') { setLoginSelection(p => Math.max(0, p - 1)); playNav(); }
        if (!currentUser && direction === 'right') { setLoginSelection(p => Math.min(users.length - 1, p + 1)); playNav(); }
        if (!currentUser && direction === 'enter') { 
            playLogin(); 
            const selectedUser = users[loginSelection];
            setCurrentUser(selectedUser);
            setIsLocked(true); 
        }
        if (isLocked && direction === 'enter') handleUserSwitch();
        return;
    }
    if (xmbActiveApp) return;
    if (direction === 'right') { setColIndex(i => Math.min(i + 1, SYSTEM_DATA.length - 1)); playNav(); if (rowIndex !== null) setRowIndex(r => Math.min(r, (SYSTEM_DATA[Math.min(colIndex + 1, SYSTEM_DATA.length - 1)]?.items.length || 1) - 1)); }
    else if (direction === 'left') { setColIndex(i => Math.max(i - 1, 0)); playNav(); if (rowIndex !== null) setRowIndex(r => Math.min(r, (SYSTEM_DATA[Math.max(colIndex - 1, 0)]?.items.length || 1) - 1)); }
    else if (direction === 'down') { if (rowIndex === null) { setRowIndex(0); playNav(); } else { setRowIndex(prev => Math.min(prev + 1, SYSTEM_DATA[colIndex].items.length - 1)); playNav(); } }
    else if (direction === 'up') { if (rowIndex === 0) { setRowIndex(null); playNav(); } else if (rowIndex !== null) { setRowIndex(prev => Math.max(prev - 1, 0)); playNav(); } }
    else if (direction === 'enter') {
       if (rowIndex !== null) {
          playSelect();
          const item = SYSTEM_DATA[colIndex].items[rowIndex];
          
          // WRAPPER FOR LAUNCH ANIMATION
          const performAction = () => {
              if (window.aetherSystem?.launchGame && (item.source === 'Steam' || item.source === 'Epic')) {
                  const cleanData = { 
                      id: item.id, 
                      realId: item.realId, 
                      source: item.source, 
                      path: item.path, 
                      name: item.label 
                  };
                  window.aetherSystem.launchGame(cleanData);
              }
              else if (item.action) {
                  item.action();
              }
              else if (item.app) {
                  if ([APP_REFS.FILES, APP_REFS.NETWORK, APP_REFS.NOTEPAD, APP_REFS.OLLAMA].includes(item.app)) {
                      launchProductiveApp(item.app);
                  } else {
                      setXmbActiveApp(item.app);
                  }
              }
          };

          // ANIMATION LOGIC: Only animate Games or Heavy Apps (Paint/AI)
          // System tools (Settings, Files, Calc) skip the overlay for speed.
          const heavyApps = ['ollama', 'paint', 'music']; 
          
          if (item.source || (item.app && heavyApps.includes(item.app))) {
              triggerLaunch(item.label, item.icon || Package, performAction);
          } else {
              performAction();
          }

       }
    } else if (direction === 'back') { if(rowIndex !== null) { setRowIndex(null); playBack(); } else if (colIndex !== 2) { setColIndex(2); playBack(); } }
  }, [users, loginSelection, SYSTEM_DATA, playNav, playLogin, playSelect, playBack, autoDesktop]); 

  const handleKeyDown = useCallback((e) => {
    if (stateRef.current.isLocked) { if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) e.preventDefault(); return; }
    if (stateRef.current.xmbActiveApp) { if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); return; }
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
    if (stateRef.current.isLocked || stateRef.current.xmbActiveApp || !stateRef.current.isFocused || scrollTimeoutRef.current) return;
    e.preventDefault(); 
    // Debounce trackpad/mousewheel inputs
    const now = Date.now();
    if (scrollTimeoutRef.current && now - scrollTimeoutRef.current < 150) return;
    scrollTimeoutRef.current = now;

    const direction = Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 5 ? (e.deltaY > 0 ? 'down' : 'up') : (Math.abs(e.deltaX) > 5 ? (e.deltaX > 0 ? 'right' : 'left') : null);
    if (direction) { handleNavigation(direction); }
  }, [handleNavigation]);

  const handleTouchStart = (e) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
      if (stateRef.current.isLocked || stateRef.current.xmbActiveApp) return;
      
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          // Tap detected
          handleNavigation('enter');
          return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal Swipe
          if (Math.abs(deltaX) > 50) handleNavigation(deltaX > 0 ? 'left' : 'right');
      } else {
          // Vertical Swipe
          if (Math.abs(deltaY) > 50) handleNavigation(deltaY > 0 ? 'down' : 'up'); 
      }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown); 
    if(containerRef.current) {
        containerRef.current.addEventListener('wheel', handleScroll, { passive: false });
        containerRef.current.addEventListener('touchstart', handleTouchStart, { passive: true });
        containerRef.current.addEventListener('touchend', handleTouchEnd);
    }
    return () => { 
        window.removeEventListener('keydown', handleKeyDown); 
        if (containerRef.current) {
            containerRef.current.removeEventListener('wheel', handleScroll);
            containerRef.current.removeEventListener('touchstart', handleTouchStart);
            containerRef.current.removeEventListener('touchend', handleTouchEnd);
        }
    };
  }, [handleKeyDown, handleScroll]);
  
  const activateSystem = () => { setIsFocused(true); if(containerRef.current) containerRef.current.focus(); };
  const ITEM_WIDTH = isMobile ? 100 : 140; 
  const LEFT_OFFSET = window.innerWidth * (isMobile ? 0.35 : 0.20);
  const currentCategory = SYSTEM_DATA[colIndex]; const activeItem = rowIndex !== null ? currentCategory.items[rowIndex] : null;

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden text-white font-sans select-none bg-transparent outline-none" tabIndex={0} onClick={activateSystem} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} >
      
      <NotificationSystem notifications={notifications} />
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} options={contextMenu.options} onClose={() => setContextMenu(null)} />}
      
      {!isBackendConnected && globalTransitionState === 'ready' && !isLocked && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-600/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg flex items-center gap-3 border border-white/10">
              <AlertCircle size={12} className="animate-pulse"/> 
              <span>Backend Offline (Web Mode)</span>
              <div className="w-[1px] h-3 bg-white/20"></div>
              <span className="opacity-50">Game Scanning Disabled</span>
          </div>
      )}
      
      {isLocked && currentUser && ( <LockScreen users={users} currentUser={currentUser} onUnlock={handleUnlockSystem} onSwitchUser={handleUserSwitch} playSuccess={playSuccess} playFail={playFail} updateLockPattern={updateLockPattern} /> )}

      {activeItem?.hero && isFocused && currentUser && globalTransitionState === 'ready' && !isLocked && !xmbActiveApp && (
         <div className="fixed inset-0 -z-0 animate-in fade-in duration-700">
             <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out scale-105" style={{ backgroundImage: `url(${activeItem.hero})` }} />
             <div className="absolute inset-0 bg-black/60" />
             <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #000 0%, #000 25%, transparent 60%, transparent 100%)' }} />
         </div>
      )}

      <div className={`absolute top-0 left-0 w-full h-16 flex items-center justify-between px-10 transition-transform duration-500 z-30 ${isFocused && globalTransitionState === 'ready' && !isLocked ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-6"><span className="text-xs font-bold tracking-[0.25em] text-blue-400 uppercase">Aether</span><div className="w-[1px] h-4 bg-white/20"></div>{currentUser && <span className="text-xs font-medium tracking-widest text-slate-300 uppercase animate-in slide-in-from-left-4">{currentCategory.label}</span>}</div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Wifi size={14} className={wifiState ? 'text-white/60' : 'text-red-400/60'} />
                <Volume2 size={14} className="text-white/60" />
                <span className="text-[10px] font-mono opacity-50">{Math.round(volume * 100)}%</span>
            </div>
        </div>
      </div>

      {globalTransitionState === 'login' && !currentUser && (
         <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-1000">
             <div className="text-4xl font-light tracking-[0.5em] uppercase text-white mb-20 animate-in fade-in zoom-in duration-1000">Select User</div>
             <div className="flex gap-16 items-center">
                 {users.map((u, i) => (
                     <div key={u.id} className={`flex flex-col items-center gap-6 transition-all duration-500 ease-out ${i === loginSelection ? 'scale-125 opacity-100' : 'scale-90 opacity-40 grayscale'}`}>
                         <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${i === loginSelection ? 'border-white shadow-[0_0_50px_rgba(255,255,255,0.2)]' : 'border-white/10'}`} style={{borderColor: i===loginSelection ? u.color : 'rgba(255,255,255,0.1)'}}>
                             {i === loginSelection && <div className="absolute inset-0 opacity-20 animate-pulse" style={{backgroundColor: u.color}}></div>}
                             {u.pfp ? <img src={u.pfp} className="w-full h-full object-cover" /> : <div className="text-4xl font-bold" style={{color: u.color}}>{u.name.charAt(0)}</div>}
                         </div>
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
        <div className={`absolute w-full h-full transition-all duration-500 cubic-bezier(0.2, 0.0, 0.2, 1) ${isFocused && globalTransitionState === 'ready' && !isLocked && !xmbActiveApp ? 'opacity-100 blur-0' : 'opacity-0 blur-lg scale-110 pointer-events-none'}`} style={{ transform: `translateX(${LEFT_OFFSET - (colIndex * ITEM_WIDTH)}px)` }}>
            <div className="absolute top-[20%] left-0 flex items-center h-32 w-[2000px]">
            {SYSTEM_DATA.map((cat, idx) => {
                const isActive = idx === colIndex; const catHue = SYSTEM_DATA[idx]?.hue || 210;
                return ( <div key={cat.id} className={`flex flex-col items-center justify-center transition-all duration-500 ease-out ${isActive ? 'opacity-100 scale-110' : 'opacity-30 scale-90 blur-[1px]'}`} style={{ width: ITEM_WIDTH }}><cat.icon size={isActive ? 52 : 36} strokeWidth={1.5} className={`transition-all duration-300 mb-6 ${isActive ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-slate-500'}`} /><span className={`text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ color: `hsl(${catHue}, 80%, 70%)` }}>{cat.label}</span></div> );
            })}
            </div>
            <div className="absolute top-[20%] left-0 flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)" style={{ left: `${colIndex * ITEM_WIDTH}px`, transform: `translateY(${rowIndex === null ? 160 : 160 - rowIndex * 90}px)` }}>
            {SYSTEM_DATA.map((cat, cIdx) => {
                if (cIdx !== colIndex) return null; const catHue = SYSTEM_DATA[cIdx]?.hue || 210;
                return ( <div key={cat.id} className="flex flex-col items-center w-[140px]"> 
                    {cat.items.map((item, rIdx) => { 
                        const isActiveItem = rowIndex === rIdx; 
                        const itemAccent = item.accent || `hsl(${catHue}, 80%, 50%)`; 
                        const isRunning = item.id === runningGameId;

                        return ( 
                            <div key={item.id} className={`relative flex items-center gap-6 transition-all duration-300 ease-out ${isActiveItem ? 'opacity-100 translate-x-12 z-10 scale-105' : 'opacity-40 translate-x-4 scale-95 blur-[0.5px]'} my-3 whitespace-nowrap`} style={{ width: isMobile ? '300px' : '600px', height: '80px' }}> 
                                {isActiveItem && <div className="absolute -left-6 top-0 bottom-0 w-[550px] bg-gradient-to-r from-white/10 to-transparent border-l-4 -z-10 animate-in slide-in-from-left-8 fade-in duration-300" style={{ borderColor: isRunning ? '#4ade80' : itemAccent }}></div>} 
                                <div className={`w-16 h-16 flex items-center justify-center rounded-lg transition-all duration-300 ${isActiveItem ? 'bg-black/40 border border-white/20 shadow-lg backdrop-blur-sm' : 'bg-transparent border border-transparent'}`}> 
                                    {isRunning ? <Activity size={28} className="text-green-400 animate-pulse" /> : <item.icon size={28} strokeWidth={1.5} className={`transition-all duration-300 ${isActiveItem ? 'text-white' : 'text-slate-500'}`} />} 
                                </div> 
                                <div className="flex flex-col gap-0.5"> 
                                    <span className={`text-2xl font-light tracking-tight uppercase transition-all duration-300 ${isActiveItem ? 'text-white' : 'text-slate-400'}`}>{item.label}</span> 
                                    {isActiveItem && (
                                        <div className="flex items-center gap-3">
                                            {item.source && <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/10 text-white/60">{item.source}</span>}
                                            {item.subtext && <span className="text-[10px] font-bold uppercase tracking-widest drop-shadow-md opacity-80" style={{ color: itemAccent }}>{item.subtext}</span>}
                                            {item.timePlayed !== undefined && <span className="text-[10px] font-mono opacity-60 flex items-center gap-1"><Clock size={10} /> {(item.timePlayed / 60).toFixed(1)} HRS</span>}
                                            {isRunning && (
                                                <div className="flex items-center gap-2 px-2 py-0.5 bg-green-900/40 border border-green-500/30 rounded-full animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">PLAYING</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div> 
                            </div> 
                        ) 
                    })} 
                </div> );
            })}
            </div>
        </div>
      )}

      {xmbActiveApp === APP_REFS.MONITOR && <WindowedApp title="System Status" onClose={closeApp}><SystemMonitorApp close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.FILES && <WindowedApp title="Nucleus Files" onClose={closeApp}><FileManagerApp close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.APPS && <WindowedApp title="Installed Applications" onClose={closeApp}><InstalledApps close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.SETTINGS && <WindowedApp title="Settings" onClose={closeApp}><SettingsApp currentUser={currentUser} close={closeApp} systemVolume={volume} setSystemVolume={setVolume} brightness={brightness} setBrightness={setBrightness} wifiState={wifiState} setWifiState={setWifiState}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.USER_MANAGE && <WindowedApp title="User Management" onClose={closeApp}><UserManagementApp close={closeApp} users={users} currentUser={currentUser} updateUsers={updateUsers} updateLockPattern={updateLockPattern}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.NETWORK && <WindowedApp title="Network Resources" onClose={closeApp} width="w-[90%]" height="h-[85%]"><NetworkApp close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.NOTEPAD && <WindowedApp title="Text Editor" onClose={closeApp}><TextEditorApp close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.PAINT && <WindowedApp title="Canvas Paint" onClose={closeApp}><PaintApp close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.CALC && <WindowedApp title="Calculator" onClose={closeApp}><CalculatorApp close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.ABOUT && <WindowedApp title="About System" onClose={closeApp}><AboutSystemApp close={closeApp}/></WindowedApp>}
      {xmbActiveApp === APP_REFS.OLLAMA && <WindowedApp title="Aether AI" onClose={closeApp}><OllamaApp close={closeApp}/></WindowedApp>}
    </div>
  );
};

const AetherShell = () => {
    const { viewMode, setViewMode, currentUser, users, xmbActiveApp, setXmbActiveApp, openWindow, settings, launchingItem } = useContext(WindowContext);
    const [showDock, setShowDock] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (viewMode === 'desktop') {
            setShowDock(true);
        } else {
            setShowDock(false);
        }
    }, [viewMode]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'F1') setViewMode(prev => prev === 'xmb' ? 'desktop' : 'xmb');
            if (e.key.toLowerCase() === 'h') setShowDock(prev => !prev);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [setViewMode]);
    
    useEffect(() => {
        let animationFrameId; let lastButtonState = { toggle: false };
        const checkGamepad = () => {
            const gamepads = navigator.getGamepads();
            if (gamepads[0]) { 
                const gp = gamepads[0];
                const togglePressed = gp.buttons[8]?.pressed || gp.buttons[16]?.pressed; 
                if (togglePressed && !lastButtonState.toggle) { setShowDock(prev => !prev); }
                lastButtonState = { toggle: togglePressed };
            }
            animationFrameId = requestAnimationFrame(checkGamepad);
        };
        checkGamepad();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const APP_REFS = { FILES: 'files', MONITOR: 'monitor', SETTINGS: 'settings', APPS: 'apps', NETWORK: 'network', NOTEPAD: 'notepad', PAINT: 'paint', CALC: 'calc', USER_MANAGE: 'user_manage', ABOUT: 'about', OLLAMA: 'ollama' };

    const handleDockLaunch = (type) => {
        if (viewMode === 'desktop') {
            if (type === 'network') openWindow('web', 'Aether Web', <NetworkApp />, Globe, true);
            if (type === 'files') openWindow('files', 'My PC', <FileManagerApp />, Folder, true);
            if (type === 'settings') openWindow('settings', 'System Configuration', <SettingsApp />, Settings);
            if (type === 'about') openWindow('about', 'About System', <AboutSystemApp />, Info);

            if (type === 'term') openWindow('term', 'Terminal', <TerminalApp />, TerminalIcon);
        } else {
            if (type === 'network') setXmbActiveApp(APP_REFS.NETWORK);
            if (type === 'files') setXmbActiveApp(APP_REFS.FILES);
            if (type === 'settings') setXmbActiveApp(APP_REFS.SETTINGS);
            if (type === 'about') setXmbActiveApp(APP_REFS.ABOUT);
        }
    };

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none">
            <div className="absolute inset-0 z-0">
                 <WaveBackground bgColor={settings.bgColor} waveHue={settings.hue} dynamicWave={settings.dynamicWave} blur={viewMode === 'desktop'} />
            </div>

            <motion.div 
                initial={{ opacity: 1, scale: 1 }}
                animate={{ 
                    opacity: viewMode === 'xmb' ? 1 : 0, 
                    scale: viewMode === 'xmb' ? 1 : 1.1,
                    pointerEvents: viewMode === 'xmb' ? 'auto' : 'none',
                    filter: viewMode === 'xmb' ? 'blur(0px)' : 'blur(10px)'
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-10"
            >
                <SystemKernel />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                    opacity: viewMode === 'desktop' ? 1 : 0,
                    pointerEvents: viewMode === 'desktop' ? 'auto' : 'none'
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-20"
            >
                <DesktopEnvironment />
            </motion.div>
            
            {currentUser && (
                <MacDock 
                    time={time} 
                    activeApp={viewMode === 'xmb' ? xmbActiveApp : null} 
                    closeApp={() => viewMode === 'desktop' ? setViewMode('xmb') : setXmbActiveApp(null)} 
                    currentUser={currentUser} 
                    visible={showDock} 
                    onLaunch={handleDockLaunch} 
                    appRefMap={APP_REFS} 
                />
            )}
            
            
            <AnimatePresence>
                {launchingItem && <LaunchOverlay item={launchingItem} />}
            </AnimatePresence>
            <div className="fixed bottom-4 right-4 z-[1000] text-[10px] text-white/20 pointer-events-none">F1: SWITCH VIEW</div>
        </div>
    );
};

export default function App() {
  return (
    <ErrorBoundary>
        <WindowManagerProvider>
          <AetherShell />
        </WindowManagerProvider>
    </ErrorBoundary>
  );
}