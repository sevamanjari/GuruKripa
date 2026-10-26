import React, { useState, useEffect } from "react";
import { X, RotateCw, CheckCircle2, IndianRupee, Upload, FileText, Trash2 } from "lucide-react";
import { api } from "../../services/api.js";

export default function RenewModal({ isOpen, onClose, onConfirm, item, type = "insurance" }) {
  const [formData, setFormData] = useState({
    newNumber: "",
    newExpiry: "",
    newFee: "",
    newPaid: "",
    newIdv: "",
    newNcb: "",
    documentUrl: "",
    documentName: "",
    documentSize: 0
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!item) return;

    const baseExpiry = item.expiryDate ? new Date(item.expiryDate) : new Date();
    const newExp = new Date(baseExpiry);
    if (type === "drivingLicence" || type === "dl") {
      newExp.setFullYear(newExp.getFullYear() + 5);
    } else {
      newExp.setFullYear(newExp.getFullYear() + 1);
    }
    const newExpiryStr = newExp.toISOString().split("T")[0];

    const fee = item.totalAmount || item.premiumAmount || item.authFeePaid || 0;

    let numberPrefix = "";
    if (type === "insurance") {
      numberPrefix = `${item.policyNumber || "POL"}/RNW`;
    } else if (type === "permit") {
      numberPrefix = `${item.permitNumber || "PRM"}/RNW`;
    } else if (type === "fitness") {
      numberPrefix = `${item.fitnessNumber || "FIT"}/RNW`;
    } else {
      numberPrefix = `${item.dlNumber || "DL"}/RNW`;
    }

    setFormData({
      newNumber: numberPrefix,
      newExpiry: newExpiryStr,
      newFee: fee,
      newPaid: fee,
      newIdv: item.idvAmount ? Math.round(item.idvAmount * 0.9) : "",
      newNcb: item.ncbPercentage !== undefined ? Math.min(50, item.ncbPercentage + 5) : 25,
      documentUrl: "",
      documentName: "",
      documentSize: 0
    });
  }, [item, type, isOpen]);

  if (!isOpen || !item) return null;

  const total = Number(formData.newFee) || 0;
  const paid = Number(formData.newPaid) || 0;
  const due = Math.max(0, total - paid);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "insurance") {
      onConfirm(item.id, {
        newPolicyNumber: formData.newNumber,
        newPremiumAmount: total,
        newTotalAmount: total,
        newPaidAmount: paid,
        newIdvAmount: Number(formData.newIdv) || 0,
        newNcbPercentage: Number(formData.newNcb) || 0,
        documentUrl: formData.documentUrl,
        documentName: formData.documentName,
        documentSize: formData.documentSize
      });
    } else if (type === "permit") {
      onConfirm(item.id, {
        newPermitNumber: formData.newNumber,
        newExpiryDate: formData.newExpiry,
        newAuthFeePaid: total,
        newTotalAmount: total,
        newPaidAmount: paid,
        documentUrl: formData.documentUrl,
        documentName: formData.documentName,
        documentSize: formData.documentSize
      });
    } else if (type === "fitness") {
      onConfirm(item.id, {
        newExpiryDate: formData.newExpiry,
        newTotalAmount: total,
        newPaidAmount: paid,
        documentUrl: formData.documentUrl,
        documentName: formData.documentName,
        documentSize: formData.documentSize
      });
    } else {
      onConfirm(item.id, {
        newExpiryDate: formData.newExpiry,
        newTotalAmount: total,
        newPaidAmount: paid,
        documentUrl: formData.documentUrl,
        documentName: formData.documentName,
        documentSize: formData.documentSize
      });
    }
  };

  const getTitle = () => {
    if (type === "insurance") return "Renew Vehicle Insurance Policy";
    if (type === "permit") return "Renew Transport Permit";
    if (type === "fitness") return "Renew Vehicle Fitness Certificate";
    return "Renew Driving Licence";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <RotateCw size={18} color="var(--brand-primary)" />
            <h3 className="modal-title">{getTitle()}</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Target Information Card */}
            <div
              style={{
                padding: "12px 16px",
                background: "var(--bg-subtle, #f8fafc)",
                border: "1px solid var(--border-default, #e2e8f0)",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              {item.vehicleReg && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    VEHICLE NUMBER
                  </span>
                  <span className="number-plate">
                    <span className="number-plate-ind">IND</span>
                    <span>{item.vehicleReg}</span>
                  </span>
                </div>
              )}
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.customerName || "Customer"} {item.customerPhone ? `(${item.customerPhone})` : ""}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Current Expiry: <span style={{ fontWeight: 600 }}>{item.expiryDate}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
              <div className="form-group">
                <label className="form-label">New Expiry Date *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={formData.newExpiry}
                  onChange={(e) => setFormData({ ...formData, newExpiry: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Renewal Fee (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={formData.newFee}
                  onChange={(e) => setFormData({ ...formData, newFee: e.target.value })}
                />
              </div>
            </div>

            {/* Payment Collection during renewal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Amount Paid (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Paid in ₹"
                  value={formData.newPaid}
                  onChange={(e) => setFormData({ ...formData, newPaid: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Balance Due (₹)</label>
                <div
                  style={{
                    padding: "8px 12px",
                    background: due > 0 ? "rgba(239, 68, 68, 0.08)" : "rgba(34, 197, 94, 0.08)",
                    border: "1px solid var(--border-default, #e2e8f0)",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: due > 0 ? "#dc2626" : "#16a34a"
                  }}
                >
                  ₹{due.toLocaleString("en-IN")} {due === 0 ? "(Paid)" : "(Due)"}
                </div>
              </div>
            </div>

            {/* Upload Renewed Document */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "var(--bg-subtle, #f8fafc)",
                border: "1px dashed var(--border-default, #cbd5e1)",
                marginTop: "10px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  Upload Renewed Document PDF (Optional)
                </span>
                {isUploading && (
                  <span style={{ fontSize: "0.72rem", color: "var(--brand-primary)", fontWeight: 600 }}>
                    Uploading...
                  </span>
                )}
              </div>

              {formData.documentUrl ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    background: "#ffffff",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText size={16} color="var(--brand-primary)" />
                    <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      {formData.documentName || "Renewed_Document.pdf"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, documentUrl: "", documentName: "", documentSize: 0 }))}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="renew-doc-upload"
                    accept="application/pdf,image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="renew-doc-upload"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px",
                      background: "#ffffff",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--brand-primary)"
                    }}
                  >
                    <Upload size={14} />
                    <span>Attach New Policy / Certificate PDF</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Confirm & Archive Renewal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
