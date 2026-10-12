import React from 'react';
import { StatusBar } from '../components/StatusBar';
import { BuildingInfo, RoomInfo, ScreenId } from '../types/navigation';
import rb5RealPhoto from '../assets/rb5-real.jpg';

interface ThresholdTransitionScreenProps {
  onEnterBuilding: () => void;
  onBackToOutdoor: () => void;
  onFinishBuildingArrival?: () => void;
  onNavigateScreen: (screen: ScreenId) => void;
  targetBuilding?: BuildingInfo | null;
  targetRoom?: RoomInfo | null;
}

export const ThresholdTransitionScreen: React.FC<ThresholdTransitionScreenProps> = ({
  onEnterBuilding,
  onBackToOutdoor,
  onFinishBuildingArrival,
  targetBuilding,
  targetRoom,
}) => {
  const isUnivOffice = targetBuilding?.code === 'UNIV-OFFICE' || targetBuilding?.nameTh === 'อาคารสำนักงานมหาวิทยาลัย';
  const bCode = isUnivOffice ? 'RB5' : (targetBuilding?.code || 'RB5');
  const bName = isUnivOffice
    ? 'RB5'
    : (targetBuilding?.code === 'RB5' ? 'RB5' : (targetBuilding?.nameTh || targetBuilding?.name || 'RB5'));
  const rCode = targetRoom?.code || '204';
  const rName = targetRoom?.name || 'Robotics Lab';
  const targetFloor = targetRoom?.floor || 2;
  const bImageUrl = (targetBuilding?.code === 'RB5' || !targetBuilding || isUnivOffice)
    ? rb5RealPhoto
    : (targetBuilding?.imageUrl || rb5RealPhoto);

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-white select-none"
      data-purpose="threshold-transition-screen"
    >
      {/* Top Background Image of Building Entrance with Real CMU RB5 Photo */}
      <div className="relative w-full h-[40%] shrink-0 overflow-hidden bg-slate-900">
        <img
          src={bImageUrl}
          alt={`${bCode} Entrance`}
          className="w-full h-full object-cover object-center brightness-95"
          onError={(e) => {
            e.currentTarget.src = rb5RealPhoto;
          }}
        />

        {/* Subtle dark vignettes for status bar readability and smooth bottom handoff */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Clean iOS Native Status Bar (No redundant stepper or displaced Arrived in Dynamic Island) */}
        <div className="absolute top-0 inset-x-0 z-20">
          <StatusBar theme="light" navActive={false} isArrived={false} />
        </div>

        {/* Top Back Navigation Bar */}
        <div className="absolute top-14 left-4 z-20">
          <button
            onClick={onBackToOutdoor}
            aria-label="ย้อนกลับไปแผนที่ภายนอก"
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Unified Bottom Photo Badge (Matching dark forest green tone, integrated smoothly with bottom edge) */}
        <div className="absolute bottom-5 inset-x-4 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-[#1E3B2B]/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-semibold tracking-wide">
              {bCode} • ทางเข้าหลัก
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Transition Content Card (De-boxed with soft whitespace & conversational copy) */}
      <main className="relative -mt-4 flex-1 bg-white text-slate-900 rounded-t-[34px] px-6 pt-3 pb-3 flex flex-col justify-between shadow-[0_-8px_25px_rgba(0,0,0,0.06)] z-20 border-t border-slate-100 overflow-y-auto no-scrollbar">
        <div className="space-y-2.5">
          {/* Grab Pill */}
          <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto" />

          {/* Headline & Location */}
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-1 text-brand-600">
              <svg className="w-5 h-5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
              ถึง {bCode} แล้ว
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {bName}
            </p>
          </div>

          {/* Target Room Specs (De-boxed with soft whitespace and subtle borderless background) */}
          <div className="w-full bg-slate-50/70 rounded-2xl p-3.5 text-left space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              จุดหมายภายในอาคาร
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-baseline justify-between gap-3 border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500 shrink-0 text-[11.5px]">ห้องเรียน:</span>
                <span className="font-semibold text-slate-800 text-right text-[12px]">
                  Room {rCode} ({rName})
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-500 shrink-0 text-[11.5px]">ตำแหน่ง:</span>
                <span className="font-semibold text-slate-800 text-right text-[12px]">
                  ชั้น {targetFloor} • ขึ้นบันไดกลางหรือลิฟต์ A4
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Building Information (De-boxed, conversational copy, zero emojis) */}
          <div className="w-full bg-slate-50/70 rounded-2xl p-3.5 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                ข้อมูลสำหรับติดต่อ
              </span>
              <span className="text-[10.5px] font-medium text-slate-500">
                08:30 - 21:00
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-start justify-between gap-2 text-[11.5px]">
                <span className="text-slate-500 shrink-0">ทางเข้าหลัก:</span>
                <span className="font-medium text-slate-800 text-right">Gate 1 • โถงกลางชั้น 1</span>
              </div>
              <div className="flex items-start justify-between gap-2 text-[11.5px]">
                <span className="text-slate-500 shrink-0">ลิฟต์และบันได:</span>
                <span className="font-medium text-slate-800 text-right">Elevator Core A4</span>
              </div>
              <div className="flex items-start justify-between gap-2 text-[11.5px]">
                <span className="text-slate-500 shrink-0">จุดบริการ:</span>
                <span className="font-semibold text-brand-700 text-right">โต๊ะประชาสัมพันธ์ โถงชั้น 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls (Conversational, human copy) */}
        <div className="w-full flex flex-col items-center mt-3 space-y-2">
          {/* Primary CTA: Start Indoor Nav */}
          <button
            onClick={onEnterBuilding}
            aria-label={`นำทางต่อในอาคารไปห้อง ${rCode}`}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-bold text-[14.5px] rounded-full shadow-glow transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span>นำทางต่อในอาคารไปห้อง {rCode}</span>
            <svg className="w-4.5 h-4.5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Secondary CTA: Conversational "จบการนำทาง" */}
          <button
            onClick={onFinishBuildingArrival || onBackToOutdoor}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-600 hover:text-slate-900 font-medium text-[13px] rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            type="button"
          >
            <span>จบการนำทาง</span>
          </button>

          {/* Back link */}
          <button
            onClick={onBackToOutdoor}
            className="w-full py-0.5 text-slate-400 hover:text-slate-600 text-xs font-medium transition cursor-pointer"
            type="button"
          >
            กลับไปหน้าแผนที่
          </button>

          {/* iOS Bottom Indicator bar */}
          <div aria-hidden="true" className="w-32 h-1 bg-slate-300 rounded-full mt-1" />
        </div>
      </main>
    </div>
  );
};
