import React from 'react';
import { 
  Terminal as TerminalIcon, Clock, Folder, Database, Calendar, Users, 
  Rocket, Settings, ExternalLink, Server
} from 'lucide-react';

interface SidebarProps {
  view: 'console' | 'files' | 'databases' | 'schedules' | 'users' | 'startup' | 'audit';
  setView: (view: 'console' | 'files' | 'databases' | 'schedules' | 'users' | 'startup' | 'audit') => void;
  onSettingsClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, onSettingsClick }) => {
  const navItems = [
    { id: 'console', label: 'Console', icon: TerminalIcon },
    { id: 'audit', label: 'Audit Logs', icon: Clock },
    { id: 'files', label: 'File Manager', icon: Folder },
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'startup', label: 'Startup', icon: Rocket },
  ] as const;

  return (
    <aside className="hidden lg:flex w-20 bg-[#101116] border-r border-zinc-800/50 flex-col items-center py-6 shrink-0 z-50">
      {/* Logo */}
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-10">
        <Server size={24} className="text-white" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col space-y-4">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = view === item.id;
          
          return (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'sidebar-active' 
                  : 'sidebar-inactive'
              }`}
            >
              <Icon size={20} />
              <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col space-y-4">
        <button 
          onClick={onSettingsClick}
          className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all duration-200 group relative"
        >
          <Settings size={20} />
          <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-medium">
            Settings
          </span>
        </button>
        <button className="p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 group relative">
          <ExternalLink size={20} />
          <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-medium">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};
