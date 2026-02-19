
import React from 'react';
import { Location } from '../types';
import AnalogClock from './AnalogClock';

interface CityClockGridProps {
  locations: Location[];
  selectedDate: Date;
}

const CityClockGrid: React.FC<CityClockGridProps> = ({ locations, selectedDate }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-baseline justify-between border-b border-theme-main pb-4">
        <h2 className="text-xl font-bold text-theme-base flex items-center gap-2">
          My Cities (Personal World Clock)
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {locations.map((loc) => {
          const localDate = new Date(selectedDate.toLocaleString('en-US', { timeZone: loc.timezone }));
          
          // Get digital format matching the request: AM/PM and specific layout
          const digitalTime = localDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Using 24h as per screenshot Fri 20:20:34
          });

          const dayLabel = localDate.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={loc.id} className="flex flex-col items-center group">
              <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300">
                <AnalogClock date={localDate} size={110} theme="auto" />
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  {/* Placeholder for flag/icon - could use an API but sticking to clean text/emoji for speed/reliability */}
                  <span className="text-lg">📍</span>
                  <span className="font-black text-theme-base tracking-tight truncate max-w-[120px]">
                    {loc.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-theme-muted font-bold mono text-xs tracking-tight">
                  {loc.id === 'local' && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>}
                  <span>{dayLabel}</span>
                  <span>{digitalTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CityClockGrid;
