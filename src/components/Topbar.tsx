import React from 'react';
import { Server, Copy, ChevronRight, Power, RefreshCw, Square } from 'lucide-react';

interface TopbarProps {
  publicIP: string;
  serverStatus: string;
  view: string;
  uptime: number;
  onServerAction: (action: string) => void;
  dockerImage?: string;
  startupCommand?: string;
  autoStartCommand?: boolean;
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export const Topbar: React.FC<TopbarProps> = ({
  publicIP,
  serverStatus,
  view,
  uptime,
  onServerAction,
  dockerImage = 'node:lts',
  startupCommand = 'npm start',
  autoStartCommand = true,
}) => {
  return (
    <header className="h-14 sm:h-16 bg-[#101116] border-b border-zinc-800/50 flex items-center justify-between px-4 sm:px-10 shrink-0 z-40">
      {/* Left Section */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Server size={16} className="text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <h1 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
              Server Panel
            </h1>
            <div className="h-3 w-px bg-zinc-800" />
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicIP);
                alert('IP copied to clipboard!');
              }}
              className="flex items-center space-x-2 px-2 py-0.5 bg-zinc-800/50 hover:bg-zinc-800 rounded text-[9px] font-mono text-zinc-400 hover:text-white transition-all group"
            >
              <span>{publicIP}</span>
              <Copy size={10} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
          <div className="flex items-center space-x-1.5 mt-1">
            <div
              className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${
                serverStatus === 'running'
                  ? 'status-online animate-pulse'
                  : serverStatus === 'offline'
                  ? 'status-offline'
                  : 'status-starting'
              }`}
            />
            <span className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              {serverStatus === 'running'
                ? 'Server Online'
                : serverStatus === 'offline'
                ? 'Server Offline'
                : serverStatus === 'starting'
                ? 'Server Starting...'
                : 'Server Stopping...'}
            </span>
          </div>
        </div>
        <div className="h-5 w-px bg-zinc-800 mx-1 sm:mx-2 hidden sm:block" />
        <div className="hidden sm:flex items-center space-x-2 text-[10px] sm:text-[11px] text-zinc-400 font-mono">
          <span className="hover:text-white cursor-pointer transition-colors">Server</span>
          <ChevronRight size={10} className="text-zinc-600" />
          <span className="text-white capitalize">{view}</span>
        </div>
        
        {/* Docker & Startup Info */}
        {view === 'startup' && (
          <>
            <div className="h-5 w-px bg-zinc-800 mx-1 sm:mx-2 hidden lg:block" />
            <div className="hidden lg:flex items-center space-x-4 text-[9px]">
              <div className="flex flex-col items-start">
                <span className="text-zinc-600 uppercase tracking-widest">Docker</span>
                <span className="text-blue-400 font-mono">{dockerImage?.split('/').pop()?.split(':')[0] || 'unknown'}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-zinc-600 uppercase tracking-widest">Startup</span>
                <span className={`font-mono ${autoStartCommand ? 'text-emerald-400' : 'text-yellow-600'}`}>
                  {autoStartCommand ? 'Auto' : 'Manual'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Stats - Hidden on small screens */}
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

        {/* Server Control Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onServerAction('start')}
            disabled={serverStatus !== 'offline'}
            className={`p-1.5 sm:p-2 border rounded-lg transition-all ${
              serverStatus === 'offline'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-zinc-800/50 text-zinc-600 border-zinc-700 cursor-not-allowed'
            }`}
            title="Start"
          >
            <Power size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onServerAction('restart')}
            disabled={serverStatus !== 'running'}
            className={`p-1.5 sm:p-2 border rounded-lg transition-all ${
              serverStatus === 'running'
                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
                : 'bg-zinc-800/50 text-zinc-600 border-zinc-700 cursor-not-allowed'
            }`}
            title="Restart"
          >
            <RefreshCw size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onServerAction('stop')}
            disabled={serverStatus !== 'running'}
            className={`p-1.5 sm:p-2 border rounded-lg transition-all ${
              serverStatus === 'running'
                ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                : 'bg-zinc-800/50 text-zinc-600 border-zinc-700 cursor-not-allowed'
            }`}
            title="Stop"
          >
            <Square size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
