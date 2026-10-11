import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  RotateCw,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Clock,
  History
} from "lucide-react";
import HistoryModal from "./Modals/HistoryModal.jsx";

export default function PermitsView({
  permits = [],
  onAddPermit,
  onEditPermit,
  onDeletePermit,
  onRenewPermit
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDueDate, setFilterDueDate] = useState("All");

  // History Modal State
  const [historyItem, setHistoryItem] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return 999;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(dateStr);
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    return Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
  };

  const filteredPermits = permits.filter((perm) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (perm.permitNumber && perm.permitNumber.toLowerCase().includes(q)) ||
      (perm.vehicleReg && perm.vehicleReg.toLowerCase().includes(q)) ||
      (perm.customerName && perm.customerName.toLowerCase().includes(q)) ||
      (perm.customerPhone && perm.customerPhone.toLowerCase().includes(q)) ||
      (perm.permitType && perm.permitType.toLowerCase().includes(q));

    const days = getDaysUntil(perm.expiryDate);

    let computed = "Active";
    if (days < 0) computed = "Expired";
    else if (days <= 30) computed = "Expiring Soon";

    const matchesStatus =
      filterStatus === "All" ||
      computed === filterStatus ||
      perm.status === filterStatus;

    let matchesDueDate = true;
    if (filterDueDate === "expired") {
      matchesDueDate = days < 0;
    } else if (filterDueDate === "1") {
      matchesDueDate = days >= 0 && days <= 1;
    } else if (filterDueDate === "7") {
      matchesDueDate = days >= 0 && days <= 7;
    } else if (filterDueDate === "15") {
      matchesDueDate = days >= 0 && days <= 15;
    } else if (filterDueDate === "30") {
      matchesDueDate = days >= 0 && days <= 30;
    }

    return matchesSearch && matchesStatus && matchesDueDate;
  });

  const countExpired = permits.filter((p) => getDaysUntil(p.expiryDate) < 0).length;
  const count1Day = permits.filter((p) => {
    const d = getDaysUntil(p.expiryDate);
    return d >= 0 && d <= 1;
  }).length;
  const count7Days = permits.filter((p) => {
    const d = getDaysUntil(p.expiryDate);
    return d >= 0 && d <= 7;
  }).length;
  const count15Days = permits.filter((p) => {
    const d = getDaysUntil(p.expiryDate);
    return d >= 0 && d <= 15;
  }).length;
  const count30Days = permits.filter((p) => {
    const d = getDaysUntil(p.expiryDate);
    return d >= 0 && d <= 30;
  }).length;

  return (
    <div>
      {/* Uniform Workspace Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Commercial Vehicle Permits</h1>
          <p className="view-subtitle">
            Track State Goods, National (NP Form 48), and Tourist permit validities and inspect past permit renewal logs.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onAddPermit}>
          <Plus size={14} />
          <span>Add Permit</span>
        </button>
      </div>

      {/* Uniform Renewal Due Filter Chips */}
      <div className="chips-bar">
        <span className="chips-label">
          <Clock size={13} />
          Renewal Due:
        </span>

        <button
          className={`chip-btn ${filterDueDate === "All" ? "active" : ""}`}
          onClick={() => setFilterDueDate("All")}
        >
          All
          <span className="chip-count">{permits.length}</span>
        </button>

        <button
          className={`chip-btn ${filterDueDate === "1" ? "active" : ""}`}
          onClick={() => setFilterDueDate("1")}
        >
          Within 1 Day
          <span className="chip-count">{count1Day}</span>
        </button>

        <button
          className={`chip-btn ${filterDueDate === "7" ? "active" : ""}`}
          onClick={() => setFilterDueDate("7")}
        >
          Within 7 Days
          <span className="chip-count">{count7Days}</span>
        </button>

        <button
          className={`chip-btn ${filterDueDate === "15" ? "active" : ""}`}
          onClick={() => setFilterDueDate("15")}
        >
          Within 15 Days
          <span className="chip-count">{count15Days}</span>
        </button>

        <button
          className={`chip-btn ${filterDueDate === "30" ? "active" : ""}`}
          onClick={() => setFilterDueDate("30")}
        >
          Within 30 Days
          <span className="chip-count">{count30Days}</span>
        </button>

        <button
          className={`chip-btn ${filterDueDate === "expired" ? "active" : ""}`}
          onClick={() => setFilterDueDate("expired")}
        >
          Overdue / Expired
          <span className="chip-count">{countExpired}</span>
        </button>
      </div>

      {/* Uniform Search and Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by vehicle reg, permit no, permit type, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "160px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Expiring Soon">Expiring Soon (&lt; 30d)</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Uniform Table Card */}
      <div className="table-card">
        {filteredPermits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={20} />
            </div>
            <h3 className="empty-state-title">No Permits Found</h3>
            <p className="empty-state-desc">
              {permits.length === 0
                ? "No vehicle permits registered yet. Click '+ Add Permit' to create a permit record."
                : "No permits match the selected expiry or search filters."}
            </p>
            {permits.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={onAddPermit}>
                <Plus size={13} />
                <span>Add First Permit</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Customer Name & Phone</th>
                  <th>Permit Details</th>
                  <th>Coverage & State</th>
                  <th>Expiry Date</th>
                  <th>Status & Due</th>
                  <th>Govt Fee</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermits.map((perm) => {
                  const days = getDaysUntil(perm.expiryDate);
                  const isExpired = days < 0;
                  const isCritical = days >= 0 && days <= 7;
                  const isWarning = days > 7 && days <= 30;
                  const historyCount = perm.renewalHistory?.length || 0;

                  return (
                    <tr key={perm.id}>
                      <td>
                        <div className="number-plate">
                          <span className="number-plate-ind">IND</span>
                          <span>{perm.vehicleReg}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {perm.customerName || "N/A"}
                        </div>
                        {perm.customerPhone && (
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
                              href={`tel:${perm.customerPhone}`}
                              style={{ color: "var(--text-muted)", textDecoration: "none" }}
                            >
                              {perm.customerPhone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          {perm.permitNumber}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {perm.permitType || "State Goods Permit"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                          {perm.state || "Madhya Pradesh"}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          <Calendar size={13} color="var(--text-light)" />
                          <span>{perm.expiryDate || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        {isExpired ? (
                          <span className="status-badge status-critical">
                            Expired ({Math.abs(days)}d ago)
                          </span>
                        ) : isCritical ? (
                          <span className="status-badge status-critical">
                            Due in {days} day{days === 1 ? "" : "s"}
                          </span>
                        ) : isWarning ? (
                          <span className="status-badge status-warning">
                            Due in {days} days
                          </span>
                        ) : (
                          <span className="status-badge status-active">
                            Valid ({days}d left)
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--text-primary)" }}>
                          {perm.authFeePaid ? `₹${Number(perm.authFeePaid).toLocaleString("en-IN")}` : "-"}
                        </span>
                      </td>
                      <td className="action-cell">
                        <div className="action-group">
                          <button
                            className="action-pill-btn"
                            onClick={() => onRenewPermit(perm.id)}
                            title="Renew Permit"
                          >
                            <RotateCw size={12} />
                            <span>Renew</span>
                          </button>
                          <button
                            className={`action-icon-btn ${historyCount > 0 ? "has-history" : ""}`}
                            onClick={() => {
                              setHistoryItem(perm);
                              setIsHistoryOpen(true);
                            }}
                            title={historyCount > 0 ? `View Permit History (${historyCount} past terms)` : "View Permit History"}
                          >
                            <History size={13} />
                          </button>
                          <button
                            className="action-icon-btn"
                            onClick={() => onEditPermit(perm)}
                            title="Edit Permit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="action-icon-btn action-icon-danger"
                            onClick={() => onDeletePermit(perm.id, perm.permitNumber)}
                            title="Delete Permit"
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

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setHistoryItem(null);
        }}
        item={historyItem}
        type="permit"
      />
    </div>
  );
}
