
import React, { useState, useEffect, useCallback } from 'react';

interface Countdown {
  id: string;
  title: string;
  targetDate: Date;
}

const CountdownView: React.FC = () => {
  // Persistence Layer
  const [countdowns, setCountdowns] = useState<Countdown[]>(() => {
    const saved = localStorage.getItem('vibetime_countdowns');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((c: any) => ({
        ...c,
        targetDate: new Date(c.targetDate)
      }));
    } catch {
      return [];
    }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('00:00');
  const [now, setNow] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('vibetime_countdowns', JSON.stringify(countdowns));
  }, [countdowns]);

  // Reactive Update Function: Updates the list live as the user types in "Edit" mode
  const updateLiveItem = useCallback((updates: Partial<Countdown>) => {
    if (!editingId) return;
    setCountdowns(prev => prev.map(c => 
      c.id === editingId ? { ...c, ...updates } : c
    ));
  }, [editingId]);

  const addCountdown = () => {
    if (!newDate) return;
    const target = new Date(`${newDate}T${newTime}`);
    if (isNaN(target.getTime())) return;

    const title = newTitle.trim() || 'Precision Tracker';

    if (editingId) {
      // Finalize the edit
      setCountdowns(prev => prev.map(c => 
        c.id === editingId ? { ...c, title, targetDate: target } : c
      ));
      setEditingId(null);
    } else {
      const newEntry: Countdown = {
        id: Date.now().toString(),
        title,
        targetDate: target
      };
      setCountdowns([...countdowns, newEntry]);
    }

    setNewTitle('');
    setNewDate('');
    setNewTime('00:00');
  };

  const removeCountdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCountdowns(countdowns.filter(c => c.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setNewTitle('');
      setNewDate('');
      setNewTime('00:00');
    }
  };

  const startEditing = (c: Countdown) => {
    setEditingId(c.id);
    setNewTitle(c.title === 'Precision Tracker' ? '' : c.title);
    
    const d = c.targetDate;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    
    setNewDate(dateStr);
    setNewTime(timeStr);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateTimeLeft = (target: Date) => {
    const difference = target.getTime() - now.getTime();
    if (difference <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };

    return {
      d: Math.floor(difference / (1000 * 60 * 60 * 24)),
      h: Math.floor((difference / (1000 * 60 * 60)) % 24),
      m: Math.floor((difference / 1000 / 60) % 60),
      s: Math.floor((difference / 1000) % 60),
      expired: false
    };
  };

  const handleDateOrTimeChange = (dateVal: string, timeVal: string) => {
    setNewDate(dateVal);
    setNewTime(timeVal);
    if (editingId) {
      const target = new Date(`${dateVal}T${timeVal}`);
      if (!isNaN(target.getTime())) {
        updateLiveItem({ targetDate: target });
      }
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto">
      <header className="px-4">
        <h2 className="text-4xl font-black text-theme-base tracking-tight mb-2">Event Countdown</h2>
        <p className="text-theme-muted font-medium">Global synchronization for deadlines, launches, and celebrations.</p>
      </header>

      {/* Creation/Editing Engine */}
      <div className={`bg-theme-surface border ${editingId ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-theme-main'} rounded-[3rem] p-8 md:p-12 shadow-xl theme-transition mx-4 relative overflow-hidden`}>
        {editingId && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>}
        
        <h3 className={`${editingId ? 'text-blue-600' : 'text-blue-500'} text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-2`}>
          <span className={`w-1.5 h-1.5 ${editingId ? 'bg-blue-600' : 'bg-blue-500'} rounded-full animate-pulse`}></span>
          {editingId ? 'Updating Precision Engine' : 'Configure New Tracker'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">Event Title (Optional)</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (editingId) updateLiveItem({ title: e.target.value.trim() || 'Precision Tracker' });
              }}
              placeholder="e.g. System Overhaul"
              className="w-full bg-theme-base border border-theme-main rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-theme-base placeholder:text-theme-muted/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">Target Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => handleDateOrTimeChange(e.target.value, newTime)}
              className="w-full bg-theme-base border border-theme-main rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-theme-base"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">Local Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => handleDateOrTimeChange(newDate, e.target.value)}
              className="w-full bg-theme-base border border-theme-main rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-theme-base"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-10">
          <button
            onClick={addCountdown}
            disabled={!newDate}
            className={`px-12 py-5 font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-xs tracking-widest ${
              !newDate ? 'bg-theme-card text-theme-muted cursor-not-allowed opacity-50' : (editingId ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
            }`}
          >
            {editingId ? 'Confirm Updates' : 'Initialize Tracker'}
          </button>
          
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setNewTitle(''); setNewDate(''); setNewTime('00:00'); }}
              className="px-8 py-5 bg-theme-base text-theme-muted hover:text-theme-base font-black rounded-2xl border border-theme-main transition-all uppercase text-xs tracking-widest"
            >
              Discard Changes
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 px-4">
        {countdowns.map((c) => {
          const timeLeft = calculateTimeLeft(c.targetDate);
          const isBeingEdited = editingId === c.id;
          
          return (
            <div 
              key={c.id} 
              onClick={() => startEditing(c)}
              className={`bg-theme-surface border ${isBeingEdited ? 'border-blue-500 ring-8 ring-blue-500/5' : 'border-theme-main hover:border-blue-500/30'} rounded-[3rem] p-10 md:p-14 relative overflow-hidden group shadow-2xl theme-transition cursor-pointer transform transition-transform hover:scale-[1.005]`}
            >
              <div className={`absolute top-0 right-0 w-80 h-80 ${isBeingEdited ? 'bg-blue-500/15' : 'bg-blue-500/5'} blur-[120px] rounded-full pointer-events-none -mr-40 -mt-40 transition-colors`}></div>
              
              <div className="absolute top-8 left-10 text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-2">
                <div className={`w-1.5 h-1.5 bg-blue-500 rounded-full ${isBeingEdited ? 'animate-ping' : ''}`}></div>
                {isBeingEdited ? 'Modifying Engine' : 'Live Precision Tracker'}
              </div>
              
              <button
                onClick={(e) => removeCountdown(e, c.id)}
                className="absolute top-8 right-8 p-3 text-theme-muted hover:text-red-500 bg-theme-base/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-theme-main hover:border-red-500/20 z-10"
                title="Decommission Tracker"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="mt-12 mb-12">
                <h4 className="text-4xl md:text-6xl font-black text-theme-base tracking-tighter mb-4 leading-none group-hover:text-blue-500 transition-colors">
                  {c.title}
                </h4>
                <div className="flex items-center gap-3">
                   <div className="px-2 py-0.5 bg-theme-base rounded text-[10px] font-black text-theme-muted uppercase tracking-widest border border-theme-main shadow-sm">Point Alpha</div>
                   <p className="text-theme-muted text-sm font-black tracking-tight tabular-nums opacity-60">{c.targetDate.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
              </div>

              {timeLeft.expired ? (
                <div className="py-20 text-center bg-blue-500/5 rounded-[2.5rem] border border-blue-500/20 animate-in zoom-in-95 duration-500 backdrop-blur-sm">
                  <div className="text-6xl font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Event Reached</div>
                  <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest opacity-60">Cycle Complete</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {[
                    { label: 'Days', value: timeLeft.d },
                    { label: 'Hours', value: timeLeft.h },
                    { label: 'Minutes', value: timeLeft.m },
                    { label: 'Seconds', value: timeLeft.s }
                  ].map((unit, i) => (
                    <div key={i} className="bg-theme-base border border-theme-main rounded-[2rem] p-8 text-center flex flex-col justify-center relative overflow-hidden group/unit transition-all hover:border-blue-500/40 shadow-sm">
                      <div className="text-5xl md:text-8xl font-black text-theme-base mono tracking-tighter tabular-nums mb-1 relative z-10 transition-colors group-hover/unit:text-blue-500">
                        {unit.value < 10 ? `0${unit.value}` : unit.value}
                      </div>
                      <div className="text-[10px] font-black text-theme-muted uppercase tracking-[0.5em] relative z-10 opacity-40">
                        {unit.label}
                      </div>
                      <div className="absolute inset-0 bg-blue-500/0 group-hover/unit:bg-blue-500/[0.02] transition-colors pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {countdowns.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed border-theme-main rounded-[3rem] bg-theme-base/20 mx-4 opacity-60">
            <div className="w-16 h-16 bg-theme-card rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-theme-muted font-black uppercase tracking-[0.3em] text-xs">No Active Precision Trackers</p>
            <p className="text-theme-muted/50 text-[10px] mt-2 font-bold uppercase tracking-widest">Waiting for Input</p>
          </div>
        )}
      </div>

      <footer className="pt-20 pb-12 text-center">
        <div className="text-theme-muted text-[10px] uppercase font-black tracking-[1em] opacity-30">
          VibeTime Precision Protocol · PRO-READY V1.5.0
        </div>
      </footer>
    </div>
  );
};

export default CountdownView;
