
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Location, AppView } from './types';
import TimeCard from './components/TimeCard';
import Timeline from './components/Timeline';
import MeetingPlanner from './components/MeetingPlanner';
import WidgetsView from './components/WidgetsView';
import DateCalculator from './components/DateCalculator';
import CountdownView from './components/CountdownView';
import CityClockGrid from './components/CityClockGrid';
import AffiliateSlot from './components/AffiliateSlot';
import FortuneView from './components/FortuneView';
import { parseTimeQuery, getCitySuggestions } from './services/gemini';

const App: React.FC = () => {
  // Persistence Layer: Load state from LocalStorage
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('vibetime_locations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [theme, setTheme] = useState(() => localStorage.getItem('vibetime_theme') || 'light');
  const [activeTab, setActiveTab] = useState<AppView>(AppView.Timeline);
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [baseTime, setBaseTime] = useState(new Date());
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const [timelineSearch, setTimelineSearch] = useState('');
  const [timelineSuggestions, setTimelineSuggestions] = useState<any[]>([]);
  const [isTimelineSearchLoading, setIsTimelineSearchLoading] = useState(false);
  const timelineDropdownRef = useRef<HTMLDivElement>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('vibetime_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('vibetime_theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial Location Setup (only if none saved)
  useEffect(() => {
    if (locations.length === 0) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = userTimezone.split('/');
      const cityName = parts[parts.length - 1].replace(/_/g, ' ');
      
      setLocations([
        { id: 'local', name: cityName || 'Your Location', timezone: userTimezone },
        { id: 'ny', name: 'New York', timezone: 'America/New_York' },
        { id: 'lon', name: 'London', timezone: 'Europe/London' },
        { id: 'tok', name: 'Tokyo', timezone: 'Asia/Tokyo' }
      ]);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setBaseTime(new Date()), 1000); // 1s interval for real-time clocks
    return () => clearInterval(timer);
  }, []);

  // Optimized debounce for faster searching
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (cityInput.trim().length > 1) { // Trigger after 2 chars for snappiness
        setIsCityLoading(true);
        try {
          const results = await getCitySuggestions(cityInput);
          setSuggestions(results || []);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setIsCityLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 200); 
    return () => clearTimeout(handler);
  }, [cityInput]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (timelineSearch.trim().length > 1) {
        setIsTimelineSearchLoading(true);
        try {
          const results = await getCitySuggestions(timelineSearch);
          setTimelineSuggestions(results || []);
        } catch (err) {
          setTimelineSuggestions([]);
        } finally {
          setIsTimelineSearchLoading(false);
        }
      } else {
        setTimelineSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [timelineSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setSuggestions([]);
      if (timelineDropdownRef.current && !timelineDropdownRef.current.contains(e.target as Node)) setTimelineSuggestions([]);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowThemeMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedDate = useCallback(() => {
    const date = new Date(baseTime);
    date.setMinutes(date.getMinutes() + offsetMinutes);
    return date;
  }, [baseTime, offsetMinutes]);

  const removeLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const updateLocations = (newLocs: Location[]) => {
    setLocations(newLocs);
  };

  const handleDateChange = (newDate: Date) => {
    const diffMs = newDate.getTime() - baseTime.getTime();
    setOffsetMinutes(Math.round(diffMs / 60000));
  };

  const selectSuggestion = (s: any) => {
    if (!locations.find(l => l.timezone === s.timezone)) {
      setLocations(prev => [...prev, { 
        id: Date.now().toString(), 
        name: s.city, 
        timezone: s.timezone
      }]);
      setCityInput('');
      setTimelineSearch('');
      setSuggestions([]);
      setTimelineSuggestions([]);
    } else {
      setAiMessage(`${s.city} is already listed.`);
      setTimeout(() => setAiMessage(''), 3000);
      setSuggestions([]);
      setTimelineSuggestions([]);
      setCityInput('');
      setTimelineSearch('');
    }
  };

  const themes = [
    { id: 'light', name: 'Light', color: 'bg-white' },
    { id: 'midnight', name: 'Midnight', color: 'bg-slate-900' },
    { id: 'blackout', name: 'Blackout', color: 'bg-black' },
    { id: 'cyber', name: 'Cyber', color: 'bg-purple-900' }
  ];

  return (
    <div className="min-h-screen flex flex-col pb-48 transition-colors duration-400">
      <header className="border-b border-theme-main bg-theme-surface/80 backdrop-blur-lg sticky top-0 z-40 transition-colors duration-400">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
          <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer group" onClick={() => setActiveTab(AppView.Timeline)}>
            <div className={`w-12 h-12 bg-white border ${theme === 'light' ? 'border-[#FF9933]/40' : 'border-theme-main'} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-blue-500/10 transition-all relative overflow-hidden`}>
              {/* Modern IST Logo */}
              <div className="absolute inset-0 flex flex-col">
                <div className="h-1/3 w-full bg-[#FF9933] opacity-20"></div>
                <div className="h-1/3 w-full bg-white"></div>
                <div className="h-1/3 w-full bg-[#128807] opacity-20"></div>
              </div>
              <svg className="w-7 h-7 text-blue-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <circle cx="12" cy="12" r="2" fill="currentColor" className="text-[#000080]" />
              </svg>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-black tracking-tight text-theme-base leading-none">Convert IST Time</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] text-theme-muted font-black mt-1">Precision Portal</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-theme-card/50 p-1 rounded-xl transition-colors duration-400 overflow-x-auto no-scrollbar">
            {[
              { id: AppView.Timeline, label: 'Converter' },
              { id: AppView.Planner, label: 'Planner' },
              { id: AppView.Widgets, label: 'Widgets' },
              { id: AppView.Countdown, label: 'Countdown' },
              { id: AppView.Calculator, label: 'Calculator' },
              { id: AppView.Fortune, label: 'Fortune' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AppView)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-theme-muted hover:text-theme-base'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex-grow flex items-center justify-end gap-4">
            <div className="relative w-full max-w-xs" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Quick add city..."
                  className="w-full bg-theme-base border border-theme-main rounded-xl py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-theme-base placeholder:text-theme-muted/50"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  {isCityLoading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>}
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-theme-surface border border-theme-main rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion(s)}
                        className="w-full px-4 py-3 text-left hover:bg-theme-card flex items-center justify-between border-b border-theme-main last:border-0 transition-colors group"
                      >
                        <div className="min-w-0 flex-grow">
                          <div className="text-sm font-bold text-theme-base truncate group-hover:text-blue-500">{s.city}</div>
                          <div className="text-[10px] text-theme-muted uppercase tracking-wider">{s.country}</div>
                        </div>
                        <div className="text-[10px] mono text-theme-muted font-bold ml-2 whitespace-nowrap">{s.timezone}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={themeRef}>
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2.5 bg-theme-card hover:bg-theme-main rounded-xl border border-theme-main text-theme-base transition-all"
                title="Change Theme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              </button>
              
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-theme-surface border border-theme-main rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-theme-card transition-colors ${theme === t.id ? 'bg-theme-card' : ''}`}
                    >
                      <div className={`w-4 h-4 rounded-full border border-theme-main ${t.color}`}></div>
                      <span className={`text-sm font-bold ${theme === t.id ? 'text-blue-500' : 'text-theme-base'}`}>{t.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {aiMessage && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-top-4">
              {aiMessage}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        {activeTab === AppView.Timeline && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                 <h2 className="text-4xl md:text-5xl font-black text-theme-base tracking-tight leading-tight">Convert IST Time</h2>
                 <p className="text-theme-muted mt-3 text-lg font-medium">Precision time conversion and multi-city synchronization engine.</p>
              </div>
              
              <div className="relative w-full max-w-sm" ref={timelineDropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={timelineSearch}
                    onChange={(e) => setTimelineSearch(e.target.value)}
                    placeholder="Search city to add..."
                    className="w-full bg-theme-base border border-theme-main rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xl transition-all text-theme-base placeholder:text-theme-muted/50"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">
                    {isTimelineSearchLoading ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
                  </div>
                </div>
                {timelineSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-theme-surface border border-theme-main rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                    {timelineSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion(s)}
                        className="w-full px-5 py-4 text-left hover:bg-theme-card flex items-center justify-between border-b border-theme-main last:border-0 transition-all group"
                      >
                        <div className="min-w-0 flex-grow">
                          <div className="text-sm font-bold text-theme-base group-hover:text-blue-500">{s.city}, {s.country}</div>
                          <div className="text-[10px] text-theme-muted mono uppercase mt-0.5">{s.timezone}</div>
                        </div>
                        <svg className="w-4 h-4 text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Affiliate Banner */}
            <AffiliateSlot type="banner" className="mb-8" />

            <div className="space-y-4 pt-12 border-t border-theme-main transition-colors duration-400">
              <h3 className="text-sm font-black text-theme-muted uppercase tracking-[0.2em] mb-6">Detailed Conversion List</h3>
              {locations.map((loc, idx) => (
                <div key={loc.id} className="space-y-4">
                  <TimeCard location={loc} selectedDate={getSelectedDate()} onRemove={removeLocation} isBase={idx === 0} />
                  {/* Insert a smaller affiliate slot after the 3rd item if it exists */}
                  {idx === 2 && locations.length > 3 && (
                    <div className="py-2">
                       <AffiliateSlot type="banner" className="bg-theme-surface border-dashed" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Grid of Analog Clocks */}
            <div className="pt-12 border-t border-theme-main">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  <CityClockGrid locations={locations} selectedDate={getSelectedDate()} />
                </div>
                {/* Affiliate Sidebar Card */}
                <div className="hidden lg:block">
                  <AffiliateSlot type="card" className="h-full sticky top-24" />
                </div>
              </div>
            </div>

            <div className="pb-32"></div>
          </div>
        )}

        {activeTab === AppView.Planner && (
          <div className="max-w-full space-y-6">
            <AffiliateSlot type="banner" className="mb-6" />
            <MeetingPlanner locations={locations} selectedDate={getSelectedDate()} onUpdateLocations={updateLocations} onDateChange={handleDateChange} />
          </div>
        )}

        {activeTab === AppView.Widgets && <div className="max-w-6xl mx-auto"><AffiliateSlot type="banner" className="mb-8" /><WidgetsView locations={locations} /></div>}
        {activeTab === AppView.Calculator && <div className="max-w-6xl mx-auto"><DateCalculator /></div>}
        {activeTab === AppView.Countdown && <div className="max-w-6xl mx-auto"><CountdownView /></div>}
        {activeTab === AppView.Fortune && <div className="max-w-6xl mx-auto"><FortuneView /></div>}
      </main>

      {activeTab !== AppView.Widgets && activeTab !== AppView.Calculator && activeTab !== AppView.Countdown && activeTab !== AppView.Fortune && (
        <Timeline offsetMinutes={offsetMinutes} setOffsetMinutes={setOffsetMinutes} locations={locations} baseTime={baseTime} />
      )}
    </div>
  );
};

export default App;
