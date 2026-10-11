import React, { useState } from "react";
import {
  HelpCircle,
  FileCheck,
  Clock,
  IndianRupee,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
  X
} from "lucide-react";

export default function RtoServicesView({ services = [], onInitiateService }) {
  const [selectedService, setSelectedService] = useState(null);

  const formatCurrency = (val) => {
    if (typeof val === "string") return val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(20, 27, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <FileCheck size={22} color="#fbbf24" />
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>
            Official RTO & Transport Consultancy Services
          </h2>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "780px" }}>
          Full documentation handling, government fee processing, and fast-track processing across Indore, Bhopal, Ujjain, Jabalpur, and all Madhya Pradesh & Central India RTO offices.
        </p>
      </div>

      {/* Services Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px"
        }}
      >
        {services.map((srv) => (
          <div
            key={srv.id}
            className="glass-panel"
            style={{
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#fbbf24",
                    background: "rgba(245, 158, 11, 0.15)",
                    padding: "3px 8px",
                    borderRadius: "4px"
                  }}
                >
                  {srv.category}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--text-muted)"
                  }}
                >
                  <Clock size={13} color="#38bdf8" />
                  {srv.turnaroundTime}
                </span>
              </div>

              <h3 style={{ fontSize: "1.08rem", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>
                {srv.name}
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "16px" }}>
                {srv.description}
              </p>

              {/* Fee Breakdown */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Govt Statutory Fee
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {formatCurrency(srv.governmentFee)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    GuruKripa Service
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                    {srv.serviceCharge === 0 ? "Complimentary" : formatCurrency(srv.serviceCharge)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => setSelectedService(srv)}
              >
                <Info size={14} />
                <span>Required Docs</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => onInitiateService(srv)}
              >
                <span>Initiate</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Checklist Modal */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Documents Required Checklist
                </h3>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {selectedService.name}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedService(null)}
                style={{ padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: "16px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Please ensure the vehicle owner or transporter has the following original and attested photocopies ready for fast processing:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedService.documentsRequired?.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.06)"
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#34d399",
                        flexShrink: 0
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "#f3f4f6" }}>
                      {doc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const srv = selectedService;
                  setSelectedService(null);
                  onInitiateService(srv);
                }}
              >
                Proceed with Service Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
