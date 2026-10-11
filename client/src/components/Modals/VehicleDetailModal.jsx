import React from "react";
import { X, Truck, Shield, FileText, Calendar, Building, CheckCircle2, AlertTriangle } from "lucide-react";

export default function VehicleDetailModal({ isOpen, onClose, vehicle }) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="number-plate" style={{ fontSize: "1rem", padding: "4px 10px 4px 6px" }}>
              <span className="number-plate-ind" style={{ fontSize: "0.65rem", padding: "2px 5px" }}>IND</span>
              <span>{vehicle.regNumber}</span>
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>
                {vehicle.make} {vehicle.model}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                {vehicle.vehicleType} ({vehicle.manufacturingYear})
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Owner & Hypothecation */}
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px"
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Registered Transporter / Owner
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                {vehicle.customerName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Hypothecation Bank Lien
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "#fbbf24", marginTop: "2px" }}>
                {vehicle.hypothecation || "None"}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              padding: "14px 16px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.06)"
            }}
          >
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Chassis Number
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#38bdf8", marginTop: "2px" }}>
                {vehicle.chassisNumber}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Engine Number
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#fff", marginTop: "2px" }}>
                {vehicle.engineNumber}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Gross Vehicle Wt (GVW)
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", marginTop: "2px" }}>
                {vehicle.gvwKg?.toLocaleString("en-IN")} kg
              </div>
            </div>
          </div>

          {/* Compliance & Validities */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px"
            }}
          >
            <div
              style={{
                padding: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Fitness Certificate
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, marginTop: "2px" }}>
                {vehicle.fitnessExpiry}
              </div>
              <span className="status-badge status-active" style={{ fontSize: "0.68rem", padding: "1px 5px", marginTop: "4px" }}>
                RTO Approved
              </span>
            </div>

            <div
              style={{
                padding: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Road Tax Valid Upto
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, marginTop: "2px" }}>
                {vehicle.taxValidUpto}
              </div>
              <span className="status-badge status-active" style={{ fontSize: "0.68rem", padding: "1px 5px", marginTop: "4px" }}>
                Tax Cleared
              </span>
            </div>

            <div
              style={{
                padding: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                PUC Emission Valid
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, marginTop: "2px" }}>
                {vehicle.pucExpiry || "N/A"}
              </div>
              <span className="status-badge status-active" style={{ fontSize: "0.68rem", padding: "1px 5px", marginTop: "4px" }}>
                Certified
              </span>
            </div>
          </div>

          {/* Linked Insurance & Permits */}
          {vehicle.insurances && vehicle.insurances.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Shield size={15} color="#34d399" />
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                  Active Insurance Cover
                </h4>
              </div>
              {vehicle.insurances.map((ins) => (
                <div
                  key={ins.id}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 600 }}>
                      {ins.policyNumber}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      {ins.insuranceCompany} • Premium: ₹{ins.premiumAmount?.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#f3f4f6" }}>
                    Valid until {ins.expiryDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close RC Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
