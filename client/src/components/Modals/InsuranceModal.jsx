import React, { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";

export default function InsuranceModal({
  isOpen,
  onClose,
  onSave,
  insurance,
  underwriters = [],
  onOpenManageUnderwriters
}) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    vehicleReg: "",
    insuranceCompany: "",
    policyNumber: "",
    policyType: "Comprehensive",
    startDate: "",
    expiryDate: "",
    idvAmount: "",
    ncbPercentage: 20,
    premiumAmount: "",
    status: "Active",
    notes: ""
  });

  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    if (insurance) {
      setFormData({
        customerName: insurance.customerName || "",
        customerPhone: insurance.customerPhone || "",
        vehicleReg: insurance.vehicleReg || "",
        insuranceCompany: insurance.insuranceCompany || "",
        policyNumber: insurance.policyNumber || "",
        policyType: insurance.policyType || "Comprehensive",
        startDate: insurance.startDate || "",
        expiryDate: insurance.expiryDate || "",
        idvAmount: insurance.idvAmount || "",
        ncbPercentage: insurance.ncbPercentage ?? 20,
        premiumAmount: insurance.premiumAmount || "",
        status: insurance.status || "Active",
        notes: insurance.notes || ""
      });
      // If the existing policy's underwriter isn't in underwriters list, enable custom view
      const existsInList = underwriters.some(
        (u) => u.name.toLowerCase() === (insurance.insuranceCompany || "").toLowerCase()
      );
      setIsCustomMode(!existsInList && !!insurance.insuranceCompany);
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toISOString().split("T")[0];

      // Default to first registered underwriter if available, otherwise empty
      const defaultCompany = underwriters.length > 0 ? underwriters[0].name : "";

      setFormData({
        customerName: "",
        customerPhone: "",
        vehicleReg: "",
        insuranceCompany: defaultCompany,
        policyNumber: "",
        policyType: "Comprehensive",
        startDate: today,
        expiryDate: nextYearStr,
        idvAmount: "",
        ncbPercentage: 20,
        premiumAmount: "",
        status: "Active",
        notes: ""
      });
      setIsCustomMode(underwriters.length === 0);
    }
  }, [insurance, isOpen, underwriters]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.vehicleReg.trim() || !formData.policyNumber.trim()) {
      alert("Customer Name, Vehicle Number, and Policy Number are required!");
      return;
    }
    if (!formData.insuranceCompany.trim()) {
      alert("Please enter or select the Insurance Underwriter company.");
      return;
    }
    onSave({
      ...formData,
      insuranceCompany: formData.insuranceCompany.trim(),
      vehicleId: formData.vehicleReg
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Ramesh Chandra / Sharma Roadways"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="10-digit mobile"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Vehicle Registration Number *</label>
                <input
                  type="text"
                  className="form-input font-mono"
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
                  placeholder="e.g. POL-MP-9842"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              {/* Dynamic Insurance Underwriter based on user's dealings */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Insurance Underwriter *
                  </label>
                  {underwriters.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(!isCustomMode)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--brand-primary)",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0
                      }}
                    >
                      {isCustomMode ? "Choose from list" : "+ Type custom"}
                    </button>
                  )}
                </div>

                {!isCustomMode && underwriters.length > 0 ? (
                  <select
                    className="form-select"
                    required
                    value={formData.insuranceCompany}
                    onChange={(e) => {
                      if (e.target.value === "__MANAGE__") {
                        if (onOpenManageUnderwriters) onOpenManageUnderwriters();
                      } else {
                        setFormData({ ...formData, insuranceCompany: e.target.value });
                      }
                    }}
                  >
                    <option value="">Select Underwriter Company...</option>
                    {underwriters.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.agencyCode ? `(Code: ${u.agencyCode})` : ""}
                      </option>
                    ))}
                    {onOpenManageUnderwriters && (
                      <option value="__MANAGE__">⚙️ Manage Underwriters...</option>
                    )}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      required
                      list="underwriter-dealings-list"
                      placeholder="Enter company (e.g. Tata AIG, Go Digit, Shriram)"
                      value={formData.insuranceCompany}
                      onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                    />
                    <datalist id="underwriter-dealings-list">
                      {underwriters.map((u) => (
                        <option key={u.id} value={u.name} />
                      ))}
                    </datalist>
                  </div>
                )}
                {underwriters.length === 0 && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px" }}>
                    No hardcoded underwriters. Type your company name or{" "}
                    {onOpenManageUnderwriters && (
                      <a
                        href="#manage"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenManageUnderwriters();
                        }}
                        style={{ color: "var(--brand-primary)", textDecoration: "underline", fontWeight: 600 }}
                      >
                        register dealing partners
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Coverage Type</label>
                <select
                  className="form-select"
                  value={formData.policyType}
                  onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                >
                  <option value="Comprehensive">Comprehensive (Full)</option>
                  <option value="Third Party Only">Third Party Only</option>
                  <option value="Own Damage">Standalone Own Damage</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">IDV Value (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2500000"
                  value={formData.idvAmount}
                  onChange={(e) => setFormData({ ...formData, idvAmount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">NCB Bonus (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 25"
                  value={formData.ncbPercentage}
                  onChange={(e) => setFormData({ ...formData, ncbPercentage: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Premium / Fee (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 24000"
                  value={formData.premiumAmount}
                  onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operational Notes / Terms</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Policy endorsements, financier hypothecation note, cashless garage conditions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <span>{insurance ? "Update Policy" : "Save Insurance Entry"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
