import React, { useState, useEffect } from 'react';
import { StatusBar } from '../components/StatusBar';
import { BottomNavBar } from '../components/BottomNavBar';
import { ScreenId, RoomInfo, BuildingInfo } from '../types/navigation';
import { CMU_BUILDINGS, RB5_BUILDING } from '../data/campusData';

interface SearchResultsScreenProps {
  searchQuery: string;
  onBack: () => void;
  onSelectDestination: (room: RoomInfo | null, building?: BuildingInfo) => void;
  onNavigateScreen: (screen: ScreenId) => void;
  onOptionsClick?: () => void;
}

export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  searchQuery,
  onBack,
  onSelectDestination,
  onNavigateScreen,
  onOptionsClick,
}) => {
  const [currentQuery, setCurrentQuery] = useState(searchQuery || 'RB5');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>(2);

  // Sync when prop changes
  useEffect(() => {
    if (searchQuery) {
      setCurrentQuery(searchQuery);
    }
  }, [searchQuery]);

  // Find best match building based on query
  const qLower = (currentQuery || '').toLowerCase().trim();
  
  // Custom logic to match aliases, building name, room codes
  const bestMatchs: BuildingInfo[] = CMU_BUILDINGS.filter((b) => {
    if (!qLower) return false;
    const matchBuilding = b.code.toLowerCase().includes(qLower) ||
      b.name.toLowerCase().includes(qLower) ||
      (b.nameTh && b.nameTh.toLowerCase().includes(qLower)) ||
      b.faculty.toLowerCase().includes(qLower) ||
      (b.aliases && b.aliases.some(alias => alias.toLowerCase().includes(qLower) || qLower.includes(alias.toLowerCase())));
      
    const matchRoom = b.rooms.some(r => r.code.toLowerCase().includes(qLower) || r.name.toLowerCase().includes(qLower));
    
    return matchBuilding || matchRoom;
  });

  const hasResults = bestMatchs.length > 0;
  const bestMatch = bestMatchs[0];

  // Selected room inside the matched building
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);

  // Keep selectedRoom valid when bestMatch changes
  useEffect(() => {
    if (bestMatch && bestMatch.rooms.length > 0) {
      const targetRoomMatch = bestMatch.rooms.find(r => r.code.toLowerCase().includes(qLower) || r.name.toLowerCase().includes(qLower));
      const target = targetRoomMatch || bestMatch.rooms.find((r) => r.isTarget) || bestMatch.rooms[0];
      setSelectedRoom(target);
    } else {
      setSelectedRoom(null);
    }
  }, [bestMatch, qLower]);

  const filteredRooms = bestMatch ? (
    selectedFloor === 'all'
      ? bestMatch.rooms
      : bestMatch.rooms.filter((r) => r.floor === selectedFloor)
  ) : [];

  // Other search results
  const otherBuildings = hasResults ? bestMatchs.slice(1) : [];

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[var(--bg)]" data-purpose="search-results-screen">
      {/* ======================================================== */}
      {/* LOCKED TOP HEADER (Fixed at top, does NOT scroll away)  */}
      {/* ======================================================== */}
      <header className="shrink-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--primary-soft)]/60 shadow-[0_4px_20px_rgba(43,77,54,0.04)]">
        {/* Top iOS Status Bar with safe Dynamic Island clearance */}
        <StatusBar theme="dark" />

        <div className="px-5 pt-3 pb-3 space-y-3">
          {/* Top Search Navigation Bar with Back, Title, Filter */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              aria-label="Back"
              className="w-10 h-10 rounded-full bg-white border border-brand-100/80 flex items-center justify-center text-slate-700 shadow-soft active:scale-95 transition cursor-pointer hover:bg-canvas"
            >
              <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 shadow-sm">
                  <span className="w-3.5 h-3.5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Search</span>
                </div>
                <div className="w-1.5 border-b-2 border-dotted border-slate-300"></div>
                <div className="flex items-center gap-1 px-1 opacity-50 grayscale">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold">2</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Route</span>
                </div>
                <div className="w-1.5 border-b-2 border-dotted border-slate-300"></div>
                <div className="flex items-center gap-1 px-1 opacity-50 grayscale">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold">3</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Go</span>
                </div>
              </div>
              <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">Search results</h1>
            </div>

            <button
              onClick={onOptionsClick}
              aria-label="Filter options"
              className="w-10 h-10 rounded-full bg-white border border-brand-100/80 flex items-center justify-center text-slate-700 shadow-soft active:scale-95 transition cursor-pointer hover:bg-canvas"
            >
              <svg className="w-4.5 h-4.5 text-brand-600 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Active Search Input Box */}
          <div className="relative flex items-center bg-white rounded-3xl border border-[var(--primary-soft)] shadow-search px-3.5 py-3 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <svg className="w-4.5 h-4.5 text-brand-600 shrink-0 mr-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              className="w-full p-0 text-[14px] font-semibold border-0 text-slate-900 focus:ring-0 focus:outline-none bg-transparent"
              placeholder="Search building or room code"
            />
            {currentQuery && (
              <button
                type="button"
                onClick={() => setCurrentQuery('')}
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Clear query"
              >
                <svg className="w-3 h-3 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-4 space-y-4">
        {/* Results Meta Count Row with Dots Indicator */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-[14px] font-bold text-slate-900 tracking-tight leading-snug">
              Results for “{currentQuery}”
            </h2>
            <p className="text-[11.5px] text-slate-500 font-medium">
              {hasResults ? 'Found in Chiang Mai University' : 'No Results Found'}
            </p>
          </div>
          {/* Page Dots Indicator */}
          {hasResults && (
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-1.5 rounded-full bg-brand-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          )}
        </div>

        {!hasResults ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-slate-500 text-sm font-medium text-center">
              No buildings or rooms found.<br/>Try popular searches below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <button onClick={() => setCurrentQuery('RB5')} className="px-4 py-2 bg-[var(--primary-soft)] text-[var(--primary-dark)] rounded-full text-xs font-bold shadow-soft">RB5</button>
              <button onClick={() => setCurrentQuery('Student Hub')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold shadow-soft">Student Hub</button>
              <button onClick={() => setCurrentQuery('Library')} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold shadow-soft">Library</button>
            </div>
          </div>
        ) : (
          <>
            {/* BEST MATCH BUILDING CARD */}
            <section className="bg-white rounded-3xl border border-[var(--primary-soft)]/80 shadow-soft overflow-hidden p-4 space-y-3.5" data-purpose="best-match-card">
              {/* Best Match Header Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                    {bestMatch.code}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {bestMatch.cmuNumber ? `CMU #${bestMatch.cmuNumber}` : 'Building'}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50/90 border border-brand-100 px-2.5 py-0.5 rounded-full shadow-soft">
                  BEST MATCH
                </span>
              </div>

          {/* Campus Building Thumbnail Image */}
          <div className="w-full h-36 rounded-2xl overflow-hidden relative border border-slate-100 group">
            <img
              src={bestMatch.imageUrl}
              alt={bestMatch.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-2.5 left-2.5 bg-slate-900/75 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10.5px] font-semibold flex items-center space-x-1.5 shadow-soft">
              <svg className="w-3 h-3 text-[var(--primary-soft)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>{bestMatch.zone}</span>
            </div>
          </div>

          {/* Building Details */}
          <div className="space-y-1">
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
              {bestMatch.name}
            </h3>
            {bestMatch.nameTh && (
              <p className="text-[12px] font-semibold text-brand-700">
                {bestMatch.nameTh}
              </p>
            )}
            <p className="text-[11.5px] font-medium text-slate-500">
              {bestMatch.faculty}
            </p>
            <div className="flex items-center space-x-2 pt-0.5 text-[11.5px] font-semibold text-brand-700">
              <svg className="w-3.5 h-3.5 text-brand-600 shrink-0 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.313a2.25 2.25 0 0 0-2.006 0L2.622 5.75c-.381.19-.622.58-.622 1.006v11.722c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.997 2.498a2.25 2.25 0 0 0 2.006 0Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{bestMatch.distance} • {bestMatch.walkTime} walk</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">
                {bestMatch.elevatorsAvailable ? 'Elevator Available' : 'Stairs Only'}
              </span>
            </div>
          </div>

          {/* Directions CTA Button */}
          <button
            onClick={() => {
              onSelectDestination(selectedRoom, bestMatch);
              onNavigateScreen('starting-point');
            }}
            className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white py-3 rounded-2xl font-bold text-[13.5px] flex items-center justify-center space-x-2 shadow-soft transition cursor-pointer"
          >
            <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Get Directions</span>
          </button>
        </section>

        {/* SELECT ROOM INSIDE BUILDING SECTION */}
        {bestMatch.rooms.length > 0 && (
          <section className="bg-white rounded-3xl border border-[var(--primary-soft)] shadow-soft p-4 space-y-3.5" data-purpose="select-room-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                  <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 tracking-tight leading-snug">
                    Select Room
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-medium">
                    Select room in building {bestMatch.code}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100/80">
                Indoor Directory
              </span>
            </div>

            {/* Floor Selector Segmented Control */}
            <div className="flex items-center bg-[var(--surface-soft)] p-1 rounded-2xl border border-[var(--primary-soft)]/50 space-x-1 text-[11px] font-semibold overflow-x-auto no-scrollbar snap-x">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`flex-1 min-w-[70px] shrink-0 py-1.5 rounded-lg transition text-center cursor-pointer snap-center ${
                  selectedFloor === 'all'
                    ? 'bg-brand-600 text-white shadow-soft font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              {bestMatch.floors.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`flex-1 min-w-[70px] shrink-0 py-1.5 rounded-lg transition text-center cursor-pointer snap-center ${
                    selectedFloor === fl
                      ? 'bg-brand-600 text-white shadow-soft font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Floor {fl}
                </button>
              ))}
            </div>

            {/* Selected Room Banner */}
            {selectedRoom && (
              <div className="bg-brand-50/90 border border-brand-100 rounded-2xl p-2.5 flex items-center justify-between text-[11.5px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  <div>
                    <span className="font-bold text-brand-700">
                      Selected: Room {selectedRoom.code} (Level {selectedRoom.floor})
                    </span>
                    <p className="text-[10px] text-slate-500">Direct indoor navigation route ready</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onSelectDestination(selectedRoom, bestMatch);
                    onNavigateScreen('route-preview');
                  }}
                  className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-soft transition flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <span>Navigate</span>
                  <svg className="w-3 h-3 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Room Chips Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">
                  Floor {selectedFloor === 'all' ? 'All' : selectedFloor}
                </span>
                <span className="text-[10px] text-slate-400">{filteredRooms.length} rooms</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {filteredRooms.map((room) => {
                  const isCurrentTarget = selectedRoom?.code === room.code;
                  return (
                    <div
                      key={room.code}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-2.5 rounded-2xl transition flex flex-col justify-between space-y-1 cursor-pointer ${
                        isCurrentTarget
                          ? 'border-2 border-brand-600 bg-brand-50/90 shadow-soft relative'
                          : 'border border-slate-100 bg-[var(--surface-soft)] hover:border-brand-200 hover:bg-brand-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span
                            className={`text-[12px] font-extrabold ${
                              isCurrentTarget ? 'text-brand-700' : 'text-slate-800'
                            }`}
                          >
                            {room.code}
                          </span>
                          {isCurrentTarget && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          )}
                        </div>
                        {room.isTarget ? (
                          <span className="text-[9px] font-extrabold uppercase tracking-wide text-brand-700 bg-brand-100 px-1 py-0.2 rounded">
                            TARGET
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-slate-400 font-medium truncate max-w-[70px]">
                            {room.wing}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[10.5px] truncate ${
                          isCurrentTarget ? 'text-brand-700 font-bold' : 'text-slate-600 font-medium'
                        }`}
                      >
                        {room.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* OTHER CMU BUILDINGS SECTION */}
        <section className="space-y-2.5 pb-2">
          <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">
            Other Campus Buildings (Other Campus Buildings)
          </h3>

          <div className="space-y-2.5">
            {otherBuildings.slice(0, 4).map((bldg) => (
              <div
                key={bldg.id}
                onClick={() => {
                  onSelectDestination(bldg.rooms[0] || null, bldg);
                  onNavigateScreen('route-preview');
                }}
                className="bg-white rounded-3xl border border-[var(--primary-soft)]/40 shadow-soft p-3.5 space-y-2 hover:bg-[var(--surface-soft)] cursor-pointer transition active:scale-[0.99]"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50/90 border border-brand-100 flex items-center justify-center shrink-0 text-brand-600 mt-0.5 font-bold text-xs">
                    {bldg.code.slice(0, 4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded">
                        {bldg.code}
                      </span>
                      {bldg.cmuNumber && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          #{bldg.cmuNumber}
                        </span>
                      )}
                    </div>
                    <h4 className="text-[13.5px] font-bold text-slate-800 tracking-tight leading-snug mt-0.5 truncate">
                      {bldg.name}
                    </h4>
                    {bldg.nameTh && (
                      <p className="text-[11px] text-brand-700 font-medium truncate">
                        {bldg.nameTh}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                      <svg className="w-3 h-3 text-brand-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd" />
                      </svg>
                      <span>{bldg.zone} • {bldg.distance}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{bldg.hours}</span>
                  </span>
                  <span className="text-brand-600 font-bold hover:text-brand-700 flex items-center space-x-0.5">
                    Navigate to this building ›
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
          </>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNavBar
        currentTab="home"
        onSelectTab={(tab) => {
          if (tab === 'home') onNavigateScreen('home');
          if (tab === 'profile') onNavigateScreen('profile');
          if (tab === 'map') onNavigateScreen('route-preview');
        }}
        onNavigateScreen={onNavigateScreen}
      />
    </div>
  );
};
