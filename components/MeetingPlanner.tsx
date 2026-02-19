
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Location } from '../types';
import { getCitySuggestions } from '../services/gemini';

interface MeetingPlannerProps {
  locations: Location[];
  selectedDate: Date;
  onUpdateLocations: (newLocs: Location[]) => void;
  onDateChange: (date: Date) => void;
}

const MeetingPlanner: React.FC<MeetingPlannerProps> = ({ locations, selectedDate, onUpdateLocations, onDateChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Standard 24-hour range (0 to 23)
  const hoursRange = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // Calculate ±3 days range
  const dateStrip = useMemo(() => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDate]);

  const getSlotColorClass = (hour: number) => {
    if (hour >= 22 || hour < 6) return 'bg-theme-base/60 text-slate-500'; // Night
    if (hour >= 6 && hour < 9) return 'bg-amber-500/5 text-amber-500/80'; // Sunrise
    if (hour >= 9 && hour < 18) return 'bg-blue-600/10 text-theme-base ring-1 ring-inset ring-blue-500/20'; // Work
    return 'bg-blue-400/5 text-blue-400/80'; // Evening
  };

  const addLocation = (s: any) => {
    if (!locations.find(l => l.timezone === s.timezone)) {
      onUpdateLocations([...locations, { id: Date.now().toString(), name: s.city, timezone: s.timezone }]);
    }
    setSearchQuery('');
    setSuggestions([]);
  };

  const removeLocation = (id: string) => {
    onUpdateLocations(locations.filter(l => l.id !== id));
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsLoading(true);
        const results = await getCitySuggestions(searchQuery);
        setSuggestions(results);
        setIsLoading(false);
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const getUTCOffset = (timezone: string) => {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '';
    const hours = Math.floor(Math.abs(offset));
    const mins = Math.round((Math.abs(offset) % 1) * 60);
    return `${sign}${hours}${mins > 0 ? '.' + (mins/6) : ''}`;
  };

  const baseTz = locations[0]?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const baseNow = new Date(currentTime.toLocaleString('en-US', { timeZone: baseTz }));
  const currentHourIndex = baseNow.getHours();

  return (
    <div className="bg-theme-surface border border-theme-main rounded-2xl shadow-2xl flex flex-col theme-transition overflow-hidden font-sans w-full">
      
      {/* Date Navigation Strip */}
      <div className="flex items-center justify-between px-6 py-4 bg-theme-base/20 border-b border-theme-main/50">
        <div className="flex gap-2">
          {dateStrip.map((date, idx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={idx}
                onClick={() => onDateChange(date)}
                className={`flex flex-col items-center min-w-[64px] py-2 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'hover:bg-theme-card text-theme-muted hover:text-theme-base'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-sm font-black">
                  {date.getDate()}
                </span>
                {isToday && !isSelected && <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={() => onDateChange(new Date())}
          className="px-4 py-2 bg-theme-card border border-theme-main rounded-xl text-[10px] font-black uppercase tracking-widest text-theme-muted hover:text-blue-500 hover:border-blue-500/30 transition-all"
        >
          Jump to Today
        </button>
      </div>

      {/* Search & Tool Bar */}
      <div className="flex items-center p-3 bg-theme-base/40 border-b border-theme-main gap-4 flex-wrap">
        <div className="relative flex-grow max-w-sm" ref={dropdownRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="+ Add place or timezone"
            className="w-full bg-theme-base/50 border border-theme-main rounded-xl px-10 py-2 text-sm text-theme-base focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-theme-muted/40 transition-all"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            {isLoading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-theme-surface border border-theme-main rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden backdrop-blur-2xl">
              {suggestions.map((s, idx) => (
                <button key={idx} onClick={() => addLocation(s)} className="w-full px-4 py-3 text-left hover:bg-blue-500/10 flex items-center justify-between border-b border-theme-main last:border-0 transition-colors group">
                  <div className="min-w-0">
                    <span className="font-bold text-theme-base group-hover:text-blue-400">{s.city}</span>
                    <div className="text-[10px] text-theme-muted uppercase tracking-widest">{s.country}</div>
                  </div>
                  <span className="text-[10px] mono text-theme-muted font-bold ml-2 opacity-40">{s.timezone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-theme-muted ml-auto">
          <div className="bg-theme-card/30 px-3 py-1.5 rounded-lg border border-theme-main text-theme-base flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <button className="text-blue-500 hover:text-blue-400 font-black tracking-widest uppercase text-[10px]">Share Link</button>
        </div>
      </div>

      {/* Grid Wrapper */}
      <div className="flex flex-col relative bg-theme-base/10 overflow-x-auto no-scrollbar scroll-smooth">
        
        {/* Sticky Hour Header */}
        <div className="flex border-b border-theme-main/50 bg-theme-surface/90 backdrop-blur sticky top-0 z-30 min-w-full">
          <div className="w-[130px] shrink-0 border-r border-theme-main/50 p-2 text-[9px] font-black text-theme-muted uppercase tracking-widest bg-theme-base/20 flex items-center justify-center">
            Timezones
          </div>
          <div className="flex-grow flex items-stretch">
            {hoursRange.map((h) => (
              <div key={h} className={`flex-1 min-w-[28px] flex flex-col items-center justify-center py-1.5 relative ${h === currentHourIndex ? 'bg-blue-500/10' : ''}`}>
                <span className={`text-[10px] font-black ${h === currentHourIndex ? 'text-blue-400' : 'text-theme-muted opacity-60'}`}>{h}</span>
                <span className="text-[6px] uppercase font-black opacity-30 tracking-tighter leading-none">{h < 12 ? 'am' : 'pm'}</span>
                {h === currentHourIndex && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* City Rows */}
        {locations.map((loc, locIdx) => {
          const locNow = new Date(currentTime.toLocaleString('en-US', { timeZone: loc.timezone }));
          const offsetStr = getUTCOffset(loc.timezone);
          const isBase = locIdx === 0;

          return (
            <div key={loc.id} className="flex border-b border-theme-main/20 group hover:bg-white/[0.01] transition-colors h-[64px] items-stretch min-w-full">
              
              <div className="w-[130px] shrink-0 p-2 flex items-center gap-2 relative bg-theme-surface border-r border-theme-main z-20 sticky left-0 shadow-lg theme-transition">
                <div className="w-5 flex flex-col items-center shrink-0">
                   {isBase ? (
                     <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-white">
                       <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                     </div>
                   ) : (
                     <span className="text-[8px] font-black text-theme-muted opacity-30">{offsetStr}</span>
                   )}
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-[11px] text-theme-base truncate leading-none">{loc.name}</h4>
                  <div className="text-[7px] text-theme-muted font-bold uppercase tracking-tight opacity-40 mt-0.5 truncate">
                    {loc.timezone.split('/').pop()?.replace('_', ' ')}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-black text-blue-500 mono leading-none mb-0.5 tabular-nums">
                    {locNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                  <div className="text-[6px] font-black text-theme-muted opacity-20 uppercase">
                    {locNow.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>

                {!isBase && (
                  <button 
                    onClick={() => removeLocation(loc.id)}
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 bg-theme-card border border-theme-main rounded p-0.5 opacity-0 group-hover:opacity-100 shadow-xl z-40 text-theme-muted hover:text-red-500 transition-all"
                  >
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              <div className="flex-grow flex items-stretch overflow-hidden">
                {hoursRange.map((hIndex) => {
                  const baseStartTime = new Date(selectedDate);
                  baseStartTime.setHours(0, 0, 0, 0);
                  const moment = new Date(baseStartTime.getTime() + hIndex * 3600000);
                  const localTime = new Date(moment.toLocaleString('en-US', { timeZone: loc.timezone }));
                  
                  const h = localTime.getHours();
                  const m = localTime.getMinutes();
                  const isNewDay = h === 0 && m === 0;
                  const slotClass = getSlotColorClass(h);
                  const isNowCol = hIndex === currentHourIndex;

                  return (
                    <div 
                      key={hIndex} 
                      className={`flex-1 min-w-[28px] border-r border-theme-main/10 flex flex-col items-center justify-center relative transition-all cursor-default ${slotClass} ${hoverIndex === hIndex ? 'brightness-125' : ''}`}
                      onMouseEnter={() => setHoverIndex(hIndex)}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      {isNewDay && <div className="absolute inset-y-0 left-0 border-l-[2px] border-blue-600/60 z-10"></div>}

                      <div className="flex flex-col items-center gap-0">
                        <span className={`text-[12px] font-black leading-tight ${isNowCol ? 'text-blue-400' : ''}`}>
                          {h}
                        </span>
                        {m !== 0 && (
                          <span className="text-[7px] font-bold text-theme-base/50 leading-none tabular-nums">
                            :{m < 10 ? `0${m}` : m}
                          </span>
                        )}
                      </div>

                      <span className="text-center text-[5px] uppercase font-black opacity-10 tracking-tighter leading-none mt-0.5">{h < 12 ? 'am' : 'pm'}</span>

                      {hoverIndex === hIndex && (
                        <div className="absolute inset-0 bg-white/10 z-30 pointer-events-none ring-1 ring-inset ring-white/10"></div>
                      )}

                      {isNowCol && (
                        <div className="absolute inset-0 bg-blue-500/5 border-x border-blue-500/20 z-20 pointer-events-none"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="p-2.5 bg-theme-base/30 border-t border-theme-main flex justify-center gap-6 text-[7px] font-black text-theme-muted uppercase tracking-[0.3em] overflow-x-auto no-scrollbar">
         <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 bg-blue-600/20 border border-blue-500/40 rounded-sm"></div> Business
         </div>
         <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 bg-theme-base border border-theme-main rounded-sm opacity-50"></div> Off-Hours
         </div>
         <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 bg-blue-600 border border-blue-400 rounded-sm"></div> Next Day
         </div>
         <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 border-x border-blue-500/50 bg-blue-500/10 rounded-sm"></div> Current Hour
         </div>
      </div>
    </div>
  );
};

export default MeetingPlanner;
