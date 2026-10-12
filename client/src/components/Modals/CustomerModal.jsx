import React, { useState, useEffect } from "react";
import { X, Users, Save, IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";

export default function CustomerModal({ isOpen, onClose, onSave, customer }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    totalAmount: "",
    paidAmount: "",
    notes: ""
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        totalAmount: customer.totalAmount ?? (customer.amount ?? ""),
        paidAmount: customer.paidAmount ?? (customer.status === "Completed" ? (customer.amount ?? "") : ""),
        notes: customer.notes || ""
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        totalAmount: "",
        paidAmount: "",
        notes: ""
      });
    }
  }, [customer, isOpen]);

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
      label: "No Charges Set",
      color: "var(--text-muted)",
      bg: "var(--bg-secondary)"
    };
  }

  const handleMarkFullPaid = () => {
    if (total > 0) {
      setFormData({ ...formData, paidAmount: total });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Customer Name and Phone number are required!");
      return;
    }
    onSave({
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Users size={18} color="var(--brand-primary)" />
            <h3 className="modal-title">
              {customer ? "Edit Customer Details" : "Add New Customer"}
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Section 1: Basic Details */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--brand-primary)",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Users size={14} />
                <span>Basic Customer Details</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Ramesh Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    placeholder="e.g. 9826012345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. client@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City / Address (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Indore, MP"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Payment & Due Tracker */}
            <div
              style={{
                marginBottom: "16px",
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
                  marginBottom: "10px"
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
                  <span>Payment & Dues Tracking</span>
                </div>

                {total > 0 && paid < total && (
                  <button
                    type="button"
                    onClick={handleMarkFullPaid}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--brand-primary)",
                      fontSize: "0.75rem",
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: "8px" }}>
                  <label className="form-label">Total Charges / Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="Total amount in ₹"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "8px" }}>
                  <label className="form-label">Amount Paid / Advance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="Received in ₹"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamic Due Payment Calculation Preview */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "#ffffff",
                  border: "1px solid var(--border-default, #e2e8f0)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                    Outstanding Balance / Due Payment:
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
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
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
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

            {/* Section 3: Notes & Instructions */}
            <div className="form-group">
              <label className="form-label">Customer Notes & Opted Services (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="List services requested (DL renewal, insurance, permit, RC transfer) or client notes..."
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
              <span>{customer ? "Update Customer" : "Save Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
