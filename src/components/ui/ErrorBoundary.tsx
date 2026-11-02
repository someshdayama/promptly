"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary class component.
 * Catches rendering crashes (such as HTML parse/injection errors) in the resume preview.
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "#111" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#d70015", marginBottom: "8px" }}>
            This page could not be shown
          </h2>
          <p style={{ fontSize: "14px", lineHeight: 1.5, marginBottom: "20px" }}>
            Something in the resume text broke the layout. Try again, or make the resume again.
          </p>
          <button
            onClick={this.handleReset}
            style={{ height: "40px", padding: "0 20px", borderRadius: "999px", background: "#000", color: "#fff", fontWeight: 600, fontSize: "14px" }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
