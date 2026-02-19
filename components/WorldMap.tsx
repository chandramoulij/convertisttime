
import React, { useState, useEffect, useRef } from 'react';
import { Location } from '../types';
import { getCitySuggestions } from '../services/gemini';

interface WorldMapProps {
  locations: Location[];
  selectedDate: Date;
  onAddPin: (x: number, y: number) => void;
  onAddLocation: (s: any) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ locations, selectedDate, onAddPin, onAddLocation }) => {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // Account for zoom if necessary, but simple coordinate click is fine for a flat SVG
    onAddPin(x, y);
  };

  const offsets = [
    { label: '-12', color: '#4d4dff' },
    { label: '-11', color: '#33ccff' },
    { label: '-10', color: '#66ff66' },
    { label: '-9', color: '#ccff33' },
    { label: '-8', color: '#ffcc33' },
    { label: '-7', color: '#ff6633' },
    { label: '-6', color: '#ff66cc' },
    { label: '-5', color: '#3333ff' },
    { label: '-4', color: '#33cccc' },
    { label: '-3', color: '#33cc33' },
    { label: '-2', color: '#ccff99' },
    { label: '-1', color: '#ffffcc' },
    { label: 'UTC', color: '#ff3333' },
    { label: '+1', color: '#ffcc99' },
    { label: '+2', color: '#ffff99' },
    { label: '+3', color: '#ccff99' },
    { label: '+4', color: '#99ff99' },
    { label: '+5', color: '#3399ff' },
    { label: '+6', color: '#9999ff' },
    { label: '+7', color: '#ff99cc' },
    { label: '+8', color: '#ffcc99' },
    { label: '+9', color: '#ffffcc' },
    { label: '+10', color: '#99ff99' },
    { label: '+11', color: '#3399ff' },
  ];

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-sm shadow-xl text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-slate-700 tracking-tight">World Time Zone Map</h2>
        <div className="h-1 w-32 bg-amber-400 mt-2 rounded-full"></div>
      </div>
      
      <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-3xl">
        This interactive map represent time zones around the world and cities observing them. Just point at the city on the map or search it in the search field to see the detailed information.
      </p>

      <div className="relative w-full aspect-[16/9] bg-blue-50/30 border border-slate-200 overflow-hidden rounded-sm group/map">
        {/* Search Overlay */}
        <div className="absolute top-4 left-4 z-20 w-72" ref={dropdownRef}>
          <div className="relative group/search">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-white border border-slate-300 rounded-sm py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder-slate-400 text-slate-700 shadow-sm"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl z-50 rounded-sm">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => { onAddLocation(s); setSearchQuery(''); setSuggestions([]); }}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 text-xs border-b border-slate-100 last:border-0 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-700">{s.city}, {s.country}</span>
                  <span className="text-[10px] text-slate-400 mono">{s.timezone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col bg-white border border-slate-300 shadow-sm rounded-sm">
          <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2.5 hover:bg-slate-50 border-b border-slate-200 text-slate-600 font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
          </button>
          <button onClick={() => setZoom(z => Math.max(1, z - 0.2))} className="p-2.5 hover:bg-slate-50 text-slate-600 font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4"/></svg>
          </button>
        </div>

        <svg 
          viewBox="0 0 100 50" 
          className="w-full h-full cursor-crosshair select-none transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          onClick={handleClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverPos({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100
            });
          }}
          onMouseLeave={() => hoverPos && setHoverPos(null)}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="world-grid-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.1" fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect width="100" height="50" fill="url(#world-grid-dots)" />

          {/* Timezone Bands (Vertical Colored Bars) */}
          {offsets.map((o, i) => {
            const width = 100 / 24;
            const x = i * width;
            return (
              <rect 
                key={i} 
                x={x} y="0" width={width} height="50" 
                fill={o.color} fillOpacity="0.12" 
                className="transition-all duration-300"
              />
            );
          })}

          {/* Continent Shapes (More detailed but stylized) */}
          <g className="fill-slate-100 stroke-slate-200 transition-colors" strokeWidth="0.15">
            {/* Americas */}
            <path d="M12,5 L28,5 L32,15 L35,28 L30,35 L28,48 L22,48 L25,32 L10,25 Z" fill="#fffbe6" fillOpacity="0.8" />
            {/* EMEA */}
            <path d="M42,5 L60,5 L65,15 L62,35 L58,48 L48,48 L45,35 L40,20 Z" fill="#f6ffed" fillOpacity="0.8" />
            {/* Asia */}
            <path d="M65,5 L95,5 L98,25 L92,42 L75,42 L70,30 L65,15 Z" fill="#f9f0ff" fillOpacity="0.8" />
            {/* Oceania */}
            <path d="M78,35 L92,35 L95,48 L82,48 Z" fill="#fff1f0" fillOpacity="0.8" />
          </g>

          {/* Region Labels */}
          <g className="pointer-events-none uppercase tracking-widest" style={{ fontSize: '1px', fontWeight: 'bold' }}>
            <text x="18" y="15" fill="#94a3b8">North America</text>
            <text x="28" y="42" fill="#94a3b8">South America</text>
            <text x="48" y="12" fill="#94a3b8">Europe</text>
            <text x="50" y="32" fill="#94a3b8">Africa</text>
            <text x="78" y="15" fill="#94a3b8">Asia</text>
            <text x="84" y="42" fill="#94a3b8">Oceania</text>
          </g>

          {/* Red City Dots (Pins) */}
          {locations.map((loc) => {
            const x = loc.coords?.x ?? (Math.random() * 80 + 10);
            const y = loc.coords?.y ?? (Math.random() * 30 + 10);
            const localTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: loc.timezone });
            
            return (
              <g key={loc.id} className="group cursor-pointer">
                <circle cx={x} cy={y} r="0.55" fill="#e11d48" className="animate-pulse" />
                <circle cx={x} cy={y} r="1.4" fill="#e11d48" fillOpacity="0" className="group-hover:fill-opacity-20 transition-all duration-200" />
                
                {/* Information Popover on Hover */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect x={x + 1.5} y={y - 5.5} width="16" height="7.5" rx="0.5" fill="white" stroke="#e2e8f0" strokeWidth="0.1" className="shadow-2xl" />
                  <text x={x + 2.5} y={y - 2.5} className="fill-slate-900 font-bold" style={{ fontSize: '1.4px' }}>{loc.name}</text>
                  <text x={x + 2.5} y={y - 0.5} className="fill-blue-600 font-medium" style={{ fontSize: '1.2px' }}>{localTimeString}</text>
                  <text x={x + 2.5} y={y + 1.2} className="fill-slate-400" style={{ fontSize: '0.9px' }}>{loc.timezone}</text>
                </g>
              </g>
            );
          })}

          {/* Crosshair guide */}
          {hoverPos && (
            <g className="pointer-events-none opacity-20">
              <line x1={hoverPos.x} y1="0" x2={hoverPos.x} y2="50" stroke="#94a3b8" strokeWidth="0.1" strokeDasharray="0.5,0.5" />
              <line x1="0" y1={hoverPos.y} x2="100" y2={hoverPos.y} stroke="#94a3b8" strokeWidth="0.1" strokeDasharray="0.5,0.5" />
            </g>
          )}
        </svg>
      </div>

      {/* UTC Offset Legend */}
      <div className="flex w-full h-8 border border-slate-200 overflow-hidden shadow-sm">
        {offsets.map((o, i) => (
          <div 
            key={i} 
            className="flex-1 flex items-center justify-center text-[10px] font-black border-r border-slate-200 last:border-0 hover:brightness-95 transition-all cursor-default"
            style={{ backgroundColor: o.color, color: i === 12 ? 'white' : '#1e293b' }}
            title={`UTC ${o.label}`}
          >
            {o.label}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h3 className="text-xl font-bold text-slate-700 mb-4">How to use our map of world time zones?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-500 leading-relaxed">
          <div>
            <p className="mb-4">
              Our interactive map allows you to visualize the current time conditions across the globe at a glance. Each vertical color band represents a standard UTC offset, helping you identify regional sync points.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the <span className="font-bold text-slate-700">Search</span> field to find any city or capital.</li>
              <li>Point at any <span className="font-bold text-red-500">Red Dot</span> to see detailed local time and timezone info.</li>
            </ul>
          </div>
          <div>
            <p className="mb-4">
              You can also interact with the map directly by clicking any point to "drop a pin". Our AI engine will analyze the coordinates and attempt to resolve the nearest major city for you.
            </p>
            <div className="flex gap-4 items-center p-3 bg-blue-50/50 rounded-sm border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold">i</div>
              <p className="text-xs italic">Tip: Use the zoom controls in the top right for a more precise view of dense urban areas like Europe or East Asia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
