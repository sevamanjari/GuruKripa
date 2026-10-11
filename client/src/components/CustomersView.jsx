import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Edit2,
  Trash2
} from "lucide-react";

export default function CustomersView({
  customers = [],
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const serviceOptions = [
    "All",
    "DL (Driving Licence)",
    "Vehicle Insurance",
    "Permit",
    "Fitness Certificate",
    "RC Transfer",
    "General RTO"
  ];

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(q)) ||
      (c.docNumber && c.docNumber.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q));

    const matchesService = filterService === "All" || c.serviceType === filterService;
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;

    return matchesSearch && matchesService && matchesStatus;
  });

  return (
    <div>
      {/* Uniform Workspace Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Customer Directory & RTO Tracker</h1>
          <p className="view-subtitle">
            Register and manage customer Driving Licences, commercial insurances, permits, and RTO files.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onAddCustomer}>
          <Plus size={14} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Uniform Search and Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by customer name, mobile, vehicle number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "160px" }}
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
        >
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Services" : s}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "140px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Uniform Table Card */}
      <div className="table-card">
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={20} />
            </div>
            <h3 className="empty-state-title">No Matching Records Found</h3>
            <p className="empty-state-desc">
              {customers.length === 0
                ? "No customer entries exist yet. Click '+ Add Customer' to create the first record."
                : "No customer records match your active search and filter criteria."}
            </p>
            {customers.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={onAddCustomer}>
                <Plus size={13} />
                <span>Add Customer</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name & Mobile</th>
                  <th>Service Type</th>
                  <th>Vehicle / Ref Number</th>
                  <th>Due Date</th>
                  <th>Fee (₹)</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                      <div
                        style={{
                          fontSize: "0.76rem",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "2px"
                        }}
                      >
                        <Phone size={11} color="var(--text-muted)" />
                        <a
                          href={`tel:${c.phone}`}
                          style={{ color: "var(--text-muted)", textDecoration: "none" }}
                        >
                          {c.phone}
                        </a>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-neutral">{c.serviceType}</span>
                    </td>
                    <td>
                      {c.vehicleNumber ? (
                        <div className="number-plate">
                          <span className="number-plate-ind">IND</span>
                          <span>{c.vehicleNumber}</span>
                        </div>
                      ) : c.docNumber ? (
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                            fontWeight: 600
                          }}
                        >
                          {c.docNumber}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>-</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {c.dueDate || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--text-primary)" }}>
                        {c.amount ? `₹${Number(c.amount).toLocaleString("en-IN")}` : "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          c.status === "Completed"
                            ? "status-active"
                            : c.status === "In Progress"
                            ? "status-info"
                            : "status-warning"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          maxWidth: "180px",
                          display: "inline-block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {c.notes || "-"}
                      </span>
                    </td>
                    <td className="action-cell">
                      <div className="action-group">
                        <button
                          className="action-icon-btn"
                          onClick={() => onEditCustomer(c)}
                          title="Edit Customer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="action-icon-btn action-icon-danger"
                          onClick={() => onDeleteCustomer(c.id, c.name)}
                          title="Delete Customer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
