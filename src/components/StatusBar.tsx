import React from 'react';

interface StatusBarProps {
  theme?: 'dark' | 'light';
  time?: string;
  showDynamicIsland?: boolean;
  navActive?: boolean;
  isArrived?: boolean;
  navStatusText?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  theme = 'dark',
  time = '9:41',
  showDynamicIsland = true,
  navActive = false,
  isArrived = false,
  navStatusText,
}) => {
  const isLightText = theme === 'light';

  return (
    <header
      className={`relative z-40 w-full min-h-[54px] pt-3.5 px-8 pb-2 flex justify-between items-center select-none ${
        isLightText ? 'text-white' : 'text-slate-900'
      }`}
      data-purpose="iphone-15-promax-status-bar"
    >
      {/* Left: Clock */}
      <span className="text-[15px] font-bold tracking-tight font-sans pl-1">
        {time}
      </span>

      {/* Center: Dynamic Island (iPhone 15 Pro Max) */}
      {showDynamicIsland && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-2.5 h-[34px] bg-black rounded-full flex items-center justify-between px-3 text-white shadow-md transition-all duration-300 pointer-events-auto cursor-default z-50 group hover:scale-[1.03]"
          style={{ width: isArrived || navActive ? '146px' : '124px' }}
          title="iPhone 15 Pro Max Dynamic Island"
        >
          {isArrived ? (
            <>
              {/* Arrived Destination Status in Dynamic Island (Eliminates Turn Arrow Conflict) */}
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shadow-xs">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-[10px] font-extrabold text-emerald-400 tracking-tight uppercase">
                  {navStatusText || 'Arrived'}
                </span>
              </div>
              {/* Camera cutout reflection dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#18181b] border border-neutral-700/60 ml-auto" />
            </>
          ) : navActive ? (
            <>
              {/* Live Activity: Navigation Direction Mini Icon */}
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M4 19v-6a4 4 0 0 1 4-4h10" />
                    <polyline points="14 5 18 9 14 13" />
                  </svg>
                </span>
                <span className="text-[10px] font-bold text-white tracking-tight">120m</span>
              </div>
              {/* Camera cutout reflection dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#18181b] border border-neutral-700/60 ml-auto" />
            </>
          ) : (
            <>
              {/* Standard TrueDepth sensor & FaceID camera elements */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#141416] border border-neutral-800" />
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" title="Microphone/Location active" />
                <div className="w-3 h-3 rounded-full bg-[#141416] border border-neutral-750 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#202028]" />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Right: Cellular, WiFi, Battery */}
      <div className="flex items-center space-x-2 pr-1">
        {/* Cellular Signal Icon */}
        <svg
          className="w-4 h-3 fill-current"
          fill="none"
          viewBox="0 0 17 11"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect height="3" rx="0.75" width="3" x="0" y="8" />
          <rect height="5.5" rx="0.75" width="3" x="4.5" y="5.5" />
          <rect height="8" rx="0.75" width="3" x="9" y="3" />
          <rect height="10.5" rx="0.75" width="3" x="13.5" y="0.5" />
        </svg>

        {/* WiFi Icon */}
        <svg
          className="w-3.5 h-3 fill-current ml-0.5"
          fill="none"
          viewBox="0 0 16 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 9.5C8.82843 9.5 9.5 10.1716 9.5 11C9.5 11.8284 8.82843 12.5 8 12.5C7.17157 12.5 6.5 11.8284 6.5 11C6.5 10.1716 7.17157 9.5 8 9.5Z" />
          <path
            clipRule="evenodd"
            d="M12.784 4.887C10.172 2.371 6.002 2.348 3.364 4.887C3.064 5.176 2.585 5.169 2.295 4.869C2.006 4.569 2.013 4.09 2.313 3.8C5.543 0.692 10.63 0.72 13.834 3.8C14.134 4.09 14.141 4.569 13.852 4.869C13.562 5.169 13.084 5.176 12.784 4.887Z"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M10.871 6.837C9.309 5.333 6.866 5.32 5.282 6.837C4.982 7.126 4.504 7.119 4.214 6.819C3.925 6.519 3.932 6.041 4.232 5.751C6.402 3.674 9.774 3.693 11.921 5.751C12.221 6.041 12.228 6.519 11.939 6.819C11.649 7.119 11.171 7.126 10.871 6.837Z"
            fillRule="evenodd"
          />
        </svg>

        {/* Battery Icon */}
        <div
          className={`relative w-6 h-[11.5px] border ${
            isLightText ? 'border-white' : 'border-slate-900'
          } rounded-[3.5px] p-[1.5px] flex items-center ml-0.5`}
        >
          <div
            className={`h-full w-full ${
              isLightText ? 'bg-white' : 'bg-slate-900'
            } rounded-[1.5px]`}
          />
          <div
            className={`absolute -right-[3px] top-[2.5px] w-[2px] h-[5px] ${
              isLightText ? 'bg-white' : 'bg-slate-900'
            } rounded-r-[1px]`}
          />
        </div>
      </div>
    </header>
  );
};
