import React from 'react';
import { motion } from 'motion/react';
import { Database, Plus, Trash2, Copy, Key } from 'lucide-react';

export const DatabasesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Database size={24} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Databases</h1>
              <p className="text-sm text-zinc-400">Manage server databases</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium">
            <Plus size={16} />
            <span>New Database</span>
          </button>
        </div>
      </div>

      {/* Database Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { name: 'minecraft_world', user: 'mc_user', host: 'localhost:3306', size: '245MB' },
          { name: 'game_data', user: 'game_admin', host: 'localhost:3306', size: '156MB' },
          { name: 'stats_db', user: 'stats_user', host: 'localhost:3306', size: '89MB' },
          { name: 'backup_db', user: 'backup_user', host: 'localhost:3306', size: '512MB' },
        ].map((db, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Database size={18} className="text-purple-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{db.name}</h3>
                  <p className="text-xs text-zinc-400 truncate">{db.host}</p>
                </div>
              </div>
              <button className="text-zinc-500 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-zinc-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Username</span>
                <div className="flex items-center space-x-2 font-mono text-xs text-white">
                  <span>{db.user}</span>
                  <button className="text-zinc-500 hover:text-blue-400">
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Database Size</span>
                <span className="text-white font-medium">{db.size}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 bg-zinc-800/50 text-zinc-300 rounded hover:bg-zinc-800 transition-colors text-sm font-medium flex items-center justify-center space-x-1">
                <Key size={14} />
                <span>Password</span>
              </button>
              <button className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium">
                Manage
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
