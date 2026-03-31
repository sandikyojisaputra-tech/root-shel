import React from 'react';
import { motion } from 'motion/react';
import { Clock, AlertCircle, CheckCircle, Info, ChevronRight } from 'lucide-react';

export const AuditView: React.FC = () => {
  const auditLogs = [
    { timestamp: 'Today 3:45 PM', action: 'Server Started', type: 'success', user: 'admin', details: 'Server started manually' },
    { timestamp: 'Today 2:30 PM', action: 'Configuration Updated', type: 'info', user: 'admin', details: 'Updated startup command' },
    { timestamp: 'Today 1:15 PM', action: 'File Upload', type: 'info', user: 'player_1', details: 'Uploaded server.jar' },
    { timestamp: 'Today 12:00 PM', action: 'Backup Created', type: 'success', user: 'system', details: 'Automatic daily backup' },
    { timestamp: 'Yesterday 11:45 PM', action: 'Server Stopped', type: 'warning', user: 'admin', details: 'Server stopped for maintenance' },
    { timestamp: 'Yesterday 9:30 PM', action: 'User Added', type: 'info', user: 'admin', details: 'Added new sub-user: moderator_john' },
    { timestamp: 'Yesterday 8:00 PM', action: 'Power Action', type: 'warning', user: 'moderator_john', details: 'Server restarted' },
    { timestamp: 'Yesterday 2:15 PM', action: 'Database Backup', type: 'success', user: 'system', details: 'Database backup completed' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-emerald-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <Info size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <Clock size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
            <p className="text-sm text-zinc-400">View server activity and user actions</p>
          </div>
        </div>
      </div>

      {/* Filter/Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg p-4 flex items-center space-x-4"
      >
        <input 
          type="text" 
          placeholder="Search logs..."
          className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-600 transition-colors"
        />
        <select className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors">
          <option>All Types</option>
          <option>Success</option>
          <option>Warning</option>
          <option>Error</option>
          <option>Info</option>
        </select>
      </motion.div>

      {/* Logs List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        {auditLogs.map((log, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-lg p-4 w-full hover:bg-zinc-800/50 transition-colors text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-semibold text-white">{log.action}</h4>
                    <span className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded">
                      {log.user}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{log.details}</p>
                  <p className="text-xs text-zinc-600 mt-1">{log.timestamp}</p>
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-1"
              />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Load More */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <button className="px-6 py-2 bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors font-medium">
          Load More Logs
        </button>
      </motion.div>
    </div>
  );
};
