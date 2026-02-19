
import React, { useState, useEffect, useRef } from 'react';
import { Location } from '../types';
import AnalogClock from './AnalogClock';
import { getCitySuggestions } from '../services/gemini';

interface WidgetsViewProps {
  locations: Location[];
}

const WidgetsView: React.FC<WidgetsViewProps> = ({ locations }) => {
  const [previewLocation, setPreviewLocation] = useState<Location | null>(locations[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const selectSuggestion = (s: any) => {
    setPreviewLocation({
      id: 'preview',
      name: s.city,
      timezone: s.timezone,
      countryCode: s.country
    });
    setSearchQuery('');
    setSuggestions([]);
  };

  if (!previewLocation && locations.length > 0) {
    setPreviewLocation(locations[0]);
  }

  const localTime = previewLocation 
    ? new Date(now.toLocaleString('en-US', { timeZone: previewLocation.timezone }))
    : now;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-theme-surface p-8 rounded-[3rem] border border-theme-main gap-6 theme-transition shadow-xl">
        <div>
          <h2 className="text-3xl font-bold text-theme-base">Live Time Engines</h2>
          <p className="text-theme-muted text-sm mt-1">Search any city to generate high-fidelity widgets.</p>
        </div>
        
        <div className="relative w-full max-w-sm" ref={dropdownRef}>
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city for preview..."
              className="w-full bg-theme-base border border-theme-main rounded-2xl py-3 px-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-theme-base placeholder:text-theme-muted/50"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {isLoading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
            </div>
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-theme-surface border border-theme-main rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => selectSuggestion(s)}
                  className="w-full px-5 py-3.5 text-left hover:bg-theme-card flex items-center justify-between border-b border-theme-main last:border-0 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate text-theme-base">{s.city}, {s.country}</div>
                    <div className="text-[10px] text-theme-muted uppercase tracking-widest">{s.timezone}</div>
                  </div>
                  <svg className="w-4 h-4 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5"/></svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Analog Widget */}
          <div className="bg-theme-surface p-12 rounded-[4rem] border border-theme-main flex flex-col items-center justify-center group hover:border-blue-500/50 transition-all duration-500 shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden theme-transition">
            <div className="absolute top-8 left-8 text-[10px] font-black text-theme-muted uppercase tracking-[0.4em]">Engine A.V1</div>
            <div className="mb-10 transform group-hover:scale-105 transition-transform duration-500">
              <AnalogClock date={localTime} size={280} />
            </div>
            <div className="text-center">
              <h3 className="text-blue-500/60 uppercase tracking-[0.5em] text-[10px] font-black mb-3">Analog Precision</h3>
              <div className="text-2xl font-bold text-theme-base tracking-tight">{previewLocation.name}</div>
            </div>
          </div>

          {/* Digital Widget */}
          <div className="bg-theme-surface p-12 rounded-[4rem] border border-theme-main flex flex-col items-center justify-center group hover:border-indigo-500/50 transition-all duration-500 shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden theme-transition">
             <div className="absolute top-8 right-8 text-[10px] font-black text-theme-muted uppercase tracking-[0.4em]">Engine D.V1</div>
             <div className="text-center mb-10">
                <div className="text-8xl font-black text-theme-base mono tracking-tighter mb-4 tabular-nums">
                  {localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).split(' ')[0]}
                </div>
                <div className="text-3xl font-bold text-indigo-500 mono uppercase tracking-widest">
                  {localTime.toLocaleTimeString([], { hour12: true }).split(' ')[1]}
                </div>
             </div>
             <div className="text-xl text-theme-muted mono font-medium mb-12 uppercase border-y border-theme-main py-4 w-full text-center">
                {localTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
             </div>
             <div className="text-center">
               <h3 className="text-indigo-500/60 uppercase tracking-[0.5em] text-[10px] font-black mb-3">Digital Pulse</h3>
               <div className="text-lg font-bold text-theme-base">{previewLocation.timezone}</div>
             </div>
          </div>
        </div>
      )}
      
      {!previewLocation && locations.length === 0 && (
        <div className="py-40 text-center border-2 border-dashed border-theme-main rounded-[3rem]">
          <p className="text-theme-muted font-bold uppercase tracking-widest">Start by searching a city above</p>
        </div>
      )}

      <div className="text-center text-theme-muted text-[10px] uppercase font-black tracking-[0.6em] pt-12">
        Synchronized Global Clock Protocol
      </div>
    </div>
  );
};

export default WidgetsView;
