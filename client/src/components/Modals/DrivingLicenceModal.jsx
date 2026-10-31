import React, { useState, useEffect } from "react";
import { X, Award, IndianRupee, CheckCircle2, AlertCircle, Upload, Trash2, Calendar, FileText } from "lucide-react";
import CustomerAutoFetchField from "../CustomerAutoFetchField.jsx";
import IndianDateInput from "../Common/IndianDateInput.jsx";
import { parseIndianDateToISO } from "../../utils/dateFormatter.js";
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
  "All India (National)"
];

export default function DrivingLicenceModal({ isOpen, onClose, onSave, dl, customers = [] }) {
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerName: "",
    dlNumber: "",
    rtoAffiliated: "RTO Indore (MP-09)",
    expiryDate: "",
    documentUrl: "",
    documentName: "",
    documentSize: 0,
    totalAmount: 2500,
    paidAmount: "",
    status: "Active",
    notes: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isCustomRto, setIsCustomRto] = useState(false);

  useEffect(() => {
    if (dl) {
      const tot = dl.totalAmount ?? "";
      const pd = dl.paidAmount ?? (dl.paymentStatus === "Paid" ? tot : "");
      const rto = dl.rtoAffiliated || "RTO Indore (MP-09)";

      setFormData({
        customerPhone: dl.customerPhone || "",
        customerName: dl.customerName || "",
        dlNumber: dl.dlNumber || "",
        rtoAffiliated: rto,
        expiryDate: dl.expiryDate || "",
        documentUrl: dl.documentUrl || "",
        documentName: dl.documentName || "",
        documentSize: dl.documentSize || 0,
        totalAmount: tot,
        paidAmount: pd,
        status: dl.status || "Active",
        notes: dl.notes || ""
      });

      setIsCustomRto(!DEFAULT_RTOS.includes(rto) && !!rto);
    } else {
      const nextFiveYears = new Date();
      nextFiveYears.setFullYear(nextFiveYears.getFullYear() + 5);
      const nextFiveYearsStr = nextFiveYears.toISOString().split("T")[0];

      setFormData({
        customerPhone: "",
        customerName: "",
        dlNumber: "",
        rtoAffiliated: "RTO Indore (MP-09)",
        expiryDate: nextFiveYearsStr,
        documentUrl: "",
        documentName: "",
        documentSize: 0,
        totalAmount: 2500,
        paidAmount: "",
        status: "Active",
        notes: ""
      });
      setIsCustomRto(false);
    }
  }, [dl, isOpen]);

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

  const handleAddFiveYears = () => {
    let base = new Date();
    if (formData.expiryDate) {
      const iso = parseIndianDateToISO(formData.expiryDate);
      const parsed = new Date(iso);
      if (!isNaN(parsed)) base = parsed;
    }
    base.setFullYear(base.getFullYear() + 5);
    setFormData((prev) => ({ ...prev, expiryDate: base.toISOString().split("T")[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.expiryDate) {
      alert("Please fill in Customer Name and Expiry Date");
      return;
    }

    onSave({
      ...formData,
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
                background: "rgba(99, 102, 241, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6366f1"
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
                {dl ? "Edit Driving Licence" : "New Driving Licence"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>
                DL record with RTO jurisdiction & uploaded PDF licence
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
            required={true}
          />

          {/* DL Number (Optional) */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "5px" }}>
              Driving Licence Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. MP09-2022-0012345"
              value={formData.dlNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, dlNumber: e.target.value.toUpperCase() }))}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-default, #cbd5e1)",
                fontSize: "0.9rem",
                textTransform: "uppercase"
              }}
            />
          </div>

          {/* RTO Affiliated */}
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
                  color: "#6366f1",
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
                Expire Date (DD/MM/YYYY) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <button
                type="button"
                onClick={handleAddFiveYears}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6366f1",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                +5 Years from current
              </button>
            </div>
            <IndianDateInput
              value={formData.expiryDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
              required
            />
          </div>

          {/* Upload Driving Licence PDF */}
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
                Driving Licence PDF (Document Upload)
              </span>
              {isUploading && (
                <span style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 600 }}>
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
                  <FileText size={18} color="#6366f1" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary, #0f172a)" }}>
                    {formData.documentName || "Driving_Licence.pdf"}
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
                    style={{ fontSize: "0.75rem", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}
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
                  id="dl-pdf-upload"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="dl-pdf-upload"
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
                    color: "#6366f1"
                  }}
                >
                  <Upload size={16} />
                  <span>Choose DL PDF to Upload</span>
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
                <IndianRupee size={16} color="#6366f1" />
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
                  Service Fee (₹)
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
                        color: "#6366f1",
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
              placeholder="e.g. LMV + MCWG endorsed, Medical certificate attached"
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
                background: "#6366f1",
                color: "#ffffff",
                fontWeight: 600
              }}
            >
              {dl ? "Update Driving Licence" : "Save Driving Licence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
