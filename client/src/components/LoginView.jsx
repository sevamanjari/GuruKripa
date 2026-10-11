import React, { useState } from "react";
import { Truck, Lock, User, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await onLoginSuccess(username, password);
    } catch (err) {
      setErrorMessage(err.message || "Invalid login credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 16px",
        background: "var(--bg-app)"
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Brand Banner */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "var(--brand-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.15)"
            }}
          >
            <Truck size={26} />
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            GuruKripa Yatayat
          </h1>
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Transport & RTO Services Portal • Secure Office Access
          </p>
        </div>

        {/* Login Card */}
        <div
          className="office-card"
          style={{
            padding: "28px 24px",
            background: "#ffffff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <ShieldCheck size={18} color="var(--brand-primary)" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Authorized Personnel Sign-In
            </span>
          </div>

          {errorMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                background: "var(--badge-danger-bg)",
                border: "1px solid var(--badge-danger-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--badge-danger-text)",
                fontSize: "0.82rem",
                fontWeight: 500,
                marginBottom: "16px"
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Username / Staff ID</label>
              <div style={{ position: "relative" }}>
                <User
                  size={15}
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-light)"
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  required
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: "34px" }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-light)"
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  required
                  autoComplete="current-password"
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "34px", paddingRight: "36px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-light)",
                    cursor: "pointer",
                    display: "flex",
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "10px 16px",
                fontSize: "0.9rem",
                display: "flex",
                justifyContent: "center",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div
          style={{
            marginTop: "16px",
            textAlign: "center",
            fontSize: "0.74rem",
            color: "var(--text-light)"
          }}
        >
          Protected by HMAC Session Tokens • Strict CORS & Clickjacking Defense Active
        </div>
      </div>
    </div>
  );
}
