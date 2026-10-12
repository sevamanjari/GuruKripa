import React, { useState, useEffect } from "react";
import { X, FileText, Save, IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";
import CustomerAutoFetchField from "../CustomerAutoFetchField.jsx";

export default function PermitModal({ isOpen, onClose, onSave, permit, customers = [] }) {
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerName: "",
    vehicleReg: "",
    permitNumber: "",
    permitType: "State Goods Permit",
    state: "Madhya Pradesh",
    startDate: "",
    expiryDate: "",
    totalAmount: "",
    paidAmount: "",
    status: "Active",
    notes: ""
  });

  useEffect(() => {
    if (permit) {
      const tot = permit.totalAmount ?? (permit.authFeePaid ?? "");
      const pd = permit.paidAmount ?? (permit.paymentStatus === "Paid" ? tot : "");
      setFormData({
        customerPhone: permit.customerPhone || "",
        customerName: permit.customerName || "",
        vehicleReg: permit.vehicleReg || "",
        permitNumber: permit.permitNumber || "",
        permitType: permit.permitType || "State Goods Permit",
        state: permit.state || "Madhya Pradesh",
        startDate: permit.startDate || permit.issueDate || "",
        expiryDate: permit.expiryDate || "",
        totalAmount: tot,
        paidAmount: pd,
        status: permit.status || "Active",
        notes: permit.notes || ""
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toISOString().split("T")[0];

      setFormData({
        customerPhone: "",
        customerName: "",
        vehicleReg: "",
        permitNumber: "",
        permitType: "State Goods Permit",
        state: "Madhya Pradesh",
        startDate: today,
        expiryDate: nextYearStr,
        totalAmount: 16500,
        paidAmount: "",
        status: "Active",
        notes: ""
      });
    }
  }, [permit, isOpen]);

  if (!isOpen) return null;

  const total = Math.max(0, Number(formData.totalAmount) || 0);
  const paid = Math.max(0, Number(formData.paidAmount) || 0);
  const due = Math.max(0, total - paid);

  let paymentBadge = null;
  if (total > 0) {
    if (due === 0) {
      paymentBadge = {
        label: "Fully Paid",
        color: "var(--color-success, #16a34a)",
        bg: "rgba(22, 163, 74, 0.1)"
      };
    } else if (paid > 0) {
      paymentBadge = {
        label: `Partially Paid (₹${due.toLocaleString("en-IN")} Due)`,
        color: "var(--color-warning, #d97706)",
        bg: "rgba(217, 119, 6, 0.1)"
      };
    } else {
      paymentBadge = {
        label: `Full Fee Due (₹${due.toLocaleString("en-IN")})`,
        color: "var(--color-danger, #dc2626)",
        bg: "rgba(220, 38, 38, 0.1)"
      };
    }
  } else {
    paymentBadge = {
      label: "No Fee Configured",
      color: "var(--text-muted)",
      bg: "var(--bg-secondary)"
    };
  }

  const handleMarkFullPaid = () => {
    if (total > 0) {
      setFormData((prev) => ({ ...prev, paidAmount: total }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerPhone.trim() || !formData.customerName.trim() || !formData.vehicleReg.trim() || !formData.permitNumber.trim()) {
      alert("Customer Phone (primary), Customer Name, Vehicle Number, and Permit Number are required!");
      return;
    }
    onSave({
      ...formData,
      customerPhone: formData.customerPhone.trim(),
      customerName: formData.customerName.trim(),
      vehicleId: formData.vehicleReg.trim().toUpperCase(),
      vehicleReg: formData.vehicleReg.trim().toUpperCase(),
      authFeePaid: total,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due
    });
  };

  const permitTypes = [
    "State Goods Permit",
    "National Permit (Form 48 / AITP)",
    "Contract Carriage Permit",
    "Stage Carriage Permit",
    "Tourist Vehicle Permit",
    "Temporary Permit (Special)"
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <FileText size={18} color="var(--brand-primary)" />
            <h3 className="modal-title">
              {permit ? "Edit Transport Permit" : "Add Permit Entry"}
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Real-time Customer Mobile Auto-Fetch Field */}
            <CustomerAutoFetchField
              phone={formData.customerPhone}
              name={formData.customerName}
              onPhoneChange={(val) => setFormData((prev) => ({ ...prev, customerPhone: val }))}
              onNameChange={(val) => setFormData((prev) => ({ ...prev, customerName: val }))}
              customers={customers}
              required
            />

            {/* Vehicle & Permit Number */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Vehicle Registration No *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. MP 09 CD 4567"
                  value={formData.vehicleReg}
                  onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Permit Number *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. NP/MP/2026/0491"
                  value={formData.permitNumber}
                  onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Permit Category & Jurisdiction */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Permit Category</label>
                <select
                  className="form-select"
                  value={formData.permitType}
                  onChange={(e) => setFormData({ ...formData, permitType: e.target.value })}
                >
                  {permitTypes.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Jurisdiction / State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. All India / MP"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            {/* Validity Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Valid From</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            {/* Payment & Due Tracking Card */}
            <div
              style={{
                marginTop: "4px",
                marginBottom: "14px",
                padding: "14px",
                borderRadius: "8px",
                background: "var(--bg-secondary, #f8fafc)",
                border: "1px solid var(--border-default, #e2e8f0)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px"
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--brand-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <IndianRupee size={14} />
                  <span>Monetary & Due Insights</span>
                </div>

                {total > 0 && paid < total && (
                  <button
                    type="button"
                    onClick={handleMarkFullPaid}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--brand-primary)",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline"
                    }}
                  >
                    Mark Fully Paid
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group" style={{ marginBottom: "6px" }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>
                    Total Permit Charges / Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="Total Fee in ₹"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "6px" }}>
                  <label className="form-label" style={{ fontSize: "0.76rem" }}>
                    Amount Paid by Customer (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="Paid in ₹"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamic Due Balance Display */}
              <div
                style={{
                  marginTop: "6px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#ffffff",
                  border: "1px solid var(--border-default, #e2e8f0)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Outstanding Permit Due:
                  </div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: due > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)"
                    }}
                  >
                    ₹{due.toLocaleString("en-IN")}
                  </div>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    color: paymentBadge.color,
                    background: paymentBadge.bg
                  }}
                >
                  {due === 0 && total > 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {paymentBadge.label}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes / Route Specifications (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Route conditions, Form 48 authorization code, gross vehicle weight..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{permit ? "Update Permit" : "Save Permit Entry"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
