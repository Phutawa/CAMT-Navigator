import React from 'react';
import { StatusBar } from '../components/StatusBar';

interface SplashScreenProps {
  onEnter: () => void;
  brandVariant?: 'WayFind' | 'LostFound';
  onToggleBrand?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnter,
  brandVariant = 'WayFind',
  onToggleBrand,
}) => {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-canvas"
      data-purpose="stage-1-splash-screen"
    >
      {/* Background Ambient Radial Glows & Campus Grid Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-brand-200/40 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute top-1/3 -right-24 w-88 h-88 bg-brand-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-brand-100/40 rounded-full blur-3xl" />

        {/* Faint campus grid SVG lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07] stroke-brand-900"
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="splash-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1.2" />
              <circle cx="24" cy="24" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#splash-grid)" />
          <line x1="0" y1="200" x2="390" y2="460" stroke="currentColor" strokeDasharray="8 6" strokeWidth="2" />
          <line x1="390" y1="360" x2="0" y2="620" stroke="currentColor" strokeDasharray="6 4" strokeWidth="1.5" />
        </svg>
      </div>

      {/* iOS Top Status Bar */}
      <StatusBar theme="dark" />

      {/* Top System Ready Label */}
      <div className="relative z-10 w-full flex justify-end pt-1 pr-6">
        <span className="text-[10px] tracking-widest font-mono text-brand-900/40 uppercase">
          System Ready
        </span>
      </div>

      {/* Centerpiece Brand Identity */}
      <section className="relative z-10 flex flex-col items-center justify-center -mt-6 px-6" data-purpose="app-branding">
        {/* Interactive App Icon with Multi-layer Radar Waves */}
        <div
          onClick={onEnter}
          className="relative mb-6 group cursor-pointer"
          title="Tap to Launch"
        >
          {/* Multi-layer Radar Waves */}
          <div className="absolute -inset-4 rounded-[36px] bg-brand-500/25 animate-radar pointer-events-none" />
          <div
            className="absolute -inset-8 rounded-[44px] bg-brand-400/15 animate-radar pointer-events-none"
            style={{ animationDelay: '0.8s' }}
          />
          {/* Glowing Drop Shadow */}
          <div className="absolute inset-0 bg-brand-600 rounded-[32px] filter blur-xl opacity-45 transform scale-95 translate-y-3 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300" />

          {/* Squircle App Icon Button */}
          <div className="relative w-24 h-24 bg-gradient-to-tr from-[#5215C9] via-[#6524EB] to-[#8048FF] rounded-[26px] p-0.5 shadow-glow flex items-center justify-center border border-white/30 transform transition-transform duration-300 group-hover:scale-105 active:scale-95">
            <svg
              className="w-13 h-13 text-white drop-shadow-md transform transition-transform duration-500 group-hover:rotate-12"
              fill="none"
              viewBox="0 0 52 52"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M42.23 8.35a1.8 1.8 0 0 0-2.07-.37L10.38 21.64a1.8 1.8 0 0 0-.21 3.25l13.62 6.55a1.5 1.5 0 0 1 .74.74l6.55 13.62a1.8 1.8 0 0 0 3.25-.21L42.6 10.42a1.8 1.8 0 0 0-.37-2.07Z"
                fill="white"
                stroke="white"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <circle cx="28" cy="24" r="3.2" fill="#5817D5" className="opacity-90" />
              <circle cx="28" cy="24" r="1.5" fill="white" />
            </svg>
          </div>
        </div>

        {/* Brand Name Typography */}
        <h1
          onClick={onToggleBrand}
          className="text-[34px] leading-tight font-extrabold tracking-tight text-brand-900 flex items-center cursor-pointer select-none"
          title="Click to toggle WayFind / LostFound naming style"
        >
          {brandVariant === 'WayFind' ? (
            <>
              <span>Way</span>
              <span className="text-brand-600">Find</span>
            </>
          ) : (
            <>
              <span>Lost</span>
              <span className="text-brand-600">Found</span>
            </>
          )}
        </h1>

        {/* Uppercase Subtitle */}
        <p className="mt-1 text-[11px] font-bold tracking-[0.28em] text-brand-900/60 uppercase">
          Campus Navigation
        </p>

        {/* Micro Network Status Badge */}
        <div className="mt-4 px-3.5 py-1.5 bg-white/80 backdrop-blur-md border border-brand-100 rounded-full shadow-soft">
          <span className="text-[11px] font-medium text-brand-900/80 tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Campus Network Active
          </span>
        </div>

        {/* Action Button: Tap to Enter WayFind */}
        <button
          onClick={onEnter}
          className="mt-7 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 active:scale-95 text-white rounded-full text-xs font-bold tracking-wide shadow-glow flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Tap to Enter WayFind</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* Splash Footer: Loading Indicator & Coverage Stats */}
      <footer className="relative z-10 w-full flex flex-col items-center mb-6 px-6" data-purpose="initialization-indicator">
        <div className="flex items-center space-x-2.5 mb-1.5" role="status">
          <svg
            className="animate-spin-smooth w-4 h-4 text-brand-600"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-90"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          <span className="text-[13px] font-semibold text-slate-600 tracking-tight">
            Initializing campus map...
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium tracking-wide mb-3">
          126 buildings • 4,800 rooms
        </p>

        {/* Standard iOS Home Indicator bar */}
        <div className="w-36 h-1 bg-slate-900/25 rounded-full" />
      </footer>
    </div>
  );
};
