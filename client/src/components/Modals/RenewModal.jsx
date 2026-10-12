import React, { useState, useEffect } from "react";
import { X, RotateCw, CheckCircle2, IndianRupee } from "lucide-react";

export default function RenewModal({ isOpen, onClose, onConfirm, item, type = "insurance" }) {
  const [formData, setFormData] = useState({
    newNumber: "",
    newExpiry: "",
    newFee: "",
    newPaid: "",
    newIdv: "",
    newNcb: ""
  });

  useEffect(() => {
    if (!item) return;

    const baseExpiry = item.expiryDate ? new Date(item.expiryDate) : new Date();
    const newExp = new Date(baseExpiry);
    newExp.setFullYear(newExp.getFullYear() + 1);
    const newExpiryStr = newExp.toISOString().split("T")[0];

    const fee = type === "insurance" ? (item.totalAmount || item.premiumAmount || 35000) : (item.totalAmount || item.authFeePaid || 16500);

    if (type === "insurance") {
      setFormData({
        newNumber: `${item.policyNumber}/RN`,
        newExpiry: newExpiryStr,
        newFee: fee,
        newPaid: fee,
        newIdv: Math.round((item.idvAmount || 2500000) * 0.9),
        newNcb: Math.min(50, (item.ncbPercentage || 20) + 5)
      });
    } else {
      setFormData({
        newNumber: `${item.permitNumber}/R1`,
        newExpiry: newExpiryStr,
        newFee: fee,
        newPaid: fee,
        newIdv: "",
        newNcb: ""
      });
    }
  }, [item, type, isOpen]);

  if (!isOpen || !item) return null;

  const total = Number(formData.newFee) || 0;
  const paid = Number(formData.newPaid) || 0;
  const due = Math.max(0, total - paid);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "insurance") {
      onConfirm(item.id, {
        newPolicyNumber: formData.newNumber,
        newPremiumAmount: total,
        newTotalAmount: total,
        newPaidAmount: paid,
        newIdvAmount: Number(formData.newIdv),
        newNcbPercentage: Number(formData.newNcb)
      });
    } else {
      onConfirm(item.id, {
        newPermitNumber: formData.newNumber,
        newExpiryDate: formData.newExpiry,
        newAuthFeePaid: total,
        newTotalAmount: total,
        newPaidAmount: paid
      });
    }
  };

  const isInsurance = type === "insurance";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <RotateCw size={18} color="var(--brand-primary)" />
            <h3 className="modal-title">
              {isInsurance ? "Fast Renew Insurance Policy" : "Fast Renew Transport Permit"}
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Clean Uniform Information Box */}
            <div
              style={{
                padding: "12px 16px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  VEHICLE / OWNER
                </span>
                <span className="number-plate">
                  <span className="number-plate-ind">IND</span>
                  <span>{item.vehicleReg}</span>
                </span>
              </div>
              <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {item.customerName || "RTO Client"} {item.customerPhone ? `(${item.customerPhone})` : ""}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Current Document: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{isInsurance ? item.policyNumber : item.permitNumber}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "12px" }}>
              <label className="form-label">
                {isInsurance ? "New Policy Number *" : "Renewed Permit / Auth No *"}
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.newNumber}
                onChange={(e) => setFormData({ ...formData, newNumber: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                <label className="form-label">
                  {isInsurance ? "Renewal Premium (₹) *" : "Permit Fee (₹) *"}
                </label>
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
                <label className="form-label">Amount Paid / Received (₹)</label>
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
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: due > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)"
                  }}
                >
                  ₹{due.toLocaleString("en-IN")} {due === 0 ? "(Paid)" : "(Due)"}
                </div>
              </div>
            </div>

            {isInsurance && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Insured Declared Value (IDV ₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.newIdv}
                    onChange={(e) => setFormData({ ...formData, newIdv: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Updated NCB Bonus (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.newNcb}
                    onChange={(e) => setFormData({ ...formData, newNcb: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Confirm Renewal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
