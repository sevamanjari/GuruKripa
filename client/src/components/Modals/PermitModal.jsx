import React, { useState, useEffect } from "react";
import { X, FileText, IndianRupee, CheckCircle2, AlertCircle, Upload, Trash2, Calendar } from "lucide-react";
import CustomerAutoFetchField from "../CustomerAutoFetchField.jsx";
import { api } from "../../services/api.js";

const DEFAULT_RTOS = [
  "RTO Indore (MP-09)",
  "RTO Bhopal (MP-04)",
  "RTO Ujjain (MP-13)",
  "RTO Jabalpur (MP-20)",
  "RTO Gwalior (MP-07)",
  "RTO Dewas (MP-41)",
  "RTO Dhar (MP-11)",
  "RTO Ratlam (MP-43)",
  "RTO Khargone (MP-10)",
  "RTO Khandwa (MP-12)",
  "RTO Sagar (MP-15)",
  "RTO Rewa (MP-17)",
  "All India (National Permit)"
];

export default function PermitModal({ isOpen, onClose, onSave, permit, customers = [] }) {
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerName: "",
    vehicleReg: "",
    rtoAffiliated: "RTO Indore (MP-09)",
    permitNumber: "",
    expiryDate: "",
    documentUrl: "",
    documentName: "",
    documentSize: 0,
    totalAmount: 16500,
    paidAmount: "",
    status: "Active",
    notes: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isCustomRto, setIsCustomRto] = useState(false);

  useEffect(() => {
    if (permit) {
      const tot = permit.totalAmount ?? (permit.authFeePaid ?? "");
      const pd = permit.paidAmount ?? (permit.paymentStatus === "Paid" ? tot : "");
      const rto = permit.rtoAffiliated || permit.issuingRto || "RTO Indore (MP-09)";

      setFormData({
        customerPhone: permit.customerPhone || "",
        customerName: permit.customerName || "",
        vehicleReg: permit.vehicleReg || "",
        rtoAffiliated: rto,
        permitNumber: permit.permitNumber || "",
        expiryDate: permit.expiryDate || "",
        documentUrl: permit.documentUrl || "",
        documentName: permit.documentName || "",
        documentSize: permit.documentSize || 0,
        totalAmount: tot,
        paidAmount: pd,
        status: permit.status || "Active",
        notes: permit.notes || ""
      });

      setIsCustomRto(!DEFAULT_RTOS.includes(rto) && !!rto);
    } else {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toISOString().split("T")[0];

      setFormData({
        customerPhone: "",
        customerName: "",
        vehicleReg: "",
        rtoAffiliated: "RTO Indore (MP-09)",
        permitNumber: "",
        expiryDate: nextYearStr,
        documentUrl: "",
        documentName: "",
        documentSize: 0,
        totalAmount: 16500,
        paidAmount: "",
        status: "Active",
        notes: ""
      });
      setIsCustomRto(false);
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
      color: "var(--text-muted, #64748b)",
      bg: "var(--bg-secondary, #f8fafc)"
    };
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await api.uploadDocument(file);
      setFormData((prev) => ({
        ...prev,
        documentUrl: res.url,
        documentName: res.name || file.name,
        documentSize: res.size || file.size
      }));
    } catch (err) {
      alert("Failed to upload document: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documentUrl: "",
      documentName: "",
      documentSize: 0
    }));
  };

  const handleAddYear = () => {
    const base = formData.expiryDate ? new Date(formData.expiryDate) : new Date();
    base.setFullYear(base.getFullYear() + 1);
    setFormData((prev) => ({ ...prev, expiryDate: base.toISOString().split("T")[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vehicleReg || !formData.expiryDate) {
      alert("Please fill in Vehicle Number and Expiry Date");
      return;
    }

    onSave({
      ...formData,
      issuingRto: formData.rtoAffiliated,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      paymentStatus: total > 0 ? (due === 0 ? "Paid" : paid > 0 ? "Partial" : "Due") : "No Charges"
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid var(--border-default, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(5, 150, 105, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#059669"
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
                {permit ? "Edit Transport Permit" : "New Transport Permit"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>
                Simplified permit record with RTO Affiliation & PDF document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              color: "var(--text-muted, #64748b)"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 22px", flex: 1 }}>
          {/* Customer Lookup (Phone & Name) */}
          <CustomerAutoFetchField
            phone={formData.customerPhone}
            name={formData.customerName}
            onPhoneChange={(val) => setFormData((prev) => ({ ...prev, customerPhone: val }))}
            onNameChange={(val) => setFormData((prev) => ({ ...prev, customerName: val }))}
            customers={customers}
            required={false}
          />

          {/* Vehicle Number & Permit Number */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "5px" }}>
                Vehicle Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MP09AB1234"
                value={formData.vehicleReg}
                onChange={(e) => setFormData((prev) => ({ ...prev, vehicleReg: e.target.value.toUpperCase() }))}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default, #cbd5e1)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "5px" }}>
                Permit Number (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={formData.permitNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, permitNumber: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default, #cbd5e1)",
                  fontSize: "0.9rem"
                }}
              />
            </div>
          </div>

          {/* RTO Affiliated (instead of underwriter) */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                RTO Affiliated <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomRto(!isCustomRto)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#059669",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                {isCustomRto ? "Select from list" : "Type custom RTO"}
              </button>
            </div>

            {isCustomRto ? (
              <input
                type="text"
                placeholder="e.g. RTO Indore (MP-09)"
                value={formData.rtoAffiliated}
                onChange={(e) => setFormData((prev) => ({ ...prev, rtoAffiliated: e.target.value }))}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default, #cbd5e1)",
                  fontSize: "0.9rem"
                }}
              />
            ) : (
              <select
                value={formData.rtoAffiliated}
                onChange={(e) => setFormData((prev) => ({ ...prev, rtoAffiliated: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default, #cbd5e1)",
                  fontSize: "0.9rem",
                  background: "#ffffff"
                }}
              >
                {DEFAULT_RTOS.map((rto) => (
                  <option key={rto} value={rto}>
                    {rto}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Expiry Date */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Expire Date <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <button
                type="button"
                onClick={handleAddYear}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#059669",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                +1 Year from current
              </button>
            </div>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
              required
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-default, #cbd5e1)",
                fontSize: "0.9rem"
              }}
            />
          </div>

          {/* Upload Permit PDF */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "var(--bg-subtle, #f8fafc)",
              border: "1px dashed var(--border-default, #cbd5e1)",
              marginBottom: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
                Permit Document (PDF / Document Upload)
              </span>
              {isUploading && (
                <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                  Uploading file...
                </span>
              )}
            </div>

            {formData.documentUrl ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={18} color="#059669" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary, #0f172a)" }}>
                    {formData.documentName || "Permit_Document.pdf"}
                  </span>
                  {formData.documentSize > 0 && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)" }}>
                      ({Math.round(formData.documentSize / 1024)} KB)
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <a
                    href={formData.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "0.75rem", color: "#059669", textDecoration: "none", fontWeight: 600 }}
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="permit-pdf-upload"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="permit-pdf-upload"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid var(--border-default, #cbd5e1)",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#059669"
                  }}
                >
                  <Upload size={16} />
                  <span>Choose Permit PDF to Upload</span>
                </label>
              </div>
            )}
          </div>

          {/* Payment Related Section */}
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid var(--border-default, #cbd5e1)",
              marginBottom: "14px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IndianRupee size={16} color="#059669" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
                  Payment Details
                </span>
              </div>
              {paymentBadge && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "20px",
                    color: paymentBadge.color,
                    background: paymentBadge.bg
                  }}
                >
                  {paymentBadge.label}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                  Permit Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, totalAmount: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem"
                  }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Paid (₹)</label>
                  {total > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, paidAmount: total }))}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#059669",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0
                      }}
                    >
                      All Paid
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paidAmount: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                  Due Balance (₹)
                </label>
                <input
                  type="text"
                  disabled
                  value={due > 0 ? `₹${due.toLocaleString("en-IN")}` : "₹0 (Cleared)"}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: due > 0 ? "rgba(239, 68, 68, 0.08)" : "rgba(34, 197, 94, 0.08)",
                    color: due > 0 ? "#dc2626" : "#16a34a",
                    fontWeight: 700,
                    fontSize: "0.88rem"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "5px" }}>
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. State Goods Permit, 5 Year authorization"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-default, #cbd5e1)",
                fontSize: "0.85rem"
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: "9px 18px", borderRadius: "8px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "9px 22px",
                borderRadius: "8px",
                background: "#059669",
                color: "#ffffff",
                fontWeight: 600
              }}
            >
              {permit ? "Update Permit" : "Save Transport Permit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
