import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Settings, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Gamepad2, 
  Globe, 
  Users, 
  Folder, 
  Power, 
  Wifi, 
  Battery, 
  Clock, 
  Monitor,
  HardDrive,
  FileText,
  X,
  Maximize2,
  Minimize2,
  Play,
  Star,
  Trophy,
  MoreHorizontal,
  Volume2,
  Mic,
  Bluetooth,
  Shield,
  CreditCard,
  Smartphone
} from 'lucide-react';

/* --- VOLUMETRIC SILK WAVE COMPONENT (OPTIMIZED) --- */
const WaveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const drawWave = () => {
      // 1. Background - Deep Void
      // We use a very dark radial gradient to give a vignette effect
      const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
      gradient.addColorStop(0, '#101018'); 
      gradient.addColorStop(0.5, '#08080c');
      gradient.addColorStop(1, '#000000'); 
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Slow Floating Particles (Dust) - Optimized Count
      const time = Date.now() * 0.0001; 
      // Reduced from 40 to 20 for performance
      for (let i = 0; i < 20; i++) { 
        const x = (Math.sin(time * 0.2 + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.15 + i * 0.3) * 0.5 + 0.5) * canvas.height;
        const size = Math.random() * 1.5;
        // Subtle opacity
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(time + i)) * 0.15 + 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Volumetric Silk Engine
      // Instead of filling shapes, we draw overlapping lines with additive blending ('lighter')
      ctx.globalCompositeOperation = 'lighter'; 
      
      // OPTIMIZATION: Reduced line count from 40 to 20
      // This drastically reduces the number of draw calls while keeping the look
      const lines = 20; 
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        
        // Color Palette: Shift from deep blue to white
        const hue = 210 + Math.sin(t * 0.1 + i * 0.05) * 20; 
        const alpha = (Math.sin(t * 0.2 + i * 0.1) * 0.5 + 0.5) * 0.06; // Slightly higher alpha to compensate for fewer lines
        
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
        ctx.lineWidth = 2 + Math.sin(i) * 1; 

        // OPTIMIZATION: Increased step size from 15 to 30
        // Reduces geometric complexity by 50%
        for (let x = 0; x <= canvas.width + 30; x += 30) {
            // Complex wave function for organic fluid look
            const yOffset = 
                Math.sin(x * 0.002 + t * 0.5 + i * 0.05) * 100 +  
                Math.cos(x * 0.005 - t * 0.3) * 50 +              
                Math.sin(x * 0.01 + t * 0.2 + i * 0.1) * 20;      
            
            const y = centerY + yOffset;

            if (x === 0) ctx.moveTo(x, y);
            // Smooth curve with adjusted control point for wider step
            else ctx.quadraticCurveTo(x - 15, y, x, y); 
        }
        ctx.stroke();
      }

      // Reset for next frame
      ctx.globalCompositeOperation = 'source-over';
      t += 0.005; // Maintain slow fluid speed
      animationFrameId = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

