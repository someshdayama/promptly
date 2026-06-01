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
        <div style={{
          padding: "2rem",
          background: "#18181b",
          color: "#f8fafc",
          borderRadius: "12px",
          border: "1px dashed rgba(244, 63, 94, 0.4)",
          textAlign: "center",
          maxWidth: "420px",
          margin: "4rem auto",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f43f5e", marginBottom: "0.5rem" }}>
            Unable to render Preview
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            The selected template encountered a render error, likely due to malformed HTML tags or structure in the resume data. Try editing the text inline or regenerating.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "0.55rem 1.25rem",
              background: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.8rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
            }}
          >
            Reset Preview Pane
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
