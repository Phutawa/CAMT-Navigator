import React, { useState } from 'react';
import { StatusBar } from '../components/StatusBar';
import { CampusVectorMap } from '../components/CampusVectorMap';
import { ScreenId, BuildingInfo, TravelMode } from '../types/navigation';
import { VISUAL_CHECKPOINTS, CAMPUS_IMAGES } from '../data/campusData';
import { getRouteForDestination } from '../data/routes/campusRoutes';

interface OutdoorNavScreenProps {
  onCheckpointReached: () => void;
  onOpenLostModal: () => void;
  onExitNavigation: () => void;
  onNavigateScreen: (screen: ScreenId) => void;
  targetBuilding?: BuildingInfo | null;
  userLocation?: { lat: number; lng: number };
  travelMode?: TravelMode;
}

const BUS_CHECKPOINTS = [
  {
    id: 'bus-cp1',
    number: 1,
    title: 'จุดขึ้นรถ: ป้ายสหกรณ์ มช.',
    description: 'เดิน 110 ม. จาก CAMT ไปรอขึ้นรถบัส มช. สาย 1',
    distanceAhead: '110 m',
    instruction: 'เดินตรงไปขึ้นรถที่\nป้ายสหกรณ์ มช.',
    imageUrl: CAMPUS_IMAGES.libraryWalk,
    status: 'active',
  },
  {
    id: 'bus-cp2',
    number: 2,
    title: 'รถชัทเทิลบัส มช. สาย 1',
    description: 'นั่งรถบัสวิ่งตามถนนหลัก มุ่งหน้าไปลงที่ป้าย อ.มช.',
    distanceAhead: '480 m',
    instruction: 'นั่งรถบัส มช. สาย 1\nไปลงที่ป้าย อ.มช.',
    imageUrl: CAMPUS_IMAGES.northQuad,
    status: 'upcoming',
  },
  {
    id: 'bus-cp3',
    number: 3,
    title: 'จุดจอดใกล้สุด: ป้าย อ.มช.',
    description: 'ลงรถที่ป้าย อ.มช. แล้วเดิน 110 ม. เข้าอาคารวิจัย 5',
    distanceAhead: '110 m',
    instruction: 'ลงที่ป้าย อ.มช.\nเดิน 110 ม. เข้าตึก RB5',
    imageUrl: CAMPUS_IMAGES.rb5Plaza,
    status: 'goal',
  },
];

