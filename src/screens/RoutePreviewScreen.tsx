import React, { useState } from 'react';
import { StatusBar } from '../components/StatusBar';
import { CampusVectorMap } from '../components/CampusVectorMap';
import { ScreenId, TravelMode, BuildingInfo } from '../types/navigation';
import { getRouteForDestination } from '../data/routes/campusRoutes';

interface RoutePreviewScreenProps {
  origin: string;
  destinationName: string;
  onBack: () => void;
  onStartNavigation: (mode: TravelMode) => void;
  onNavigateScreen: (screen: ScreenId) => void;
  onOptionsClick?: () => void;
  targetBuilding?: BuildingInfo | null;
  userLocation?: { lat: number; lng: number };
}

export const RoutePreviewScreen: React.FC<RoutePreviewScreenProps> = ({
  origin = 'วิทยาลัยศิลปะ สื่อและเทคโนโลยี (CAMT)',
  destinationName = 'Research Building 5 (RB5)',
  onBack,
  onStartNavigation,
  onNavigateScreen,
  onOptionsClick,
  targetBuilding,
  userLocation,
}) => {
  const [activeMode, setActiveMode] = useState<TravelMode>('walk');
  const [stepFreeRoute, setStepFreeRoute] = useState(true);

  const activeRoute = getRouteForDestination(targetBuilding);
  const durationMins = activeRoute.summary?.durationMinutes || Math.round(activeRoute.durationS / 60) || 5;
  const distanceStr = activeRoute.summary?.distanceText || `${activeRoute.distanceM} m`;

  // Clearly differentiated campus student modes (NOT ride-hailing / Grab style)
  const modeDetails: Record<
    TravelMode,
    { title: string; time: string; distance: string; badge: string; desc: string; icon: React.ReactNode }
  > = {
    walk: {
      title: 'Walk (Recommended)',
      time: `${durationMins} mins`,
      distance: distanceStr,
      badge: 'Step-free',
      desc: 'Calculated based on average walking speed 4.5 km/h',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 320 512">
          <path d="M160 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM126.5 199.3c-1 .4-1.9 .8-2.9 1.2l-8 3.5c-16.4 7.3-29 21.2-34.7 38.2l-2.6 7.8c-5.6 16.8-23.7 25.8-40.5 20.2s-25.8-23.7-20.2-40.5l2.6-7.8c11.4-34.1 36.6-61.9 69.4-76.5l8-3.5c20.8-9.2 43.3-14 66.1-14c44.6 0 84.8 26.8 101.9 67.9L281 232.7l21.4 10.7c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3L247 287.3c-10.3-5.2-18.4-13.8-22.8-24.5l-9.6-23-19.3 65.5 49.5 54c5.4 5.9 9.2 13 11.2 20.8l23 92.1c4.3 17.1-6.1 34.5-23.3 38.8s-34.5-6.1-38.8-23.3l-22-88.1-70.7-77.1c-14.8-16.1-20.3-38.6-14.7-59.7l16.9-63.5zM68.7 398l25-62.4c2.1 3 4.5 5.8 7 8.6l40.7 44.4-14.5 36.2c-2.4 6-6 11.5-10.6 16.1L54.6 502.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L68.7 398z"/>
        </svg>
      ),
    },
    bus: {
      title: 'CMU Shuttle Bus Line 1 (รถม่วง มช. สาย 1)',
      time: '11 mins',
      distance: 'เดิน 220 ม. · รถบัส 480 ม.',
      badge: 'จุดจอดใกล้สุด: ป้าย อ.มช. (110 ม.)',
      desc: 'ขึ้นที่ป้ายสหกรณ์ มช. → ลงป้าย อ.มช. (ใกล้ RB5 ที่สุด) → เดิน 110 ม. ถึงตึก',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 576 512">
          <path d="M288 0C422.4 0 512 35.2 512 80V96l0 32c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32l0 160c0 17.7-14.3 32-32 32v32c0 17.7-14.3 32-32 32H416c-17.7 0-32-14.3-32-32V448H192v32c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32l0-32c-17.7 0-32-14.3-32-32l0-160c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h0V96h0V80C64 35.2 153.6 0 288 0zM128 160v96c0 17.7 14.3 32 32 32H272V128H160c-17.7 0-32 14.3-32 32zM304 288H416c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32H304V288zM144 400a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm288 0a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM384 80c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16s7.2 16 16 16H368c8.8 0 16-7.2 16-16z"/>
        </svg>
      ),
    },
    motorbike: {
      title: 'Motorbike',
      time: '4 mins',
      distance: '1.1 km',
      badge: 'Parking Lot C',
      desc: 'Park at motorbike lot near RB5, walk 40m',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 640 512">
          <path d="M280 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h57.7l16.4 30.3L256 192l-45.3-45.3c-12-12-28.3-18.7-45.3-18.7H64c-17.7 0-32 14.3-32 32v32h96c88.4 0 160 71.6 160 160c0 11-1.1 21.7-3.2 32h70.4c-2.1-10.3-3.2-21-3.2-32c0-52.2 25-98.6 63.7-127.8l15.4 28.6C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L418.2 128H480c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H459.6c-7.5 0-14.7 2.6-20.5 7.4L391.7 78.9l-14-26c-7-12.9-20.5-21-35.2-21H280zM462.7 311.2l28.2 52.2c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-28.2-52.2c2.3-.3 4.7-.4 7.1-.4c35.3 0 64 28.7 64 64s-28.7 64-64 64s-64-28.7-64-64c0-15.5 5.5-29.7 14.7-40.8zM187.3 376c-9.5 23.5-32.5 40-59.3 40c-35.3 0-64-28.7-64-64s28.7-64 64-64c26.9 0 49.9 16.5 59.3 40h66.4C242.5 268.8 190.5 224 128 224C57.3 224 0 281.3 0 352s57.3 128 128 128c62.5 0 114.5-44.8 125.8-104H187.3zM128 384a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/>
        </svg>
      ),
    },
    car: {
      title: 'Car',
      time: '5 mins',
      distance: '1.2 km',
      badge: 'Parking P2',
      desc: 'Park at Science Faculty parking lot',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
          <path d="M192 0c-17.7 0-32 14.3-32 32V64c0 .1 0 .1 0 .2c-38.6 2.2-72.3 27.3-85.2 64.1L39.6 228.8C16.4 238.4 0 261.3 0 288V432v48c0 17.7 14.3 32 32 32H64c17.7 0 32-14.3 32-32V432H416v48c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V432 288c0-26.7-16.4-49.6-39.6-59.2L437.2 128.3c-12.9-36.8-46.6-62-85.2-64.1c0-.1 0-.1 0-.2V32c0-17.7-14.3-32-32-32H192zM165.4 128H346.6c13.6 0 25.7 8.6 30.2 21.4L402.9 224H109.1l26.1-74.6c4.5-12.8 16.6-21.4 30.2-21.4zM96 288a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm288 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
        </svg>
      ),
    },
  };

  const currentDetail = modeDetails[activeMode];

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-canvas select-none"
      data-purpose="route-preview-screen"
    >
      {/* Interactive Campus Vector Map Background */}
      <CampusVectorMap
        showRoute={true}
        routeType="active-glow"
        travelMode={activeMode}
        showLayersControl={true}
        showCompassControl={true}
        targetBuilding={targetBuilding}
        userLocation={userLocation}
      />

      {/* Top Header Bar */}
      <header className="shrink-0 z-30 bg-white/85 backdrop-blur-md pb-2.5 border-b border-brand-100/40 shadow-soft">
        <StatusBar theme="dark" />

        <nav className="px-5 pt-1.5 flex items-center justify-between pointer-events-auto">
          {/* Back Circular Button */}
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-white shadow-soft border border-slate-200/80 flex items-center justify-center text-slate-700 active:scale-95 transition cursor-pointer"
            type="button"
          >
            <svg className="w-5 h-5 -ml-0.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Center Title */}
          <div className="text-center flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center gap-1 px-1 opacity-60">
                <span className="w-3 h-3 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[8px] font-bold">1</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-brand-600">Search</span>
              </div>
              <div className="w-1 border-b-2 border-dotted border-brand-300"></div>
              <div className="flex items-center gap-1 bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full border border-brand-200 shadow-sm">
                <span className="w-3 h-3 rounded-full bg-brand-600 text-white flex items-center justify-center text-[8px] font-bold">2</span>
                <span className="text-[8px] font-bold uppercase tracking-wider">Route</span>
              </div>
              <div className="w-1 border-b-2 border-dotted border-slate-300"></div>
              <div className="flex items-center gap-1 px-1 opacity-50 grayscale">
                <span className="w-3 h-3 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-bold">3</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Go</span>
              </div>
            </div>
            <h1 className="text-[15px] font-extrabold text-slate-800 tracking-tight leading-none">
              Recommended route
            </h1>
          </div>

          {/* Options / Help */}
          <button
            onClick={onOptionsClick}
            aria-label="Options"
            className="w-10 h-10 rounded-full bg-white shadow-soft border border-slate-200/80 flex items-center justify-center text-slate-700 active:scale-95 transition cursor-pointer"
            type="button"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Spacer to expose map area */}
      <div className="flex-1 pointer-events-none" />

      {/* Bottom Route Setup Sheet (Decluttered, Top-to-Bottom Logical Order per Pun & Namo) */}
      <section
        className="relative z-30 bg-white rounded-t-[34px] shadow-[0_-12px_40px_rgba(20,25,45,0.14)] px-5 pt-3 pb-3 flex flex-col pointer-events-auto border-t border-brand-100/50 space-y-3"
        data-purpose="route-details-bottom-sheet"
      >
        {/* Top Center Drag Indicator Bar */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto" />

        {/* 1. Origin & Destination Card (Top-to-bottom sequence) */}
        <div className="bg-surface-soft border border-brand-100 rounded-3xl p-2.5 space-y-2">
          {/* Origin (Auto GPS) */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Starting Point (Current GPS)
                </span>
                <span className="font-bold text-slate-800 truncate block">
                  {origin}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateScreen('starting-point')}
              className="text-[11px] font-bold text-brand-600 hover:underline px-2 py-1 rounded-lg bg-white border border-brand-100 shrink-0 cursor-pointer"
            >
              Change Point
            </button>
          </div>

          <div className="h-[1px] bg-brand-100/60 ml-4" />

          {/* Destination */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 ring-2 ring-brand-200 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-brand-600 font-bold block uppercase">
                Destination (Classroom)
              </span>
              <span className="font-extrabold text-slate-900 truncate block">
                {destinationName} • Room 204 (Level 2)
              </span>
            </div>
          </div>
        </div>

        {/* 2. Campus Transport Mode Chips (Clearly Student-focused, NOT Ride-hailing) */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-0.5">
            Travel Modes in CMU
          </span>
          <div className="grid grid-cols-4 gap-1.5" data-purpose="mode-selector">
            {(['walk', 'bus', 'motorbike', 'car'] as TravelMode[]).map((m) => {
              const detail = modeDetails[m];
              const isSelected = activeMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveMode(m)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-glow border-brand-600'
                      : 'bg-white border-slate-200/70 text-slate-600 hover:bg-canvas'
                  }`}
                >
                  <div className={`mb-1 flex items-center justify-center ${isSelected ? 'text-white' : 'text-slate-500'}`}>{detail.icon}</div>
                  <span className={`text-[10.5px] leading-tight font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {detail.title.split(' ')[0]}
                  </span>
                  <span className={`text-[9.5px] font-medium ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                    {detail.time}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Travel Time & Walking Calculation Basis (Solves Namo's pace doubt) */}
        <div className="bg-canvas border border-slate-200/80 rounded-3xl p-2.5 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[9.5px] font-bold text-slate-400 uppercase block">
                Distance & Time
              </span>
              <span className="text-lg font-black text-slate-900 leading-tight">
                {currentDetail.distance} · <span className="text-brand-600">{currentDetail.time}</span>
              </span>
            </div>
          </div>

          {/* Walking Criteria Explanation */}
          <div className="text-right max-w-[170px]">
            <span className="inline-block text-[10px] font-bold text-[var(--primary-dark)] bg-[var(--primary-soft)] px-2 py-0.5 rounded-full mb-0.5">
              {currentDetail.badge}
            </span>
            <p className="text-[9.5px] text-slate-500 font-medium leading-tight">
              {currentDetail.desc}
            </p>
          </div>
        </div>

        {/* 4. Sequential Landmark Waypoints Preview */}
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-500">
          <span>{activeMode === 'bus' ? 'Bus stops & Route:' : 'Landmarks along route:'}</span>
          <span className="text-brand-700 font-bold truncate max-w-[230px]" title={
            activeMode === 'bus'
              ? '1. ป้ายสหกรณ์ (110ม.) → 2. รถบัสสาย 1 → 3. ลงป้าย อ.มช. (ใกล้สุด) → 4. เดินเข้าตึก'
              : (activeRoute.checkpoints && activeRoute.checkpoints.length > 0
                  ? activeRoute.checkpoints.map((cp, idx) => `${idx + 1}. ${cp.nameTh || cp.name}`).join(' → ')
                  : '1. Library Walk → 2. Sculpture Court → 3. RB5 Plaza')
          }>
            {activeMode === 'bus'
              ? '1. ป้ายสหกรณ์ (110ม.) → 2. รถบัสสาย 1 → 3. ลงป้าย อ.มช. (ใกล้สุด) → 4. เดินเข้าตึก'
              : (activeRoute.checkpoints && activeRoute.checkpoints.length > 0
                  ? activeRoute.checkpoints.map((cp, idx) => `${idx + 1}. ${cp.nameTh || cp.name}`).join(' → ')
                  : '1. Library Walk → 2. Sculpture Court → 3. RB5 Plaza')}
          </span>
        </div>

        {/* 5. Primary Big CTA (Bold, Salient, Uncluttered per Pun & Namo) */}
        <button
          onClick={() => onStartNavigation(activeMode)}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white rounded-3xl font-black text-[15px] tracking-wide shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
          data-purpose="start-navigation-cta"
          type="button"
        >
          <span>Start Navigation</span>
          <svg className="w-4.5 h-4.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* iOS Home Indicator Bar */}
        <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto" />
      </section>
    </div>
  );
};
