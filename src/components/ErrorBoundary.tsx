import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 m-4 shadow-sm text-center">
          <h2 className="text-sm font-bold text-red-900 mb-1">
            {this.props.fallbackTitle || 'เกิดข้อผิดพลาดในการแสดงผล'}
          </h2>
          <p className="text-xs text-red-600 mb-3 font-mono">
            {this.state.error?.message || 'Component failed to load.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
