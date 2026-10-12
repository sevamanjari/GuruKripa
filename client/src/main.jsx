import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GuruKripa App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            padding: "20px",
            fontFamily: "Inter, sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: "460px",
              width: "100%",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)"
            }}
          >
            <h2 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "8px", fontWeight: 700 }}>
              System Reload Needed
            </h2>
            <p style={{ fontSize: "0.84rem", color: "#64748b", marginBottom: "20px", lineHeight: 1.5 }}>
              A temporary display sync occurred. Please reload to continue.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#991b1b",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  marginBottom: "16px",
                  fontFamily: "monospace",
                  textAlign: "left"
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 18px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Reload Portal
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  fontWeight: 500,
                  fontSize: "0.82rem",
                  cursor: "pointer"
                }}
              >
                Reset & Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
