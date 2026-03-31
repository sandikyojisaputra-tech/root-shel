import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { 
  Sidebar, Topbar, ConsoleView, FilesView, DatabasesView, 
  SchedulesView, UsersView, StartupView, AuditView 
} from './components';
import { 
  Terminal as TerminalIcon, Shield, Globe, Cpu, Activity, Upload, Lock, 
  Terminal as TermIcon, Search, Command as CmdIcon, Settings, X, Folder, 
  File, ChevronRight, ChevronLeft, HardDrive, FilePlus, FolderPlus, 
  Edit3, Play, Copy, Trash2, FileJson, FileCode, FileText, FileType,
  Archive, Clock, MapPin, Monitor, Server, Layout, Database, Calendar, Users,
  ExternalLink, Power, RefreshCw, Square, Rocket, ShieldAlert,
  Scissors, Edit2, Package, Clipboard, Download, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DOCKER_IMAGES } from './config/dockerImages';

const COMMON_COMMANDS = [
  'ls', 'cd', 'cat', 'mkdir', 'rm', 'cp', 'mv', 'nano', 'vim', 'python3', 
  'node', 'npm', 'git', 'docker', 'curl', 'wget', 'grep', 'find', 'chmod', 
  'chown', 'ps', 'top', 'kill', 'exit', 'clear', 'history', 'pwd', 'whoami',
  'apt install', 'apt update', 'df -h', 'free -m', 'uname -a', 'netstat', 'ifconfig'
];

const TERMINAL_THEMES = {
  default: {
    background: 'transparent',
    foreground: '#d4d4d4',
    cursor: '#3b82f6',
    selectionBackground: 'rgba(59, 130, 246, 0.3)',
    black: '#101116',
    red: '#ef4444',
    green: '#10b981',
    yellow: '#f59e0b',
    blue: '#3b82f6',
    magenta: '#8b5cf6',
    cyan: '#06b6d4',
    white: '#e5e5e5',
  },
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    selectionBackground: 'rgba(68, 71, 90, 0.5)',
    black: '#21222c',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
  },
  solarized: {
    background: '#002b36',
    foreground: '#839496',
    cursor: '#93a1a1',
    selectionBackground: 'rgba(7, 54, 66, 0.5)',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
  },
  oneDark: {
    background: '#282c34',
    foreground: '#abb2bf',
    cursor: '#528bff',
    selectionBackground: 'rgba(62, 68, 81, 0.5)',
    black: '#282c34',
    red: '#e06c75',
    green: '#98c379',
    yellow: '#d19a66',
    blue: '#61afef',
    magenta: '#c678dd',
    cyan: '#56b6c2',
    white: '#abb2bf',
  },
  monokai: {
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    selectionBackground: 'rgba(73, 72, 62, 0.5)',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
  }
};

