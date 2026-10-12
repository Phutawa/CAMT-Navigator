import React, { useState } from 'react';
import { StatusBar } from '../components/StatusBar';
import { BottomNavBar } from '../components/BottomNavBar';
import { ScreenId, TravelMode, UserPreferences } from '../types/navigation';
import { CAMPUS_IMAGES } from '../data/campusData';

interface ProfileScreenProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onNavigateScreen: (screen: ScreenId) => void;
  onOpenSettings: () => void;
  onSelectSavedPlace: (placeName: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  preferences,
  onUpdatePreferences,
  onNavigateScreen,
  onOpenSettings,
  onSelectSavedPlace,
}) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [studentName, setStudentName] = useState('Maya Thompson');
  const [studentMajor, setStudentMajor] = useState('BSc Computer Science · Year 2');
  const [showTravelModeSelector, setShowTravelModeSelector] = useState(false);
  const [voiceTestPlaying, setVoiceTestPlaying] = useState(false);

  const handleVoiceToggle = () => {
    const nextState = !preferences.voiceGuidance;
    onUpdatePreferences({ voiceGuidance: nextState });
    if (nextState) {
      setVoiceTestPlaying(true);
      // Play a subtle speech synthesizer utterance or audio feedback
      if ('speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance('WayFind voice guidance active. In 120 meters, turn right at Library Walk.');
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        } catch {
          // fallback
        }
      }
      setTimeout(() => setVoiceTestPlaying(false), 2400);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[var(--bg)] select-none" data-purpose="profile-screen">
      {/* ======================================================== */}
      {/* LOCKED TOP HEADER (Fixed at top, does NOT scroll away)  */}
      {/* ======================================================== */}
      <header className="shrink-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--primary-soft)]/50 shadow-[0_4px_16px_rgba(43,77,54,0.03)]">
        {/* Top iOS Status Bar */}
        <StatusBar theme="dark" />

        {/* Top Profile Header Bar */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3" data-purpose="page-title-bar">
          <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">Profile</h1>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-slate-700 shadow-soft active:scale-95 transition hover:bg-canvas cursor-pointer"
            type="button"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Scrollable Profile Content */}
      <main className="flex-1 px-5 pt-3 pb-4 overflow-y-auto no-scrollbar space-y-4">

        {/* Student Profile Identity Card */}
        <section className="relative overflow-hidden bg-[var(--primary-dark)] rounded-[22px] p-4 text-white shadow-lg shadow-[rgba(43,77,54,0.2)]" data-purpose="student-identity-card">
          {/* Edit Profile Pencil Button */}
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            aria-label="Edit Profile"
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>

          <div className="flex items-center space-x-3.5">
            {/* Profile Avatar with subtle ring */}
            <div className="relative flex-shrink-0">
              <img
                src={CAMPUS_IMAGES.studentMaya}
                alt="Maya Thompson Student ID"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--primary-soft)]/50"
              />
            </div>

            {/* Student Meta Information */}
            <div className="flex-1 min-w-0 pr-6">
              {editingProfile ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs bg-white/20 px-2 py-0.5 rounded text-white font-bold outline-none"
                  />
                  <input
                    type="text"
                    value={studentMajor}
                    onChange={(e) => setStudentMajor(e.target.value)}
                    className="w-full text-[10px] bg-white/20 px-2 py-0.5 rounded text-white/80 outline-none"
                  />
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="text-[9px] bg-brand-500 px-2 py-0.5 rounded text-white font-bold mt-1"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-[17px] font-bold tracking-tight text-white leading-tight truncate">
                    {studentName}
                  </h2>
                  <p className="text-[12px] text-[var(--primary-soft)] font-normal mt-0.5 leading-snug truncate">
                    {studentMajor}
                  </p>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-medium tracking-wide mt-1.5 border border-white/20">
                    STU 2026 04821
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Saved Places Section */}
        <section data-purpose="saved-locations-section">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h3 className="text-[15px] font-bold text-[var(--ink)]">Saved places</h3>
            <button
              onClick={() => onNavigateScreen('search')}
              className="text-[12px] font-semibold text-[var(--primary)] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Main Library */}
            <div
              onClick={() => onSelectSavedPlace('Main Library')}
              className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between cursor-pointer hover:border-[var(--primary-soft)] transition active:scale-[0.98]"
              data-purpose="saved-place-item"
            >
              <div className="w-8 h-8 rounded-2xl bg-[var(--primary-soft)]/60 flex items-center justify-center text-[var(--primary)] mb-2.5">
                <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight">Main Library</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">West Campus</p>
              </div>
            </div>

            {/* Card 2: Robotics Lab */}
            <div
              onClick={() => onSelectSavedPlace('Robotics Lab 2.14')}
              className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between cursor-pointer hover:border-[var(--primary-soft)] transition active:scale-[0.98]"
              data-purpose="saved-place-item"
            >
              <div className="w-8 h-8 rounded-2xl bg-[var(--primary-soft)]/60 flex items-center justify-center text-[var(--primary)] mb-2.5">
                <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.127A2 2 0 0 1 14 9.527V2" />
                  <path d="M8.5 2h7" />
                  <path d="M7 16h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight">Robotics Lab</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">RB5 · Level 2</p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Preferences */}
        <section data-purpose="navigation-preferences-section">
          <h3 className="text-[15px] font-bold text-[var(--ink)] mb-2.5 px-0.5">Navigation preferences</h3>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] divide-y divide-slate-100 overflow-hidden">
            {/* Preference 1: Step-free routes */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)]/60 flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="4" r="2" />
                    <path d="m15 11 1.5 7h-3.5l-1-4-2 2v2H7v-4l4-3 1-5h3l-.5 2" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-slate-800">Step-free routes</span>
              </div>

              {/* iOS Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={preferences.stepFree}
                  onChange={(e) => onUpdatePreferences({ stepFree: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]" />
              </label>
            </div>

            {/* Preference 2: Voice guidance */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)]/60 flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-slate-800">Voice guidance</span>
                  {voiceTestPlaying && (
                    <span className="text-[10px] text-brand-600 font-bold animate-pulse">
                       Testing speech...
                    </span>
                  )}
                </div>
              </div>

              {/* iOS Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={preferences.voiceGuidance}
                  onChange={handleVoiceToggle}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]" />
              </label>
            </div>

            {/* Preference 3: Default travel mode */}
            <div
              onClick={() => setShowTravelModeSelector(!showTravelModeSelector)}
              className="flex items-center justify-between px-3.5 py-3 cursor-pointer active:bg-canvas transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)]/60 flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-slate-800">Default travel mode</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-400">
                <span className="text-[12px] text-gray-500 font-normal capitalize">
                  {preferences.defaultTravelMode}
                </span>
                <svg className="w-3.5 h-3.5 text-gray-400 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {/* Inline Mode Selector Dropdown */}
            {showTravelModeSelector && (
              <div className="p-2.5 bg-canvas flex gap-1.5 justify-around">
                {(['walk', 'car', 'motorbike', 'bus'] as TravelMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      onUpdatePreferences({ defaultTravelMode: mode });
                      setShowTravelModeSelector(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs capitalize font-bold transition ${
                      preferences.defaultTravelMode === mode
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Settings Section */}
        <section data-purpose="settings-section">
          <h3 className="text-[15px] font-bold text-[var(--ink)] mb-2.5 px-0.5">Settings</h3>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] divide-y divide-slate-100 overflow-hidden">
            {/* Setting 1: Navigation alerts */}
            <div
              onClick={() => onUpdatePreferences({ navAlerts: !preferences.navAlerts })}
              className="flex items-center justify-between px-3.5 py-3 cursor-pointer active:bg-canvas transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)]/60 flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-slate-800">Navigation alerts</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-400">
                <span className="text-[12px] text-gray-400 font-normal">
                  {preferences.navAlerts ? 'On' : 'Off'}
                </span>
                <svg className="w-3.5 h-3.5 text-gray-400 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {/* Setting 2: Privacy & location */}
            <div
              onClick={onOpenSettings}
              className="flex items-center justify-between px-3.5 py-3 cursor-pointer active:bg-canvas transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)]/60 flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-slate-800">Privacy & location</span>
              </div>
              <div className="flex items-center text-gray-400">
                <svg className="w-3.5 h-3.5 text-gray-400 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <BottomNavBar
        currentTab="profile"
        onSelectTab={(tab) => {
          if (tab === 'home') onNavigateScreen('home');
          if (tab === 'map') onNavigateScreen('route-preview');
        }}
        onNavigateScreen={onNavigateScreen}
      />
    </div>
  );
};
