import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Plus, X, Save, AlertCircle } from 'lucide-react';

interface StartupViewProps {
  config?: {
    startupCommand: string;
    dockerImage: string;
    envVars: Array<{ key: string; value: string }>;
  };
  onSaveConfig?: (config: any) => void;
}

export const StartupView: React.FC<StartupViewProps> = ({ 
  config = {
    startupCommand: 'npm start',
    dockerImage: 'ghcr.io/pterodactyl/yolks:node_20',
    envVars: []
  },
  onSaveConfig
}) => {
  const [localConfig, setLocalConfig] = useState(config);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-pink-600/20 rounded-lg">
            <Rocket size={24} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Startup Settings</h1>
            <p className="text-sm text-zinc-400">Configure server startup command and environment</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg p-4 flex items-start space-x-3 border-l-4 border-yellow-600"
      >
        <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-white mb-1">Modification Warning</h3>
          <p className="text-sm text-zinc-400">
            Incorrect startup configuration may prevent your server from starting. Please ensure you understand the implications of your changes before saving.
          </p>
        </div>
      </motion.div>

      {/* Startup Command */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-lg p-6"
      >
        <h3 className="font-semibold text-white mb-4">Startup Command</h3>
        <input 
          type="text" 
          value={localConfig.startupCommand}
          onChange={(e) => setLocalConfig({ ...localConfig, startupCommand: e.target.value })}
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-600 transition-colors"
          placeholder="Enter startup command..."
        />
        <p className="text-xs text-zinc-400 mt-2">The command executed when the server starts</p>
      </motion.div>

      {/* Docker Image */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-lg p-6"
      >
        <h3 className="font-semibold text-white mb-4">Docker Image</h3>
        <input 
          type="text" 
          value={localConfig.dockerImage}
          onChange={(e) => setLocalConfig({ ...localConfig, dockerImage: e.target.value })}
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-600 transition-colors"
          placeholder="Enter Docker image..."
        />
        <p className="text-xs text-zinc-400 mt-2">The Docker image used to run your server</p>
      </motion.div>

      {/* Environment Variables */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Environment Variables</h3>
          <button className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium flex items-center space-x-1">
            <Plus size={14} />
            <span>Add Variable</span>
          </button>
        </div>

        <div className="space-y-2">
          {localConfig.envVars && localConfig.envVars.length > 0 ? (
            localConfig.envVars.map((envVar, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={envVar.key}
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                  placeholder="KEY"
                />
                <span className="text-zinc-600">=</span>
                <input 
                  type="text" 
                  value={envVar.value}
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                  placeholder="value"
                />
                <button className="p-2 text-zinc-400 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 py-4">No environment variables configured</p>
          )}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-end space-x-4"
      >
        <button className="px-6 py-2 text-zinc-400 hover:text-white transition-colors font-medium">
          Cancel
        </button>
        <button 
          onClick={() => onSaveConfig?.(localConfig)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save Configuration</span>
        </button>
      </motion.div>
    </div>
  );
};
