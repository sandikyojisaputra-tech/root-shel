import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, Clock, Play, Pause, Trash2, Edit2 } from 'lucide-react';

export const SchedulesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-600/20 rounded-lg">
              <Calendar size={24} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Schedules</h1>
              <p className="text-sm text-zinc-400">Manage automated server tasks</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium">
            <Plus size={16} />
            <span>New Schedule</span>
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg overflow-hidden"
      >
        <div className="border-b border-zinc-800/50 px-6 py-3 bg-zinc-900/50 grid grid-cols-12 gap-4 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Interval</div>
          <div className="col-span-3">Command</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Actions</div>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {[
            { name: 'Server Backup', interval: 'Daily 2:00 AM', command: 'backup -full', enabled: true },
            { name: 'Restart Server', interval: 'Daily 6:00 AM', command: 'restart', enabled: true },
            { name: 'Cleanup Logs', interval: 'Weekly Mon 3:00 AM', command: 'rm -rf logs/*', enabled: false },
            { name: 'Database Optimize', interval: 'Monthly 1st 2:00 AM', command: 'optimize-db', enabled: true },
          ].map((schedule, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 hover:bg-zinc-800/20 transition-colors items-center">
              <div className="col-span-3">
                <p className="font-medium text-white truncate">{schedule.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-zinc-400 truncate">{schedule.interval}</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-zinc-400 font-mono truncate">{schedule.command}</p>
              </div>
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${schedule.enabled ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                  <span className="text-sm text-zinc-400">{schedule.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors">
                  <Edit2 size={14} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Schedule Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-lg p-6"
      >
        <div className="flex items-start space-x-3">
          <Clock size={18} className="text-cyan-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-2">About Schedules</h3>
            <p className="text-sm text-zinc-400">
              Schedules allow you to automate server tasks at specific times. Commands are executed on the server using the shell environment configured in Startup settings.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
