import React, { useState } from 'react';
import { StatusBar } from '../components/StatusBar';
import { BottomNavBar } from '../components/BottomNavBar';
import { ScreenId } from '../types/navigation';
import { RECENT_SEARCHES, CMU_BUILDINGS } from '../data/campusData';

interface HomeScreenProps {
  onSearch: (query: string) => void;
  onNavigateScreen: (screen: ScreenId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSearch,
  onNavigateScreen,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [recentList, setRecentList] = useState(RECENT_SEARCHES);
  const [isListening, setIsListening] = useState(false);
  


  // Compute search results based on input
  const searchResults = searchInput.trim() === '' ? [] : CMU_BUILDINGS.filter(b => 
    b.name.toLowerCase().includes(searchInput.toLowerCase()) || 
    b.code.toLowerCase().includes(searchInput.toLowerCase()) ||
    (b.nameTh && b.nameTh.includes(searchInput)) ||
    (b.aliases && b.aliases.some(a => a.toLowerCase().includes(searchInput.toLowerCase())))
  ).slice(0, 5); // Limit to top 5 results

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() === '') {
      return; // Do nothing if search input is empty
    }
    if (searchResults.length > 0) {
      // Pass the typed input if they hit submit, or the best match's name if they were just typing a partial code
      onSearch(searchInput.trim());
    } else {
      onSearch(searchInput.trim());
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setSearchInput('Research Building 5 (RB5)...');
    setTimeout(() => {
      setIsListening(false);
      setSearchInput('RB5');
      onSearch('RB5');
    }, 1200);
  };

  const handleClearRecent = () => {
    setRecentList([]);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-canvas" data-purpose="stage-2-home-screen">
      {/* ======================================================== */}
      {/* LOCKED TOP HEADER (Fixed at top, does NOT scroll away)  */}
      {/* ======================================================== */}
      <header className="shrink-0 z-30 bg-surface/95 backdrop-blur-md border-b border-brand-100/50 shadow-soft">
        {/* Top iOS Status Bar with iPhone 15 Pro Max Dynamic Island */}
        <StatusBar theme="dark" />

        {/* Locked Brand Greeting & Weather Bar */}
        <div className="px-5 pt-3 pb-3 space-y-3">
          <section className="flex items-start justify-between" data-purpose="heading-section">
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 shadow-sm">
                  <span className="w-3.5 h-3.5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Search</span>
                </div>
                <div className="w-2 border-b-2 border-dotted border-slate-300"></div>
                <div className="flex items-center gap-1 px-1 opacity-50 grayscale">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold">2</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Route</span>
                </div>
                <div className="w-2 border-b-2 border-dotted border-slate-300"></div>
                <div className="flex items-center gap-1 px-1 opacity-50 grayscale">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold">3</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Go</span>
                </div>
              </div>
              <h1 className="text-[25px] leading-tight font-extrabold text-slate-900 tracking-tight mt-0.5">
                Where are you<br />headed?
              </h1>
            </div>

            {/* Weather & Campus Condition Widget */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-100 rounded-full shadow-soft backdrop-blur-md cursor-pointer hover:border-brand-200 transition"
              title="Campus weather condition: 22°C Partly cloudy"
            >
              <span className="material-symbols-outlined text-[17px] text-amber-500">
                partly_cloudy_day
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-800 leading-none">22°C</span>
                <span className="text-[9px] font-medium text-slate-400 leading-tight">Partly cloudy</span>
              </div>
            </div>
          </section>

          {/* Locked Search Input Bar (Always accessible at top) */}
          <section data-purpose="search-box-container">
            <form onSubmit={handleSearchSubmit} className="group relative flex items-center bg-white rounded-3xl p-3 shadow-card border border-brand-100/90 transition-all focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mr-3 shrink-0">
                <svg className="w-5 h-5 text-brand-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Room / Building / Course (e.g. RB5 204)"
                  className="w-full text-[13.5px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                />
                <p className="text-[10px] text-brand-700/70 font-medium tracking-tight mt-0.5 truncate">
                  Supports abbreviations, course codes, and building nicknames
                </p>
              </div>

              <button
                type="submit"
                disabled={!searchInput.trim()}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ml-2 shrink-0 transition-all ${
                  searchInput.trim()
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand/20 shadow-lg active:scale-95'
                    : 'bg-slate-100 text-slate-400 shadow-none'
                }`}
                title="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          </section>
        </div>
      </header>

      {/* Main Scrollable Content (Scrolls smoothly underneath the locked top section) */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-4 space-y-5">

        {/* Search Results / Recent Searches Section */}
        <section data-purpose="search-results">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {searchInput.trim() ? 'Search Results' : 'Recent searches'}
            </h2>
            {!searchInput.trim() && recentList.length > 0 && (
              <button
                onClick={handleClearRecent}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-brand-100/80 shadow-soft overflow-hidden divide-y divide-slate-100">
            {searchInput.trim() ? (
              searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No places found matching "{searchInput}".
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSearch(item.name)}
                    className="flex items-center justify-between p-3.5 hover:bg-brand-50/50 cursor-pointer transition active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-2xl bg-brand-50/90 flex items-center justify-center shrink-0 text-brand-600">
                        <span className="material-symbols-outlined text-[20px]">
                          {item.category === 'faculty' ? 'school' : 'location_on'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-extrabold text-slate-900 tracking-tight leading-snug truncate">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {item.code}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : recentList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Recent searches cleared. Try searching for a building or room above.
              </div>
            ) : (
              recentList.map((item) => (
                <div
                  key={item.code}
                  onClick={() => onSearch(item.code)}
                  className="flex items-center justify-between p-3.5 hover:bg-brand-50/50 cursor-pointer transition active:scale-[0.99]"
                  data-purpose="search-item"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-2xl bg-brand-50/90 flex items-center justify-center shrink-0 text-brand-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-extrabold text-slate-900 tracking-tight leading-snug">
                          {item.code}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                        {item.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-2">
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Persistent 3-Tab Bottom Navigation Bar */}
      <BottomNavBar
        currentTab="home"
        onSelectTab={(tab) => {
          if (tab === 'profile') onNavigateScreen('profile');
          if (tab === 'map') onNavigateScreen('route-preview');
        }}
        onNavigateScreen={onNavigateScreen}
      />
    </div>
  );
};
