import React, { useState, useEffect } from 'react';
import { ScreenId, RoomInfo, BuildingInfo, UserPreferences, TravelMode } from './types/navigation';
import { INITIAL_PREFERENCES, RB5_BUILDING } from './data/campusData';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SearchResultsScreen } from './screens/SearchResultsScreen';
import { StartingPointScreen } from './screens/StartingPointScreen';
import { RoutePreviewScreen } from './screens/RoutePreviewScreen';
import { OutdoorNavScreen } from './screens/OutdoorNavScreen';
import { ThresholdTransitionScreen } from './screens/ThresholdTransitionScreen';
import { IndoorNavScreen } from './screens/IndoorNavScreen';
import { ArrivalScreen } from './screens/ArrivalScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AssistanceModal } from './components/AssistanceModal';
import { ErrorBoundary } from './components/ErrorBoundary';

const DebugMapScreen = React.lazy(() =>
  import('./screens/DebugMapScreen').then((m) => ({ default: m.DebugMapScreen }))
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [searchQuery, setSearchQuery] = useState('RB5');
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo>(RB5_BUILDING);
  const [startingPoint, setStartingPoint] = useState('วิทยาลัยศิลปะ สื่อและเทคโนโลยี (CAMT)');
  const [startingPointCoords, setStartingPointCoords] = useState<{lat: number, lng: number}>({ lat: 18.800705, lng: 98.950591 });
  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const [selectedTravelMode, setSelectedTravelMode] = useState<TravelMode>('walk');
  const [brandVariant, setBrandVariant] = useState<'WayFind' | 'LostFound'>('WayFind');
  const [deviceFrameMode, setDeviceFrameMode] = useState<'promax' | 'fullscreen'>('promax');
  const [scaleMode, setScaleMode] = useState<'fit' | '100%'>('fit');
  const [isDebugMap, setIsDebugMap] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/debug/map' ||
        window.location.hash === '#debug-map' ||
        window.location.search.includes('debug=map'))
    );
  });

  // Modal states
  const [modalType, setModalType] = useState<'lost' | 'report' | 'options' | null>(null);
  const [arrivalMode, setArrivalMode] = useState<'building' | 'room'>('building');

  // Sync /debug/map URL and hash
  useEffect(() => {
    const handleLocationChange = () => {
      const isDebug =
        window.location.pathname === '/debug/map' ||
        window.location.hash === '#debug-map' ||
        window.location.search.includes('debug=map');
      setIsDebugMap(isDebug);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Auto transition from splash to home after 3.6s if user does not click (as in html prototype)
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        // Auto transition demonstration
        setCurrentScreen('home');
      }, 3600);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentScreen('search');
  };

  const handleSelectDestination = (room: RoomInfo | null, building?: BuildingInfo) => {
    setSelectedRoom(room);
    if (building) {
      setSelectedBuilding(building);
    }
  };

  const handleStartNavigation = (mode: TravelMode) => {
    setSelectedTravelMode(mode);
    handleUpdatePreferences({ defaultTravelMode: mode });
    setCurrentScreen('outdoor-nav');
  };

  const handleCheckpointReached = () => {
    // Proceed into contextual threshold transition before indoor navigation
    setCurrentScreen('threshold-transition');
  };

  const handleNextLandmark = () => {
    // Reached destination room 204
    setArrivalMode('room');
    setCurrentScreen('arrival');
  };

  if (isDebugMap) {
    return (
      <React.Suspense
        fallback={
          <div className="w-screen h-screen bg-slate-900 text-white flex items-center justify-center font-bold font-sans">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Loading Campus Network & Route Inspector...</span>
            </div>
          </div>
        }
      >
        <DebugMapScreen
          onBack={() => {
            setIsDebugMap(false);
            if (window.location.hash === '#debug-map') {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0D0B16] flex flex-col items-center justify-start py-3 px-2 font-sans select-none text-slate-800 overflow-x-hidden">
      {/* ======================================================== */}
      {/* Top Prototype Controls Bar (As featured in prototype html) */}
      {/* ======================================================== */}
      <header className="mb-3 flex flex-wrap items-center justify-center gap-2 z-50 max-w-3xl px-2">
        {/* Debug Map Toggle Button */}
        <button
          onClick={() => {
            setIsDebugMap(true);
            window.location.hash = '#debug-map';
          }}
          className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 active:scale-95 text-emerald-300 text-xs font-bold rounded-full border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
          title="Open Campus Walkway & Route Debugger (/debug/map)"
        >
          <span>🗺️ Debug Map</span>
          <span className="text-[9px] bg-emerald-500/30 px-1.5 py-0.5 rounded font-mono text-emerald-200">/debug/map</span>
        </button>
        {/* Replay Intro / Toggle Splash Button */}
        <button
          onClick={() => {
            if (currentScreen === 'splash') {
              setCurrentScreen('home');
            } else {
              setCurrentScreen('splash');
            }
          }}
          className="group px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
          id="toggleTransitionBtn"
        >
          <svg
            className="w-3.5 h-3.5 text-brand-300 group-hover:rotate-180 transition-transform duration-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{currentScreen === 'splash' ? 'Enter Home' : 'Replay Intro'}</span>
        </button>

        {/* Prototype Screen Fast Jumper */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1">
          <span className="text-[11px] text-white/60 font-medium hidden sm:inline">Screen:</span>
          <select
            value={currentScreen}
            onChange={(e) => setCurrentScreen(e.target.value as ScreenId)}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer border-0 p-0 pr-2"
          >
            <option value="splash" className="bg-[#1D1138] text-white">1. Splash Screen</option>
            <option value="home" className="bg-[#1D1138] text-white">2. Home Screen</option>
            <option value="search" className="bg-[#1D1138] text-white">3. Search & Room Directory</option>
            <option value="starting-point" className="bg-[#1D1138] text-white">4. Choose Starting Point</option>
            <option value="route-preview" className="bg-[#1D1138] text-white">5. Route Preview (Decluttered)</option>
            <option value="outdoor-nav" className="bg-[#1D1138] text-white">6. Outdoor Nav & Landmarks</option>
            <option value="threshold-transition" className="bg-[#1D1138] text-white">7. Outdoor  Indoor Handoff</option>
            <option value="indoor-nav" className="bg-[#1D1138] text-white">8. Indoor Step Navigation</option>
            <option value="arrival" className="bg-[#1D1138] text-white">9. Arrival & Verification</option>
            <option value="profile" className="bg-[#1D1138] text-white">10. Student Profile</option>
          </select>
        </div>

        {/* Model Spec Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-500/20 text-brand-200 text-[11px] font-semibold rounded-full border border-brand-400/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>iPhone 15 Pro Max (430 × 932)</span>
        </div>

        {/* Viewport Frame Toggle */}
        <button
          onClick={() => setDeviceFrameMode(deviceFrameMode === 'promax' ? 'fullscreen' : 'promax')}
          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-brand-200 text-[11px] font-semibold rounded-full border border-white/15 transition-all cursor-pointer"
          title="Toggle phone bezel mockup or full canvas"
        >
          {deviceFrameMode === 'promax' ? ' Pro Max Frame' : ' Full View'}
        </button>

        {/* Scale Toggle for comfortable viewing */}
        {deviceFrameMode === 'promax' && (
          <button
            onClick={() => setScaleMode(scaleMode === 'fit' ? '100%' : 'fit')}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-medium rounded-full border border-white/15 transition-all cursor-pointer"
            title="Scale to fit screen or 100% actual dimensions"
          >
            {scaleMode === 'fit' ? ' Fit Window' : ' 100% Size'}
          </button>
        )}
      </header>

      {/* ======================================================== */}
      {/* iPhone 15 Pro Max Device Frame Container (430px × 932px) */}
      {/* ======================================================== */}
      <div
        className={`relative flex items-center justify-center transition-all duration-300 ${
          deviceFrameMode === 'promax' && scaleMode === 'fit'
            ? 'origin-top scale-[0.88] sm:scale-[0.92] md:scale-[0.95] lg:scale-100 my-0'
            : 'my-1'
        }`}
      >
        {/* Physical Hardware Buttons Simulation on Bezel (Left & Right) */}
        {deviceFrameMode === 'promax' && (
          <>
            {/* Left side: Action Button */}
            <div className="absolute -left-[14px] top-[148px] w-[4px] h-[32px] bg-[#363444] rounded-l-[3px] border-l border-white/20 shadow-soft pointer-events-none" />
            {/* Left side: Volume Up Button */}
            <div className="absolute -left-[14px] top-[200px] w-[4px] h-[58px] bg-[#363444] rounded-l-[3px] border-l border-white/20 shadow-soft pointer-events-none" />
            {/* Left side: Volume Down Button */}
            <div className="absolute -left-[14px] top-[275px] w-[4px] h-[58px] bg-[#363444] rounded-l-[3px] border-l border-white/20 shadow-soft pointer-events-none" />
            {/* Right side: Power / Lock Button */}
            <div className="absolute -right-[14px] top-[220px] w-[4px] h-[88px] bg-[#363444] rounded-r-[3px] border-r border-white/20 shadow-soft pointer-events-none" />
          </>
        )}

        <main
          className={`relative overflow-hidden transition-all duration-300 ${
            deviceFrameMode === 'promax'
              ? 'w-[430px] h-[932px] rounded-[56px] shadow-[0_30px_90px_rgba(0,0,0,0.7)] border-[11px] border-[#22212C] ring-1 ring-white/15'
              : 'w-full max-w-[460px] h-[92vh] rounded-[28px] shadow-2xl border border-white/20'
          } bg-[#FAF9FD] flex flex-col justify-between`}
          id="phoneContainer"
        >
          <ErrorBoundary fallbackTitle="เกิดข้อผิดพลาดในการโหลดหน้าจอ">
          {/* Render Current Active Screen */}
          {currentScreen === 'splash' && (
            <SplashScreen
              onEnter={() => setCurrentScreen('home')}
              brandVariant={brandVariant}
              onToggleBrand={() =>
                setBrandVariant((prev) => (prev === 'WayFind' ? 'LostFound' : 'WayFind'))
              }
            />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              onSearch={handleSearch}
              onNavigateScreen={(screen) => setCurrentScreen(screen)}
            />
          )}

          {currentScreen === 'search' && (
            <SearchResultsScreen
              searchQuery={searchQuery}
              onBack={() => setCurrentScreen('home')}
              onSelectDestination={handleSelectDestination}
              onNavigateScreen={(screen) => setCurrentScreen(screen)}
              onOptionsClick={() => setModalType('options')}
            />
          )}

          {currentScreen === 'starting-point' && (
            <StartingPointScreen
              onBack={() => setCurrentScreen('search')}
              onConfirmStartingPoint={(origin, coords) => {
                setStartingPoint(origin);
                if (coords) setStartingPointCoords(coords);
              }}
              onNavigateScreen={(screen) => setCurrentScreen(screen)}
              targetBuilding={selectedBuilding}
              userLocation={startingPointCoords}
              onSelectBuilding={(building) => setSelectedBuilding(building)}
            />
          )}

          {currentScreen === 'route-preview' && (
            <RoutePreviewScreen
              origin={startingPoint}
              destinationName={
                selectedRoom
                  ? `${selectedBuilding.code} Room ${selectedRoom.code} (${selectedBuilding.nameTh || selectedBuilding.name})`
                  : `${selectedBuilding.name} (${selectedBuilding.nameTh || selectedBuilding.code})`
              }
              onBack={() => setCurrentScreen('search')}
              onStartNavigation={handleStartNavigation}
              onNavigateScreen={(screen) => setCurrentScreen(screen)}
              onOptionsClick={() => setModalType('options')}
              targetBuilding={selectedBuilding}
              userLocation={startingPointCoords}
            />
          )}

          {currentScreen === 'outdoor-nav' && (
            <OutdoorNavScreen
              onCheckpointReached={handleCheckpointReached}
              onOpenLostModal={() => setModalType('lost')}
              onExitNavigation={() => setCurrentScreen('route-preview')}
              onNavigateScreen={(screen) => setCurrentScreen(screen)}
              targetBuilding={selectedBuilding}
              userLocation={startingPointCoords}
              travelMode={selectedTravelMode}
            />
          )}

          {currentScreen === 'threshold-transition' && (
            <ThresholdTransitionScreen
              targetBuilding={selectedBuilding}
              targetRoom={selectedRoom}
              onEnterBuilding={() => setCurrentScreen('indoor-nav')}
              onBackToOutdoor={() => setCurrentScreen('outdoor-nav')}
              onFinishBuildingArrival={() => {
                setArrivalMode('building');
                setCurrentScreen('arrival');
              }}
              onNavigateScreen={(screen) => setCurrentScreen(screen)}
            />
          )}

          {currentScreen === 'indoor-nav' && (
            <IndoorNavScreen
              targetBuilding={selectedBuilding}
              targetRoom={selectedRoom}
              onNextLandmark={handleNextLandmark}
              onOpenLostModal={() => setModalType('lost')}
              onBack={() => setCurrentScreen('threshold-transition')}
            />
          )}

          {currentScreen === 'arrival' && (
            <ArrivalScreen
              targetBuilding={selectedBuilding}
              targetRoom={selectedRoom}
              mode={arrivalMode}
              onReturnHome={() => {
                setSelectedRoom(null);
                setCurrentScreen('home');
              }}
              onStartIndoorNav={() => setCurrentScreen('indoor-nav')}
              onReportIssue={() => setModalType('report')}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onNavigateScreen={(screen) => setCurrentScreen(screen)}
              onOpenSettings={() => setModalType('options')}
              onSelectSavedPlace={(place) => {
                setSearchQuery(place);
                setCurrentScreen('search');
              }}
            />
          )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Interactive Assistance Modals */}
      <AssistanceModal
        type={modalType || 'lost'}
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onAction={(action) => {
          if (action === 'recalibrate') {
            setCurrentScreen('outdoor-nav');
          }
        }}
      />
    </div>
  );
}
