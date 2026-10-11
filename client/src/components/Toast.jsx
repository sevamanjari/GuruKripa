import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={18} style={{ color: "#059669" }} />,
    warning: <AlertTriangle size={18} style={{ color: "#d97706" }} />,
    error: <XCircle size={18} style={{ color: "#dc2626" }} />,
    info: <Info size={18} style={{ color: "#1e40af" }} />
  };

  const borders = {
    success: "#a7f3d0",
    warning: "#fde68a",
    error: "#fecaca",
    info: "#bfdbfe"
  };

  const backgrounds = {
    success: "#f0fdf4",
    warning: "#fffbeb",
    error: "#fef2f2",
    info: "#eff6ff"
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 18px",
        background: backgrounds[toast.type] || "#ffffff",
        border: `1px solid ${borders[toast.type] || "#e2e8f0"}`,
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        color: "#0f172a",
        fontSize: "0.88rem",
        fontWeight: 500,
        maxWidth: "420px"
      }}
    >
      <div>{icons[toast.type] || icons.info}</div>
      <div style={{ flex: 1 }}>{toast.message}</div>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          display: "flex",
          padding: "2px"
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
