import React from "react";
import { X, History, Calendar, Shield, FileText, ArrowRight, Clock } from "lucide-react";
import { formatToIndianDate } from "../../utils/dateFormatter.js";

export default function HistoryModal({ isOpen, onClose, item, type = "insurance" }) {
  if (!isOpen || !item) return null;

  const isInsurance = type === "insurance";
  const history = Array.isArray(item.renewalHistory) ? item.renewalHistory : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <History size={18} color="var(--brand-primary)" />
            <div>
              <h3 className="modal-title">
                {isInsurance ? "Insurance Renewal History" : "Permit Renewal History"}
              </h3>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Recurring records & past terms for vehicle {item.vehicleReg}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ gap: "16px" }}>
          {/* Customer & Vehicle Header Box */}
          <div
            style={{
              padding: "14px 16px",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                Vehicle & Client Details
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <div className="number-plate">
                  <span className="number-plate-ind">IND</span>
                  <span>{item.vehicleReg}</span>
                </div>
                <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.94rem" }}>
                  {item.customerName || "Customer"}
                </span>
                {item.customerPhone && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    • {item.customerPhone}
                  </span>
                )}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total Past Terms
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-primary)", marginTop: "2px" }}>
                {history.length} {history.length === 1 ? "Past Record" : "Past Records"}
              </div>
            </div>
          </div>

          {/* Current Active Term Summary */}
          <div>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: "8px" }}>
              Current Active Policy
            </div>
            <div
              style={{
                padding: "12px 16px",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                background: "#ffffff",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "10px"
              }}
            >
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                  {isInsurance ? "Active Policy No" : "Active Permit No"}
                </span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.86rem", color: "var(--text-primary)" }}>
                  {isInsurance ? item.policyNumber : item.permitNumber}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                  Valid Until
                </span>
                <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" }}>
                  {formatToIndianDate(item.expiryDate) || "N/A"}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                  {isInsurance ? "Underwriter" : "Category"}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  {isInsurance ? item.insuranceCompany : item.permitType}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                  {isInsurance ? "Current Premium" : "Auth Fee"}
                </span>
                <span style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--text-primary)" }}>
                  {isInsurance
                    ? (item.premiumAmount ? `₹${Number(item.premiumAmount).toLocaleString("en-IN")}` : "-")
                    : (item.authFeePaid ? `₹${Number(item.authFeePaid).toLocaleString("en-IN")}` : "-")}
                </span>
              </div>
            </div>
          </div>

          {/* Past Renewal History */}
          <div>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: "8px" }}>
              Past Renewal History Log
            </div>

            {history.length === 0 ? (
              <div
                style={{
                  padding: "32px 20px",
                  textAlign: "center",
                  background: "var(--bg-subtle)",
                  border: "1px dashed var(--border-medium)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <Clock size={24} style={{ color: "var(--text-light)", margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                  No Past Renewals Yet
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: "420px", margin: "4px auto 0" }}>
                  When this client comes for renewal, previous policy details (rates, coverage dates, NCB bonus) will automatically be archived here.
                </div>
              </div>
            ) : (
              <div className="table-container" style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Previous Document No</th>
                      <th>Term Period</th>
                      {isInsurance ? <th>Premium & IDV</th> : <th>Govt Fee</th>}
                      {isInsurance && <th>NCB (%)</th>}
                      <th>Renewed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={h.id || idx}>
                        <td>
                          <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" }}>
                            {isInsurance ? h.policyNumber : h.permitNumber}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {isInsurance ? h.insuranceCompany : (h.permitType || "Permit")}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            {formatToIndianDate(h.issueDate) || "Prior"} <span style={{ color: "var(--text-light)" }}>→</span> {formatToIndianDate(h.expiryDate)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" }}>
                            {isInsurance
                              ? (h.premiumAmount ? `₹${Number(h.premiumAmount).toLocaleString("en-IN")}` : "-")
                              : (h.authFeePaid ? `₹${Number(h.authFeePaid).toLocaleString("en-IN")}` : "-")}
                          </div>
                          {isInsurance && h.idvAmount > 0 && (
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              IDV: ₹{Number(h.idvAmount).toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>
                        {isInsurance && (
                          <td>
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                              {h.ncbPercentage ? `${h.ncbPercentage}%` : "0%"}
                            </span>
                          </td>
                        )}
                        <td>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {h.renewedOn || "Archived"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
