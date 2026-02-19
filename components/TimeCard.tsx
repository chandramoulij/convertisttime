
import React from 'react';
import { Location } from '../types';
import AnalogClock from './AnalogClock';

interface TimeCardProps {
  location: Location;
  selectedDate: Date;
  onRemove: (id: string) => void;
  isBase?: boolean;
}

const TimeCard: React.FC<TimeCardProps> = ({ location, selectedDate, onRemove, isBase }) => {
  const localDate = new Date(selectedDate.toLocaleString('en-US', { timeZone: location.timezone }));
  
  const formattedTime = localDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const formattedDate = localDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`group flex items-center p-4 rounded-xl transition-all duration-300 border theme-transition ${
      isBase 
        ? 'bg-blue-600/10 border-blue-500/50' 
        : 'bg-theme-surface border-theme-main hover:border-blue-500/50'
    }`}>
      <div className="flex-shrink-0 mr-4">
        <AnalogClock date={localDate} size={60} />
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg truncate text-theme-base">{location.name}</h3>
          {isBase && <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-blue-600 rounded text-white shadow-lg">Local</span>}
        </div>
        <p className="text-sm text-theme-muted font-medium">{location.timezone}</p>
      </div>

      <div className="flex flex-col items-end flex-shrink-0 ml-4">
        <div className="text-2xl font-bold mono text-blue-500">{formattedTime}</div>
        <div className="text-sm text-theme-muted mono">{formattedDate}</div>
      </div>

      {!isBase && (
        <button
          onClick={() => onRemove(location.id)}
          className="ml-6 p-2 opacity-0 group-hover:opacity-100 text-theme-muted hover:text-red-500 transition-all"
          title="Remove city"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TimeCard;
