import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error?: string | null;
  lastUpdate?: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
  lastUpdate
}) => {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Wifi size={14} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-medium">Connected</span>
        </>
      ) : error ? (
        <>
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-[10px] text-red-500 font-medium">Error</span>
        </>
      ) : (
        <>
          <WifiOff size={14} className="text-yellow-500" />
          <span className="text-[10px] text-yellow-500 font-medium">Connecting...</span>
        </>
      )}
      {lastUpdate && (
        <span className="text-[9px] text-zinc-600 ml-2">
          {Math.round((Date.now() - lastUpdate) / 1000)}s ago
        </span>
      )}
    </div>
  );
};
