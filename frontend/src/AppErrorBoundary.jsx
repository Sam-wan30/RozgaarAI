import React from "react";
import { captureError } from "./lib/monitoring";

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    captureError(error, {
      componentStack: errorInfo?.componentStack
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
          <div className="max-w-md rounded-3xl bg-white p-8 shadow-soft ring-1 ring-slate-200">
            <p className="text-2xl font-black">RozgaarAI could not load</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Please refresh the page. If it happens again, check the browser console for the error details.
            </p>
            <button
              type="button"
              className="mt-6 min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
