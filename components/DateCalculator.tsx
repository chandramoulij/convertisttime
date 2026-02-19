
import React, { useState } from 'react';

type CalcType = 'difference' | 'business' | 'add' | 'info' | 'pattern';

const DateCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcType>('difference');
  
  // States for various calculations
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState(new Date().toISOString().split('T')[0]);
  const [daysToAdd, setDaysToAdd] = useState(0);
  const [infoDate, setInfoDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const calculateDifference = () => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // More detailed breakdown
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const months = Math.floor(remainingDays / 30);
    const finalDays = remainingDays % 30;

    return { total: diffDays, breakdown: `${years} years, ${months} months, ${finalDays} days` };
  };

  const calculateBusinessDays = () => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    let count = 0;
    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const calculateAddSubtract = () => {
    const d = new Date(date1);
    d.setDate(d.getDate() + daysToAdd);
    return d.toDateString();
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getInfo = () => {
    const d = new Date(infoDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      weekday: days[d.getDay()],
      weekNumber: getWeekNumber(d),
      isLeap: (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || (d.getFullYear() % 400 === 0) ? 'Yes' : 'No'
    };
  };

  return (
    <div className="bg-theme-surface border border-theme-main rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] animate-in fade-in slide-in-from-bottom-6 duration-700 theme-transition">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-theme-base border-r border-theme-main p-8 space-y-2">
        <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Calculators</h3>
        {[
          { id: 'difference', label: 'Days Span', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { id: 'business', label: 'Business Days', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { id: 'add', label: 'Future Date', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
          { id: 'info', label: 'Date Details', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as CalcType)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                : 'text-theme-muted hover:text-theme-base hover:bg-theme-card'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-grow p-12 bg-theme-surface relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        {activeTab === 'difference' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-4xl font-black tracking-tight text-theme-base mb-2">Days Between Dates</h2>
              <p className="text-theme-muted">Calculate the total span of time between any two calendar points.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest block">Start Date</label>
                <input 
                  type="date" 
                  value={date1} 
                  onChange={(e) => setDate1(e.target.value)}
                  className="w-full bg-theme-base border border-theme-main rounded-2xl p-4 text-theme-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest block">End Date</label>
                <input 
                  type="date" 
                  value={date2} 
                  onChange={(e) => setDate2(e.target.value)}
                  className="w-full bg-theme-base border border-theme-main rounded-2xl p-4 text-theme-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-7xl font-black text-blue-500 mono tracking-tighter tabular-nums">{calculateDifference().total}</div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">Total Days</div>
              </div>
              <div className="text-right sm:text-right">
                <div className="text-theme-base font-bold text-lg">{calculateDifference().breakdown}</div>
                <div className="text-[10px] text-theme-muted uppercase tracking-widest mt-1">Span Breakdown</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-4xl font-black tracking-tight text-theme-base mb-2">Business Days</h2>
              <p className="text-theme-muted">Exclude weekends automatically. Perfect for project planning.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest block">Start Date</label>
                <input 
                  type="date" 
                  value={date1} 
                  onChange={(e) => setDate1(e.target.value)}
                  className="w-full bg-theme-base border border-theme-main rounded-2xl p-4 text-theme-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest block">End Date</label>
                <input 
                  type="date" 
                  value={date2} 
                  onChange={(e) => setDate2(e.target.value)}
                  className="w-full bg-theme-base border border-theme-main rounded-2xl p-4 text-theme-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[2.5rem] text-center">
              <div className="text-8xl font-black text-emerald-500 mono tracking-tighter tabular-nums">{calculateBusinessDays()}</div>
              <div className="text-sm font-bold text-emerald-500 uppercase tracking-[0.4em] mt-4">Working Days Found</div>
              <div className="mt-6 text-xs text-theme-muted italic max-w-sm mx-auto">
                * Weekend exclusion logic (Sat/Sun). Holidays not deducted.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-4xl font-black tracking-tight text-theme-base mb-2">Time Projection</h2>
              <p className="text-theme-muted">Determine future or past dates by injecting day offsets.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest block">Reference Date</label>
                <input 
                  type="date" 
                  value={date1} 
                  onChange={(e) => setDate1(e.target.value)}
                  className="w-full bg-theme-base border border-theme-main rounded-2xl p-4 text-theme-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest block">Day Offset (+ / -)</label>
                <input 
                  type="number" 
                  value={daysToAdd} 
                  onChange={(e) => setDaysToAdd(parseInt(e.target.value) || 0)}
                  className="w-full bg-theme-base border border-theme-main rounded-2xl p-4 text-theme-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/20 p-12 rounded-[2.5rem] text-center relative">
              <div className="text-4xl sm:text-6xl font-black text-theme-base tracking-tight">{calculateAddSubtract()}</div>
              <div className="text-sm font-bold text-indigo-400 uppercase tracking-[0.4em] mt-6">Projected Target Date</div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-4xl font-black tracking-tight text-theme-base mb-2">Date DNA</h2>
              <p className="text-theme-muted">Extract metadata for any calendar entry.</p>
            </header>

            <div className="space-y-4 max-w-sm">
              <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest block">Analysis Target</label>
              <input 
                type="date" 
                value={infoDate} 
                onChange={(e) => setInfoDate(e.target.value)}
                className="w-full bg-theme-base border border-theme-main rounded-2xl p-4 text-theme-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Weekday', value: getInfo().weekday, color: 'text-blue-500' },
                { label: 'Week #', value: getInfo().weekNumber, color: 'text-indigo-500' },
                { label: 'Leap Year', value: getInfo().isLeap, color: 'text-emerald-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-theme-base border border-theme-main p-8 rounded-[2rem] shadow-sm">
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateCalculator;