/* --- MOCK DATA --- */
const SYSTEM_DATA = [
  {
    id: 'users',
    icon: Users,
    label: 'Users',
    items: [
      { id: 'u1', label: 'Create New User', icon: Users, type: 'action' },
      { id: 'u2', label: 'Guest', icon: Users, subtext: 'Temporary Access', type: 'user' },
      { id: 'u3', label: 'Admin', icon: Users, subtext: 'Local Account', type: 'user' }
    ]
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    items: [
      { id: 's1', label: 'System Update', icon: Settings, subtext: 'Version 24.11' },
      { id: 's2', label: 'Theme Settings', icon: ImageIcon, subtext: 'Silk (Default)' },
      { id: 's3', label: 'Display Settings', icon: Monitor, subtext: '1080p Output' },
      { id: 's4', label: 'Sound Settings', icon: Volume2, subtext: 'Optical Out' },
      { id: 's5', label: 'Accessory Settings', icon: Bluetooth, subtext: 'Manage Bluetooth' },
      { id: 's6', label: 'Security Settings', icon: Shield, subtext: 'Parental Control' },
      { id: 's7', label: 'Remote Play', icon: Smartphone, subtext: 'Mobile Connection' },
      { id: 's8', label: 'Network Settings', icon: Wifi, subtext: 'Connected: Ethernet' },
      { id: 's9', label: 'System Information', icon: Monitor, subtext: 'XMB Web Shell 1.2' }
    ]
  },
  {
    id: 'photo',
    icon: ImageIcon,
    label: 'Photo',
    items: [
      { id: 'p1', label: 'Camera Roll', icon: Folder, subtext: '12 Items' },
      { id: 'p2', label: 'Wallpapers', icon: Folder, subtext: '4 Items' },
      { id: 'p3', label: 'Screenshots', icon: Folder, subtext: 'Steam Library' }
    ]
  },
  {
    id: 'music',
    icon: Music,
    label: 'Music',
    items: [
      { id: 'm1', label: 'Spotify', icon: Globe, subtext: 'App' },
      { id: 'm2', label: 'Playlists', icon: Folder, subtext: '0 Tracks' },
      { id: 'm3', label: 'USB Drive', icon: Folder, subtext: 'No Device' }
    ]
  },
  {
    id: 'video',
    icon: Video,
    label: 'Video',
    items: [
      { id: 'v1', label: 'Netflix', icon: Globe, subtext: 'Streaming' },
      { id: 'v2', label: 'YouTube', icon: Globe, subtext: 'Streaming' },
      { id: 'v3', label: 'Twitch', icon: Globe, subtext: 'Live' },
      { id: 'v4', label: 'Recorded Gameplay', icon: Folder, subtext: '1.2 GB' }
    ]
  },
  {
    id: 'game',
    icon: Gamepad2,
    label: 'Game',
    items: [
      { 
        id: 'g1', 
        label: 'Cyberpunk 2077', 
        icon: Gamepad2, 
        source: 'Steam',
        bg: 'linear-gradient(135deg, rgba(243, 230, 0, 0.2) 0%, rgba(255, 0, 60, 0.2) 50%, rgba(0, 0, 0, 0) 100%)',
        accent: '#f3e600',
        subtext: 'Played Today',
        stats: { hours: '142h', achievements: '45/60', lastPlayed: '2h ago' }
      },
      { 
        id: 'g2', 
        label: 'Elden Ring', 
        icon: Gamepad2, 
        source: 'Steam',
        bg: 'linear-gradient(135deg, rgba(200, 160, 50, 0.2) 0%, rgba(50, 50, 50, 0.2) 50%, rgba(0, 0, 0, 0) 100%)',
        accent: '#d4af37',
        subtext: 'Cloud Synced',
        stats: { hours: '85h', achievements: '22/42', lastPlayed: 'Yesterday' }
      },
      { 
        id: 'g3', 
        label: 'Fortnite', 
        icon: Gamepad2, 
        source: 'Epic Games',
        bg: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(65, 105, 225, 0.2) 50%, rgba(0, 0, 0, 0) 100%)',
        accent: '#8a2be2',
        subtext: 'Season 5 Update',
        stats: { hours: '400h+', achievements: 'N/A', lastPlayed: 'Now' }
      },
      { 
        id: 'g4', 
        label: 'Apex Legends', 
        icon: Gamepad2, 
        source: 'Origin',
        bg: 'linear-gradient(135deg, rgba(255, 69, 0, 0.2) 0%, rgba(139, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0) 100%)',
        accent: '#ff4500',
        subtext: 'Ranked Ready',
        stats: { hours: '12h', achievements: '15/90', lastPlayed: '3d ago' }
      },
      { 
        id: 'g5', 
        label: 'Save Data Utility', 
        icon: HardDrive, 
        subtext: 'Manage Saves' 
      },
      { 
        id: 'g6', 
        label: 'Trophies', 
        icon: Trophy, 
        subtext: 'View Collection' 
      }
    ]
  },
  {
    id: 'network',
    icon: Globe,
    label: 'Network',
    items: [
      { id: 'n1', label: 'Internet Browser', icon: Globe, type: 'app', app: 'browser' },
      { id: 'n2', label: 'Download Management', icon: Folder },
      { id: 'n3', label: 'Online Manuals', icon: FileText }
    ]
  },
  {
    id: 'files',
    icon: Folder,
    label: 'Files',
    items: [
      { id: 'f1', label: 'File Explorer', icon: HardDrive, type: 'app', app: 'explorer' }
    ]
  },
  {
    id: 'power',
    icon: Power,
    label: 'Power',
    items: [
      { id: 'pw1', label: 'Turn Off System', icon: Power },
      { id: 'pw2', label: 'Restart', icon: Power }
    ]
  }
];

