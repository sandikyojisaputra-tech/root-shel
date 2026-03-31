import React from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Trash2, Edit2, Lock, Shield } from 'lucide-react';

export const UsersView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600/20 rounded-lg">
              <Users size={24} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sub-Users</h1>
              <p className="text-sm text-zinc-400">Manage server access permissions</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium">
            <Plus size={16} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { username: 'player_1', email: 'player1@example.com', role: 'Admin', created: '2024-01-15' },
          { username: 'moderator_john', email: 'john@example.com', role: 'Moderator', created: '2024-02-20' },
          { username: 'helper_bot', email: 'bot@example.com', role: 'Helper', created: '2024-03-10' },
          { username: 'viewer_only', email: 'viewer@example.com', role: 'Viewer', created: '2024-03-25' },
        ].map((user, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{user.username}</h3>
                <p className="text-sm text-zinc-400">{user.email}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.role === 'Admin' ? 'bg-red-600/20 text-red-400' :
                  user.role === 'Moderator' ? 'bg-orange-600/20 text-orange-400' :
                  user.role === 'Helper' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-zinc-800/50 text-zinc-400'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="mb-4 pb-4 border-b border-zinc-800/50 text-sm">
              <p className="text-zinc-400">
                Created <span className="text-white">{user.created}</span>
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <button className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium flex items-center justify-center space-x-2">
                <Shield size={14} />
                <span>Edit Permissions</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 bg-zinc-800/50 text-zinc-300 rounded hover:bg-zinc-800 transition-colors text-sm font-medium flex items-center justify-center space-x-1">
                <Lock size={14} />
                <span>Reset Password</span>
              </button>
              <button className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