export const OutdoorNavScreen: React.FC<OutdoorNavScreenProps> = ({
  onCheckpointReached,
  onOpenLostModal,
  onExitNavigation,
  onNavigateScreen,
  targetBuilding,
  userLocation,
  travelMode = 'walk',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeRoute = getRouteForDestination(targetBuilding);
  const isBus = travelMode === 'bus';
  const checkpointsList = isBus ? BUS_CHECKPOINTS : (activeRoute.checkpoints && activeRoute.checkpoints.length >= 3 ? activeRoute.checkpoints.map((cp, i) => ({
    id: cp.id,
    number: i + 1,
    title: cp.nameTh || cp.name,
    description: `มุ่งหน้าไปตามทางเดินสู่ ${cp.nameTh || cp.name}`,
    distanceAhead: `${Math.round(activeRoute.distanceM / 3)} m`,
    imageUrl: i === 0 ? CAMPUS_IMAGES.libraryWalk : (i === 1 ? CAMPUS_IMAGES.northQuad : CAMPUS_IMAGES.rb5Plaza),
    status: (i === 0 ? 'active' : (i === 1 ? 'upcoming' : 'goal')) as any,
  })) : VISUAL_CHECKPOINTS);

  const activeCheckpoint = checkpointsList[activeStepIndex] || checkpointsList[0];

  // Dynamic remaining metrics along route
  const totalDist = isBus ? 700 : (activeRoute.distanceM || 303);
  const remainingDist = isBus
    ? (activeStepIndex === 0 ? 700 : activeStepIndex === 1 ? 590 : 110)
    : (activeStepIndex === 0 ? totalDist : activeStepIndex === 1 ? Math.round(totalDist * 0.6) : Math.max(25, Math.round(totalDist * 0.2)));
  const remainingMins = isBus
    ? (activeStepIndex === 0 ? 11 : activeStepIndex === 1 ? 7 : 2)
    : Math.max(1, Math.ceil((remainingDist / totalDist) * (activeRoute.summary?.durationMinutes || 5)));

  const handleNextStep = () => {
    if (activeStepIndex < checkpointsList.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    } else {
      // All outdoor checkpoints cleared! Transition to Indoor Navigation!
      onCheckpointReached();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#EFEFF6] select-none" data-purpose="outdoor-nav-screen">
      {/* Background Vector Map with Interactive Layers, Pan & Zoom */}
      <CampusVectorMap
        showRoute={true}
        routeType="outdoor-turn"
        travelMode={travelMode}
        showLayersControl={true}
        showCompassControl={true}
        activeCheckpointIndex={activeStepIndex}
        targetBuilding={targetBuilding}
        userLocation={userLocation}
      />

      {/* Top Status Bar & Turn-by-Turn Instruction Banner */}
      <header className="relative z-20 w-full pt-1 px-5 flex flex-col items-center">
        <StatusBar theme="dark" navActive={true} />

        {/* Top App Workflow Stepper Pill (Clear frosted container so it never overlaps map text) */}
        <div className="flex items-center gap-1.5 mb-2.5 mt-2 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full shadow-md border border-slate-200/80 z-20">
          <div className="flex items-center gap-1 opacity-50">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">1</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Search</span>
          </div>
          <span className="text-slate-300 text-[10px]">›</span>
          <div className="flex items-center gap-1 opacity-50">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">2</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Route</span>
          </div>
          <span className="text-slate-300 text-[10px]">›</span>
          <div className="flex items-center gap-1.5 bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full border border-brand-300/80 shadow-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-black">3</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-brand-700">{isBus ? 'Bus Nav' : 'Outdoor Nav'}</span>
          </div>
        </div>

        {/* Turn-by-Turn Instruction Card */}
        <section className="w-full bg-primary-dark text-white rounded-[22px] p-4 shadow-nav-card border border-primary-dark/80" data-purpose="turn-by-turn-card">
          <div className="flex items-start justify-between">
            {/* Big Curved Arrow Squircle Box */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 p-2.5 bg-white/10 rounded-3xl flex items-center justify-center flex-shrink-0 border border-white/5">
                {isBus && activeStepIndex === 1 ? (
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 576 512">
                    <path d="M288 0C422.4 0 512 35.2 512 80V96l0 32c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32l0 160c0 17.7-14.3 32-32 32v32c0 17.7-14.3 32-32 32H416c-17.7 0-32-14.3-32-32V448H192v32c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32l0-32c-17.7 0-32-14.3-32-32l0-160c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h0V96h0V80C64 35.2 153.6 0 288 0zM128 160v96c0 17.7 14.3 32 32 32H272V128H160c-17.7 0-32 14.3-32 32zM304 288H416c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32H304V288zM144 400a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm288 0a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM384 80c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16s7.2 16 16 16H368c8.8 0 16-7.2 16-16z"/>
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M4 19v-6a4 4 0 0 1 4-4h10" />
                    <polyline points="14 5 18 9 14 13" />
                  </svg>
                )}
              </div>

              {/* Instruction Details */}
              <div className="flex flex-col">
                <span className="text-brand-100/90 text-[11px] font-medium tracking-wide uppercase">
                  {isBus
                    ? (activeStepIndex === 0 ? 'IN 110 M' : activeStepIndex === 1 ? 'IN 480 M' : 'IN 110 M')
                    : (activeStepIndex === 0 ? 'IN 80 M' : activeStepIndex === 1 ? 'IN 100 M' : 'IN 95 M')}
                </span>
                <h1 className="text-white text-[17px] font-bold leading-snug tracking-tight">
                  {isBus ? (
                    activeStepIndex === 0 ? (
                      <>เดินไปขึ้นรถที่<br />ป้ายสหกรณ์ มช.</>
                    ) : activeStepIndex === 1 ? (
                      <>นั่งรถบัส มช. สาย 1<br />ไปลงที่ป้าย อ.มช.</>
                    ) : (
                      <>ลงที่ป้าย อ.มช.<br />เดิน 110 ม. เข้าตึก RB5</>
                    )
                  ) : (
                    activeCheckpoint ? (
                      <>มุ่งหน้าสู่<br />{activeCheckpoint.title}</>
                    ) : (
                      <>เดินตรงไปตามทางเท้า</>
                    )
                  )}
                </h1>
              </div>
            </div>

            {/* High-Contrast Segmented Step Progress Indicator */}
            <div className="flex flex-col items-end gap-1.5 pt-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-white/15 px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
                Step {activeStepIndex + 1} of 3
              </span>
              <div 
                aria-label={`Route step ${activeStepIndex + 1} of 3`} 
                className="flex items-center gap-1.5"
              >
                {[0, 1, 2].map((idx) => {
                  const isActive = activeStepIndex === idx;
                  const isCompleted = idx < activeStepIndex;
                  return (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-7 bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]'
                          : isCompleted
                          ? 'w-3.5 bg-white/80'
                          : 'w-3.5 bg-white/30'
                      }`}
                      title={`Step ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Checkpoint Subtitle Information */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center text-[12px] text-brand-100/90">
            <span>
              {isBus ? 'Next step · ' : 'Next outdoor checkpoint · '}
              <strong className="font-semibold text-white">
                {isBus
                  ? (activeStepIndex === 0 ? 'ขึ้นรถบัส มช. สาย 1' : activeStepIndex === 1 ? 'จุดจอดใกล้สุด: ป้าย อ.มช.' : 'ประตูทางเข้าหลัก RB5')
                  : (checkpointsList[activeStepIndex + 1]?.title || targetBuilding?.nameTh || targetBuilding?.name || 'ประตูทางเข้าอาคาร')}
              </strong>
            </span>
          </div>
        </section>

        {/* Clean Route Direction Pill (Below the card to prevent overlap) */}
        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-slate-200/80 text-[11px] font-medium text-brand-700 pointer-events-none">
          <svg className="w-3 h-3 text-brand-600 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          </svg>
          <span>{isBus ? 'CMU Shuttle Bus to RB5 (ป้าย อ.มช.)' : `Follow route to ${targetBuilding?.nameTh || targetBuilding?.name || 'RB5'}`}</span>
        </div>
      </header>

      {/* Spacer to expose map */}
      <div className="flex-1 pointer-events-none" />

      {/* Bottom Controls & Trip Summary Sheet */}
      <footer className="relative z-20 w-full px-5 pb-3 flex flex-col items-center gap-2.5">
        {/* Visual Landmark Checkpoint Card */}
        <section className="w-full bg-white/95 backdrop-blur-md rounded-[24px] shadow-floating border border-brand-100/80 p-3.5 flex flex-col gap-2.5 transition-all" data-purpose="landmark-checkpoint-card">
          {/* Card Header & Checkpoint Stepper Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                {isBus ? 'BUS TRANSIT MILESTONE' : 'VISUAL LANDMARK CHECKPOINT'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {activeStepIndex + 1} of 3
            </span>
          </div>

          {/* Checkpoint 3-Step Thumbnail Progress Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-canvas rounded-2xl border border-slate-100">
            {checkpointsList.map((cp, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <div
                  key={cp.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`relative flex flex-col items-center p-1 rounded-lg cursor-pointer transition ${
                    isActive
                      ? 'bg-white shadow-soft border border-brand-500/30 ring-1 ring-brand-500/20'
                      : 'hover:bg-white/60 opacity-80'
                  }`}
                >
                  <div className="w-full h-9 rounded-md overflow-hidden relative bg-slate-100 flex items-center justify-center">
                    <img 
                      src={cp.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover absolute inset-0" 
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span className="text-sm select-none pointer-events-none">
                      {isBus ? (idx === 0 ? '🚏' : idx === 1 ? '🚌' : '🎓') : (idx === 0 ? '📚' : idx === 1 ? '🏛️' : '🎓')}
                    </span>
                    {isActive ? (
                      <span className="absolute bottom-0.5 right-0.5 bg-brand-600 text-white text-[8px] font-bold px-1 rounded-sm leading-tight z-10">
                        Active
                      </span>
                    ) : idx === 2 ? (
                      <span className="absolute top-0.5 left-0.5 bg-slate-900/70 text-white text-[7px] font-semibold px-1 rounded-sm z-10">
                        Goal
                      </span>
                    ) : null}
                  </div>
                  <span className={`text-[10px] mt-1 truncate max-w-full ${isActive ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                    {cp.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Checkpoint Hero View */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-100 bg-slate-900 shadow-inner group">
            <div className="h-28 w-full relative bg-slate-900 flex items-center justify-center">
              <img
                src={activeCheckpoint.imageUrl}
                alt=""
                className="w-full h-full object-cover absolute inset-0"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="text-3xl opacity-30 select-none pointer-events-none">
                {isBus ? (activeStepIndex === 0 ? '🚏' : activeStepIndex === 1 ? '🚌' : '🎓') : '🏛️'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

              {/* Badges on Image */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full shadow-soft flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  </svg>
                  Checkpoint {activeStepIndex + 1} · {activeCheckpoint.distanceAhead}
                </span>
              </div>

              {/* Landmark Visual Cue Description Banner */}
              <div className="absolute bottom-2 left-2.5 right-2.5 flex flex-col text-white text-left">
                <span className="text-[13px] font-bold tracking-tight leading-snug drop-shadow-soft">
                  {activeCheckpoint.title}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-200 font-medium mt-0.5 drop-shadow-soft">
                  <svg className="w-3 h-3 text-brand-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="truncate">{activeCheckpoint.description}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Checkpoint Reached & I'm Lost */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={handleNextStep}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-full font-semibold text-[12px] shadow-md transition leading-tight cursor-pointer"
            >
              <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="truncate">
                {isBus
                  ? (activeStepIndex === 0 ? 'ขึ้นรถบัสแล้ว • Next ›' : activeStepIndex === 1 ? 'ลงที่ป้าย อ.มช. แล้ว • Next ›' : 'ถึงอาคาร RB5 • เข้าตึก ›')
                  : (activeStepIndex === 2 ? 'Arrived at RB5 • Enter Building ›' : 'Reached landmark • Next ›')}
              </span>
            </button>

            <button
              onClick={onOpenLostModal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-red-50/60 active:scale-95 text-rose-600 rounded-full font-semibold text-[12px] border border-rose-200/90 shadow-soft transition leading-tight cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span className="truncate">I'm Lost</span>
            </button>
          </div>
        </section>

        {/* Bottom Floating Trip Summary Card */}
        <section className="w-full bg-white rounded-[24px] p-3 px-5 shadow-floating border border-slate-100 flex items-center justify-between" data-purpose="trip-summary-sheet">
          <div className="flex flex-col text-left">
            <div className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-none">
              {remainingMins} <span className="text-[14px] font-bold">min</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Est. walk</span>
          </div>

          <div className="h-7 w-[1px] bg-slate-100" />

          <div className="flex flex-col text-left">
            <div className="text-[20px] font-extrabold text-slate-900 tracking-tight leading-none">
              {remainingDist} <span className="text-[14px] font-bold">m</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">remaining</span>
          </div>

          <button
            onClick={onExitNavigation}
            aria-label="Exit Navigation"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors ml-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </section>

        {/* iOS Home Indicator */}
        <div className="w-32 h-1 bg-slate-400/60 rounded-full mt-0.5" />
      </footer>
    </div>
  );
};
