import React from 'react';
import { motion } from 'motion/react';
import { Folder, File, Upload, RefreshCw, ChevronRight, Home } from 'lucide-react';

export const FilesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-orange-600/20 rounded-lg">
            <Folder size={24} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">File Manager</h1>
            <p className="text-sm text-zinc-400">Manage server files and directories</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg p-4 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2 text-sm text-zinc-400 font-mono">
          <Home size={16} className="text-zinc-500" />
          <ChevronRight size={14} className="text-zinc-600" />
          <span>home</span>
          <ChevronRight size={14} className="text-zinc-600" />
          <span className="text-white">server</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center space-x-2">
            <Upload size={16} />
            <span className="text-sm">Upload</span>
          </button>
          <button className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* File List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-lg overflow-hidden"
      >
        <div className="border-b border-zinc-800/50 px-6 py-3 bg-zinc-900/50 flex items-center space-x-4 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          <div className="flex-1">Name</div>
          <div className="w-24">Size</div>
          <div className="w-32">Modified</div>
          <div className="w-20">Actions</div>
        </div>
        
        <div className="divide-y divide-zinc-800/50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center space-x-4 hover:bg-zinc-800/20 transition-colors cursor-pointer group">
              {i % 2 === 0 ? (
                <>
                  <Folder size={18} className="text-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">folder_{i}</p>
                  </div>
                </>
              ) : (
                <>
                  <File size={18} className="text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">file_{i}.txt</p>
                  </div>
                </>
              )}
              <div className="w-24 text-sm text-zinc-400">
                {i % 2 === 0 ? '-' : `${i * 10}KB`}
              </div>
              <div className="w-32 text-sm text-zinc-400">
                Today at {10 + i}:00 AM
              </div>
              <div className="w-20 flex items-center space-x-2">
                <button className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-white transition-all">
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
