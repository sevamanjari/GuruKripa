import React, { useState, useEffect } from "react";
import { X, Shield, IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";
import CustomerAutoFetchField from "../CustomerAutoFetchField.jsx";

export default function InsuranceModal({
  isOpen,
  onClose,
  onSave,
  insurance,
  customers = [],
  underwriters = [],
  onOpenManageUnderwriters
}) {
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerName: "",
    vehicleReg: "",
    insuranceCompany: "",
    policyNumber: "",
    policyType: "Comprehensive",
    startDate: "",
    expiryDate: "",
    idvAmount: "",
    ncbPercentage: 20,
    totalAmount: "",
    paidAmount: "",
    status: "Active",
    notes: ""
  });

  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    if (insurance) {
      const tot = insurance.totalAmount ?? (insurance.premiumAmount ?? "");
      const pd = insurance.paidAmount ?? (insurance.paymentStatus === "Paid" ? tot : "");
      setFormData({
        customerPhone: insurance.customerPhone || "",
        customerName: insurance.customerName || "",
        vehicleReg: insurance.vehicleReg || "",
        insuranceCompany: insurance.insuranceCompany || "",
        policyNumber: insurance.policyNumber || "",
        policyType: insurance.policyType || "Comprehensive",
        startDate: insurance.startDate || insurance.issueDate || "",
        expiryDate: insurance.expiryDate || "",
        idvAmount: insurance.idvAmount || "",
        ncbPercentage: insurance.ncbPercentage ?? 20,
        totalAmount: tot,
        paidAmount: pd,
        status: insurance.status || "Active",
        notes: insurance.notes || ""
      });
      const existsInList = underwriters.some(
        (u) => u.name.toLowerCase() === (insurance.insuranceCompany || "").toLowerCase()
      );
      setIsCustomMode(!existsInList && !!insurance.insuranceCompany);
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toISOString().split("T")[0];

      const defaultCompany = underwriters.length > 0 ? underwriters[0].name : "";

      setFormData({
        customerPhone: "",
        customerName: "",
        vehicleReg: "",
        insuranceCompany: defaultCompany,
        policyNumber: "",
        policyType: "Comprehensive",
        startDate: today,
        expiryDate: nextYearStr,
        idvAmount: "",
        ncbPercentage: 20,
        totalAmount: "",
        paidAmount: "",
        status: "Active",
        notes: ""
      });
      setIsCustomMode(underwriters.length === 0);
    }
  }, [insurance, isOpen, underwriters]);

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
        label: `Full Payment Due (₹${due.toLocaleString("en-IN")})`,
        color: "var(--color-danger, #dc2626)",
        bg: "rgba(220, 38, 38, 0.1)"
      };
    }
  } else {
    paymentBadge = {
      label: "No Premium Set",
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
    if (!formData.customerPhone.trim() || !formData.customerName.trim() || !formData.vehicleReg.trim() || !formData.policyNumber.trim()) {
      alert("Customer Phone (primary), Customer Name, Vehicle Number, and Policy Number are required!");
      return;
    }
    if (!formData.insuranceCompany.trim()) {
      alert("Please enter or select the Insurance Underwriter company.");
      return;
    }
    onSave({
      ...formData,
      customerPhone: formData.customerPhone.trim(),
      customerName: formData.customerName.trim(),
      insuranceCompany: formData.insuranceCompany.trim(),
      vehicleId: formData.vehicleReg.trim().toUpperCase(),
      vehicleReg: formData.vehicleReg.trim().toUpperCase(),
      premiumAmount: total,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Shield size={18} color="var(--brand-primary)" />
            <h3 className="modal-title">
              {insurance ? "Edit Insurance Policy" : "Add Vehicle Insurance Entry"}
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

            {/* Vehicle & Policy Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Vehicle Registration No *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. MP 09 AB 1234"
                  value={formData.vehicleReg}
                  onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Policy Number *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 2311/0491823/00"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Underwriter Company */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="form-label" style={{ margin: 0 }}>Insurance Company / Underwriter *</label>
                {underwriters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    style={{ background: "none", border: "none", color: "var(--brand-primary)", fontSize: "0.74rem", cursor: "pointer", textDecoration: "underline" }}
                  >
                    {isCustomMode ? "Choose from Underwriters" : "Custom / Other Company"}
                  </button>
                )}
              </div>

              {!isCustomMode && underwriters.length > 0 ? (
                <select
                  className="form-select"
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                  required
                >
                  <option value="" disabled>Select underwriter...</option>
                  {underwriters.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tata AIG, ICICI Lombard, New India Assurance..."
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                  required
                />
              )}
            </div>

            {/* Dates & Coverage */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Coverage Type</label>
                <select
                  className="form-select"
                  value={formData.policyType}
                  onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                >
                  <option value="Comprehensive">Comprehensive Package</option>
                  <option value="Third Party Only">Third Party (TP Only)</option>
                  <option value="Zero Depreciation">Zero Depreciation (B2B)</option>
                  <option value="Commercial Vehicle Goods">Commercial Vehicle Goods</option>
                </select>
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
                    Total Premium Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="Total Premium in ₹"
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
                    Outstanding Policy Due:
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

            {/* IDV & NCB */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">IDV Value (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Insured Declared Value"
                  value={formData.idvAmount}
                  onChange={(e) => setFormData({ ...formData, idvAmount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">NCB Bonus (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0, 20, 25, 35, 50"
                  value={formData.ncbPercentage}
                  onChange={(e) => setFormData({ ...formData, ncbPercentage: e.target.value })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes & Remarks (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Agent commission, financier endorsement, chassis / engine no notes..."
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
              <Shield size={16} />
              <span>{insurance ? "Update Policy" : "Issue Policy Record"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
