import React, { useState } from "react";
import {
  Shield,
  Plus,
  Search,
  RotateCw,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Clock,
  History,
  Building2
} from "lucide-react";
import HistoryModal from "./Modals/HistoryModal.jsx";

export default function InsuranceView({
  insurances = [],
  underwriters = [],
  onAddInsurance,
  onEditInsurance,
  onDeleteInsurance,
  onRenewInsurance,
  onOpenManageUnderwriters
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDueDate, setFilterDueDate] = useState("All");
  const [filterUnderwriter, setFilterUnderwriter] = useState("All");

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

  const filteredInsurances = insurances.filter((ins) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (ins.policyNumber && ins.policyNumber.toLowerCase().includes(q)) ||
      (ins.vehicleReg && ins.vehicleReg.toLowerCase().includes(q)) ||
      (ins.customerName && ins.customerName.toLowerCase().includes(q)) ||
      (ins.customerPhone && ins.customerPhone.toLowerCase().includes(q)) ||
      (ins.insuranceCompany && ins.insuranceCompany.toLowerCase().includes(q));

    const days = getDaysUntil(ins.expiryDate);

    let computed = "Active";
    if (days < 0) computed = "Expired";
    else if (days <= 30) computed = "Expiring Soon";

    const matchesStatus =
      filterStatus === "All" ||
      computed === filterStatus ||
      ins.status === filterStatus;

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

    const matchesUnderwriter =
      filterUnderwriter === "All" ||
      (ins.insuranceCompany && ins.insuranceCompany.toLowerCase() === filterUnderwriter.toLowerCase());

    return matchesSearch && matchesStatus && matchesDueDate && matchesUnderwriter;
  });

  const countExpired = insurances.filter((i) => getDaysUntil(i.expiryDate) < 0).length;
  const count1Day = insurances.filter((i) => {
    const d = getDaysUntil(i.expiryDate);
    return d >= 0 && d <= 1;
  }).length;
  const count7Days = insurances.filter((i) => {
    const d = getDaysUntil(i.expiryDate);
    return d >= 0 && d <= 7;
  }).length;
  const count15Days = insurances.filter((i) => {
    const d = getDaysUntil(i.expiryDate);
    return d >= 0 && d <= 15;
  }).length;
  const count30Days = insurances.filter((i) => {
    const d = getDaysUntil(i.expiryDate);
    return d >= 0 && d <= 30;
  }).length;

  return (
    <div>
      {/* Uniform Workspace Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Vehicle Insurance Policies</h1>
          <p className="view-subtitle">
            Track commercial and private vehicle insurance policies. Filter renewal expiries within 1, 7, 15, or 30 days and inspect past policy history.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {onOpenManageUnderwriters && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenManageUnderwriters}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Building2 size={14} />
              <span>Manage Underwriters ({underwriters.length})</span>
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={onAddInsurance}>
            <Plus size={14} />
            <span>Add Insurance</span>
          </button>
        </div>
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
          <span className="chip-count">{insurances.length}</span>
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
            placeholder="Search by vehicle reg, policy no, insurer, customer..."
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

        {underwriters.length > 0 && (
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "180px" }}
            value={filterUnderwriter}
            onChange={(e) => setFilterUnderwriter(e.target.value)}
          >
            <option value="All">All Underwriters ({underwriters.length})</option>
            {underwriters.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Uniform Table Card */}
      <div className="table-card">
        {filteredInsurances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Shield size={20} />
            </div>
            <h3 className="empty-state-title">No Insurance Policies Found</h3>
            <p className="empty-state-desc">
              {insurances.length === 0
                ? "No insurance policies registered yet. Click '+ Add Insurance' to issue a policy record."
                : "No policies match the selected expiry or search filters."}
            </p>
            {insurances.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={onAddInsurance}>
                <Plus size={13} />
                <span>Add First Policy</span>
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
                  <th>Policy Details</th>
                  <th>Insurance Company</th>
                  <th>Expiry Date</th>
                  <th>Status & Due</th>
                  <th>Premium</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInsurances.map((ins) => {
                  const days = getDaysUntil(ins.expiryDate);
                  const isExpired = days < 0;
                  const isCritical = days >= 0 && days <= 7;
                  const isWarning = days > 7 && days <= 30;
                  const historyCount = ins.renewalHistory?.length || 0;

                  return (
                    <tr key={ins.id}>
                      <td>
                        <div className="number-plate">
                          <span className="number-plate-ind">IND</span>
                          <span>{ins.vehicleReg}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {ins.customerName || "N/A"}
                        </div>
                        {ins.customerPhone && (
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
                              href={`tel:${ins.customerPhone}`}
                              style={{ color: "var(--text-muted)", textDecoration: "none" }}
                            >
                              {ins.customerPhone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          {ins.policyNumber}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {ins.policyType || "Comprehensive"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                          {ins.insuranceCompany}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          <Calendar size={13} color="var(--text-light)" />
                          <span>{ins.expiryDate || "N/A"}</span>
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
                          {ins.premiumAmount ? `₹${Number(ins.premiumAmount).toLocaleString("en-IN")}` : "-"}
                        </span>
                      </td>
                      <td className="action-cell">
                        <div className="action-group">
                          <button
                            className="action-pill-btn"
                            onClick={() => onRenewInsurance(ins.id)}
                            title="Fast Renew Policy"
                          >
                            <RotateCw size={12} />
                            <span>Renew</span>
                          </button>
                          <button
                            className={`action-icon-btn ${historyCount > 0 ? "has-history" : ""}`}
                            onClick={() => {
                              setHistoryItem(ins);
                              setIsHistoryOpen(true);
                            }}
                            title={historyCount > 0 ? `View Renewal History (${historyCount} past terms)` : "View Renewal History"}
                          >
                            <History size={13} />
                          </button>
                          <button
                            className="action-icon-btn"
                            onClick={() => onEditInsurance(ins)}
                            title="Edit Policy"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="action-icon-btn action-icon-danger"
                            onClick={() => onDeleteInsurance(ins.id, ins.policyNumber)}
                            title="Delete Policy"
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
        type="insurance"
      />
    </div>
  );
}
