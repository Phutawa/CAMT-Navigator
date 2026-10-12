import React from 'react';
import { ScreenId } from '../types/navigation';

interface BottomNavBarProps {
  currentTab: 'home' | 'map' | 'profile';
  onSelectTab: (tab: 'home' | 'map' | 'profile') => void;
  onNavigateScreen?: (screen: ScreenId) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onNavigateScreen,
}) => {
  return (
    <div className="w-full bg-white/95 backdrop-blur-lg border-t border-brand-100 shadow-nav z-20 shrink-0">
      <nav className="flex items-center justify-around py-1.5 px-6">
        {/* Tab 1: Home */}
        <button
          onClick={() => {
            onSelectTab('home');
            if (onNavigateScreen) onNavigateScreen('home');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 relative transition-colors ${
            currentTab === 'home' ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'
          }`}
          data-purpose="tab-home"
        >
          <div className="relative">
            <svg className="w-6 h-6 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {currentTab === 'home' && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-600" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight ${currentTab === 'home' ? 'font-extrabold' : 'font-semibold'}`}>
            Home
          </span>
          <div
            className={`w-4 h-0.5 rounded-full mt-0.5 transition-all ${
              currentTab === 'home' ? 'bg-brand-600' : 'bg-transparent'
            }`}
          />
        </button>

        {/* Tab 2: Map */}
        <button
          onClick={() => {
            onSelectTab('map');
            if (onNavigateScreen) onNavigateScreen('route-preview');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
            currentTab === 'map' ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'
          }`}
          data-purpose="tab-map"
        >
          <div className="relative">
            <svg className="w-6 h-6 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.313a2.25 2.25 0 0 0-2.006 0L2.622 5.75c-.381.19-.622.58-.622 1.006v11.722c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.997 2.498a2.25 2.25 0 0 0 2.006 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {currentTab === 'map' && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-600" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight ${currentTab === 'map' ? 'font-extrabold' : 'font-semibold'}`}>
            Map
          </span>
          <div
            className={`w-4 h-0.5 rounded-full mt-0.5 transition-all ${
              currentTab === 'map' ? 'bg-brand-600' : 'bg-transparent'
            }`}
          />
        </button>

        {/* Tab 3: Profile */}
        <button
          onClick={() => {
            onSelectTab('profile');
            if (onNavigateScreen) onNavigateScreen('profile');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
            currentTab === 'profile' ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'
          }`}
          data-purpose="tab-profile"
        >
          <div className="relative">
            <svg className="w-6 h-6 stroke-[1.9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.964 0a9 9 0 1 0-11.965 0m11.965 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {currentTab === 'profile' && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-600" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight ${currentTab === 'profile' ? 'font-extrabold' : 'font-semibold'}`}>
            Profile
          </span>
          <div
            className={`w-4 h-0.5 rounded-full mt-0.5 transition-all ${
              currentTab === 'profile' ? 'bg-brand-600' : 'bg-transparent'
            }`}
          />
        </button>
      </nav>

      {/* iOS Home Indicator Bar */}
      <div className="w-full flex justify-center pb-2 pt-0.5 pointer-events-none">
        <div className="w-32 h-1 bg-slate-900/25 rounded-full" />
      </div>
    </div>
  );
};
