
import React, { useState } from 'react';
import { getFortune } from '../services/gemini';

const FortuneView: React.FC = () => {
  const [fortune, setFortune] = useState<{ fortune: string; lucky_numbers: number[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCracking, setIsCracking] = useState(false);

  const handleCrack = async () => {
    setIsCracking(true);
    setIsLoading(true);
    // Mimic cracking delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = await getFortune();
    setFortune(result);
    setIsLoading(false);
    setIsCracking(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 py-12 px-6">
      <header className="text-center space-y-4">
        <h2 className="text-5xl font-black text-theme-base tracking-tighter">The Global Oracle</h2>
        <p className="text-theme-muted text-lg font-medium max-w-xl mx-auto">
          Synchronize your destiny with the pulse of the world. Crack a digital fortune to reveal your path.
        </p>
      </header>

      <div className="flex flex-col items-center justify-center pt-8">
        {!fortune && !isLoading && (
          <button
            onClick={handleCrack}
            className="group relative flex flex-col items-center justify-center p-12 transition-all hover:scale-105 active:scale-95"
          >
            {/* Literal Cookie Shape SVG */}
            <div className="w-48 h-48 bg-amber-200 rounded-[3rem] border-8 border-amber-300 shadow-2xl relative overflow-hidden flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
              <svg className="w-24 h-24 text-amber-500/30" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5,11a1,1,0,1,1-1-1A1,1,0,0,1,17,13Zm-5,4a1,1,0,1,1-1-1A1,1,0,0,1,12,17Zm0-10a1,1,0,1,1-1-1A1,1,0,0,1,12,7Zm5,2a1,1,0,1,1-1-1A1,1,0,0,1,17,9ZM7,9A1,1,0,1,1,6,8,1,1,0,0,1,7,9Zm0,4a1,1,0,1,1-1-1A1,1,0,0,1,7,13Zm0,4a1,1,0,1,1-1-1A1,1,0,0,1,7,17Z" />
              </svg>
              <div className="absolute top-1/2 left-0 w-full h-1 bg-amber-400 opacity-20 -translate-y-1/2"></div>
            </div>
            <div className="mt-8 text-xs font-black uppercase tracking-[0.5em] text-blue-500 animate-pulse">
              Crack to Synchronize
            </div>
          </button>
        )}

        {isLoading && (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-32 h-32 relative">
               <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-theme-muted">
              Consulting the global clock...
            </div>
          </div>
        )}

        {fortune && !isLoading && (
          <div className="w-full max-w-2xl bg-theme-surface border border-theme-main rounded-[4rem] p-16 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="space-y-10 relative z-10">
              <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/60 mb-6">Your Global Wisdom</div>
                <div className="text-4xl md:text-5xl font-black text-theme-base tracking-tighter leading-tight italic">
                  "{fortune.fortune}"
                </div>
              </div>

              <div className="pt-8 border-t border-theme-main flex flex-col items-center">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-theme-muted mb-4 opacity-40">Lucky Time Units</div>
                <div className="flex gap-4">
                  {fortune.lucky_numbers.map((n, i) => (
                    <div key={i} className="w-12 h-12 bg-theme-base border border-theme-main rounded-xl flex items-center justify-center font-black text-theme-base mono">
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-6">
                <button
                  onClick={() => setFortune(null)}
                  className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors"
                >
                  Return to Oracle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="pt-24 text-center opacity-30">
        <div className="text-[10px] uppercase font-black tracking-[1em] text-theme-muted">
          PULSE V1.5 // DESTINY SYNC
        </div>
      </footer>
    </div>
  );
};

export default FortuneView;
