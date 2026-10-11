import React from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Phone,
  Edit2,
  Trash2,
  FileText
} from "lucide-react";

export default function DashboardView({
  stats,
  customers = [],
  onNavigate,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer
}) {
  const pendingCount = stats?.pendingCount || 0;
  const inProgressCount = stats?.inProgressCount || 0;
  const completedCount = stats?.completedCount || 0;
  const totalCount = stats?.totalCustomers || 0;

  return (
    <div>
      {/* Uniform Workspace Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Operations & Customer Tracker</h1>
          <p className="view-subtitle">
            GuruKripa Yatayat • Daily overview of customer Driving Licences, vehicle insurances, and transport permits.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onAddCustomer}>
          <Plus size={14} />
          <span>New Customer Entry</span>
        </button>
      </div>

      {/* Uniform 4 Metric Cards */}
      <div className="metric-grid">
        <div className="metric-card interactive" onClick={() => onNavigate("customers")}>
          <div className="metric-top">
            <span className="metric-label">Total Customers</span>
            <div className="metric-icon-wrap">
              <Users size={15} />
            </div>
          </div>
          <div className="metric-value">{totalCount}</div>
          <div className="metric-caption">All registered customer files</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Pending</span>
            <div className="metric-icon-wrap">
              <Clock size={15} />
            </div>
          </div>
          <div className="metric-value">{pendingCount}</div>
          <div className="metric-caption">Awaiting client docs or payment</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">In Progress</span>
            <div className="metric-icon-wrap">
              <AlertCircle size={15} />
            </div>
          </div>
          <div className="metric-value">{inProgressCount}</div>
          <div className="metric-caption">Processing at RTO / Insurance desk</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Completed</span>
            <div className="metric-icon-wrap">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="metric-value">{completedCount}</div>
          <div className="metric-caption">Successfully issued & delivered</div>
        </div>
      </div>

      {/* Recent Entries Card */}
      <div className="table-card">
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <h2 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Recent Customer Entries
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Latest RTO registrations and client renewal requests
            </p>
          </div>

          {customers.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("customers")}>
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={20} />
            </div>
            <h3 className="empty-state-title">No Customer Records Yet</h3>
            <p className="empty-state-desc">
              Create an entry to start tracking Driving Licences, commercial vehicle insurance, or permits.
            </p>
            <button className="btn btn-primary btn-sm" onClick={onAddCustomer}>
              <Plus size={13} />
              <span>Add First Customer</span>
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name & Phone</th>
                  <th>Service Type</th>
                  <th>Vehicle / Ref Number</th>
                  <th>Due Date</th>
                  <th>Fee (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 8).map((c) => (
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
                        <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
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
