import React, { useState } from 'react';
import { StatusBar } from '../components/StatusBar';
import { BuildingFloorPlan } from '../components/BuildingFloorPlan';
import { CAMPUS_IMAGES } from '../data/campusData';
import { BuildingInfo, RoomInfo } from '../types/navigation';

interface IndoorNavScreenProps {
  onNextLandmark: () => void;
  onOpenLostModal: () => void;
  onBack: () => void;
  targetBuilding?: BuildingInfo | null;
  targetRoom?: RoomInfo | null;
}

interface IndoorStepInfo {
  stepNumber: number;
  totalSteps: number;
  floor: number;
  floorBadge: string;
  locationName: string;
  directiveIcon: string;
  directiveTitle: string;
  imageUrl: string;
  imageAlt: string;
  scannablePills: { icon: string; text: string; highlight?: boolean }[];
  sneakInTip?: string;
  ctaText: string;
}

export const IndoorNavScreen: React.FC<IndoorNavScreenProps> = ({
  onNextLandmark,
  onOpenLostModal,
  onBack,
  targetBuilding,
  targetRoom,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'floorplan' | 'photo'>('floorplan');
  const [manualFloor, setManualFloor] = useState<number | null>(null);

  const roomCode = targetRoom?.code || '204';
  const targetFloor = targetRoom?.floor || 2;
  const bCode = targetBuilding?.code || 'RB5';
  const bNameTh = targetBuilding?.nameTh || targetBuilding?.name || 'อาคารวิจัย 5 (RB5)';

  const indoorSteps: IndoorStepInfo[] = [
    // Step 1: Vertical Navigation (Stairs / Elevator from Floor 1 to Floor 2)
    {
      stepNumber: 1,
      totalSteps: 3,
      floor: 1,
      floorBadge: `LEVEL 1 → LEVEL ${targetFloor}`,
      locationName: 'Level 1 Lobby • Central Stairs & Elevators',
      directiveIcon: 'stairs',
      directiveTitle: `Take central stairs or elevator to Level ${targetFloor}`,
      imageUrl: CAMPUS_IMAGES.centralStairs,
      imageAlt: `Central staircase and elevator bay in ${bCode}`,
      scannablePills: [
        { icon: '🛗', text: 'Step-free access available (Elevator A4)', highlight: true },
        { icon: '🪜', text: 'Central Stairs ST-1' },
      ],
      ctaText: `Arrived at Level ${targetFloor}`,
    },
    // Step 2: Hallway & Landmark Turn (Floor 2 Corridor & Vending Machine)
    {
      stepNumber: 2,
      totalSteps: 3,
      floor: targetFloor,
      floorBadge: `LEVEL ${targetFloor} • WEST WING`,
      locationName: `Level ${targetFloor} Corridor (West Wing)`,
      directiveIcon: 'turn_left',
      directiveTitle: 'Landmark: Vending Machine / Turn left, walk 15 m',
      imageUrl: CAMPUS_IMAGES.indoorHallway,
      imageAlt: `Hallway Level ${targetFloor} with vending machine landmark`,
      scannablePills: [
        { icon: '🥤', text: 'Vending Machine Landmark', highlight: true },
        { icon: '🚶‍♂️', text: 'Turn left, walk 15 m' },
      ],
      ctaText: 'Turned • Arrived at door',
    },
    // Step 3: Destination Door Checkpoint & Sneak-In Mode
    {
      stepNumber: 3,
      totalSteps: 3,
      floor: targetFloor,
      floorBadge: `LEVEL ${targetFloor} • DESTINATION`,
      locationName: `Room ${roomCode} (${targetRoom?.name || 'Target Room'})`,
      directiveIcon: 'door_front',
      directiveTitle: `Room ${roomCode} on the right (Gate 3)`,
      imageUrl: CAMPUS_IMAGES.doorRoom204,
      imageAlt: `Room ${roomCode} door checkpoint`,
      scannablePills: [
        { icon: '🚪', text: `Room ${roomCode} (Gate/Door 3)`, highlight: true },
        { icon: '🏷️', text: `${bCode} Official Room Sign` },
      ],
      sneakInTip: 'Late? Use the Back Door at the end of the hall to avoid disturbing the class.',
      ctaText: 'Verify Door & Arrival 🎉',
    },
  ];

  const currentStep = indoorSteps[currentStepIndex];
  const displayedFloor = manualFloor !== null ? manualFloor : currentStep.floor;

  const handleNext = () => {
    if (currentStepIndex < indoorSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setManualFloor(null); // automatically follow step floor
    } else {
      // Complete indoor navigation -> Go to Arrival screen!
      onNextLandmark();
    }
  };

  const handleBackStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setManualFloor(null);
    } else {
      onBack();
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-900 select-none"
      data-purpose="indoor-nav-screen"
    >
      {/* Top Header / Viewport Area */}
      <section className={`relative w-full ${viewMode === 'floorplan' ? 'h-[55%]' : 'h-[50%]'} overflow-y-auto no-scrollbar bg-slate-950 flex flex-col transition-all duration-300`} data-purpose="landmark-visual-view">
        {/* Top iOS Status Bar & Flow Steps */}
        <div className="shrink-0 z-30 flex flex-col items-center pt-1 pb-1 bg-slate-950/90 backdrop-blur-md border-b border-white/10">
          <StatusBar theme="light" navActive={true} />
          
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-1 px-1 opacity-70">
              <span className="w-3 h-3 rounded-full bg-white/30 text-white flex items-center justify-center text-[8px] font-bold">1</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white">Search</span>
            </div>
            <div className="w-1 border-b-2 border-dotted border-white/40"></div>
            <div className="flex items-center gap-1 px-1 opacity-70">
              <span className="w-3 h-3 rounded-full bg-white/30 text-white flex items-center justify-center text-[8px] font-bold">2</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white">Route</span>
            </div>
            <div className="w-1 border-b-2 border-dotted border-white/40"></div>
            <div className="flex items-center gap-1 bg-white/20 text-white px-1.5 py-0.5 rounded-full border border-white/30 shadow-sm backdrop-blur-md">
              <span className="w-3 h-3 rounded-full bg-white text-black flex items-center justify-center text-[8px] font-bold">3</span>
              <span className="text-[8px] font-bold uppercase tracking-wider">Go</span>
            </div>
          </div>
        </div>

        {/* Top Sub-Bar: Back button, Location title, and View Mode Toggle */}
        <div className="shrink-0 px-4 py-2 flex items-center justify-between z-20 bg-slate-900/90 border-b border-white/10 backdrop-blur-sm">
          <button
            onClick={handleBackStep}
            aria-label="Back step"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 active:scale-95 transition-transform shadow-md cursor-pointer"
          >
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Current Location Breadcrumb */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <span className="text-[9.5px] font-black tracking-widest text-emerald-400 uppercase drop-shadow-soft">
              {currentStep.floorBadge}
            </span>
            <h1 className="text-xs font-bold text-white tracking-tight drop-shadow-md truncate max-w-[190px]">
              {bCode} • ห้อง {roomCode}
            </h1>
          </div>

          {/* View Mode Segmented Button: Floor Plan vs Photo */}
          <div className="flex items-center bg-white/15 p-0.5 rounded-xl border border-white/20 text-[10.5px] font-bold shadow-xs">
            <button
              onClick={() => setViewMode('floorplan')}
              type="button"
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'floorplan'
                  ? 'bg-brand-600 text-white shadow-xs font-extrabold'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="ดูผังอาคารสถาปัตยกรรม (1:125)"
            >
              ผังอาคาร
            </button>
            <button
              onClick={() => setViewMode('photo')}
              type="button"
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'photo'
                  ? 'bg-brand-600 text-white shadow-xs font-extrabold'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="ดูภาพถ่ายจุดสังเกตจริง"
            >
              ภาพจริง
            </button>
          </div>
        </div>

        {/* Viewport Content: Floor Plan OR Landmark Photo */}
        <div className="flex-1 w-full px-2 py-1.5 overflow-y-auto no-scrollbar flex flex-col justify-start">
          {viewMode === 'floorplan' ? (
            <div className="w-full max-w-lg mx-auto animate-fadeIn">
              <BuildingFloorPlan
                selectedFloor={displayedFloor}
                onSelectFloor={(fl) => setManualFloor(fl)}
                targetBuilding={targetBuilding}
                targetRoom={targetRoom}
                currentStepIndex={currentStepIndex}
                onNextStep={handleNext}
                onPrevStep={handleBackStep}
                onStepSelect={(idx) => {
                  setCurrentStepIndex(idx);
                  setManualFloor(null);
                }}
                showNavigationPath={true}
                interactive={true}
              />
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[210px] rounded-2xl overflow-hidden border border-white/20 shadow-lg group animate-fadeIn">
              <img
                src={currentStep.imageUrl}
                alt={currentStep.imageAlt}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 text-white">
                <span className="px-2 py-0.5 rounded-full bg-brand-600 text-[9.5px] font-extrabold uppercase">
                  Visual Landmark Cue
                </span>
                <h4 className="text-sm font-bold mt-1 leading-snug">{currentStep.directiveTitle}</h4>
                <p className="text-[11px] text-stone-300">{currentStep.locationName}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Navigation Instruction Bottom Card (Scannable, Icons + Short Phrases - Solves Namo & Pun's text-heavy issue) */}
      <main className="relative -mt-4 flex-1 bg-white rounded-t-[32px] shadow-2xl flex flex-col justify-between px-6 pt-4 pb-4 z-20 border-t border-[var(--primary-soft)]/50">
        <div className="space-y-3">
          {/* Progress Indicators & Distance Row */}
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black tracking-wider text-brand-700 uppercase">
              INDOOR STEP {currentStep.stepNumber} OF {currentStep.totalSteps}
            </span>

            {/* Stepper Dots */}
            <div className="flex items-center space-x-1.5">
              {indoorSteps.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all ${
                    i === currentStepIndex
                      ? 'w-6 h-1.5 bg-brand-600'
                      : i < currentStepIndex
                      ? 'w-1.5 h-1.5 bg-emerald-500'
                      : 'w-1.5 h-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Primary Directive (Big, Bold, Concise) */}
          <h2 className="text-[20px] font-extrabold text-slate-900 leading-tight tracking-tight">
            {currentStep.directiveTitle}
          </h2>

          {/* Scannable Micro-Cards / Pills (Icon + Short phrase) */}
          <div className="grid grid-cols-1 gap-1.5">
            {currentStep.scannablePills.map((pill, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium border ${
                  pill.highlight
                    ? 'bg-brand-50 border-brand-200 text-brand-900 font-bold'
                    : 'bg-canvas border-slate-100 text-slate-700'
                }`}
              >
                <span className="text-base shrink-0">{pill.icon}</span>
                <span className="truncate">{pill.text}</span>
              </div>
            ))}
          </div>

          {/* Discreet Entry "Sneak-In" Mode Box (if step 3) */}
          {currentStep.sneakInTip && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-2.5 flex items-start gap-2 text-[11px] text-amber-900 animate-fade-in">
              <span className="text-sm shrink-0"></span>
              <p className="leading-snug font-medium">
                <strong className="font-bold">Discreet Entry:</strong>{' '}
                Use the Back Door at the end of the hall to avoid disturbing the class.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons: Next Checkpoint & I am Lost */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-bold text-[15px] rounded-full shadow-glow transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{currentStep.ctaText}</span>
          </button>

          <button
            onClick={onOpenLostModal}
            className="w-full py-2 px-4 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 active:scale-[0.985] font-semibold text-xs rounded-full transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>I am Lost (Indoor)</span>
          </button>
        </div>

        {/* iOS Home Indicator */}
        <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-1" />
      </main>
    </div>
  );
};
