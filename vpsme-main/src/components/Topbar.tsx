import React from 'react';
import { 
  Server, Copy, ChevronRight, Play, Stop, RotateCcw, RefreshCw
} from 'lucide-react';

interface TopbarProps {
  publicIP: string;
  serverStatus: 'running' | 'starting' | 'stopping' | 'offline';
  view: 'console' | 'files' | 'databases' | 'schedules' | 'users' | 'startup' | 'audit';
  uptime: number;
  onServerAction: (action: 'start' | 'stop' | 'restart') => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  publicIP, 
  serverStatus, 
  view, 
  uptime, 
  onServerAction 
}) => {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'running':
        return 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'offline':
        return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      case 'starting':
      case 'stopping':
        return 'bg-yellow-500 animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'running':
        return 'Server Online';
      case 'offline':
        return 'Server Offline';
      case 'starting':
        return 'Server Starting...';
      case 'stopping':
        return 'Server Stopping...';
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-[#101116] border-b border-zinc-800/50 flex items-center justify-between px-4 sm:px-10 shrink-0 z-40">
      {/* Left Section - Server Name and Status */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        {/* Mobile Logo */}
        <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 flex-shrink-0">
          <Server size={16} className="text-white" />
        </div>

        {/* Server Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider flex-shrink-0">
              OJICMNTY
            </h1>
            <div className="h-3 w-px bg-zinc-800" />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(publicIP);
              }}
              className="flex items-center space-x-2 px-2 py-0.5 bg-zinc-800/50 hover:bg-zinc-800 rounded text-[9px] font-mono text-zinc-400 hover:text-white transition-all group flex-shrink-0"
            >
              <span>{publicIP}</span>
              <Copy size={10} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor()}`} />
            <span className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest font-bold whitespace-nowrap">
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="h-5 w-px bg-zinc-800 mx-1 sm:mx-2 hidden sm:block flex-shrink-0" />
        <div className="hidden sm:flex items-center space-x-2 text-[10px] sm:text-[11px] text-zinc-400 font-mono min-w-0">
          <span className="hover:text-white cursor-pointer transition-colors flex-shrink-0">Server</span>
          <ChevronRight size={10} className="text-zinc-600 flex-shrink-0" />
          <span className="text-white capitalize truncate">{view}</span>
        </div>
      </div>

      {/* Right Section - Stats and Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Stats (Hidden on small screens) */}
        <div className="hidden xl:flex items-center space-x-6 mr-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Public IP</span>
            <span className="text-[10px] font-mono text-zinc-300">{publicIP}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Uptime</span>
            <span className="text-[10px] font-mono text-zinc-300">{formatUptime(uptime)}</span>
          </div>
        </div>

        {/* Server Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            onClick={() => onServerAction('start')}
            disabled={serverStatus === 'running' || serverStatus === 'starting'}
            className="p-2 sm:p-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-emerald-600/20 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Start Server"
          >
            <Play size={16} />
          </button>
          <button 
            onClick={() => onServerAction('stop')}
            disabled={serverStatus === 'offline' || serverStatus === 'stopping'}
            className="p-2 sm:p-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-red-600/20 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Stop Server"
          >
            <Stop size={16} />
          </button>
          <button 
            onClick={() => onServerAction('restart')}
            disabled={serverStatus === 'offline' || serverStatus === 'starting' || serverStatus === 'stopping'}
            className="p-2 sm:p-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-blue-600/20 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Restart Server"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className="p-2 sm:p-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 transition-all"
            title="Refresh Status"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
