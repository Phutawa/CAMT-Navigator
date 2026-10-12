import React, { useState } from 'react';
import { StatusBar } from '../components/StatusBar';
import { CAMPUS_IMAGES } from '../data/campusData';
import { BuildingInfo, RoomInfo } from '../types/navigation';
import rb5RealPhoto from '../assets/rb5-real.jpg';

interface ArrivalScreenProps {
  onReturnHome: () => void;
  onReportIssue: () => void;
  onStartIndoorNav?: () => void;
  targetBuilding?: BuildingInfo | null;
  targetRoom?: RoomInfo | null;
  mode?: 'building' | 'room';
}

export const ArrivalScreen: React.FC<ArrivalScreenProps> = ({
  onReturnHome,
  onReportIssue,
  onStartIndoorNav,
  targetBuilding,
  targetRoom,
  mode = 'building',
}) => {
  const [isCongratulated, setIsCongratulated] = useState(false);
  const [activeTab, setActiveTab] = useState<'building' | 'room'>(mode);

  React.useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  // Dynamic building & room metadata
  const isUnivOffice = targetBuilding?.code === 'UNIV-OFFICE' || targetBuilding?.nameTh === 'อาคารสำนักงานมหาวิทยาลัย';
  const bCode = isUnivOffice ? 'RB5' : (targetBuilding?.code || 'RB5');
  const rawBName = isUnivOffice
    ? 'RB5'
    : (targetBuilding?.nameTh || targetBuilding?.name || 'RB5');
  const bName = rawBName.replace(new RegExp(`\\s*\\(${bCode}\\)\\s*`, 'gi'), '').trim() || bCode;
  const bHours = targetBuilding?.hours || '08:30 - 21:00';
  const bImageUrl = (targetBuilding?.code === 'RB5' || !targetBuilding || isUnivOffice)
    ? rb5RealPhoto
    : (targetBuilding?.imageUrl || rb5RealPhoto);
  const bDistance = targetBuilding?.distance || '300 m';
  const rawWalkTime = targetBuilding?.walkTime || '4 mins';
  const bWalkTime = rawWalkTime.includes('min') ? rawWalkTime : `${rawWalkTime} mins`;
  const bElevators = targetBuilding?.elevatorsAvailable ?? true;

  const rCode = targetRoom?.code || '204';
  const rName = targetRoom?.name || 'Robotics Lab';
  const rFloor = targetRoom?.floor || 2;

  const isBuildingMode = activeTab === 'building';

  // View 2: Congratulate / Celebration View
  if (isCongratulated) {
    return (
      <div
        className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0F0D24] via-[#1A1438] to-[#0A0818] text-white select-none animate-fadeIn"
        data-purpose="arrival-congratulations-screen"
      >
        {/* Ambient Celebration Light Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Status Bar */}
        <div className="relative z-20">
          <StatusBar theme="light" isArrived={false} navStatusText="COMPLETED" />
        </div>

        {/* Celebration Content Body */}
        <main className="relative z-10 flex-1 px-6 pt-4 pb-4 flex flex-col justify-between overflow-y-auto no-scrollbar text-center">
          <div className="space-y-4 my-auto">
            {/* Minimalist Achievement Badge */}
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-brand-500 p-0.5 shadow-2xl">
                <div className="w-full h-full bg-[#15102F] rounded-full flex items-center justify-center text-emerald-400 shadow-inner">
                  <svg className="w-10 h-10 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Congratulatory Headlines (Human copy, no emojis) */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold tracking-wide mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>ถึงจุดหมายแล้ว</span>
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                ยินดีด้วย คุณถึงปลายทางแล้ว
              </h1>
              <p className="text-xs text-white/70 font-medium mt-1 max-w-xs mx-auto">
                {isBuildingMode
                  ? `คุณเดินทางถึง ${bCode} (${bName}) เรียบร้อยแล้วอย่างปลอดภัย`
                  : `คุณเดินทางถึงห้อง ${rCode} (${rName}) อาคาร ${bCode} เรียบร้อยแล้ว`}
              </p>
            </div>

            {/* Journey Achievement & Trip Summary Card (Clean, no emojis) */}
            <div className="w-full bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-4 text-left space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">
                  สรุปผลการเดินทาง
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  On Time
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-white/60 text-[11px] shrink-0">จุดหมายปลายทาง:</span>
                  <span className="font-semibold text-white text-right text-[11.5px]">
                    {isBuildingMode ? `${bCode} (${bName})` : `Room ${rCode} (${rName}) - ${bCode}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-[11px]">เวลาที่ใช้:</span>
                  <span className="font-bold text-emerald-300 tabular-nums">
                    {bWalkTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-[11px]">ระยะทางรวม:</span>
                  <span className="font-bold text-white tabular-nums">
                    {bDistance} (~420 ก้าว)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-[11px]">ลดการปล่อยคาร์บอน:</span>
                  <span className="font-bold text-emerald-300 tabular-nums">
                    ~120g CO₂ (เดินเท้า)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 mt-4">
            <button
              onClick={onReturnHome}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-bold text-[14.5px] rounded-full shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>กลับสู่หน้าหลัก</span>
            </button>

            <button
              onClick={() => setIsCongratulated(false)}
              className="w-full py-2 text-white/50 hover:text-white/80 text-xs font-medium transition cursor-pointer"
            >
              ดูรายละเอียดสถานที่อีกครั้ง
            </button>

            {/* iOS Bottom Indicator bar */}
            <div aria-hidden="true" className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-1" />
          </div>
        </main>
      </div>
    );
  }

  // View 1: Check Confirm Screen (Clean, de-boxed, human-touch layout)
  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-white select-none"
      data-purpose="arrival-check-confirm-screen"
    >
      {/* Top Destination View (Authentic CMU RB5 Real Photo) */}
      <div className="relative w-full h-[40%] shrink-0 overflow-hidden bg-slate-900" data-purpose="destination-header">
        <img
          src={isBuildingMode ? bImageUrl : CAMPUS_IMAGES.doorRoom204}
          alt={isBuildingMode ? `${bCode} Entrance` : `Room ${rCode} Door`}
          className="w-full h-full object-cover object-center brightness-95"
          onError={(e) => {
            e.currentTarget.src = rb5RealPhoto;
          }}
        />

        {/* Dark gradient overlay for status bar and bottom integration */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Clean iOS Native Status Bar (No redundant stepper in sky) */}
        <div className="absolute top-0 inset-x-0 z-20">
          <StatusBar theme="light" navActive={false} isArrived={false} />
        </div>

        {/* Unified Bottom Photo Badge (Harmonious brand tone, integrated into bottom edge) */}
        <div className="absolute bottom-5 inset-x-4 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-[#1E3B2B]/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-semibold tracking-wide">
              {isBuildingMode ? `${bCode} • ทางเข้าหลัก` : `${bCode} • Room ${rCode}`}
            </span>
          </div>
        </div>
      </div>

      {/* Arrival Details & Guidance Card (De-boxed with soft whitespace) */}
      <section
        className="relative -mt-4 flex-1 bg-white rounded-t-[34px] px-6 pt-3 pb-3 flex flex-col justify-between z-20 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] border-t border-slate-100 overflow-y-auto no-scrollbar"
        data-purpose="arrival-summary-content"
      >
        <div className="flex flex-col items-center text-center space-y-2.5">
          {/* Top Grab Bar */}
          <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto" />

          {/* Success Checkmark & Headline */}
          <div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-1 text-brand-600">
              <svg className="w-5 h-5 stroke-[2.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {isBuildingMode ? `ถึง ${bCode} แล้ว` : `ถึงห้อง ${rCode} แล้ว`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isBuildingMode ? bName : `${rName} • ${bCode}`}
            </p>
          </div>

          {/* Mode Switcher (Clean tabs, zero emojis) */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-full text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('building')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                isBuildingMode
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>อาคาร ({bCode})</span>
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                !isBuildingMode
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>ห้อง ({rCode})</span>
            </button>
          </div>

          {/* Verification Landmarks (De-boxed with soft whitespace, zero emojis) */}
          <div className="w-full bg-slate-50/70 rounded-2xl p-3.5 text-left space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              {isBuildingMode ? 'จุดสังเกตอาคาร' : 'จุดสังเกตห้อง'}
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-baseline justify-between gap-3 border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500 shrink-0 text-[11.5px]">ป้ายชื่อ:</span>
                <span className="font-semibold text-slate-800 text-right text-[12px]">
                  {isBuildingMode ? `${bCode} (${bName})` : `Room ${rCode} (${rName})`}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-500 shrink-0 text-[11.5px]">
                  {isBuildingMode ? 'จุดสังเกต:' : 'วิชาที่เรียน:'}
                </span>
                <span className="font-semibold text-slate-800 text-right text-[12px]">
                  {isBuildingMode ? 'โถงทางเข้าหลัก และโต๊ะประชาสัมพันธ์' : '953351 UX for Software Design'}
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
                {bHours}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-start justify-between gap-2 text-[11.5px]">
                <span className="text-slate-500 shrink-0">ทางเข้าหลัก:</span>
                <span className="font-medium text-slate-800 text-right">Gate 1 • โถงกลางชั้น 1</span>
              </div>
              <div className="flex items-start justify-between gap-2 text-[11.5px]">
                <span className="text-slate-500 shrink-0">ลิฟต์และบันได:</span>
                <span className="font-medium text-slate-800 text-right">Elevator Core A4 (ไปชั้น {rFloor})</span>
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
          {/* Main Primary CTA Button */}
          {isBuildingMode ? (
            <>
              {/* Primary CTA: Start Indoor Navigation to Room 204 */}
              <button
                onClick={() => {
                  if (onStartIndoorNav) {
                    onStartIndoorNav();
                  } else {
                    setIsCongratulated(true);
                  }
                }}
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
                onClick={() => setIsCongratulated(true)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-600 hover:text-slate-900 font-medium text-[13px] rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                type="button"
              >
                <span>จบการนำทาง</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCongratulated(true)}
              aria-label="จบการนำทาง"
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.985] text-white font-bold text-[14.5px] rounded-full shadow-glow transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <span>จบการนำทาง • เข้าห้องเรียน</span>
              <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Conversational Report Link */}
          <button
            onClick={onReportIssue}
            aria-label="แจ้งข้อมูลไม่ถูกต้อง"
            className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-600 transition-colors py-0.5 cursor-pointer"
            type="button"
          >
            <span>แจ้งข้อมูลไม่ถูกต้อง</span>
          </button>

          {/* iOS Bottom Indicator bar */}
          <div aria-hidden="true" className="w-32 h-1 bg-slate-300 rounded-full mt-1" />
        </div>
      </section>
    </div>
  );
};
