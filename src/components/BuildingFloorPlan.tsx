import React, { useState } from 'react';
import { BuildingInfo, RoomInfo } from '../types/navigation';
import { getFloorPlanData, FloorRoomLayout, BuildingFloorPlanData } from '../data/floorPlanData';

interface BuildingFloorPlanProps {
  selectedFloor: number;
  onSelectFloor?: (floor: number) => void;
  targetBuilding?: BuildingInfo | null;
  targetRoom?: RoomInfo | null;
  currentStepIndex?: number;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onStepSelect?: (stepIndex: number) => void;
  showNavigationPath?: boolean;
  interactive?: boolean;
  compact?: boolean;
}

export const BuildingFloorPlan: React.FC<BuildingFloorPlanProps> = ({
  selectedFloor,
  onSelectFloor,
  targetBuilding,
  targetRoom,
  currentStepIndex = 0,
  onNextStep,
  onPrevStep,
  onStepSelect,
  showNavigationPath = true,
  interactive = true,
  compact = false,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const floorData: BuildingFloorPlanData = getFloorPlanData(
    targetBuilding,
    selectedFloor,
    targetRoom
  );

  const availableFloors = targetBuilding?.floors && targetBuilding.floors.length > 0
    ? targetBuilding.floors
    : (targetBuilding?.id === 'cmu-univ-office' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]);

  const activeRoom = floorData.rooms.find((r) => r.id === selectedRoomId) ||
    floorData.rooms.find((r) => r.isTarget) ||
    null;

  // Grid offsets:
  // Margin for grid bubbles:
  // Left: 3.8m, Top: 3.5m, Building: 32m x 15m
  // SVG ViewBox: 0 0 38 21.5
  const ox = 3.6; // origin X of building
  const oy = 3.2; // origin Y of building

  // Dimension intervals along X: 5.0, 5.5, 5.5, 5.5, 5.5, 5.0 (total 32)
  const gridXCols = [0, 5.0, 10.5, 16.0, 21.5, 27.0, 32.0];
  // Dimension intervals along Y: A to B (6.2), B to C (5.8), C to bottom (3.0)
  const gridYRows = [0, 6.2, 12.0, 15.0];

  // Target Room & Step Navigation Coordinates:
  const isFloor1 = selectedFloor === 1;
  const targetFloor = targetRoom?.floor || 2;
  const isTargetFloor = selectedFloor === targetFloor;

  // Key reference coordinates in meters
  const elevX = ox + 28.0;
  const elevY = oy + 10.2;
  const cornerX = ox + 25.5;
  const cornerY = oy + 10.2;
  const cp1X = ox + 25.5;
  const cp1Y = oy + 7.5;

  // Floor 1 specific coordinates
  const entX = ox + 23.5;
  const entY = oy + 0.8;
  const lobbyCornerX = ox + 25.5;
  const lobbyCornerY = oy + 4.5;

  // Target Room Layout on current floor
  const targetRoomLayout = floorData.rooms.find((r) => r.isTarget) ||
    (targetRoom ? floorData.rooms.find((r) => r.code === targetRoom.code) : null) ||
    floorData.rooms.find((r) => r.category === 'workspace');

  const destX = targetRoomLayout
    ? ox + targetRoomLayout.x + (targetRoomLayout.door?.side === 'right' ? targetRoomLayout.width : targetRoomLayout.width * 0.8)
    : ox + 14.0;
  const destY = targetRoomLayout
    ? oy + targetRoomLayout.y + (targetRoomLayout.door?.offset || targetRoomLayout.height / 2)
    : oy + 10.0;

  const getCategoryStyles = (category: string, isTarget: boolean) => {
    if (isTarget) {
      return {
        fill: '#FEF08A', // highlighted energetic yellow
        stroke: '#CA8A04',
        badgeBg: '#EAB308',
        badgeText: '#713F12',
      };
    }
    switch (category) {
      case 'shared':
        return {
          fill: '#D9EDD4', // soft green
          stroke: '#6BA569',
          badgeBg: '#4E8A51',
          badgeText: '#FFFFFF',
        };
      case 'workspace':
        return {
          fill: '#F8CBB4', // warm peach/terracotta
          stroke: '#DF7D54',
          badgeBg: '#C85A2E',
          badgeText: '#FFFFFF',
        };
      case 'recreation':
        return {
          fill: '#C9DAF8', // soft blue/periwinkle
          stroke: '#5C8BD4',
          badgeBg: '#3B6DB8',
          badgeText: '#FFFFFF',
        };
      case 'service':
        return {
          fill: '#E2E8F0',
          stroke: '#94A3B8',
          badgeBg: '#64748B',
          badgeText: '#FFFFFF',
        };
      case 'core':
      default:
        return {
          fill: '#E5E7EB',
          stroke: '#9CA3AF',
          badgeBg: '#6B7280',
          badgeText: '#FFFFFF',
        };
    }
  };

  return (
    <div className="w-full bg-[#FCFAF7] rounded-3xl border border-stone-200/90 shadow-sm p-3.5 space-y-3 font-sans select-none" data-purpose="architectural-floor-plan-card">
      {/* Top Header: Building Title & Floor Switcher Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 uppercase">
              1 : 125 Architectural Plan
            </span>
            <span className="text-[10.5px] font-semibold text-stone-500">
              {floorData.buildingNameTh}
            </span>
          </div>
          <h3 className="text-sm font-extrabold text-stone-900 tracking-tight mt-0.5">
            {floorData.floorTitle} • รวม {floorData.totalAreaSqm} ตร.ม.
          </h3>
        </div>

        {/* Floor Switcher Buttons */}
        {onSelectFloor && (
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
            {availableFloors.map((fl) => {
              const isCurrent = fl === selectedFloor;
              return (
                <button
                  key={fl}
                  onClick={() => onSelectFloor(fl)}
                  type="button"
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-600 text-white shadow-sm scale-105'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  ชั้น {fl}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step-by-Step Indoor Progress Controller Bar */}
      {showNavigationPath && (
        <div className="bg-emerald-950/5 border border-emerald-600/20 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-xs">
              STEP {currentStepIndex + 1}/3
            </span>
            <span className="font-bold text-stone-800 text-[11.5px]">
              {currentStepIndex === 0
                ? `1. ขึ้นลิฟต์/บันไดไปชั้น ${targetFloor}`
                : currentStepIndex === 1
                ? '2. ออกจากลิฟต์ เลี้ยวซ้ายสู่จุดสังเกต 1'
                : `3. เข้าประตูห้อง ${targetRoom?.code || 'เป้าหมาย'}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Step Pills 1, 2, 3 */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-stone-200">
              {[0, 1, 2].map((sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => onStepSelect && onStepSelect(sIdx)}
                  className={`w-6 h-6 rounded-lg text-[10.5px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                    currentStepIndex === sIdx
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : (currentStepIndex > sIdx
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'text-stone-400 hover:text-stone-700')
                  }`}
                  title={`ไปที่ก้าวที่ ${sIdx + 1}`}
                >
                  {currentStepIndex > sIdx ? '✓' : sIdx + 1}
                </button>
              ))}
            </div>

            {/* Quick Next Step Button */}
            {onNextStep && (
              <button
                type="button"
                onClick={onNextStep}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{currentStepIndex < 2 ? 'ถัดไป ▶' : 'เสร็จสิ้น 🎉'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SVG Canvas Area: Exact 1:125 Vector Blueprint Layout */}
      <div className="relative w-full aspect-[32/17.5] bg-white rounded-2xl border border-stone-300 shadow-inner overflow-hidden p-1">
        <svg
          viewBox="0 0 37.8 19.8"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Pattern for bathroom tiles / shafts */}
            <pattern id="diagonalHatch" width="0.8" height="0.8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="0.8" stroke="#D1D5DB" strokeWidth="0.08" />
            </pattern>
            {/* Pulsing Target Marker Glow */}
            <filter id="targetGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#EAB308" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* ==================================================== */}
          {/* 1. TOP DIMENSION LINES & GRID BUBBLES (1 to 7)      */}
          {/* ==================================================== */}
          {gridXCols.map((xVal, idx) => {
            const screenX = ox + xVal;
            const bubbleNumber = idx + 1;
            return (
              <g key={`grid-col-${idx}`}>
                {/* Thin extension line */}
                <line
                  x1={screenX}
                  y1={0.8}
                  x2={screenX}
                  y2={oy}
                  stroke="#A8A29E"
                  strokeWidth="0.04"
                  strokeDasharray="0.3, 0.3"
                />
                {/* Grid bubble circle */}
                <circle
                  cx={screenX}
                  cy={0.8}
                  r="0.5"
                  fill="#FFFFFF"
                  stroke="#57534E"
                  strokeWidth="0.06"
                />
                {/* Bubble label */}
                <text
                  x={screenX}
                  y={0.98}
                  textAnchor="middle"
                  fontSize="0.5"
                  fontWeight="bold"
                  fill="#292524"
                >
                  {bubbleNumber}
                </text>
                {/* Dimension label between bubbles */}
                {idx < gridXCols.length - 1 && (
                  <text
                    x={screenX + (gridXCols[idx + 1] - xVal) / 2}
                    y={1.8}
                    textAnchor="middle"
                    fontSize="0.35"
                    fill="#78716C"
                    fontWeight="500"
                  >
                    {(gridXCols[idx + 1] - xVal).toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Horizontal top dimension witness line */}
          <line
            x1={ox}
            y1={1.4}
            x2={ox + 32}
            y2={1.4}
            stroke="#A8A29E"
            strokeWidth="0.04"
          />

          {/* ==================================================== */}
          {/* 2. LEFT DIMENSION LINES & GRID BUBBLES (A to C)     */}
          {/* ==================================================== */}
          {gridYRows.slice(0, 3).map((yVal, idx) => {
            const screenY = oy + yVal;
            const bubbleLetter = String.fromCharCode(65 + idx); // 'A', 'B', 'C'
            return (
              <g key={`grid-row-${idx}`}>
                {/* Extension line */}
                <line
                  x1={0.8}
                  y1={screenY}
                  x2={ox}
                  y2={screenY}
                  stroke="#A8A29E"
                  strokeWidth="0.04"
                  strokeDasharray="0.3, 0.3"
                />
                {/* Grid bubble circle */}
                <circle
                  cx={0.8}
                  cy={screenY}
                  r="0.5"
                  fill="#FFFFFF"
                  stroke="#57534E"
                  strokeWidth="0.06"
                />
                <text
                  x={0.8}
                  y={screenY + 0.18}
                  textAnchor="middle"
                  fontSize="0.5"
                  fontWeight="bold"
                  fill="#292524"
                >
                  {bubbleLetter}
                </text>
              </g>
            );
          })}

          {/* Vertical left dimension witness line */}
          <line
            x1={1.4}
            y1={oy}
            x2={1.4}
            y2={oy + 15}
            stroke="#A8A29E"
            strokeWidth="0.04"
          />

          {/* ==================================================== */}
          {/* 3. OUTER WALLS & REPEATING WINDOWS                  */}
          {/* ==================================================== */}
          {/* Outer Building Footprint (32m x 15m) */}
          <rect
            x={ox}
            y={oy}
            width={32}
            height={15}
            fill="#FAF8F5"
            stroke="#44403C"
            strokeWidth="0.22"
          />

          {/* Repeating Window Mullions along Top Wall */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={`win-top-${i}`}
              x1={ox + 1.2 + i * 1.25}
              y1={oy - 0.05}
              x2={ox + 1.2 + i * 1.25}
              y2={oy + 0.2}
              stroke="#78716C"
              strokeWidth="0.08"
            />
          ))}

          {/* Repeating Window Mullions along Bottom Wall */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={`win-bot-${i}`}
              x1={ox + 1.2 + i * 1.25}
              y1={oy + 14.8}
              x2={ox + 1.2 + i * 1.25}
              y2={oy + 15.05}
              stroke="#78716C"
              strokeWidth="0.08"
            />
          ))}

          {/* ==================================================== */}
          {/* 4. ROOMS & PARTITIONS (Data-driven)                  */}
          {/* ==================================================== */}
          {floorData.rooms.map((room) => {
            const rx = ox + room.x;
            const ry = oy + room.y;
            const styles = getCategoryStyles(room.category, !!room.isTarget);
            const isSelected = selectedRoomId === room.id;

            return (
              <g
                key={room.id}
                onClick={() => interactive && setSelectedRoomId(room.id)}
                className={interactive ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}
              >
                {/* Room Fill & Border */}
                <rect
                  x={rx}
                  y={ry}
                  width={room.width}
                  height={room.height}
                  fill={styles.fill}
                  stroke={isSelected ? '#15803D' : styles.stroke}
                  strokeWidth={isSelected ? '0.2' : (room.isTarget ? '0.16' : '0.1')}
                  filter={room.isTarget ? 'url(#targetGlow)' : undefined}
                />

                {/* Door Opening Swing Arc (if specified) */}
                {room.door && (
                  <path
                    d={`M ${rx + (room.door.side === 'right' ? room.width : 0)} ${ry + (room.door.offset || 2)} A 0.8 0.8 0 0 1 ${rx + (room.door.side === 'right' ? room.width - 0.8 : 0.8)} ${ry + (room.door.offset || 2) - 0.8}`}
                    fill="none"
                    stroke="#78716C"
                    strokeWidth="0.06"
                  />
                )}

                {/* Target Pin / Highlight Marker */}
                {room.isTarget && (
                  <g transform={`translate(${rx + room.width / 2}, ${ry + 1.2})`}>
                    <circle r="0.5" fill="#EF4444" />
                    <circle r="0.8" fill="none" stroke="#EF4444" strokeWidth="0.08" opacity="0.6">
                      <animate attributeName="r" values="0.5;1.2;0.5" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <text y="0.15" textAnchor="middle" fontSize="0.32" fontWeight="900" fill="#FFFFFF">
                      ★
                    </text>
                  </g>
                )}

                {/* Room Identification Bubble (A1, B1, C1, or Room Code) */}
                <g transform={`translate(${rx + room.width / 2}, ${ry + room.height / 2})`}>
                  <circle
                    r={room.width < 5 || room.height < 4 ? '0.65' : '0.85'}
                    fill={styles.badgeBg}
                    stroke="#FFFFFF"
                    strokeWidth="0.08"
                    filter="drop-shadow(0px 0.1px 0.2px rgba(0,0,0,0.25))"
                  />
                  <text
                    y={room.width < 5 || room.height < 4 ? '0.18' : '0.24'}
                    textAnchor="middle"
                    fontSize={room.width < 5 || room.height < 4 ? '0.45' : '0.6'}
                    fontWeight="800"
                    fill={styles.badgeText}
                  >
                    {room.code}
                  </text>

                  {/* Room Area Tag (e.g. 207 ตร.ม.) */}
                  {room.areaSqm && room.height >= 4.5 && (
                    <text
                      y="1.35"
                      textAnchor="middle"
                      fontSize="0.35"
                      fontWeight="bold"
                      fill="#B91C1C"
                    >
                      {room.areaSqm} ตร.ม.
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          {/* ==================================================== */}
          {/* 5. PERMANENT CORE FIXTURES: WC, ELEVATOR, STAIRS     */}
          {/* ==================================================== */}
          {/* Restroom Sanitary Fixtures (Right Core: ox+28.2 to 32, oy to oy+5.5) */}
          <g transform={`translate(${ox + 28.5}, ${oy + 0.4})`}>
            {/* Cubicles partitions */}
            <line x1="0" y1="1.1" x2="3.2" y2="1.1" stroke="#9CA3AF" strokeWidth="0.05" />
            <line x1="0" y1="2.2" x2="3.2" y2="2.2" stroke="#9CA3AF" strokeWidth="0.05" />
            <line x1="0" y1="3.3" x2="3.2" y2="3.3" stroke="#9CA3AF" strokeWidth="0.05" />
            {/* WC toilet icons */}
            <circle cx="0.4" cy="0.6" r="0.25" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.04" />
            <circle cx="0.4" cy="1.7" r="0.25" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.04" />
            <circle cx="0.4" cy="2.8" r="0.25" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.04" />
            <circle cx="0.4" cy="3.9" r="0.25" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.04" />
            {/* Washbasins */}
            <rect x="2.4" y="0.3" width="0.5" height="0.4" rx="0.1" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.04" />
            <rect x="2.4" y="1.4" width="0.5" height="0.4" rx="0.1" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.04" />
            <rect x="2.4" y="2.5" width="0.5" height="0.4" rx="0.1" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.04" />
            {/* Wheelchair Accessible Tag */}
            <text x="2.0" y="4.2" fontSize="0.4" fill="#3B82F6">♿</text>
          </g>

          {/* Passenger Elevator Shaft (Bottom-right core: ox+28.2, oy+9.0) */}
          <g transform={`translate(${ox + 28.2}, ${oy + 9.0})`}>
            {/* Shaft Cross Line */}
            <line x1="0" y1="0" x2="3.8" y2="2.5" stroke="#9CA3AF" strokeWidth="0.06" strokeDasharray="0.3, 0.2" />
            <line x1="3.8" y1="0" x2="0" y2="2.5" stroke="#9CA3AF" strokeWidth="0.06" strokeDasharray="0.3, 0.2" />
            {/* Elevator door slider */}
            <rect x="-0.15" y="0.5" width="0.3" height="1.5" fill="#2563EB" />
            <text x="1.9" y="1.5" textAnchor="middle" fontSize="0.38" fontWeight="bold" fill="#1E3A8A">
              ELEVATOR
            </text>
          </g>

          {/* Main Staircase Steps (Bottom-right core: ox+28.2, oy+11.5) */}
          <g transform={`translate(${ox + 28.2}, ${oy + 11.5})`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`main-step-${i}`} x1="0" y1={0.5 + i * 0.45} x2="3.8" y2={0.5 + i * 0.45} stroke="#78716C" strokeWidth="0.05" />
            ))}
            {/* Stair Handrail center line */}
            <line x1="1.9" y1="0" x2="1.9" y2="3.5" stroke="#44403C" strokeWidth="0.08" />
            {/* Green Fire Exit Sign */}
            <rect x="0.3" y="0.2" width="1.6" height="0.6" rx="0.1" fill="#16A34A" />
            <text x="1.1" y="0.62" textAnchor="middle" fontSize="0.28" fontWeight="bold" fill="#FFFFFF">
              FIRE EXIT
            </text>
          </g>

          {/* Fire Staircase (Top-Left: ox, oy to ox+4.8, oy+3.5) */}
          <g transform={`translate(${ox}, ${oy})`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`fire-step-${i}`} x1={0.8 + i * 0.6} y1="0" x2={0.8 + i * 0.6} y2="3.5" stroke="#78716C" strokeWidth="0.05" />
            ))}
            {/* Green Fire Exit Sign */}
            <rect x="0.4" y="0.3" width="1.8" height="0.7" rx="0.1" fill="#16A34A" />
            <text x="1.3" y="0.78" textAnchor="middle" fontSize="0.32" fontWeight="bold" fill="#FFFFFF">
              บันไดหนีไฟ
            </text>
            <text x="1.3" y="1.2" textAnchor="middle" fontSize="0.26" fontWeight="bold" fill="#DC2626">
              12 ตร.ม.
            </text>
          </g>

          {/* Red Fire Exit Arrow pointing Left */}
          <g transform={`translate(${ox - 2.8}, ${oy + 0.5})`}>
            <rect x="0" y="0.2" width="2.2" height="1.0" fill="#F87171" opacity="0.4" />
            <polygon points="0,0.7 0.8,0.1 0.8,0.5 2.2,0.5 2.2,0.9 0.8,0.9 0.8,1.3" fill="#DC2626" />
            <text x="1.1" y="-0.05" textAnchor="middle" fontSize="0.32" fontWeight="bold" fill="#DC2626">
              ทางหนีไฟ
            </text>
          </g>

          {/* ==================================================== */}
          {/* 6. BUILDING ENTRANCE ARROWS (Only Floor 1)           */}
          {/* ==================================================== */}
          {floorData.entrances?.map((ent, idx) => {
            const isTop = ent.side === 'top';
            const arrowY = isTop ? oy - 1.2 : oy + 15.2;
            return (
              <g key={`ent-${idx}`} transform={`translate(${ox + ent.x}, ${arrowY})`}>
                <polygon
                  points={isTop ? '0,1.0 -0.4,0.3 0.4,0.3' : '0,-0.2 -0.4,0.5 0.4,0.5'}
                  fill="#EC4899"
                />
                <text
                  x="0"
                  y={isTop ? -0.1 : 1.1}
                  textAnchor="middle"
                  fontSize="0.32"
                  fontWeight="bold"
                  fill="#BE185D"
                >
                  {ent.label}
                </text>
              </g>
            );
          })}

          {/* ==================================================== */}
          {/* 7. SAFETY EQUIPMENT: Fire Extinguisher & Alarm       */}
          {/* ==================================================== */}
          {floorData.safetyEquipment?.map((eq, idx) => {
            const eqX = ox + eq.x;
            const eqY = oy + eq.y;
            if (eq.type === 'extinguisher') {
              return (
                <g key={`eq-${idx}`} transform={`translate(${eqX}, ${eqY})`}>
                  <rect x="-0.2" y="-0.3" width="0.4" height="0.6" fill="#DC2626" rx="0.05" />
                  <title>ตู้เก็บอุปกรณ์ดับเพลิง</title>
                </g>
              );
            }
            return (
              <g key={`eq-${idx}`} transform={`translate(${eqX}, ${eqY})`}>
                <circle r="0.25" fill="#DC2626" />
                <title>ตำแหน่งสัญญาณเตือนภัย</title>
              </g>
            );
          })}

          {/* ==================================================== */}
          {/* 8. STEP-BY-STEP INDOOR NAVIGATION PATH              */}
          {/* ==================================================== */}
          {showNavigationPath && (
            <g>
              {/* CASE 1: Floor 1 is currently viewed */}
              {isFloor1 && (
                <g>
                  {currentStepIndex === 0 ? (
                    // Step 1 Active Path on Floor 1: Entrance -> Elevator/Stairs
                    <>
                      <path
                        d={`M ${entX} ${entY} L ${lobbyCornerX} ${lobbyCornerY} L ${lobbyCornerX} ${elevY} L ${elevX} ${elevY}`}
                        fill="none"
                        stroke="#15803D"
                        strokeWidth="0.26"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="0.6, 0.4"
                      >
                        <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" repeatCount="indefinite" />
                      </path>

                      {/* Start Point Marker (Main Entrance) */}
                      <circle cx={entX} cy={entY} r="0.4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.08" />
                      <text x={entX} y={entY - 0.55} textAnchor="middle" fontSize="0.32" fontWeight="bold" fill="#1D4ED8">
                        ทางเข้า
                      </text>

                      {/* Elevator / Stairs Arrival Point (Pulsing Target of Step 1) */}
                      <g transform={`translate(${elevX}, ${elevY})`}>
                        <circle r="0.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="0.08" />
                        <circle r="0.9" fill="none" stroke="#EA580C" strokeWidth="0.08" opacity="0.8">
                          <animate attributeName="r" values="0.5;1.2;0.5" dur="1.8s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                        <text y="0.12" textAnchor="middle" fontSize="0.34" fontWeight="900" fill="#FFFFFF">
                          🛗
                        </text>
                        {/* Target badge */}
                        <rect x="-2.6" y="0.7" width="5.2" height="0.8" rx="0.2" fill="#C2410C" />
                        <text x="0" y="1.25" textAnchor="middle" fontSize="0.28" fontWeight="bold" fill="#FFFFFF">
                          ก้าวที่ 1: ขึ้นลิฟต์ไปชั้น {targetFloor}
                        </text>
                      </g>
                    </>
                  ) : (
                    // Floor 1 already passed -> Completed route
                    <>
                      <path
                        d={`M ${entX} ${entY} L ${lobbyCornerX} ${lobbyCornerY} L ${lobbyCornerX} ${elevY} L ${elevX} ${elevY}`}
                        fill="none"
                        stroke="#86EFAC"
                        strokeWidth="0.22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx={elevX} cy={elevY} r="0.35" fill="#16A34A" stroke="#FFFFFF" strokeWidth="0.08" />
                      <text x={elevX} y={elevY + 0.12} textAnchor="middle" fontSize="0.28" fontWeight="bold" fill="#FFFFFF">
                        ✓
                      </text>
                    </>
                  )}
                </g>
              )}

              {/* CASE 2: Upper Floor (Floor 2, 3, 4, 5...) */}
              {!isFloor1 && (
                <g>
                  {/* Step 1: User is still on Floor 1, waiting to arrive at this floor */}
                  {currentStepIndex === 0 && (
                    <g transform={`translate(${elevX}, ${elevY})`}>
                      <circle cx="0" cy="0" r="0.4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="0.08" />
                      <text x="0" y="-0.6" textAnchor="middle" fontSize="0.32" fontWeight="bold" fill="#2563EB">
                        จุดเริ่มชั้นนี้ (ออกจากลิฟต์)
                      </text>
                      <rect x="-3.2" y="0.6" width="6.4" height="0.8" rx="0.2" fill="#1E293B" opacity="0.9" />
                      <text x="0" y="1.15" textAnchor="middle" fontSize="0.28" fontWeight="bold" fill="#94A3B8">
                        รอขึ้นลิฟต์มาถึงชั้นนี้...
                      </text>
                    </g>
                  )}

                  {/* Step 2: Elevator -> Checkpoint 1 ONLY (Wait for user to turn) */}
                  {currentStepIndex === 1 && (
                    <g>
                      {/* Active Animated Dashed Line: Elevator to Checkpoint 1 */}
                      <path
                        d={`M ${elevX} ${elevY} L ${cornerX} ${cornerY} L ${cp1X} ${cp1Y}`}
                        fill="none"
                        stroke="#15803D"
                        strokeWidth="0.28"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="0.6, 0.4"
                      >
                        <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" repeatCount="indefinite" />
                      </path>

                      {/* Origin Dot at Elevator */}
                      <circle cx={elevX} cy={elevY} r="0.4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="0.08" />
                      <text x={elevX} y={elevY - 0.55} textAnchor="middle" fontSize="0.3" fontWeight="bold" fill="#1D4ED8">
                        ออกจากลิฟต์
                      </text>

                      {/* Checkpoint 1: Active Pulsing Target of Step 2 */}
                      <g transform={`translate(${cp1X}, ${cp1Y})`}>
                        <circle r="0.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="0.08" />
                        <circle r="0.95" fill="none" stroke="#EA580C" strokeWidth="0.08" opacity="0.8">
                          <animate attributeName="r" values="0.5;1.25;0.5" dur="1.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0;0.8" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                        <text y="0.18" textAnchor="middle" fontSize="0.36" fontWeight="900" fill="#FFFFFF">
                          1
                        </text>
                        {/* Checkpoint Badge */}
                        <rect x="-2.6" y="0.7" width="5.2" height="0.8" rx="0.2" fill="#C2410C" />
                        <text x="0" y="1.25" textAnchor="middle" fontSize="0.28" fontWeight="bold" fill="#FFFFFF">
                          ก้าวที่ 2: จุดสังเกต (เลี้ยวซ้าย)
                        </text>
                      </g>

                      {/* Faint hint line for Step 3 to show future direction without confusing user */}
                      <path
                        d={`M ${cp1X} ${cp1Y} L ${destX} ${cp1Y} L ${destX} ${destY}`}
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="0.14"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="0.3, 0.3"
                        opacity="0.35"
                      />
                    </g>
                  )}

                  {/* Step 3: CP1 -> Destination Room Door */}
                  {currentStepIndex >= 2 && (
                    <g>
                      {/* Completed Segment 1 (Elevator to Checkpoint 1) */}
                      <path
                        d={`M ${elevX} ${elevY} L ${cornerX} ${cornerY} L ${cp1X} ${cp1Y}`}
                        fill="none"
                        stroke="#86EFAC"
                        strokeWidth="0.22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx={elevX} cy={elevY} r="0.25" fill="#94A3B8" />

                      {/* Checkpoint 1 marked with Done Checkmark */}
                      <circle cx={cp1X} cy={cp1Y} r="0.35" fill="#16A34A" stroke="#FFFFFF" strokeWidth="0.08" />
                      <text x={cp1X} y={cp1Y + 0.12} textAnchor="middle" fontSize="0.28" fontWeight="bold" fill="#FFFFFF">
                        ✓
                      </text>

                      {/* Active Animated Dashed Segment 2 (Checkpoint 1 to Destination Room) */}
                      <path
                        d={`M ${cp1X} ${cp1Y} L ${destX} ${cp1Y} L ${destX} ${destY}`}
                        fill="none"
                        stroke="#15803D"
                        strokeWidth="0.28"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="0.6, 0.4"
                      >
                        <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" repeatCount="indefinite" />
                      </path>

                      {/* Destination Pin Marker at Door / Room */}
                      <g transform={`translate(${destX}, ${destY})`}>
                        <circle r="0.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="0.08" />
                        <circle r="0.95" fill="none" stroke="#DC2626" strokeWidth="0.08" opacity="0.8">
                          <animate attributeName="r" values="0.5;1.3;0.5" dur="1.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0;0.8" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                        <text y="0.18" textAnchor="middle" fontSize="0.34" fontWeight="bold" fill="#FFFFFF">
                          ★
                        </text>
                        {/* Target badge */}
                        <rect x="-2.5" y="0.7" width="5.0" height="0.8" rx="0.2" fill="#991B1B" />
                        <text x="0" y="1.25" textAnchor="middle" fontSize="0.28" fontWeight="bold" fill="#FFFFFF">
                          ก้าวที่ 3: ถึงห้อง {targetRoom?.code || 'เป้าหมาย'}
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              )}
            </g>
          )}

          {/* ==================================================== */}
          {/* 9. BOTTOM RIGHT TITLE BADGE (1:125 Scale)            */}
          {/* ==================================================== */}
          <g transform={`translate(${ox + 23.5}, ${oy + 16.5})`}>
            <rect x="0" y="0" width="8.5" height="2.2" rx="0.5" fill="#1C1917" />
            <text x="4.25" y="0.9" textAnchor="middle" fontSize="0.65" fontWeight="bold" fill="#FFFFFF">
              {floorData.floorTitle}
            </text>
            <text x="4.25" y="1.7" textAnchor="middle" fontSize="0.42" fontWeight="medium" fill="#A8A29E">
              {floorData.scaleText}
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Room Details Bar (if room clicked or targeted) */}
      {activeRoom && (
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-2.5 flex items-center justify-between animate-fadeIn text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              activeRoom.category === 'shared' ? 'bg-[#4E8A51]' : (activeRoom.category === 'workspace' ? 'bg-[#C85A2E]' : 'bg-[#3B6DB8]')
            }`}>
              {activeRoom.code}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900">{activeRoom.name}</span>
                {activeRoom.isTarget && (
                  <span className="bg-yellow-100 text-yellow-800 text-[9.5px] font-extrabold px-1.5 py-0.2 rounded">
                    เป้าหมาย
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                {activeRoom.department || floorData.buildingNameTh} • พื้นที่ {activeRoom.areaSqm || '-'} ตร.ม.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200/80">
            {activeRoom.category === 'shared' ? 'พื้นที่ส่วนรวม (A)' : (activeRoom.category === 'workspace' ? 'พื้นที่ทำงาน (B)' : 'พื้นที่พักผ่อน (C)')}
          </span>
        </div>
      )}

      {/* Blueprint Legend Footer (Matching Reference Drawings Page 1-5) */}
      <div className="pt-1 border-t border-stone-200/60 flex flex-wrap items-center justify-between text-[10.5px] font-medium text-stone-600 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#D9EDD4] border border-[#6BA569]" />
            <span>A พื้นที่ส่วนรวม</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#F8CBB4] border border-[#DF7D54]" />
            <span>B พื้นที่ทำงาน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#C9DAF8] border border-[#5C8BD4]" />
            <span>C พื้นที่พักผ่อน</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-stone-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-3 bg-red-600 rounded-xs" />
            <span>ตู้เก็บอุปกรณ์ดับเพลิง</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>สัญญาณเตือนภัย</span>
          </div>
        </div>
      </div>
    </div>
  );
};