/* --- REFINED WINDOWED APP SIMULATION --- */
const WindowedApp = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in zoom-in duration-500 ease-out">
    <div className="bg-white/5 w-4/5 h-4/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col overflow-hidden text-white ring-1 ring-white/10">
      <div className="h-14 bg-white/5 flex items-center justify-between px-6 border-b border-white/10 select-none backdrop-blur-md">
        <div className="flex items-center gap-3 text-white/90 font-medium tracking-wide">
          <Monitor size={18} className="text-blue-400/80 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          {title}
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"><Minimize2 size={16} /></button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"><Maximize2 size={16} /></button>
          <button onClick={onClose} className="p-2 hover:bg-red-500/80 rounded-full transition-all duration-200 hover:scale-110"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-black/20 p-8 backdrop-blur-sm">
        {children}
      </div>
    </div>
  </div>
);

const ExplorerApp = () => (
  <div className="grid grid-cols-5 gap-8">
    {['C: System', 'D: Games', 'E: Media', 'Z: Network'].map((drive) => (
      <div key={drive} className="group flex flex-col items-center p-6 bg-white/5 hover:bg-white/15 rounded-2xl cursor-pointer border border-white/5 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <HardDrive size={56} className="text-blue-500/80 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
        <span className="text-sm font-medium tracking-wide text-slate-300 group-hover:text-white transition-colors">{drive}</span>
        <div className="w-full bg-black/50 h-1 mt-4 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
        </div>
      </div>
    ))}
    {['Documents', 'Downloads', 'Pictures', 'Music', 'Videos'].map((folder) => (
      <div key={folder} className="group flex flex-col items-center p-6 bg-white/5 hover:bg-white/15 rounded-2xl cursor-pointer border border-white/5 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <Folder size={56} className="text-yellow-500/80 mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
        <span className="text-sm font-medium tracking-wide text-slate-300 group-hover:text-white transition-colors">{folder}</span>
      </div>
    ))}
  </div>
);

const BrowserApp = () => (
  <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-8">
    <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20 rounded-full animate-pulse"></div>
        <Globe size={112} className="relative text-slate-400/80 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
    </div>
    <div className="text-center space-y-3">
        <h2 className="text-4xl font-thin text-white tracking-widest drop-shadow-lg">Web Browser</h2>
        <p className="text-white/50 text-lg font-light tracking-wider">Secure Sandboxed Environment</p>
    </div>
  </div>
);

