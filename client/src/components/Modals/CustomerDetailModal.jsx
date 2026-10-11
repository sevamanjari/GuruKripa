import React from "react";
import { X, Users, Truck, Shield, FileText, Phone, Mail, MapPin, Building, CreditCard } from "lucide-react";

export default function CustomerDetailModal({ isOpen, onClose, customer }) {
  if (!isOpen || !customer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60a5fa"
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{customer.name}</h3>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Client ID: {customer.id} • {customer.customerType}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Key Contact & Tax Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              padding: "16px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.06)"
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Contact Details
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.92rem", marginTop: "2px" }}>
                {customer.contactPerson}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                📞 {customer.phone}
              </div>
              {customer.email && (
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  ✉️ {customer.email}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Operating Location & Tax
              </div>
              <div style={{ fontWeight: 500, fontSize: "0.86rem", marginTop: "2px" }}>
                {customer.city}, {customer.state}
              </div>
              {customer.address && (
                <div style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: "2px" }}>
                  {customer.address}
                </div>
              )}
              <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "4px", fontFamily: "monospace" }}>
                {customer.gstin ? `GST: ${customer.gstin}` : customer.panNumber ? `PAN: ${customer.panNumber}` : "KYC Pending"}
              </div>
            </div>
          </div>

          {/* Linked Fleet Vehicles */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Truck size={16} color="#fbbf24" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                Registered Fleet Vehicles ({customer.vehicles?.length || 0})
              </h4>
            </div>

            {(!customer.vehicles || customer.vehicles.length === 0) ? (
              <div style={{ padding: "14px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                No vehicles currently linked.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {customer.vehicles.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "rgba(255, 255, 255, 0.02)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="number-plate">
                        <span className="number-plate-ind">IND</span>
                        <span>{v.regNumber}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{v.make} {v.model}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{v.vehicleType}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Fitness: {v.fitnessExpiry}
                      </div>
                      <span className={`status-badge ${v.status === "Active" ? "status-active" : "status-warning"}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Insurances */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Shield size={16} color="#34d399" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                Active Insurance Policies ({customer.insurances?.length || 0})
              </h4>
            </div>

            {(!customer.insurances || customer.insurances.length === 0) ? (
              <div style={{ padding: "14px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                No active insurance records on file.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {customer.insurances.map((i) => (
                  <div
                    key={i.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "rgba(255, 255, 255, 0.02)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#38bdf8", fontWeight: 600 }}>
                        {i.policyNumber}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {i.insuranceCompany} • Reg: {i.vehicleReg}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        ₹{Number(i.premiumAmount).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Exp: {i.expiryDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
