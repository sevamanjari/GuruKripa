import React, { useState, useEffect } from "react";
import { X, Truck, Save } from "lucide-react";
import CustomerAutoFetchField from "../CustomerAutoFetchField.jsx";
import IndianDateInput from "../Common/IndianDateInput.jsx";

export default function VehicleModal({ isOpen, onClose, onSave, vehicle, customers = [] }) {
  const [formData, setFormData] = useState({
    regNumber: "",
    customerId: "",
    customerPhone: "",
    customerName: "",
    vehicleType: "Heavy Commercial Truck (16-Wheel)",
    make: "Tata Motors",
    model: "Signa 4825.TK Heavy Truck",
    chassisNumber: "",
    engineNumber: "",
    manufacturingYear: 2023,
    fuelType: "Diesel",
    gvwKg: 47500,
    fitnessExpiry: "",
    taxValidUpto: "",
    pucExpiry: "",
    hypothecation: "None",
    status: "Active"
  });

  useEffect(() => {
    if (vehicle) {
      const foundCust = customers.find((c) => c.id === vehicle.customerId) || {};
      setFormData({
        regNumber: vehicle.regNumber || "",
        customerId: vehicle.customerId || "",
        customerPhone: vehicle.customerPhone || foundCust.phone || "",
        customerName: vehicle.customerName || foundCust.name || "",
        vehicleType: vehicle.vehicleType || "Heavy Commercial Truck (16-Wheel)",
        make: vehicle.make || "Tata Motors",
        model: vehicle.model || "",
        chassisNumber: vehicle.chassisNumber || "",
        engineNumber: vehicle.engineNumber || "",
        manufacturingYear: vehicle.manufacturingYear || 2023,
        fuelType: vehicle.fuelType || "Diesel",
        gvwKg: vehicle.gvwKg || 16000,
        fitnessExpiry: vehicle.fitnessExpiry || "",
        taxValidUpto: vehicle.taxValidUpto || "",
        pucExpiry: vehicle.pucExpiry || "",
        hypothecation: vehicle.hypothecation || "None",
        status: vehicle.status || "Active"
      });
    } else {
      const today = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const halfYear = new Date(today);
      halfYear.setMonth(halfYear.getMonth() + 6);
      const threeMonths = new Date(today);
      threeMonths.setMonth(threeMonths.getMonth() + 3);

      setFormData({
        regNumber: "",
        customerId: "",
        customerPhone: "",
        customerName: "",
        vehicleType: "Heavy Commercial Truck (16-Wheel)",
        make: "Tata Motors",
        model: "Signa 4825.TK Heavy Truck",
        chassisNumber: "",
        engineNumber: "",
        manufacturingYear: new Date().getFullYear(),
        fuelType: "Diesel",
        gvwKg: 47500,
        fitnessExpiry: nextYear.toISOString().split("T")[0],
        taxValidUpto: halfYear.toISOString().split("T")[0],
        pucExpiry: threeMonths.toISOString().split("T")[0],
        hypothecation: "None",
        status: "Active"
      });
    }
  }, [vehicle, isOpen, customers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.regNumber.trim()) {
      alert("Registration Number is required!");
      return;
    }
    if (!formData.customerPhone.trim() && !formData.customerId) {
      alert("Please provide the Customer / Transporter Mobile Number!");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} color="#fbbf24" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              {vehicle ? "Edit Commercial Vehicle" : "Add New Fleet Vehicle"}
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Auto-Fetch Customer by Mobile Number */}
            <CustomerAutoFetchField
              phone={formData.customerPhone}
              name={formData.customerName}
              onPhoneChange={(val) => setFormData((prev) => ({ ...prev, customerPhone: val }))}
              onNameChange={(val) => setFormData((prev) => ({ ...prev, customerName: val }))}
              onCustomerSelect={(c) => {
                if (c) {
                  setFormData((prev) => ({
                    ...prev,
                    customerId: c.id,
                    customerName: c.name,
                    customerPhone: c.phone
                  }));
                }
              }}
              customers={customers}
              required={true}
            />

            <div className="form-group">
              <label className="form-label">Registration Number *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. MP 09 GH 4521"
                value={formData.regNumber}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select
                  className="form-select"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="Heavy Commercial Truck (16-Wheel)">Heavy Commercial Truck (16-Wheel)</option>
                  <option value="Multi-Axle Trailer">Multi-Axle Trailer</option>
                  <option value="Tourist Luxury Bus (AC Sleeper)">Tourist Luxury Bus (AC Sleeper)</option>
                  <option value="Commercial Goods Carrier (6-Wheel)">Commercial Goods Carrier (6-Wheel)</option>
                  <option value="Bulker / Heavy Tanker">Bulker / Heavy Tanker</option>
                  <option value="LCV Mini Truck">LCV Mini Truck (Tata Ace / Bolero)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Maker / Manufacturer</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tata Motors / Ashok Leyland"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Model Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Signa 4825.TK or AVTR 5525"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mfg Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.manufacturingYear}
                  onChange={(e) => setFormData({ ...formData, manufacturingYear: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Chassis Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="MAT452109KP87654"
                  value={formData.chassisNumber}
                  onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gross Vehicle Weight (GVW Kg)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="47500"
                  value={formData.gvwKg}
                  onChange={(e) => setFormData({ ...formData, gvwKg: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Fitness Expiry (DD/MM/YYYY) *</label>
                <IndianDateInput
                  required
                  value={formData.fitnessExpiry}
                  onChange={(e) => setFormData({ ...formData, fitnessExpiry: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Valid Upto (DD/MM/YYYY) *</label>
                <IndianDateInput
                  required
                  value={formData.taxValidUpto}
                  onChange={(e) => setFormData({ ...formData, taxValidUpto: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">PUC Expiry (DD/MM/YYYY)</label>
                <IndianDateInput
                  value={formData.pucExpiry}
                  onChange={(e) => setFormData({ ...formData, pucExpiry: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Hypothecation (Bank Lien)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HDFC Bank Commercial Finance"
                  value={formData.hypothecation}
                  onChange={(e) => setFormData({ ...formData, hypothecation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Fitness Expiring">Fitness Expiring</option>
                  <option value="Tax Overdue">Tax Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{vehicle ? "Update Vehicle" : "Save Vehicle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