/* --- MAIN COMPONENT --- */
export default function XMB() {
  const [colIndex, setColIndex] = useState(5); // Start at 'Game'
  const [rowIndex, setRowIndex] = useState(null); // Null means selecting category
  const [time, setTime] = useState(new Date());
  const [activeApp, setActiveApp] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  
  const stateRef = useRef({ colIndex, rowIndex, activeApp, isFocused });
  
  useEffect(() => {
    stateRef.current = { colIndex, rowIndex, activeApp, isFocused };
  }, [colIndex, rowIndex, activeApp, isFocused]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigation = useCallback((direction) => {
    const { colIndex, rowIndex, activeApp } = stateRef.current;
    if (activeApp) return;

    if (direction === 'right') {
       if (rowIndex === null) setColIndex(prev => Math.min(prev + 1, SYSTEM_DATA.length - 1));
    } else if (direction === 'left') {
       if (rowIndex === null) setColIndex(prev => Math.max(prev - 1, 0));
    } else if (direction === 'down') {
       if (rowIndex === null) setRowIndex(0);
       else setRowIndex(prev => Math.min(prev + 1, SYSTEM_DATA[colIndex].items.length - 1));
    } else if (direction === 'up') {
       if (rowIndex === 0) setRowIndex(null);
       else if (rowIndex !== null) setRowIndex(prev => Math.max(prev - 1, 0));
    } else if (direction === 'enter') {
       if (rowIndex !== null) {
          const item = SYSTEM_DATA[colIndex].items[rowIndex];
          if (item.app) setActiveApp(item.app);
       }
    } else if (direction === 'back') {
        if(rowIndex !== null) setRowIndex(null);
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!stateRef.current.isFocused && e.key !== 'Enter') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowRight') handleNavigation('right');
    if (e.key === 'ArrowLeft') handleNavigation('left');
    if (e.key === 'ArrowDown') handleNavigation('down');
    if (e.key === 'ArrowUp') handleNavigation('up');
    if (e.key === 'Enter') handleNavigation('enter');
    if (e.key === 'Backspace' || e.key === 'Escape') handleNavigation('back');
  }, [handleNavigation]);

  const handleWheel = useCallback((e) => {
    if (stateRef.current.activeApp || !stateRef.current.isFocused) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 20) handleNavigation('right');
        if (e.deltaX < -20) handleNavigation('left');
    } else {
        if (e.deltaY > 20) handleNavigation('down');
        if (e.deltaY < -20) handleNavigation('up');
    }
  }, [handleNavigation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('wheel', handleWheel);
    };
  }, [handleKeyDown, handleWheel]);

  const activateSystem = () => {
    setIsFocused(true);
    if(containerRef.current) containerRef.current.focus();
  };

  // REDUCED SIZES
  const ITEM_WIDTH = 120; // Smaller width for columns
  const LEFT_OFFSET = window.innerWidth * 0.30; 
  const currentCategory = SYSTEM_DATA[colIndex];
  const activeItem = rowIndex !== null ? currentCategory.items[rowIndex] : null;

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden text-white font-sans select-none bg-transparent outline-none"
        tabIndex={0}
        onClick={activateSystem}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
    >
      <WaveBackground />
      
      {/* Background Dimmer for Game Context */}
      {activeItem?.bg && isFocused && (
         <div 
            className="fixed inset-0 -z-0 transition-all duration-1000 ease-in-out"
            style={{ 
                background: activeItem.bg, 
                opacity: 0.4,
                filter: 'blur(90px)',
                transform: 'scale(1.1)'
            }}
         />
      )}

      {/* BOOT / FOCUS OVERLAY */}
      {!isFocused && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-1000">
            <div className="relative group">
                <div className="absolute inset-0 bg-white/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="bg-white/5 p-12 rounded-full mb-8 backdrop-blur-2xl border border-white/20 hover:border-white/50 transition-all duration-700 hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <Users size={64} className="text-white opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                </div>
            </div>
            <h1 className="text-2xl font-thin tracking-[0.5em] uppercase text-white/90 animate-pulse drop-shadow-lg">Press Start</h1>
        </div>
      )}

      {/* STATUS BAR */}
      <div className={`absolute top-10 right-16 flex items-center gap-8 text-white/90 z-20 transition-all duration-1000 ease-out ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_15px_rgba(74,222,128,1)] animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/70">ONLINE</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-2xl font-thin tracking-[0.1em] drop-shadow-2xl text-white/90">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div 
        className={`absolute w-full h-full transition-all duration-700 cubic-bezier(0.25, 0.1, 0.25, 1) ${isFocused ? 'opacity-100 blur-0' : 'opacity-0 blur-2xl scale-110'}`}
        style={{
          transform: `translateX(${LEFT_OFFSET - (colIndex * ITEM_WIDTH)}px)`
        }}
      >
        {/* HORIZONTAL CATEGORIES */}
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center h-24" style={{ transform: 'translateY(-200px)' }}> 
          {SYSTEM_DATA.map((cat, idx) => {
            const isActive = idx === colIndex;
            return (
              <div 
                key={cat.id} 
                className={`flex flex-col items-center justify-center transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isActive ? 'opacity-100 scale-110' : 'opacity-30 scale-90 blur-[1px]'}`}
                style={{ width: ITEM_WIDTH }}
              >
                <cat.icon 
                    size={isActive ? 56 : 40} // SMALLER ICONS
                    strokeWidth={isActive ? 1.5 : 1}
                    className={`drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-500 ${isActive ? 'text-white' : 'text-slate-400'}`}
                />
                <span className={`
                    absolute top-20 text-[9px] uppercase tracking-[0.2em] font-medium transition-all duration-500
                    ${isActive ? 'opacity-100 translate-y-0 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]' : 'opacity-0 -translate-y-4'}
                `}>
                    {cat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* VERTICAL ITEMS */}
        <div 
          className="absolute top-1/2 left-0 flex flex-col transition-all duration-500 cubic-bezier(0.25, 0.1, 0.25, 1)"
          style={{ 
            left: `${colIndex * ITEM_WIDTH}px`,
            transform: `translateY(${rowIndex === null ? 0 : -rowIndex * 85 - 85}px)` // TIGHTER SPACING
          }}
        >
          {SYSTEM_DATA.map((cat, cIdx) => {
            if (cIdx !== colIndex) return null;

            return (
              <div key={cat.id} className="pt-[70px] flex flex-col items-center w-[120px]">
                {cat.items.map((item, rIdx) => {
                    const isActiveItem = rowIndex === rIdx;
                    return (
                        <div 
                            key={item.id}
                            className={`
                                flex items-center gap-6 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                                ${isActiveItem ? 'opacity-100 scale-100 translate-x-20 z-10' : 'opacity-30 scale-90 translate-x-6 blur-[0.5px]'}
                                my-3 whitespace-nowrap group
                            `}
                            style={{ width: '600px' }}
                        >
                            {/* Glassy Icon Container - SMALLER */}
                            <div className={`
                                w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-500
                                ${isActiveItem ? 'bg-white/10 ring-1 ring-white/60 backdrop-blur-2xl' : 'bg-transparent'}
                            `}>
                                <item.icon size={32} strokeWidth={1.5} className={`transition-all duration-500 ${isActiveItem ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'text-slate-400'}`} />
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <span className={`text-3xl font-thin tracking-tight transition-all duration-500 ${isActiveItem ? 'text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]' : 'text-slate-400'}`}>
                                    {item.label}
                                </span>
                                {isActiveItem && item.subtext && (
                                    <div className="flex items-center gap-3 animate-in slide-in-from-left-8 fade-in duration-500 delay-100">
                                         {item.source && (
                                            <span 
                                                className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                                style={{ backgroundColor: item.accent || '#fff' }}
                                            >
                                                {item.source}
                                            </span>
                                         )}
                                        <span className="text-xs text-white/60 font-light uppercase tracking-[0.1em] drop-shadow-md">
                                            {item.subtext}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* METADATA PANEL */}
      {activeItem && isFocused && activeItem.stats && (
        <div className="absolute bottom-20 right-20 w-[550px] pointer-events-none z-10">
             <div className="animate-in slide-in-from-right-16 fade-in duration-700 ease-out delay-200 flex flex-col items-end gap-6">
                
                <h1 className="text-7xl font-thin tracking-tighter text-right drop-shadow-2xl bg-gradient-to-br from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                    {activeItem.label}
                </h1>
                
                <div className="flex gap-4">
                     <div className="flex items-center gap-3 bg-white text-black px-6 py-2.5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-transform hover:scale-105">
                        <Play size={16} fill="black" />
                        <span className="font-bold tracking-[0.3em] text-xs">START</span>
                     </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-4 bg-white/5 backdrop-blur-3xl p-8 rounded-[1.5rem] border border-white/10 w-full shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">Time</span>
                        <span className="text-3xl font-thin text-white drop-shadow-lg">{activeItem.stats.hours}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                         <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                            <Trophy size={10} /> Trophies
                         </span>
                        <span className="text-3xl font-thin text-white drop-shadow-lg">{activeItem.stats.achievements}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">Last</span>
                        <span className="text-3xl font-thin text-white drop-shadow-lg text-right">{activeItem.stats.lastPlayed}</span>
                    </div>
                </div>

             </div>
        </div>
      )}

      {/* FOOTER */}
      <div className={`absolute bottom-12 left-20 flex gap-10 text-sm text-white/60 font-bold tracking-[0.2em] transition-all duration-700 ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-[10px] shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/10 backdrop-blur-md">↵</div>
            <span className="uppercase text-[10px] drop-shadow-md">Select</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-[10px] shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/10 backdrop-blur-md">⌫</div>
            <span className="uppercase text-[10px] drop-shadow-md">Back</span>
        </div>
      </div>

      {/* WINDOWS */}
      {activeApp === 'explorer' && (
        <WindowedApp title="File Explorer" onClose={() => setActiveApp(null)}>
          <ExplorerApp />
        </WindowedApp>
      )}
      {activeApp === 'browser' && (
        <WindowedApp title="Internet Browser" onClose={() => setActiveApp(null)}>
          <BrowserApp />
        </WindowedApp>
      )}

    </div>
  );
}