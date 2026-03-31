import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal as TerminalIcon, TrendingUp, BarChart3 } from 'lucide-react';

interface ConsoleViewProps {
  serverStatus: 'running' | 'starting' | 'stopping' | 'offline';
  stats: {
    cpu: { model: string; usage: number };
    mem: { used: number; free: number; total: number; usage: number };
    disk: { total: string; used: string; free: string; usage: number; io: string };
    uptime: number;
  };
  statsHistory: any[];
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({ serverStatus, stats, statsHistory }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <TerminalIcon size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Console</h1>
            <p className="text-sm text-zinc-400">Server terminal and system monitor</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Stat */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">CPU Usage</p>
              <p className="text-2xl font-bold text-white mt-2">{Math.round(stats.cpu.usage)}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Memory Stat */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Memory</p>
              <p className="text-2xl font-bold text-white mt-2">{Math.round(stats.mem.usage)}%</p>
              <p className="text-xs text-zinc-400 mt-1">{Math.round(stats.mem.used / 1024 / 1024)}MB / {Math.round(stats.mem.total / 1024 / 1024)}MB</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center">
              <BarChart3 size={24} className="text-cyan-400" />
            </div>
          </div>
        </motion.div>

        {/* Disk Stat */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Disk</p>
              <p className="text-2xl font-bold text-white mt-2">{Math.round(stats.disk.usage)}%</p>
              <p className="text-xs text-zinc-400 mt-1">{stats.disk.used} / {stats.disk.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <BarChart3 size={24} className="text-emerald-400" />
            </div>
          </div>
        </motion.div>

        {/* Server Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-lg p-4"
        >
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Status</p>
            <div className="flex items-center space-x-2 mt-3">
              <div className={`w-3 h-3 rounded-full ${
                serverStatus === 'running' ? 'bg-emerald-500 animate-pulse' :
                serverStatus === 'offline' ? 'bg-red-500' :
                'bg-yellow-500 animate-bounce'
              }`} />
              <span className="text-sm font-medium text-white capitalize">{serverStatus}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Terminal Placeholder */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-lg p-6 h-96"
      >
        <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-zinc-800/50">
          <TerminalIcon size={18} className="text-blue-400" />
          <h2 className="font-semibold text-white">Terminal Output</h2>
        </div>
        <div className="font-mono text-sm text-zinc-400 space-y-1 overflow-y-auto h-full">
          <p>$ Terminal content will be rendered here</p>
          <p className="text-zinc-600">Waiting for server connection...</p>
        </div>
      </motion.div>

      {/* Performance Chart Placeholder */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-lg p-6 h-80"
      >
        <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-zinc-800/50">
          <BarChart3 size={18} className="text-emerald-400" />
          <h2 className="font-semibold text-white">Performance Chart</h2>
        </div>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          <p>Performance graph will be displayed here</p>
        </div>
      </motion.div>
    </div>
  );
};
