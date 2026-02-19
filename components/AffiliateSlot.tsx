
import React from 'react';

interface AffiliateSlotProps {
  type: 'banner' | 'card' | 'sidebar';
  className?: string;
}

const AffiliateSlot: React.FC<AffiliateSlotProps> = ({ type, className = "" }) => {
  return (
    <div className={`relative group cursor-pointer overflow-hidden transition-all duration-500 border border-theme-main/50 bg-theme-base/20 rounded-2xl hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 ${className}`}>
      {/* Label */}
      <div className="absolute top-2 right-3 z-10">
        <span className="text-[8px] font-black uppercase tracking-widest text-theme-muted opacity-40 group-hover:opacity-100 transition-opacity">
          Sponsored
        </span>
      </div>

      {type === 'banner' && (
        <div className="w-full py-6 px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-black text-theme-base tracking-tight">Upgrade Your Global Workflow</div>
              <div className="text-[10px] text-theme-muted font-bold uppercase tracking-widest">Featured Partner Content</div>
            </div>
          </div>
          <button className="bg-theme-surface border border-theme-main px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
            Learn More
          </button>
        </div>
      )}

      {type === 'card' && (
        <div className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center text-blue-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-black text-theme-base">Precision Tools for Pros</div>
            <p className="text-xs text-theme-muted mt-2 max-w-[200px]">Unlock advanced synchronization features and premium insights.</p>
          </div>
          <div className="pt-2 w-full">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-theme-main to-transparent mb-4"></div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Explore Affiliates</span>
          </div>
        </div>
      )}

      {/* Decorative patterns */}
      <div className="absolute bottom-0 right-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="100" cy="100" r="80" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

export default AffiliateSlot;
