"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center p-5">
            <h1 className="display-1 text-danger mb-4">Oops!</h1>
            <h2 className="h4 mb-3">Something went wrong</h2>
            <p className="text-muted mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Reload Page
              </button>
              <Link href="/feed" className="btn btn-outline-secondary">
                Go to Feed
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling
export function useErrorHandler() {
  return (error: Error) => {
    console.error("Error caught:", error);
    // Could send to error tracking service here
  };
}
