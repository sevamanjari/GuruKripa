import React, { useState, useEffect } from "react";
import { X, FileText, Save } from "lucide-react";

export default function PermitModal({ isOpen, onClose, onSave, permit }) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    vehicleReg: "",
    permitNumber: "",
    permitType: "State Goods Permit",
    state: "Madhya Pradesh",
    startDate: "",
    expiryDate: "",
    authFeePaid: "",
    status: "Active",
    notes: ""
  });

  useEffect(() => {
    if (permit) {
      setFormData({
        customerName: permit.customerName || "",
        customerPhone: permit.customerPhone || "",
        vehicleReg: permit.vehicleReg || "",
        permitNumber: permit.permitNumber || "",
        permitType: permit.permitType || "State Goods Permit",
        state: permit.state || "Madhya Pradesh",
        startDate: permit.startDate || "",
        expiryDate: permit.expiryDate || "",
        authFeePaid: permit.authFeePaid || "",
        status: permit.status || "Active",
        notes: permit.notes || ""
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toISOString().split("T")[0];

      setFormData({
        customerName: "",
        customerPhone: "",
        vehicleReg: "",
        permitNumber: "",
        permitType: "State Goods Permit",
        state: "Madhya Pradesh",
        startDate: today,
        expiryDate: nextYearStr,
        authFeePaid: "",
        status: "Active",
        notes: ""
      });
    }
  }, [permit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.vehicleReg.trim() || !formData.permitNumber.trim()) {
      alert("Customer Name, Vehicle Number, and Permit Number are required!");
      return;
    }
    onSave({
      ...formData,
      vehicleId: formData.vehicleReg
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Customer / Transporter Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Sunil Rathore"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Mobile</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="9827012345"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Govt Auth Fee (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 16500"
                  value={formData.authFeePaid}
                  onChange={(e) => setFormData({ ...formData, authFeePaid: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Permit Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Pending Renewal">Pending Renewal</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Route Specifications</label>
              <textarea
                className="form-textarea"
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
              <span>{permit ? "Update Permit" : "Save Permit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
