import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'emerald' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const iconBgClasses = {
  blue: 'bg-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  orange: 'bg-orange-500/20 text-orange-400',
  red: 'bg-red-500/20 text-red-400',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  percentage,
  trend,
  color = 'blue',
}) => {
  return (
    <div className={`card-dark p-6 border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {value}
            </h3>
            {unit && <span className="text-sm text-zinc-400">{unit}</span>}
          </div>
          {percentage !== undefined && (
            <p className="text-xs text-zinc-400 mt-2">
              {percentage.toFixed(1)}% of capacity
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      
      {percentage !== undefined && (
        <div className="mt-4 w-full bg-zinc-800/30 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              color === 'blue' ? 'bg-blue-500' :
              color === 'emerald' ? 'bg-emerald-500' :
              color === 'orange' ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      {trend && (
        <div className={`mt-3 text-xs font-medium ${
          trend === 'up' ? 'text-red-400' :
          trend === 'down' ? 'text-emerald-400' :
          'text-zinc-400'
        }`}>
          {trend === 'up' ? '↑ Increasing' :
           trend === 'down' ? '↓ Decreasing' :
           '→ Stable'}
        </div>
      )}
    </div>
  );
};
