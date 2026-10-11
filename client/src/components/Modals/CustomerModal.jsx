import React, { useState, useEffect } from "react";
import { X, Users, Save } from "lucide-react";

export default function CustomerModal({ isOpen, onClose, onSave, customer }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceType: "DL (Driving Licence)",
    vehicleNumber: "",
    docNumber: "",
    dueDate: "",
    amount: "",
    status: "Pending",
    notes: ""
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        serviceType: customer.serviceType || "DL (Driving Licence)",
        vehicleNumber: customer.vehicleNumber || "",
        docNumber: customer.docNumber || "",
        dueDate: customer.dueDate || "",
        amount: customer.amount || "",
        status: customer.status || "Pending",
        notes: customer.notes || ""
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        serviceType: "DL (Driving Licence)",
        vehicleNumber: "",
        docNumber: "",
        dueDate: "",
        amount: "",
        status: "Pending",
        notes: ""
      });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Customer Name and Phone number are required!");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Users size={18} color="var(--brand-primary)" />
            <h3 className="modal-title">
              {customer ? "Edit Customer Entry" : "Add Customer Entry"}
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
                  placeholder="9826012345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select
                  className="form-select"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                >
                  <option value="DL (Driving Licence)">DL (Driving Licence)</option>
                  <option value="Vehicle Insurance">Vehicle Insurance</option>
                  <option value="Permit">Permit (State / National)</option>
                  <option value="Fitness Certificate">Fitness Certificate</option>
                  <option value="RC Transfer">RC Transfer</option>
                  <option value="General RTO">General RTO Work</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Vehicle Number (if any)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MP 09 AB 1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">App / DL / Policy No</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Application or DL No"
                  value={formData.docNumber}
                  onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Due / Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fee / Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Fee in ₹"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Instructions</label>
              <textarea
                className="form-textarea"
                placeholder="Any special remarks, required documents, or client instructions..."
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
              <span>{customer ? "Update Entry" : "Save Entry"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
