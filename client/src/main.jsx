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
              A browser reload is required to synchronize the latest updates.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
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
              Reset & Reload Portal
            </button>
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
