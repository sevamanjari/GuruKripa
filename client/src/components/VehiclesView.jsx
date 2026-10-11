import React, { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Shield,
  FileText,
  Building,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function VehiclesView({
  vehicles = [],
  customers = [],
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onViewVehicleDetail
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      v.regNumber.toLowerCase().includes(q) ||
      (v.customerName && v.customerName.toLowerCase().includes(q)) ||
      (v.make && v.make.toLowerCase().includes(q)) ||
      (v.model && v.model.toLowerCase().includes(q)) ||
      (v.chassisNumber && v.chassisNumber.toLowerCase().includes(q));

    const matchesType = filterType === "All" || v.vehicleType === filterType;
    const matchesStatus = filterStatus === "All" || v.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const vehicleTypes = [
    "All",
    "Heavy Commercial Truck (16-Wheel)",
    "Multi-Axle Trailer",
    "Tourist Luxury Bus (AC Sleeper)",
    "Commercial Goods Carrier (6-Wheel)",
    "Bulker / Heavy Tanker",
    "LCV Mini Truck"
  ];

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return 999;
    const now = new Date();
    const target = new Date(dateStr);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header & Controls */}
      <div
        className="glass-panel"
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Truck size={20} color="#fbbf24" />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Commercial Fleet Registry</h2>
            <span
              style={{
                fontSize: "0.78rem",
                background: "rgba(245, 158, 11, 0.15)",
                color: "#fbbf24",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600
              }}
            >
              {vehicles.length} Vehicles
            </span>
          </div>
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
            Track RC details, fitness validity, road tax status, and hypothecation across all commercial vehicles.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onAddVehicle}>
          <Plus size={16} />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by Registration (MP 09...), Owner, Make, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </div>

        {/* Filter by Status */}
        <select
          className="form-select"
          style={{ width: "auto", minWidth: "160px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Fitness Expiring">Fitness Expiring</option>
          <option value="Tax Overdue">Tax Overdue</option>
        </select>
      </div>

      {/* Vehicle Type Pills */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {vehicleTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: "6px 12px",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: "8px",
              border: "1px solid",
              cursor: "pointer",
              background: filterType === type ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.04)",
              borderColor: filterType === type ? "#f59e0b" : "rgba(255, 255, 255, 0.08)",
              color: filterType === type ? "#fbbf24" : "var(--text-muted)",
              transition: "all 0.15s ease"
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Vehicles Table */}
      <div className="glass-panel" style={{ padding: "8px" }}>
        {filteredVehicles.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Truck size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No matching vehicles found</p>
            <p style={{ fontSize: "0.82rem" }}>Try modifying your filters or add a new vehicle entry.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Registration No</th>
                  <th>Make & Model</th>
                  <th>Transporter / Owner</th>
                  <th>Fitness Expiry</th>
                  <th>Road Tax Valid</th>
                  <th>Compliance Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((veh) => {
                  const fitnessDays = getDaysUntil(veh.fitnessExpiry);
                  const taxDays = getDaysUntil(veh.taxValidUpto);

                  return (
                    <tr key={veh.id}>
                      <td>
                        <div className="number-plate">
                          <span className="number-plate-ind">IND</span>
                          <span>{veh.regNumber}</span>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          GVW: {veh.gvwKg?.toLocaleString("en-IN") || "-"} kg
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff" }}>
                          {veh.make} {veh.model}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {veh.vehicleType} ({veh.manufacturingYear})
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>
                          {veh.customerName}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-subtle)", fontFamily: "monospace" }}>
                          Hypo: {veh.hypothecation}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {veh.fitnessExpiry}
                        </div>
                        {fitnessDays < 0 ? (
                          <span className="status-badge status-critical" style={{ marginTop: "3px" }}>
                            Expired
                          </span>
                        ) : fitnessDays <= 30 ? (
                          <span className="status-badge status-warning" style={{ marginTop: "3px" }}>
                            In {fitnessDays} Days
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            Valid ({fitnessDays}d)
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {veh.taxValidUpto}
                        </div>
                        {taxDays < 0 ? (
                          <span className="status-badge status-critical" style={{ marginTop: "3px" }}>
                            Overdue
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#34d399" }}>
                            Paid
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            veh.status === "Active"
                              ? "status-active"
                              : veh.status === "Fitness Expiring"
                              ? "status-warning"
                              : "status-critical"
                          }`}
                        >
                          {veh.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onViewVehicleDetail(veh.id)}
                            title="View vehicle details & documents"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEditVehicle(veh)}
                            title="Edit Vehicle"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDeleteVehicle(veh.id, veh.regNumber)}
                            title="Delete Vehicle"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