const Terminal: React.FC<{ 
  shell: string; 
  fontSize: number; 
  fontFamily: string; 
  cursorBlink: boolean;
  showScrollbar: boolean;
  showMobileControls: boolean;
  theme: string;
}> = ({ shell, fontSize, fontFamily, cursorBlink, showScrollbar, showMobileControls, theme }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [inputBuffer, setInputBuffer] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isCtrlActive, setIsCtrlActive] = useState(false);
  const [isAltActive, setIsAltActive] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink,
      theme: TERMINAL_THEMES[theme as keyof typeof TERMINAL_THEMES] || TERMINAL_THEMES.default,
      fontFamily,
      fontSize,
      allowTransparency: true,
      rows: 30,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle Copy and Paste
    term.attachCustomKeyEventHandler((e) => {
      const key = e.key.toLowerCase();
      
      // Copy: Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && key === 'c') {
        if (term.hasSelection()) {
          const selection = term.getSelection();
          navigator.clipboard.writeText(selection);
          return false;
        }
        // If it's Ctrl+C (not Cmd) and no selection, let it pass to send SIGINT
        if (e.ctrlKey && !e.metaKey) return true;
        // If it's Cmd+C and no selection, ignore
        if (e.metaKey) return false;
      }

      // Paste: Ctrl+V or Cmd+V
      if ((e.ctrlKey || e.metaKey) && key === 'v') {
        if (e.type === 'keydown') {
          navigator.clipboard.readText().then(text => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(text);
              term.focus();
            }
          }).catch(err => {
            console.error('Failed to read clipboard:', err);
          });
        }
        return false;
      }

      return true;
    });

    // Connect to WebSocket with custom shell
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}?shell=${encodeURIComponent(shell)}`);
    socketRef.current = socket;

    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      setStatus('connected');
    };

    socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(event.data));
      } else {
        term.write(event.data);
      }
    };

    socket.onclose = () => {
      setStatus('disconnected');
      term.writeln('\n\x1b[1;37m[ERROR] Session disconnected from host.\x1b[0m');
    };

    const handleClear = () => {
      term.clear();
    };

    const handleTerminalCommand = (e: any) => {
      const cmd = e.detail;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(cmd);
        term.focus();
      }
    };

    window.addEventListener('clear-terminal', handleClear);
    window.addEventListener('terminal-command', handleTerminalCommand);

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text');
      if (text && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(text);
      }
    };

    terminalRef.current?.addEventListener('paste', handlePaste);

    term.onData((data) => {
      let finalData = data;

      // Handle Ctrl modifier
      if (isCtrlActive && data.length === 1) {
        const code = data.toLowerCase().charCodeAt(0);
        if (code >= 97 && code <= 122) { // a-z
          finalData = String.fromCharCode(code - 96);
        }
        setIsCtrlActive(false);
      }

      // Handle Alt modifier
      if (isAltActive && data.length === 1) {
        finalData = '\x1b' + data;
        setIsAltActive(false);
      }

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(finalData);
      }

      // Basic input tracking for suggestions
      if (data === '\r') {
        setInputBuffer('');
        setSuggestions([]);
      } else if (data === '\t') { // Tab
        if (suggestions.length > 0) {
          const lastWord = inputBuffer.split(' ').pop() || '';
          const completion = suggestions[0].slice(lastWord.length);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(completion);
          }
          setSuggestions([]);
          return; // Prevent sending the actual Tab character
        }
      } else if (data === '\x7f') { // Backspace
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
        setInputBuffer(prev => {
          const newBuffer = prev + data;
          const lastWord = newBuffer.split(' ').pop() || '';
          if (lastWord.length > 0) {
            const matches = COMMON_COMMANDS.filter(cmd => 
              cmd.startsWith(lastWord) && cmd !== lastWord
            ).slice(0, 5);
            setSuggestions(matches);
          } else {
            setSuggestions([]);
          }
          return newBuffer;
        });
      }

      // Track cursor position for suggestion box
      const cursor = term.buffer.active.cursorX;
      const row = term.buffer.active.cursorY;
      // Approximate pixel position (14px font, 8px width approx)
      setCursorPos({ 
        x: (cursor + 2) * 8.5, 
        y: (row + 1) * 18 + 45 
      });
    });

    term.onResize(({ cols, rows }) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    });

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial fit after a short delay to ensure DOM is ready
    setTimeout(() => fitAddon.fit(), 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('clear-terminal', handleClear);
      window.removeEventListener('terminal-command', handleTerminalCommand);
      terminalRef.current?.removeEventListener('paste', handlePaste);
      socket.close();
      term.dispose();
    };
  }, [shell, fontSize, fontFamily, cursorBlink, theme]);

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col">
      <div 
        ref={terminalRef} 
        className={`flex-1 ${showScrollbar ? 'custom-scrollbar' : 'overflow-hidden'}`}
      />
      
      {/* Suggestion Box */}
      {suggestions.length > 0 && (
        <div 
          className="absolute z-50 bg-[#101116] border border-zinc-800 rounded-lg shadow-2xl p-1 min-w-[160px] overflow-hidden"
          style={{ 
            left: `${Math.min(cursorPos.x, (terminalRef.current?.clientWidth || 0) - 180)}px`, 
            top: `${cursorPos.y + 20}px` 
          }}
        >
          <div className="text-[9px] text-zinc-500 uppercase tracking-widest px-3 py-1.5 border-b border-zinc-800 mb-1">
            Suggestions
          </div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                const lastWord = inputBuffer.split(' ').pop() || '';
                const completion = s.slice(lastWord.length);
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                  socketRef.current.send(completion);
                  xtermRef.current?.focus();
                }
                setSuggestions([]);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-mono rounded cursor-pointer transition-colors flex justify-between items-center group ${
                i === 0 ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>{s}</span>
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">TAB</span>
            </button>
          ))}
        </div>
      )}

      {/* Mobile Terminal Controls */}
      {showMobileControls && (
        <MobileControls 
          onKey={(k) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(k);
              xtermRef.current?.focus();
            }
          }}
          onCopy={() => {
            if (xtermRef.current?.hasSelection()) {
              const selection = xtermRef.current.getSelection();
              navigator.clipboard.writeText(selection);
            }
          }}
          onPaste={() => {
            navigator.clipboard.readText().then(text => {
              if (text && socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(text);
                xtermRef.current?.focus();
              }
            }).catch(err => console.error('Mobile paste error:', err));
          }}
          isCtrlActive={isCtrlActive}
          setIsCtrlActive={setIsCtrlActive}
          isAltActive={isAltActive}
          setIsAltActive={setIsAltActive}
        />
      )}
    </div>
  );
};

const MobileControls: React.FC<{ 
  onKey: (key: string) => void;
  onCopy: () => void;
  onPaste: () => void;
  isCtrlActive: boolean;
  setIsCtrlActive: (v: boolean) => void;
  isAltActive: boolean;
  setIsAltActive: (v: boolean) => void;
}> = ({ onKey, onCopy, onPaste, isCtrlActive, setIsCtrlActive, isAltActive, setIsAltActive }) => {
  const keys = [
    { label: 'ESC', value: '\x1b' },
    { label: 'TAB', value: '\t' },
    { label: 'CTRL', value: 'ctrl', toggle: true, active: isCtrlActive },
    { label: 'ALT', value: 'alt', toggle: true, active: isAltActive },
    { label: '↑', value: '\x1b[A' },
    { label: '↓', value: '\x1b[B' },
    { label: '←', value: '\x1b[D' },
    { label: '→', value: '\x1b[C' },
    { label: 'HOME', value: '\x1b[H' },
    { label: 'END', value: '\x1b[F' },
    { label: 'PGUP', value: '\x1b[5~' },
    { label: 'PGDN', value: '\x1b[6~' },
    { label: 'COPY', value: 'copy', action: onCopy },
    { label: 'PASTE', value: 'paste', action: onPaste },
    { label: '/', value: '/' },
    { label: '-', value: '-' },
    { label: '|', value: '|' },
  ];

  return (
    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2 px-1 bg-zinc-900/80 border-t border-zinc-800 backdrop-blur-sm">
      {keys.map((k, i) => (
        <button
          key={i}
          onClick={() => {
            if (k.value === 'ctrl') setIsCtrlActive(!isCtrlActive);
            else if (k.value === 'alt') setIsAltActive(!isAltActive);
            else if (k.action) k.action();
            else onKey(k.value);
          }}
          className={`
            flex-shrink-0 px-3 py-1.5 rounded text-[10px] font-bold font-mono transition-all
            ${k.active 
              ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 active:scale-95'}
          `}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
};

interface Command {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

const CommandPalette: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  commands: Command[];
}> = ({ isOpen, onClose, commands }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-zinc-800">
              <Search size={18} className="text-zinc-500 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-600 font-sans"
              />
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-500 text-[10px] rounded border border-zinc-700">ESC</span>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  No commands found for "{search}"
                </div>
              ) : (
                filteredCommands.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center px-3 py-3 rounded-xl transition-all text-left group ${
                      i === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-colors ${
                      i === selectedIndex ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white mb-0.5">{cmd.name}</div>
                      <div className="text-[11px] text-zinc-500">{cmd.description}</div>
                    </div>
                    {cmd.shortcut && (
                      <div className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">
                        {cmd.shortcut}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-zinc-950/50 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span className="px-1 py-0.5 bg-zinc-800 text-zinc-500 text-[9px] rounded border border-zinc-700">↑↓</span>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Navigate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-1 py-0.5 bg-zinc-800 text-zinc-500 text-[9px] rounded border border-zinc-700">ENTER</span>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Select</span>
                </div>
              </div>
              <div className="text-[9px] text-zinc-700 font-mono">COMMAND PALETTE V1.0</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const FileIcon: React.FC<{ name: string; isDirectory: boolean }> = ({ name, isDirectory }) => {
  if (isDirectory) return <Folder size={14} />;
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json': return <FileJson size={14} className="text-yellow-500/70" />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz': return <Archive size={14} className="text-orange-400/70" />;
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx': return <FileCode size={14} className="text-blue-400/70" />;
    case 'md':
    case 'txt': return <FileText size={14} className="text-zinc-400" />;
    case 'html':
    case 'css': return <FileType size={14} className="text-orange-400/70" />;
    default: return <File size={14} className="text-zinc-500" />;
  }
};

const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/home/workspace');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);
  const [clipboard, setClipboard] = useState<{ paths: string[], type: 'copy' | 'cut' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: any } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basename = (p: string) => p.split('/').pop() || '';

  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [newItemName, setNewItemName] = useState('');
  const [editingFile, setEditingFile] = useState<{ path: string, content: string } | null>(null);

  const handleCreateItem = async () => {
    if (!newItemName) return;
    const endpoint = newItemType === 'file' ? '/api/create-file' : '/api/create-folder';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, name: newItemName })
      });
      if (res.ok) {
        fetchFiles(currentPath);
        setIsNewItemModalOpen(false);
        setNewItemName('');
      } else {
        const data = await res.json();
        alert(data.error || `Failed to create ${newItemType}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFiles = async (path: string) => {
    setLoading(true);
    setSelectedFiles(new Set());
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.files) {
        // Filter out app-specific files to keep it clean for the user
        const appFiles = ['server.ts', 'package.json', 'package-lock.json', 'node_modules', 'src', 'dist', 'metadata.json', '.env.example', 'tsconfig.json', 'vite.config.ts', 'firebase-applet-config.json', 'firebase-blueprint.json', 'firestore.rules', 'firebase.ts', '.git', '.gitignore', '.next', '.vercel'];
        const filteredFiles = data.files.filter((f: any) => !appFiles.includes(f.name));
        
        setFiles(filteredFiles.sort((a: any, b: any) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        }));
        setCurrentPath(data.path);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);

    const handleRefresh = () => fetchFiles(currentPath);
    const handleClearDir = () => handleClearDirectory();
    window.addEventListener('refresh-files', handleRefresh);
    window.addEventListener('clear-directory', handleClearDir);
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('refresh-files', handleRefresh);
      window.removeEventListener('clear-directory', handleClearDir);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [currentPath]);

  const handleContextMenu = (e: React.MouseEvent, file: any) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleCopy = (paths: string[]) => {
    setClipboard({ paths, type: 'copy' });
    setContextMenu(null);
  };

  const handleCut = (paths: string[]) => {
    setClipboard({ paths, type: 'cut' });
    setContextMenu(null);
  };

  const handlePaste = async () => {
    if (!clipboard) return;
    setLoading(true);
    try {
      for (const source of clipboard.paths) {
        const name = basename(source);
        const destination = joinPath(currentPath, name);
        const endpoint = clipboard.type === 'copy' ? '/api/copy' : '/api/move';
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, destination })
        });
      }
      fetchFiles(currentPath);
      if (clipboard.type === 'cut') setClipboard(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setContextMenu(null);
    }
  };

  const handleCompress = async (paths: string[]) => {
    const name = prompt('Enter ZIP name:', 'archive.zip');
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch('/api/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths, name })
      });
      if (res.ok) fetchFiles(currentPath);
      else {
        const data = await res.json();
        alert(data.error || 'Failed to compress');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setContextMenu(null);
    }
  };

  const handleNavigate = (name: string) => {
    const newPath = joinPath(currentPath, name);
    fetchFiles(newPath);
  };

  const handleBack = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length <= 2 && parts[0] === 'home' && parts[1] === 'workspace') return;
    parts.pop();
    const newPath = '/' + parts.join('/');
    fetchFiles(newPath);
  };

  const handleCreateFile = async () => {
    const name = prompt('Enter file name:');
    if (!name) return;
    try {
      const res = await fetch('/api/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, name })
      });
      if (res.ok) fetchFiles(currentPath);
      else {
        const data = await res.json();
        alert(data.error || 'Failed to create file');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;
    try {
      const res = await fetch('/api/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, name })
      });
      if (res.ok) fetchFiles(currentPath);
      else {
        const data = await res.json();
        alert(data.error || 'Failed to create folder');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRename = async (oldName: string) => {
    const newName = prompt('Enter new name:', oldName);
    if (!newName || newName === oldName) return;
    try {
      const res = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldPath: joinPath(currentPath, oldName), 
          newPath: joinPath(currentPath, newName) 
        })
      });
      if (res.ok) fetchFiles(currentPath);
      else {
        const data = await res.json();
        alert(data.error || 'Failed to rename');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/delete?path=${encodeURIComponent(joinPath(currentPath, name))}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchFiles(currentPath);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearDirectory = async () => {
    if (!confirm(`Are you sure you want to delete ALL files in ${currentPath}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clear-directory?path=${encodeURIComponent(currentPath)}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchFiles(currentPath);
      else {
        const data = await res.json();
        alert(data.error || 'Failed to clear directory');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (name: string) => {
    window.open(`/api/download?path=${encodeURIComponent(joinPath(currentPath, name))}`, '_blank');
  };

  const handleOpenFile = async (name: string) => {
    const fullPath = joinPath(currentPath, name);
    setLoading(true);
    try {
      const res = await fetch(`/api/read-file?path=${encodeURIComponent(fullPath)}`);
      const data = await res.json();
      if (res.ok) {
        setEditingFile({ path: fullPath, content: data.content });
      } else {
        alert(data.error || 'Failed to read file');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setContextMenu(null);
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    setLoading(true);
    try {
      const res = await fetch('/api/save-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: editingFile.path, content: editingFile.content })
      });
      if (res.ok) {
        setEditingFile(null);
        fetchFiles(currentPath);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save file');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/upload?path=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchFiles(currentPath);
        // Reset input
        e.target.value = '';
      } else {
        const error = await res.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed due to network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = (name: string) => {
    let cmd = '';
    const fullPath = joinPath(currentPath, name);
    if (name === 'package.json') cmd = `cd ${currentPath} && npm start\n`;
    else if (name.endsWith('.js')) cmd = `node ${fullPath}\n`;
    else if (name.endsWith('.py')) cmd = `python3 ${fullPath}\n`;
    else if (name.endsWith('.sh')) cmd = `chmod +x ${fullPath} && ${fullPath}\n`;
    
    if (cmd) {
      window.dispatchEvent(new CustomEvent('terminal-command', { detail: cmd }));
    }
  };

  const handleExtract = async (name: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: joinPath(currentPath, name) })
      });
      if (res.ok) fetchFiles(currentPath);
      else {
        const data = await res.json();
        alert(data.error || 'Failed to extract ZIP');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyPath = (name: string) => {
    const fullPath = joinPath(currentPath, name);
    navigator.clipboard.writeText(fullPath);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleSelect = (name: string, e?: React.MouseEvent | React.ChangeEvent | React.TouchEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedFiles(newSelected);
    if (newSelected.size === 0) setIsSelectionMode(false);
  };

  const startLongPress = (name: string) => {
    isLongPressActive.current = false;
    longPressTimer.current = setTimeout(() => {
      setIsSelectionMode(true);
      toggleSelect(name);
      isLongPressActive.current = true;
    }, 600); // 600ms for long press
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.name)));
    }
  };

  const joinPath = (base: string, name: string) => {
    const b = base.endsWith('/') ? base : base + '/';
    const n = name.startsWith('/') ? name.slice(1) : name;
    return b + n;
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} selected items?`)) return;

    setLoading(true);
    try {
      const paths = Array.from(selectedFiles).map((name: string) => joinPath(currentPath, name));
      const res = await fetch('/api/delete-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths })
      });
      const data = await res.json();
      if (res.ok) {
        const errors = data.results?.filter((r: any) => r.status === 'error');
        if (errors && errors.length > 0) {
          alert(`Deleted some items, but ${errors.length} failed: ${errors[0].message}`);
        }
        setSelectedFiles(new Set());
        setIsSelectionMode(false);
        fetchFiles(currentPath);
      } else {
        alert(data.error || 'Failed to delete selected items');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (editingFile) {
          e.preventDefault();
          handleSaveFile();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingFile, handleSaveFile]);

  const hasPackageJson = files.some(f => f.name === 'package.json');

  return (
    <div className="flex-1 flex flex-col min-h-0" onContextMenu={(e) => handleContextMenu(e, null)}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        className="hidden" 
        multiple
      />
      
      {contextMenu && (
        <div 
          className="fixed z-[200] bg-[#1b1d23] border border-zinc-800 rounded-xl shadow-2xl py-2 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.file ? (
            <>
              <button 
                onClick={() => { handleCopy([joinPath(currentPath, contextMenu.file.name)]); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Copy size={14} /> Copy
              </button>
              <button 
                onClick={() => { handleCut([joinPath(currentPath, contextMenu.file.name)]); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Scissors size={14} /> Cut
              </button>
              <button 
                onClick={() => { handleRename(contextMenu.file.name); setContextMenu(null); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Edit2 size={14} /> Rename
              </button>
              <button 
                onClick={() => { handleDelete(contextMenu.file.name); setContextMenu(null); }}
                className="w-full px-4 py-2 text-left text-[11px] text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
              <div className="h-px bg-zinc-800 my-1" />
              {!contextMenu.file.isDirectory && (
                <button 
                  onClick={() => { handleDownload(contextMenu.file.name); setContextMenu(null); }}
                  className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
                >
                  <Download size={14} /> Download
                </button>
              )}
              <button 
                onClick={() => { handleCompress([joinPath(currentPath, contextMenu.file.name)]); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Package size={14} /> Compress
              </button>
              {contextMenu.file.name.endsWith('.zip') && (
                <button 
                  onClick={() => { handleExtract(contextMenu.file.name); setContextMenu(null); }}
                  className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
                >
                  <Archive size={14} /> Extract
                </button>
              )}
              <div className="h-px bg-zinc-800 my-1" />
              <div className="relative group/submenu">
                <button 
                  className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3"><ExternalLink size={14} /> Open With</div>
                  <ChevronRight size={12} />
                </button>
                <div className="absolute left-full top-0 hidden group-hover/submenu:block bg-[#1b1d23] border border-zinc-800 rounded-xl shadow-2xl py-2 min-w-[140px] ml-1">
                  <button onClick={() => { handleRun(contextMenu.file.name); setContextMenu(null); }} className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors">Terminal</button>
                  <button onClick={() => { handleOpenFile(contextMenu.file.name); }} className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors">Text Editor</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button 
                disabled={!clipboard}
                onClick={handlePaste}
                className={`w-full px-4 py-2 text-left text-[11px] flex items-center gap-3 transition-colors ${
                  clipboard ? 'text-zinc-300 hover:bg-blue-600 hover:text-white' : 'text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Clipboard size={14} /> Paste
              </button>
              <div className="h-px bg-zinc-800 my-1" />
              <button 
                onClick={() => { fileInputRef.current?.click(); setContextMenu(null); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Upload size={14} /> Upload Files
              </button>
              <div className="h-px bg-zinc-800 my-1" />
              <button 
                onClick={() => { setNewItemType('file'); setIsNewItemModalOpen(true); setContextMenu(null); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <FilePlus size={14} /> New File
              </button>
              <button 
                onClick={() => { setNewItemType('folder'); setIsNewItemModalOpen(true); setContextMenu(null); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <FolderPlus size={14} /> New Folder
              </button>
            </>
          )}
          {selectedFiles.size > 0 && (
            <>
              <div className="h-px bg-zinc-800 my-1" />
              <button 
                onClick={() => { handleCopy(Array.from(selectedFiles).map((n: string) => joinPath(currentPath, n))); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Copy size={14} /> Copy Selected ({selectedFiles.size})
              </button>
              <button 
                onClick={() => { handleCut(Array.from(selectedFiles).map((n: string) => joinPath(currentPath, n))); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Scissors size={14} /> Cut Selected ({selectedFiles.size})
              </button>
              <button 
                onClick={() => { handleCompress(Array.from(selectedFiles).map((n: string) => joinPath(currentPath, n))); }}
                className="w-full px-4 py-2 text-left text-[11px] text-zinc-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Package size={14} /> Compress Selected
              </button>
              <button 
                onClick={() => { handleDeleteSelected(); setContextMenu(null); }}
                className="w-full px-4 py-2 text-left text-[11px] text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Trash2 size={14} /> Delete Selected
              </button>
            </>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6 border-b border-zinc-800/50 bg-[#1b1d23]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-zinc-400 font-mono overflow-x-auto no-scrollbar whitespace-nowrap max-w-full">
            <button 
              onClick={() => fetchFiles('/home/workspace')}
              className="px-2 py-1 bg-zinc-800/50 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
            >
              /workspace
            </button>
            {currentPath.split('/').filter(Boolean).slice(2).map((part, i, arr) => (
              <React.Fragment key={i}>
                <ChevronRight size={10} className="text-zinc-700 shrink-0" />
                <button 
                  className="px-2 py-1 bg-zinc-800/50 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                  onClick={() => fetchFiles('/home/workspace/' + arr.slice(0, i + 1).join('/'))}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d0e12] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button 
                onClick={() => fetchFiles(currentPath)}
                className="flex-1 sm:flex-none px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
                title="Refresh Files"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> <span>Refresh</span>
              </button>
              <button 
                onClick={() => { setNewItemType('file'); setIsNewItemModalOpen(true); }}
                className="flex-1 sm:flex-none px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
              >
                <FilePlus size={12} /> <span>New File</span>
              </button>
              <button 
                onClick={() => { setNewItemType('folder'); setIsNewItemModalOpen(true); }}
                className="flex-1 sm:flex-none px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
              >
                <FolderPlus size={12} /> <span>New Folder</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Upload size={12} /> Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Item Modal */}
      <AnimatePresence>
        {isNewItemModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewItemModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#1b1d23] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Create New {newItemType}</h3>
                <button onClick={() => setIsNewItemModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  {newItemType} Name
                </label>
                <input 
                  autoFocus
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateItem()}
                  placeholder={`Enter ${newItemType} name...`}
                  className="w-full bg-[#0d0e12] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <p className="mt-3 text-[10px] text-zinc-500">
                  The {newItemType} will be created in <span className="text-blue-400 font-mono">{currentPath}</span>
                </p>
              </div>
              <div className="px-6 py-4 bg-[#101116] border-t border-zinc-800 flex justify-end space-x-3">
                <button 
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateItem}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-900/20"
                >
                  Create {newItemType}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Editor Modal */}
      <AnimatePresence>
        {editingFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingFile(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full h-full bg-[#0d0e12] flex flex-col z-[110]"
            >
              <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-[#101116]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">File Editor</h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{editingFile.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/30 rounded-lg border border-zinc-800/50 mr-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Status:</span>
                    <span className="text-[10px] text-emerald-500 font-mono">Ready</span>
                  </div>
                  <button 
                    onClick={handleSaveFile}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                  >
                    <Save size={14} /> Save Content
                  </button>
                  <button 
                    onClick={() => setEditingFile(null)} 
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-[#0a0b0e]">
                <textarea 
                  autoFocus
                  value={editingFile.content}
                  onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                  className="w-full h-full bg-transparent text-zinc-300 font-mono text-sm p-8 resize-none focus:outline-none custom-scrollbar leading-relaxed"
                  spellCheck={false}
                  placeholder="Start typing..."
                />
              </div>
              <div className="px-6 py-3 bg-[#101116] border-t border-zinc-800/50 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Characters:</span>
                    <span className="text-[10px] font-mono text-zinc-300">{editingFile.content.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Lines:</span>
                    <span className="text-[10px] font-mono text-zinc-300">{editingFile.content.split('\n').length}</span>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 mx-1">Ctrl + S</kbd> to save
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="grid grid-cols-[40px_1fr_80px] sm:grid-cols-[40px_1fr_120px_180px_100px] px-4 sm:px-6 py-3 bg-[#101116] border-b border-zinc-800/50 text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest items-center">
          <div className="flex items-center justify-center">
            {isSelectionMode && (
              <input 
                type="checkbox" 
                checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                onChange={toggleSelectAll}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            )}
          </div>
          <span>Name</span>
          <span className="hidden sm:block">Size</span>
          <span className="hidden sm:block">Last Modified</span>
          <span className="text-right">Actions</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredFiles.length === 0 && !loading && (
            <div className="py-20 text-center">
              <Search size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
              <p className="text-zinc-500 text-[11px] uppercase tracking-widest">No files found matching your search.</p>
            </div>
          )}
          
          {filteredFiles.map((file, i) => (
            <div
              key={i}
              className={`grid grid-cols-[40px_1fr_80px] sm:grid-cols-[40px_1fr_120px_180px_100px] px-4 sm:px-6 py-3 border-b border-zinc-800/20 hover:bg-white/5 transition-colors group items-center cursor-pointer select-none ${
                selectedFiles.has(file.name) ? 'bg-blue-500/5' : ''
              }`}
              onClick={() => {
                if (isLongPressActive.current) {
                  isLongPressActive.current = false;
                  return;
                }
                isSelectionMode ? toggleSelect(file.name) : (file.isDirectory ? handleNavigate(file.name) : handleOpenFile(file.name));
              }}
              onMouseDown={() => !isSelectionMode && startLongPress(file.name)}
              onMouseUp={endLongPress}
              onMouseLeave={endLongPress}
              onTouchStart={() => !isSelectionMode && startLongPress(file.name)}
              onTouchEnd={endLongPress}
              onContextMenu={(e) => handleContextMenu(e, file)}
            >
              <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {isSelectionMode && (
                  <input 
                    type="checkbox" 
                    checked={selectedFiles.has(file.name)}
                    onChange={() => toggleSelect(file.name)}
                    className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                )}
              </div>
              <div 
                className="flex items-center space-x-3 overflow-hidden"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  file.isDirectory ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-800/50 text-zinc-500'
                }`}>
                  <FileIcon name={file.name} isDirectory={file.isDirectory} />
                </div>
                <span className={`text-[10px] sm:text-[11px] font-bold truncate transition-colors ${
                  file.isDirectory ? 'text-blue-400 hover:text-blue-300' : 'text-zinc-300 group-hover:text-white'
                }`}
                >
                  {file.name}
                </span>
              </div>
              
              <div className="hidden sm:block text-[10px] font-mono text-zinc-500">
                {file.isDirectory ? '-' : formatSize(file.size)}
              </div>
              
              <div className="hidden sm:block text-[10px] font-mono text-zinc-500">
                {new Date(file.mtime).toLocaleString()}
              </div>
              
              <div className="flex items-center justify-end space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {file.name.endsWith('.zip') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleExtract(file.name); }}
                    className="p-1.5 hover:bg-orange-500/20 text-zinc-500 hover:text-orange-500 rounded"
                    title="Extract"
                  >
                    <Archive size={12} />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRename(file.name); }}
                  className="p-1.5 hover:bg-white/10 text-zinc-500 hover:text-white rounded"
                  title="Rename"
                >
                  <Edit3 size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                  className="p-1.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedFiles.size > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1b1d23] border border-zinc-800 rounded-xl px-6 py-3 flex items-center space-x-6 shadow-2xl z-50 ring-1 ring-white/5"
            >
              <div className="flex items-center space-x-3 border-r border-zinc-800 pr-6">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">
                  {selectedFiles.size}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleDeleteSelected}
                  className="px-4 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 text-[10px] font-bold uppercase tracking-widest rounded transition-all hover:text-white flex items-center gap-2"
                >
                  <Trash2 size={12} /> Delete
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiles(new Set());
                    setIsSelectionMode(false);
                  }}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SettingsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  settings: any;
  updateSettings: (key: string, value: any) => void;
}> = ({ isOpen, onClose, settings, updateSettings }) => {
  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-white' : 'bg-zinc-800'}`}
    >
      <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${active ? 'right-1 bg-black' : 'left-1 bg-zinc-500'}`} />
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">System Settings</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-1">Terminal Configuration</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visual Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-white text-black rounded-2xl flex flex-col items-center justify-center space-y-2 border border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <div className="w-8 h-8 rounded-full bg-black border border-zinc-800" />
                    <span className="text-xs font-bold">Monochrome</span>
                  </button>
                  <button className="p-4 bg-zinc-800/50 text-zinc-500 rounded-2xl flex flex-col items-center justify-center space-y-2 border border-zinc-700 opacity-50 cursor-not-allowed">
                    <div className="w-8 h-8 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold">Cyberpunk (Locked)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Terminal Theme</h3>
                <select 
                  value={settings.terminalTheme}
                  onChange={(e) => updateSettings('terminalTheme', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white transition-colors"
                >
                  <option value="default">Default Dark</option>
                  <option value="dracula">Dracula</option>
                  <option value="solarized">Solarized Dark</option>
                  <option value="oneDark">One Dark</option>
                  <option value="monokai">Monokai</option>
                </select>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Terminal Font</h3>
                <div className="flex items-center space-x-4">
                  <select 
                    value={settings.fontFamily}
                    onChange={(e) => updateSettings('fontFamily', e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white transition-colors"
                  >
                    <option value='"JetBrains Mono", monospace'>JetBrains Mono</option>
                    <option value='"Fira Code", monospace'>Fira Code</option>
                    <option value='"Source Code Pro", monospace'>Source Code Pro</option>
                    <option value='monospace'>System Mono</option>
                  </select>
                  <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                    <button 
                      onClick={() => updateSettings('fontSize', Math.max(10, settings.fontSize - 1))}
                      className="px-3 py-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono text-white px-2">{settings.fontSize}px</span>
                    <button 
                      onClick={() => updateSettings('fontSize', Math.min(24, settings.fontSize + 1))}
                      className="px-3 py-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Toggles & Behavior</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Cursor Blink</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Animate terminal cursor</span>
                    </div>
                    <Toggle active={settings.cursorBlink} onClick={() => updateSettings('cursorBlink', !settings.cursorBlink)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Show Scrollbar</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Toggle terminal scroll visibility</span>
                    </div>
                    <Toggle active={settings.showScrollbar} onClick={() => updateSettings('showScrollbar', !settings.showScrollbar)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Mobile Controls</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Show virtual keyboard bar</span>
                    </div>
                    <Toggle active={settings.showMobileControls} onClick={() => updateSettings('showMobileControls', !settings.showMobileControls)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Auto-Refresh Stats</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Update system info every 5s</span>
                    </div>
                    <Toggle active={settings.autoRefreshStats} onClick={() => updateSettings('autoRefreshStats', !settings.autoRefreshStats)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Settings synced</span>
              </div>
              <button onClick={onClose} className="px-8 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

const AuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1b1d23]">
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Audit Logs</h2>
            <p className="text-sm text-zinc-400 mt-1">Track significant server actions and user activity</p>
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Refresh Logs"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search logs by action, details, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#16171d] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
            <ShieldAlert size={48} className="opacity-20" />
            <p>No audit logs found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="bg-[#16171d] border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${
                      log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400' :
                      log.action.includes('CREATE') ? 'bg-green-500/10 text-green-400' :
                      log.action.includes('UPLOAD') ? 'bg-blue-500/10 text-blue-400' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200">{log.action}</span>
                        <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-500 uppercase tracking-wider font-semibold">
                          {log.user}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-zinc-400 font-mono break-all">
                        {JSON.stringify(log.details)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-zinc-300">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ServerActions: React.FC<{ 
  status: 'running' | 'starting' | 'stopping' | 'offline';
  onAction: (action: 'start' | 'stop' | 'restart') => void;
}> = ({ status, onAction }) => {
  return (
    <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Server Actions</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Control your server instance</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          status === 'running' ? 'bg-emerald-500/10 text-emerald-500' :
          status === 'offline' ? 'bg-red-500/10 text-red-500' :
          'bg-yellow-500/10 text-yellow-500'
        }`}>
          {status}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onAction('start')}
          disabled={status !== 'offline'}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all space-y-2 ${
            status === 'offline' 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10' 
              : 'bg-zinc-800/30 border-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Power size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Start</span>
        </button>
        
        <button
          onClick={() => onAction('restart')}
          disabled={status !== 'running'}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all space-y-2 ${
            status === 'running' 
              ? 'bg-blue-500/5 border-blue-500/20 text-blue-500 hover:bg-blue-500/10' 
              : 'bg-zinc-800/30 border-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Restart</span>
        </button>
        
        <button
          onClick={() => onAction('stop')}
          disabled={status !== 'running'}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all space-y-2 ${
            status === 'running' 
              ? 'bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10' 
              : 'bg-zinc-800/30 border-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Square size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Stop</span>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/50">
        <button
          onClick={() => onAction('restart')}
          disabled={status !== 'running'}
          className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl border transition-all ${
            status === 'running' 
              ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-lg shadow-blue-900/20' 
              : 'bg-zinc-800/30 border-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={16} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Restart Server</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ data: any[], stats: any }> = ({ data, stats }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-2xl p-6 shadow-xl xl:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Specifications</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Real-time hardware information</p>
          </div>
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
            <Server size={16} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Cpu size={14} />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Processor</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 truncate" title={stats.cpu.model}>
              {stats.cpu.model}
            </div>
          </div>
          <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Monitor size={14} />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Operating System</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 truncate" title={stats.os}>
              {stats.os}
            </div>
          </div>
          <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Database size={14} />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Memory</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300">
              {stats.mem.total} MB
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">CPU Usage History</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Real-time processor load (%)</p>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Cpu size={16} />
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#101116', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Memory Usage History</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Real-time RAM utilization (%)</p>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Activity size={16} />
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#101116', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="mem" stroke="#10b981" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-2xl p-6 shadow-xl xl:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Disk Usage Overview</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Storage capacity utilization (%)</p>
          </div>
          <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
            <HardDrive size={16} />
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#101116', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#f59e0b' }}
              />
              <Area type="monotone" dataKey="disk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDisk)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'console' | 'files' | 'databases' | 'schedules' | 'users' | 'startup' | 'audit'>('console');
  const [statsHistory, setStatsHistory] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<'running' | 'starting' | 'stopping' | 'offline'>('running');
  const [publicIP, setPublicIP] = useState<string>('Detecting...');
  const [config, setConfig] = useState<any>({
    startupCommand: "npm start",
    dockerImage: "ghcr.io/pterodactyl/yolks:node_20",
    envVars: [],
    autoStartCommand: true
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isExecutingStartup, setIsExecutingStartup] = useState(false);
  const [startupExecutionLog, setStartupExecutionLog] = useState<string[]>([]);
  const [shell, setShell] = useState<string>('/bin/bash');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>({
    server: '...',
    ip: '...',
    location: '...',
    os: '...',
    uptime: 0,
    cpu: { model: '...', usage: 0 },
    mem: { used: 0, free: 0, total: 0, usage: 0 },
    disk: { total: '0G', used: '0G', free: '0G', usage: 0, io: 'Low' }
  });

  // Settings State with Persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('webshell-settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 14,
      fontFamily: '"JetBrains Mono", monospace',
      cursorBlink: true,
      showMobileControls: true,
      showScrollbar: false,
      autoRefreshStats: true,
      terminalTheme: 'default'
    };
  });

  useEffect(() => {
    localStorage.setItem('webshell-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }
      const data = await res.json();
      setServerStatus(data.status);
    } catch (e) {
      console.error("Failed to fetch server status", e);
    }
  };

  const executeStartupCommand = async () => {
    if (!config.autoStartCommand || !config.startupCommand) return;
    
    setIsExecutingStartup(true);
    setStartupExecutionLog([`[${new Date().toLocaleTimeString()}] Executing startup command...`]);
    
    try {
      const res = await fetch('/api/server/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: config.startupCommand,
          dockerImage: config.dockerImage,
          envVars: config.envVars
        })
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      setStartupExecutionLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Command executed successfully`,
        `[${new Date().toLocaleTimeString()}] Output: ${data.output || 'Command completed'}`
      ]);
    } catch (e) {
      console.error("Failed to execute startup command", e);
      setStartupExecutionLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Error: ${e instanceof Error ? e.message : 'Unknown error'}`
      ]);
    } finally {
      setIsExecutingStartup(false);
    }
  };

  const handleServerAction = async (action: 'start' | 'stop' | 'restart') => {
    try {
      const res = await fetch('/api/server/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          startupCommand: config.startupCommand,
          dockerImage: config.dockerImage,
          autoExecute: config.autoStartCommand
        })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }
      const data = await res.json();
      setServerStatus(data.status);
      
      // Auto-execute startup command if enabled and action is start/restart
      if (config.autoStartCommand && (action === 'start' || action === 'restart')) {
        setTimeout(() => executeStartupCommand(), 1500);
      }
      
      // Refresh status after a delay to show transitions
      setTimeout(fetchStatus, 2500);
    } catch (e) {
      console.error("Failed to perform server action", e);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error("Failed to fetch config", e);
    }
  };

  const saveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert('Configuration saved successfully!');
      }
    } catch (e) {
      console.error("Failed to save config", e);
      alert('Failed to save configuration.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchConfig();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const commands: Command[] = [
    {
      id: 'view-audit',
      name: 'Go to Audit Logs',
      description: 'View significant server actions and user activity',
      icon: <Clock size={16} />,
      action: () => setView('audit'),
      shortcut: 'G A L'
    },
    {
      id: 'view-console',
      name: 'Go to Console',
      description: 'View the terminal and real-time server statistics',
      icon: <TerminalIcon size={16} />,
      action: () => setView('console'),
      shortcut: 'G C'
    },
    {
      id: 'view-files',
      name: 'Go to File Manager',
      description: 'Manage, upload, and edit your server files',
      icon: <Folder size={16} />,
      action: () => setView('files'),
      shortcut: 'G F'
    },
    {
      id: 'view-databases',
      name: 'Go to Databases',
      description: 'Manage server databases',
      icon: <Database size={16} />,
      action: () => setView('databases'),
      shortcut: 'G D'
    },
    {
      id: 'view-schedules',
      name: 'Go to Schedules',
      description: 'Manage automated tasks',
      icon: <Calendar size={16} />,
      action: () => setView('schedules'),
      shortcut: 'G S'
    },
    {
      id: 'view-users',
      name: 'Go to Users',
      description: 'Manage sub-user permissions',
      icon: <Users size={16} />,
      action: () => setView('users'),
      shortcut: 'G U'
    },
    {
      id: 'view-startup',
      name: 'Go to Startup',
      description: 'Configure server startup command',
      icon: <Rocket size={16} />,
      action: () => setView('startup'),
      shortcut: 'G T'
    },
    {
      id: 'shell-bash',
      name: 'Switch to Bash',
      description: 'Use /bin/bash as your primary shell environment',
      icon: <TermIcon size={16} />,
      action: () => setShell('/bin/bash')
    },
    {
      id: 'shell-sh',
      name: 'Switch to SH',
      description: 'Use /bin/sh for a minimal shell experience',
      icon: <TermIcon size={16} />,
      action: () => setShell('/bin/sh')
    },
    {
      id: 'shell-python',
      name: 'Switch to Python3',
      description: 'Enter interactive Python 3.x REPL',
      icon: <Cpu size={16} />,
      action: () => setShell('/usr/bin/python3')
    },
    {
      id: 'shell-node',
      name: 'Switch to Node.js',
      description: 'Enter interactive Node.js REPL',
      icon: <Activity size={16} />,
      action: () => setShell('/usr/bin/node')
    },
    {
      id: 'file-refresh',
      name: 'Refresh File Explorer',
      description: 'Reload the current directory listing',
      icon: <Activity size={16} />,
      action: () => {
        const event = new CustomEvent('refresh-files');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'clear-terminal',
      name: 'Clear Terminal',
      description: 'Clear all text from the current terminal buffer',
      icon: <X size={16} />,
      action: () => {
        const event = new CustomEvent('clear-terminal');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'clear-directory',
      name: 'Clear Current Directory',
      description: 'Delete all files and folders in the current explorer path',
      icon: <Trash2 size={16} />,
      action: () => {
        const event = new CustomEvent('clear-directory');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'app-settings',
      name: 'Application Settings',
      description: 'Configure terminal theme, font size, and behavior',
      icon: <Settings size={16} />,
      action: () => setIsSettingsOpen(true)
    }
  ];

  useEffect(() => {
    const fetchInfo = () => {
      if (!settings.autoRefreshStats) return;
      fetch('/api/info')
        .then(res => res.json())
        .then(data => {
          setPublicIP(data.ip);
          setStats(data);
          setStatsHistory(prev => {
            const newHistory = [...prev, {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              cpu: data.cpu.usage,
              mem: data.mem.usage,
              disk: data.disk.usage
            }];
            // Keep last 20 data points
            return newHistory.slice(-20);
          });
        })
        .catch(() => setPublicIP('Unknown'));
    };

    fetchInfo();
    const interval = setInterval(fetchInfo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [settings.autoRefreshStats]);

  return (
    <div className="fixed inset-0 bg-[#0d0e12] text-[#d4d4d4] font-sans selection:bg-blue-500/30 selection:text-white overflow-hidden flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar view={view} setView={setView} onSettingsClick={() => setIsSettingsOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Topbar 
          publicIP={publicIP}
          serverStatus={serverStatus}
          view={view}
          uptime={stats.uptime}
          onServerAction={handleServerAction}
          dockerImage={config.dockerImage}
          startupCommand={config.startupCommand}
          autoStartCommand={config.autoStartCommand}
        />

        {/* View Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10">
          <AnimatePresence mode="wait">
            {view === 'audit' && (
              <motion.div 
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <AuditLog />
              </motion.div>
            )}

            {view === 'console' && (
              <motion.div 
                key="console"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-3 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-sm">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-500">
                      <Cpu size={16} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5 sm:mb-1 truncate">CPU Usage</div>
                      <div className="text-sm sm:text-xl font-mono text-white">{stats.cpu.usage}%</div>
                    </div>
                  </div>
                  <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-3 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-sm">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-500">
                      <Activity size={16} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5 sm:mb-1 truncate">Memory</div>
                      <div className="text-sm sm:text-xl font-mono text-white">{stats.mem.usage}%</div>
                      <div className="text-[8px] sm:text-[10px] text-zinc-600 font-mono truncate">{stats.mem.used}MB / {stats.mem.total}MB</div>
                    </div>
                  </div>
                  <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-3 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-sm">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-orange-500">
                      <HardDrive size={16} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5 sm:mb-1 truncate">Disk Usage</div>
                      <div className="text-sm sm:text-xl font-mono text-white">{stats.disk.usage}%</div>
                      <div className="text-[8px] sm:text-[10px] text-zinc-600 font-mono truncate">{stats.disk.used} / {stats.disk.total}</div>
                    </div>
                  </div>
                  <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-3 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-sm">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-purple-500">
                      <Globe size={16} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5 sm:mb-1 truncate">Network</div>
                      <div className="text-sm sm:text-xl font-mono text-white">{stats.disk.io}</div>
                      <div className="text-[8px] sm:text-[10px] text-zinc-600 font-mono truncate">{stats.location}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Terminal Container */}
                    <div className="bg-[#0a0b0e] border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px] sm:h-[600px]">
                      <div className="px-4 py-3 bg-[#101116] border-b border-zinc-800/50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 bg-zinc-800/50 rounded-lg">
                            <TerminalIcon size={14} className="text-zinc-400" />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Console</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 px-2 py-1 bg-zinc-800/30 rounded border border-zinc-800/50">
                            <span className="text-[9px] text-zinc-500 font-mono">Shell:</span>
                            <select 
                              value={shell} 
                              onChange={(e) => setShell(e.target.value)}
                              className="bg-transparent text-[9px] font-mono text-blue-400 outline-none cursor-pointer"
                            >
                              <option value="/bin/bash">bash</option>
                              <option value="/bin/sh">sh</option>
                              <option value="/usr/bin/python3">python</option>
                              <option value="/usr/bin/node">node</option>
                            </select>
                          </div>
                          <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('clear-terminal'))}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
                            title="Clear Console"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 p-2 sm:p-4 overflow-hidden">
                        <Terminal 
                          key={`${shell}-${settings.fontSize}-${settings.fontFamily}-${settings.cursorBlink}`} 
                          shell={shell} 
                          fontSize={settings.fontSize}
                          fontFamily={settings.fontFamily}
                          cursorBlink={settings.cursorBlink}
                          showScrollbar={settings.showScrollbar}
                          showMobileControls={settings.showMobileControls}
                          theme={settings.terminalTheme}
                        />
                      </div>
                    </div>

                    {/* Charts integrated below terminal */}
                    <Dashboard data={statsHistory} stats={stats} />
                  </div>

                  <div className="space-y-6">
                    <ServerActions status={serverStatus} onAction={handleServerAction} />
                    
                    <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-5 flex items-center">
                        <Monitor size={12} className="mr-2 text-blue-500" />
                        Server Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-800/30">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Node</span>
                          <span className="text-[10px] font-mono text-zinc-300">Node-01</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-800/30">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Status</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            serverStatus === 'running' ? 'bg-emerald-500/10 text-emerald-500' :
                            serverStatus === 'offline' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>{serverStatus}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-800/30">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Uptime</span>
                          <span className="text-[10px] font-mono text-zinc-300">{formatUptime(stats.uptime)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-800/30">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">IP Address</span>
                          <span className="text-[10px] font-mono text-zinc-300">{publicIP}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Location</span>
                          <span className="text-[10px] font-mono text-zinc-300">{stats.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-5 flex items-center">
                        <Settings size={12} className="mr-2 text-emerald-500" />
                        Quick Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Auto Refresh</span>
                          <button 
                            onClick={() => updateSettings('autoRefreshStats', !settings.autoRefreshStats)}
                            className={`w-8 h-4 rounded-full transition-colors relative ${settings.autoRefreshStats ? 'bg-blue-600' : 'bg-zinc-700'}`}
                          >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.autoRefreshStats ? 'left-4.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Font Size</span>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => updateSettings('fontSize', Math.max(10, settings.fontSize - 1))} className="p-1 bg-zinc-800 rounded text-zinc-400 hover:text-white">-</button>
                            <span className="text-[10px] font-mono text-zinc-300 w-4 text-center">{settings.fontSize}</span>
                            <button onClick={() => updateSettings('fontSize', Math.min(24, settings.fontSize + 1))} className="p-1 bg-zinc-800 rounded text-zinc-400 hover:text-white">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'files' && (
              <motion.div 
                key="files"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl overflow-hidden shadow-xl"
              >
                <FileExplorer />
              </motion.div>
            )}

            {view === 'databases' && (
              <motion.div 
                key="databases"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-4 sm:p-8 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Databases</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Manage server databases</p>
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-colors">
                    New Database
                  </button>
                </div>
                <div className="bg-[#101116] border border-zinc-800/50 rounded-xl overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
                    <thead>
                      <tr className="bg-[#1a1c23] border-b border-zinc-800/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Database</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Host</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Username</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-[11px] font-bold text-zinc-300">s1_main</td>
                        <td className="px-6 py-4 text-[11px] font-mono text-zinc-500">127.0.0.1:3306</td>
                        <td className="px-6 py-4 text-[11px] font-mono text-zinc-500">u1_admin</td>
                        <td className="px-6 py-4">
                          <button className="text-zinc-500 hover:text-white transition-colors"><Settings size={14} /></button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {view === 'schedules' && (
              <motion.div 
                key="schedules"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-4 sm:p-8 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Schedules</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Automate server tasks</p>
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-colors">
                    Create Schedule
                  </button>
                </div>
                <div className="text-center py-20 bg-[#101116] border border-zinc-800/50 rounded-xl">
                  <Calendar size={48} className="mx-auto text-zinc-800 mb-4" />
                  <p className="text-zinc-500 text-[11px] uppercase tracking-widest">No schedules found for this server.</p>
                </div>
              </motion.div>
            )}

            {view === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-4 sm:p-8 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Users</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Manage sub-user access</p>
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-colors">
                    New User
                  </button>
                </div>
                <div className="bg-[#101116] border border-zinc-800/50 rounded-xl overflow-hidden">
                  <div className="p-4 sm:p-6 flex items-center justify-between border-b border-zinc-800/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 font-bold text-xs sm:text-base">M</div>
                      <div className="min-w-0">
                        <div className="text-[10px] sm:text-[11px] font-bold text-white truncate">mlbbsaya10@gmail.com</div>
                        <div className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest">Owner</div>
                      </div>
                    </div>
                    <div className="px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20 shrink-0">
                      Full Access
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'startup' && (
              <motion.div 
                key="startup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1b1d23] border border-zinc-800/50 rounded-xl p-4 sm:p-8 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Startup Configuration</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Manage server startup variables</p>
                  </div>
                  <button 
                    onClick={saveConfig}
                    disabled={isSavingConfig}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSavingConfig ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-6">
                    <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Startup Command</h3>
                      <input 
                        type="text" 
                        value={config.startupCommand}
                        onChange={(e) => setConfig({ ...config, startupCommand: e.target.value })}
                        className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-[10px] sm:text-[11px] text-blue-400 outline-none focus:border-blue-500/50 transition-all"
                      />
                      <p className="text-[9px] text-zinc-600 mt-2 italic">This command is executed when the server starts.</p>
                    </div>
                    
                    <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Docker Image</h3>
                      <div className="space-y-3">
                        <select 
                          value={config.dockerImage}
                          onChange={(e) => setConfig({ ...config, dockerImage: e.target.value })}
                          className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-[10px] sm:text-[11px] text-zinc-300 outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                        >
                          <optgroup label="Runtime Environments">
                            {DOCKER_IMAGES.filter(img => img.category === 'runtime').map(img => (
                              <option key={img.id} value={img.name}>{img.displayName}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Game Servers">
                            {DOCKER_IMAGES.filter(img => img.category === 'game-server').map(img => (
                              <option key={img.id} value={img.name}>{img.displayName}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Databases">
                            {DOCKER_IMAGES.filter(img => img.category === 'database').map(img => (
                              <option key={img.id} value={img.name}>{img.displayName}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Utilities">
                            {DOCKER_IMAGES.filter(img => img.category === 'utility').map(img => (
                              <option key={img.id} value={img.name}>{img.displayName}</option>
                            ))}
                          </optgroup>
                        </select>
                        <div className="text-[9px] text-zinc-600 italic bg-zinc-900/50 border border-zinc-800/30 rounded px-3 py-2">
                          <p>
                            {DOCKER_IMAGES.find(img => img.name === config.dockerImage)?.description || 'Select a Docker image to see details'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Environment Variables</h3>
                      <button 
                        onClick={() => setConfig({ ...config, envVars: [...config.envVars, { key: '', value: '' }] })}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors text-blue-500"
                        title="Add Variable"
                      >
                        <FilePlus size={14} />
                      </button>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {config.envVars.map((env: any, idx: number) => (
                        <div key={idx} className="space-y-2 p-3 bg-black/20 rounded-lg border border-zinc-800/50 relative group">
                          <button 
                            onClick={() => {
                              const newEnv = [...config.envVars];
                              newEnv.splice(idx, 1);
                              setConfig({ ...config, envVars: newEnv });
                            }}
                            className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={12} />
                          </button>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Key</label>
                            <input 
                              type="text" 
                              value={env.key}
                              onChange={(e) => {
                                const newEnv = [...config.envVars];
                                newEnv[idx].key = e.target.value;
                                setConfig({ ...config, envVars: newEnv });
                              }}
                              placeholder="e.g. SERVER_PORT"
                              className="w-full bg-black/40 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-300 outline-none focus:border-blue-500/50" 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Value</label>
                            <input 
                              type="text" 
                              value={env.value}
                              onChange={(e) => {
                                const newEnv = [...config.envVars];
                                newEnv[idx].value = e.target.value;
                                setConfig({ ...config, envVars: newEnv });
                              }}
                              placeholder="e.g. 3000"
                              className="w-full bg-black/40 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-300 outline-none focus:border-blue-500/50" 
                            />
                          </div>
                        </div>
                      ))}
                      {config.envVars.length === 0 && (
                        <div className="text-center py-10 text-zinc-600">
                          <p className="text-[10px] uppercase tracking-widest">No environment variables defined.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Auto-Execution Controls */}
                  <div className="space-y-6">
                    <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Auto-Execution</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-zinc-800/50">
                          <div>
                            <p className="text-[10px] font-medium text-white">Auto-Execute Startup Command</p>
                            <p className="text-[9px] text-zinc-600 mt-1">Automatically run startup command when server starts</p>
                          </div>
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={config.autoStartCommand}
                              onChange={(e) => setConfig({ ...config, autoStartCommand: e.target.checked })}
                              className="w-4 h-4 rounded accent-blue-500"
                            />
                          </label>
                        </div>
                        
                        {config.autoStartCommand && (
                          <button
                            onClick={executeStartupCommand}
                            disabled={isExecutingStartup}
                            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            {isExecutingStartup ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                Executing...
                              </>
                            ) : (
                              <>
                                <Play size={14} />
                                Test Execute Now
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Execution Log */}
                    {startupExecutionLog.length > 0 && (
                      <div className="bg-[#101116] border border-zinc-800/50 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Execution Log</h3>
                          <button
                            onClick={() => setStartupExecutionLog([])}
                            className="text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="bg-black/40 border border-zinc-800/50 rounded-lg p-3 font-mono text-[9px] text-zinc-400 max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                          {startupExecutionLog.map((log, idx) => (
                            <div key={idx} className="text-zinc-500">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="h-10 bg-[#101116] border-t border-zinc-800/50 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center space-x-6 text-[9px] text-zinc-600 uppercase tracking-[0.3em]">
            <span>© 2026 OJICMNTY INFRASTRUCTURE</span>
            <span className="hidden md:inline">NODE: {stats.server}</span>
          </div>
          <div className="flex items-center space-x-4 text-[9px] text-zinc-600 uppercase tracking-[0.3em]">
            <span className="flex items-center gap-1"><Monitor size={10} /> {stats.os}</span>
          </div>
        </footer>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#101116] border-t border-zinc-800/50 flex items-center justify-around px-2 z-50 backdrop-blur-md">
          <button 
            onClick={() => setView('console')}
            className={`flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-lg transition-all ${
              view === 'console' ? 'text-blue-500 bg-blue-500/5' : 'text-zinc-500'
            }`}
          >
            <TerminalIcon size={18} />
            <span className="text-[7px] uppercase tracking-widest font-bold">Console</span>
          </button>
          <button 
            onClick={() => setView('files')}
            className={`flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-lg transition-all ${
              view === 'files' ? 'text-blue-500 bg-blue-500/5' : 'text-zinc-500'
            }`}
          >
            <Folder size={18} />
            <span className="text-[7px] uppercase tracking-widest font-bold">Files</span>
          </button>
          <button 
            onClick={() => setView('databases')}
            className={`flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-lg transition-all ${
              view === 'databases' ? 'text-blue-500 bg-blue-500/5' : 'text-zinc-500'
            }`}
          >
            <Database size={18} />
            <span className="text-[7px] uppercase tracking-widest font-bold">DBs</span>
          </button>
          <button 
            onClick={() => setView('audit')}
            className={`flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-lg transition-all ${
              view === 'audit' ? 'text-blue-500 bg-blue-500/5' : 'text-zinc-500'
            }`}
          >
            <Clock size={18} />
            <span className="text-[7px] uppercase tracking-widest font-bold">Audit</span>
          </button>
          <button 
            onClick={() => setView('startup')}
            className={`flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-lg transition-all ${
              view === 'startup' ? 'text-blue-500 bg-blue-500/5' : 'text-zinc-500'
            }`}
          >
            <Rocket size={18} />
            <span className="text-[7px] uppercase tracking-widest font-bold">Startup</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-lg text-zinc-500"
          >
            <Settings size={18} />
            <span className="text-[7px] uppercase tracking-widest font-bold">Settings</span>
          </button>
        </nav>
      </div>

      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        commands={commands} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
}
