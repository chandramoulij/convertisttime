
import React, { useRef, useState, useEffect } from 'react';
import { Location } from '../types';

interface TimelineProps {
  offsetMinutes: number;
  setOffsetMinutes: (offset: number) => void;
  locations: Location[];
  baseTime: Date;
}

const Timeline: React.FC<TimelineProps> = ({ offsetMinutes, setOffsetMinutes, locations, baseTime }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startOffset, setStartOffset] = useState(0);

  // 7 days in minutes = 10080
  const MAX_OFFSET = 10080;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartOffset(offsetMinutes);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      // Sensitivity: 1px = 5 minutes of offset for the larger range
      const newOffset = startOffset + Math.round(dx / 1.5);
      setOffsetMinutes(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, newOffset)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startOffset, setOffsetMinutes]);

  const getSelectedDate = () => {
    const date = new Date(baseTime);
    date.setMinutes(date.getMinutes() + offsetMinutes);
    return date;
  };

  const currentScrubDate = getSelectedDate();
  const daysOffset = Math.round(offsetMinutes / 1440);

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-theme-surface border-t border-theme-main py-4 px-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-400`}
    >
      <div className="max-w-7xl mx-auto">
        {/* City Times Bar */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 mb-2">
          {locations.map((loc) => {
            const locTime = new Date(currentScrubDate.toLocaleString('en-US', { timeZone: loc.timezone }));
            return (
              <div 
                key={loc.id} 
                className="flex-shrink-0 bg-theme-card/50 border border-theme-main rounded-xl px-4 py-2 flex items-center gap-3 transition-colors hover:border-blue-500/30 group"
              >
                <div className="text-left">
                  <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest leading-none mb-1 group-hover:text-blue-500 transition-colors">
                    {loc.name}
                  </div>
                  <div className="text-sm font-bold text-theme-base mono tabular-nums flex items-baseline gap-1">
                    {locTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).split(' ')[0]}
                    <span className="text-[9px] uppercase font-bold text-blue-500 opacity-80">
                      {locTime.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mb-3 select-none">
          <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted">Multi-Day Scrubber</h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black mono ${offsetMinutes !== 0 ? 'bg-blue-600 text-white' : 'bg-theme-card text-theme-muted'}`}>
                {daysOffset !== 0 ? `${daysOffset > 0 ? '+' : ''}${daysOffset}d ` : ''}
                {Math.floor((Math.abs(offsetMinutes) % 1440) / 60)}h {Math.abs(offsetMinutes % 60)}m
              </span>
              <span className="text-[9px] font-bold text-theme-muted uppercase tracking-wider">
                {currentScrubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setOffsetMinutes(0)}
            className="text-[10px] font-black text-theme-muted hover:text-blue-500 transition-colors uppercase tracking-[0.2em]"
          >
            BACK TO PRESENT
          </button>
        </div>

        {/* Draggable Surface */}
        <div 
          onMouseDown={handleMouseDown}
          className={`relative h-16 rounded-2xl flex items-center px-4 cursor-ew-resize overflow-hidden border transition-all duration-300 ${
            isDragging ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10' : 'border-theme-main bg-theme-base/40'
          }`}
        >
          {/* Day Markers in Background */}
          <div className="absolute inset-0 flex justify-between px-10 pointer-events-none opacity-10">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="w-px h-full bg-theme-base border-r border-theme-muted/20" />
            ))}
          </div>

          <div className="w-full relative h-1 bg-theme-card rounded-full overflow-hidden">
            <input
              type="range"
              min={-MAX_OFFSET}
              max={MAX_OFFSET}
              step={1}
              value={offsetMinutes}
              onChange={(e) => setOffsetMinutes(parseInt(e.target.value))}
              onMouseDown={(e) => e.stopPropagation()} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
            <div 
              className="absolute h-full bg-blue-500 rounded-full transition-all duration-75"
              style={{ 
                left: '50%', 
                width: `${Math.abs(offsetMinutes / MAX_OFFSET * 50)}%`,
                transform: offsetMinutes < 0 ? 'translateX(-100%)' : 'none'
              }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] z-20" />
          </div>
          
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-between px-10 text-[8px] text-theme-muted mono font-black pointer-events-none uppercase tracking-[0.3em] opacity-60">
            <span>-7 DAYS</span>
            <span>CURRENT</span>
            <span>+7 DAYS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
