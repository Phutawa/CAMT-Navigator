import React, { useState } from 'react';

interface AssistanceModalProps {
  type: 'lost' | 'report' | 'options';
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionName: string) => void;
}

export const AssistanceModal: React.FC<AssistanceModalProps> = ({
  type,
  isOpen,
  onClose,
  onAction,
}) => {
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 border border-brand-100 transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

        {type === 'lost' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Need assistance?</h3>
              <p className="text-xs text-slate-500 mt-1">
                We'll help you recalibrate your orientation on campus.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  if (onAction) onAction('recalibrate');
                  onClose();
                }}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-bold rounded-2xl shadow-soft transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Re-scan Nearest Landmark</span>
              </button>

              <button
                onClick={() => {
                  if (onAction) onAction('compass');
                  onClose();
                }}
                className="w-full py-3 px-4 bg-canvas hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-2xl border border-slate-200 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>Calibrate Digital Compass</span>
              </button>

              <button
                onClick={() => {
                  if (onAction) onAction('helpline');
                  onClose();
                }}
                className="w-full py-2.5 px-4 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Call Campus Security Helpdesk</span>
              </button>
            </div>
          </div>
        )}

        {type === 'report' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Report Destination Issue</h3>
              <p className="text-xs text-slate-500 mt-1">
                Help fellow students keep campus maps accurate.
              </p>
            </div>

            {reportSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  
                </div>
                <p className="text-xs font-bold text-emerald-900">Thank you for reporting!</p>
                <p className="text-[11px] text-emerald-700">Campus Facilities team has been notified.</p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <textarea
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Elevator currently under maintenance, door locked, or incorrect room signage..."
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setReportSubmitted(true);
                      setTimeout(() => {
                        setReportSubmitted(false);
                        onClose();
                      }, 1400);
                    }}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl transition"
                  >
                    Submit Report
                  </button>
                  <button
                    onClick={onClose}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-full transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {type === 'options' && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight text-center">Route Options</h3>
            <div className="divide-y divide-slate-100">
              <button
                onClick={() => {
                  if (onAction) onAction('accessible');
                  onClose();
                }}
                className="w-full py-3 flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-brand-600"
              >
                <span>Prefer indoor air-conditioned walkways</span>
                <span className="text-[11px] text-slate-400">Enabled</span>
              </button>
              <button
                onClick={() => {
                  if (onAction) onAction('avoid-stairs');
                  onClose();
                }}
                className="w-full py-3 flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-brand-600"
              >
                <span>Step-free wheelchair / ramp access</span>
                <span className="text-[11px] text-brand-600 font-bold">Active</span>
              </button>
              <button
                onClick={() => {
                  if (onAction) onAction('satellite');
                  onClose();
                }}
                className="w-full py-3 flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-brand-600"
              >
                <span>Satellite 3D buildings overlay</span>
                <span className="text-[11px] text-slate-400">Off</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full hover:bg-slate-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
