import React, { useState } from 'react';
import { StatusBar } from '../components/StatusBar';
import { CampusVectorMap } from '../components/CampusVectorMap';
import { ScreenId, BuildingInfo } from '../types/navigation';

interface StartingPointScreenProps {
  onBack: () => void;
  onConfirmStartingPoint: (origin: string, coords?: { lat: number; lng: number }) => void;
  onNavigateScreen: (screen: ScreenId) => void;
  targetBuilding?: BuildingInfo | null;
  userLocation?: { lat: number; lng: number };
  onSelectBuilding?: (building: BuildingInfo) => void;
}

export const StartingPointScreen: React.FC<StartingPointScreenProps> = ({
  onBack,
  onConfirmStartingPoint,
  onNavigateScreen,
  targetBuilding,
  userLocation,
  onSelectBuilding,
}) => {
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [pinModeActive, setPinModeActive] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState('Student Hub');
  const [mapCenter, setMapCenter] = useState({ lat: 18.800705, lng: 98.950591 });

  const handleUseCurrentLocation = () => {
    if (!gpsEnabled) {
      alert('Please enable GPS to use your current location, or choose "Drop a manual pin".');
      return;
    }
    onConfirmStartingPoint('วิทยาลัยศิลปะ สื่อและเทคโนโลยี (CAMT)', { lat: 18.800705, lng: 98.950591 });
    onNavigateScreen('route-preview');
  };

  const handleManualPin = () => {
    setPinModeActive(true);
  };

  const handleConfirmPin = () => {
    onConfirmStartingPoint('Custom Pinned Location', mapCenter);
    onNavigateScreen('route-preview');
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#F4F6FA] select-none" data-purpose="choose-starting-point-screen">
      {/* Campus Vector Map Background */}
      <CampusVectorMap
        showRoute={true}
        routeType="preview-dash"
        targetBuilding={targetBuilding}
        userLocation={userLocation || { lat: 18.800705, lng: 98.950591 }}
        onSelectBuilding={onSelectBuilding}
        showLayersControl={true}
        showCompassControl={true}
        onCenterChange={setMapCenter}
      />

      {/* Top Header Bar (Locked at top with safe Dynamic Island clearance) */}
      <header className="shrink-0 z-30 bg-white/80 backdrop-blur-md pb-2.5 border-b border-brand-100/40 shadow-soft" data-purpose="status-and-top-nav">
        <StatusBar theme="dark" />

        <div className="px-5 pt-1.5 flex items-center justify-between" data-purpose="nav-header">
          <div className="flex items-center gap-3 w-full">
            {/* Circular Back Button */}
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-soft border border-gray-200/70 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition cursor-pointer"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-700 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Screen Title */}
            <div className="flex-1 text-center pr-10">
              <h1 className="text-base font-bold text-gray-900 tracking-tight">
                Choose starting point
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Absolute Centered Pin for Manual Selection */}
      {pinModeActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none mb-32">
          <div className="relative">
            {/* Bounce Animation wrapper */}
            <div className="animate-bounce">
              <svg className="w-10 h-10 text-brand-600 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            {/* Shadow under pin */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-[50%] blur-[1px]"></div>
          </div>
        </div>
      )}

      {/* Spacer to expose map */}
      <div className="flex-1 pointer-events-none" />

      {/* Location Permission Modal Sheet */}
      <section
        className="relative z-30 bg-white rounded-t-[36px] shadow-2xl px-6 pt-3 pb-3 border-t border-brand-100/50"
        data-purpose="location-prompt-card"
      >
        {/* Top Center Drag Handle */}
        <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 mt-0.5" />

        {/* Header Row: Icon, Title & Flow Pagination Dots */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: Soft Sage Squircle with Location Beacon Icon */}
          <div className="w-12 h-12 rounded-3xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-600">
            <svg
              className="w-6 h-6 rotate-[-15deg] translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polygon fill="currentColor" fillOpacity="0.12" points="3 11 22 2 13 21 11 13 3 11" stroke="currentColor" />
            </svg>
          </div>

          {/* Middle: Title & Subtitle */}
          <div className="flex-1 pt-0.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-snug">
                Where are you now?
              </h2>
              {/* Step Indicator Dots */}
              <div aria-label="Step progress indicator" className="flex items-center space-x-1.5">
                <span className="w-2.5 h-1.5 rounded-full bg-brand-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed pr-2">
              WayFind needs a starting point to calculate your best route.
            </p>
          </div>
        </div>

        {/* Allow GPS Permission Row with iOS Toggle */}
        <div className="mt-4 p-3.5 bg-surface-soft rounded-3xl border border-brand-100/80 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-900 block leading-tight">Allow GPS</span>
            <span className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5 block">
              {gpsEnabled ? 'Using your precise location while navigating' : 'Precise GPS currently disabled'}
            </span>
          </div>

          {/* iOS Switch Toggle Component */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gpsEnabled}
              onChange={(e) => setGpsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
          </label>
        </div>

        {/* Action Buttons Stack */}
        <div className="mt-4 space-y-2.5" data-purpose="cta-buttons-group">
          {pinModeActive ? (
            <button
              onClick={handleConfirmPin}
              className="w-full h-12 text-white font-bold rounded-full bg-brand-600 hover:bg-brand-700 shadow-float transition-all duration-150 flex items-center justify-center text-[15px] tracking-wide active:scale-[0.99] shadow-md shadow-brand-600/30"
              type="button"
            >
              Confirm Pin Here
            </button>
          ) : (
            <>
              {/* Primary Action: Current Location */}
              <button
                onClick={handleUseCurrentLocation}
                className={`w-full h-12 text-white font-semibold rounded-full shadow-float transition-all duration-150 flex items-center justify-center text-[15px] tracking-wide active:scale-[0.99] ${
                  gpsEnabled
                    ? 'bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/30'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
                type="button"
              >
                {gpsEnabled ? 'Use my current location' : 'GPS is disabled'}
              </button>

              {/* Secondary Action: Drop a Manual Pin */}
              <button
                onClick={handleManualPin}
                className="w-full h-11 bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-800 font-medium rounded-full border border-gray-200/90 transition-all duration-150 flex items-center justify-center gap-2 text-sm shadow-soft"
                type="button"
              >
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
                <span>Drop a manual pin</span>
              </button>
            </>
          )}
        </div>

        {/* Privacy Footnote */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-gray-400 text-[11px] pb-1">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" width="14" x="5" y="11" />
            <circle cx="12" cy="16" fill="currentColor" r="1.5" />
            <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Your location is only used during this trip.</span>
        </div>

        {/* iOS Home Indicator */}
        <div className="w-32 h-1 bg-slate-900/25 rounded-full mx-auto mt-2 mb-1" />
      </section>
    </div>
  );
};
