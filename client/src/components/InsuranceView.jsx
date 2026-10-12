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
  Building2,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X
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
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterDueDate, setFilterDueDate] = useState("All");
  const [filterUnderwriter, setFilterUnderwriter] = useState("All");
  const [showOverview, setShowOverview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  // Financial aggregates
  const totalBilled = insurances.reduce((sum, i) => sum + (Number(i.totalAmount) || Number(i.premiumAmount) || 0), 0);
  const totalCollected = insurances.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalDue = insurances.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);
  const policiesWithDue = insurances.filter((i) => (Number(i.dueAmount) || 0) > 0).length;

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

    let matchesPayment = true;
    if (filterPayment === "Due") {
      matchesPayment = (Number(ins.dueAmount) || 0) > 0;
    } else if (filterPayment === "Paid") {
      matchesPayment = ins.paymentStatus === "Paid" || ((Number(ins.totalAmount) || 0) > 0 && (Number(ins.dueAmount) || 0) === 0);
    } else if (filterPayment === "Partial") {
      matchesPayment = ins.paymentStatus === "Partial";
    }

    return matchesSearch && matchesStatus && matchesDueDate && matchesUnderwriter && matchesPayment;
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

  const activeFilters = [];
  if (filterDueDate !== "All") activeFilters.push({ key: "due", label: `Due: ${filterDueDate === "expired" ? "Expired" : filterDueDate + "d"}`, reset: () => setFilterDueDate("All") });
  if (filterPayment !== "All") activeFilters.push({ key: "payment", label: `Payment: ${filterPayment}`, reset: () => setFilterPayment("All") });
  if (filterStatus !== "All") activeFilters.push({ key: "status", label: `Status: ${filterStatus}`, reset: () => setFilterStatus("All") });
  if (filterUnderwriter !== "All") activeFilters.push({ key: "underwriter", label: `Insurer: ${filterUnderwriter}`, reset: () => setFilterUnderwriter("All") });
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div>
      {/* Compact Workspace Header */}
      <div className="view-header compact-view-header">
        <div className="view-header-main">
          <h1 className="view-title">Vehicle Insurances</h1>
          <p className="view-subtitle">
            Vehicle insurance policies, renewal cycles, underwriters, and premium collections.
          </p>
        </div>

        <div className="view-header-actions">
          {onOpenManageUnderwriters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenManageUnderwriters}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Building2 size={13} />
              <span>Underwriters ({underwriters.length})</span>
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={onAddInsurance}>
            <Plus size={14} />
            <span>Add Insurance</span>
          </button>
        </div>
      </div>

      {/* On-Demand Collapsible Overview Stats */}
      <div className="collapsible-stats-section">
        <div
          className={`compact-stats-bar ${showOverview ? "active" : ""}`}
          onClick={() => setShowOverview(!showOverview)}
          role="button"
          tabIndex={0}
        >
          <div className="compact-stats-left">
            <div className="compact-stat-pill">
              <Shield size={13} style={{ color: "var(--brand-primary)" }} />
              <span>Policies:</span>
              <strong>{insurances.length}</strong>
            </div>

            <div className="compact-stat-pill">
              <IndianRupee size={13} style={{ color: "var(--text-muted)" }} />
              <span>Premiums:</span>
              <strong>₹{totalBilled.toLocaleString("en-IN")}</strong>
            </div>

            <div className="compact-stat-pill success">
              <CheckCircle2 size={13} />
              <span>Paid:</span>
              <strong>₹{totalCollected.toLocaleString("en-IN")}</strong>
            </div>

            <div className={`compact-stat-pill ${totalDue > 0 ? "danger" : ""}`}>
              <AlertCircle size={13} />
              <span>Due:</span>
              <strong>₹{totalDue.toLocaleString("en-IN")}</strong>
            </div>

            {count30Days > 0 && (
              <div className="compact-stat-pill" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #ffedd5" }}>
                <Clock size={12} />
                <span>Expiring (30d):</span>
                <strong>{count30Days}</strong>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-toggle-stats"
            onClick={(e) => {
              e.stopPropagation();
              setShowOverview(!showOverview);
            }}
            title={showOverview ? "Hide detailed cards" : "Show detailed cards"}
          >
            <span>{showOverview ? "Hide Stats" : "Show Stats"}</span>
            {showOverview ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Detailed 4 Metric Cards */}
        {showOverview && (
          <div className="metric-grid animated-dropdown">
            <div className="metric-card" style={{ padding: "14px 16px" }}>
              <div className="metric-top" style={{ marginBottom: "6px" }}>
                <span className="metric-label">Total Policies</span>
                <div className="metric-icon-wrap">
                  <Shield size={14} />
                </div>
              </div>
              <div className="metric-value" style={{ fontSize: "1.4rem" }}>
                {insurances.length}
              </div>
              <div className="metric-caption">Active & historical policies</div>
            </div>

            <div className="metric-card" style={{ padding: "14px 16px" }}>
              <div className="metric-top" style={{ marginBottom: "6px" }}>
                <span className="metric-label">Total Premiums</span>
                <div className="metric-icon-wrap">
                  <IndianRupee size={14} />
                </div>
              </div>
              <div className="metric-value" style={{ fontSize: "1.4rem" }}>
                ₹{totalBilled.toLocaleString("en-IN")}
              </div>
              <div className="metric-caption">Aggregate premium charges</div>
            </div>

            <div className="metric-card" style={{ padding: "14px 16px" }}>
              <div className="metric-top" style={{ marginBottom: "6px" }}>
                <span className="metric-label">Premiums Collected</span>
                <div className="metric-icon-wrap" style={{ color: "var(--color-success, #16a34a)" }}>
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <div className="metric-value" style={{ fontSize: "1.4rem", color: "var(--color-success, #16a34a)" }}>
                ₹{totalCollected.toLocaleString("en-IN")}
              </div>
              <div className="metric-caption">Payments received to date</div>
            </div>

            <div
              className="metric-card"
              style={{
                padding: "14px 16px",
                borderLeft: totalDue > 0 ? "3px solid var(--color-danger, #dc2626)" : "1px solid var(--border-default)"
              }}
            >
              <div className="metric-top" style={{ marginBottom: "6px" }}>
                <span className="metric-label">Outstanding Premium Dues</span>
                <div className="metric-icon-wrap" style={{ color: totalDue > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)" }}>
                  <AlertCircle size={14} />
                </div>
              </div>
              <div
                className="metric-value"
                style={{
                  fontSize: "1.4rem",
                  color: totalDue > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)"
                }}
              >
                ₹{totalDue.toLocaleString("en-IN")}
              </div>
              <div className="metric-caption">
                {policiesWithDue} polic{policiesWithDue === 1 ? "y" : "ies"} with unpaid balance
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clean Compact Search & Dropdown Filter Control */}
      <div className="filter-controls-container">
        <div className="search-filter-row">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search by vehicle reg, policy no, insurer, customer, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search query"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`filter-toggle-btn ${showFilters || hasActiveFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filter policies"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="filter-active-badge">
                {activeFilters.length}
              </span>
            )}
            {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && !showFilters && (
          <div className="active-filters-chips">
            <span className="active-filters-label">Active:</span>
            {activeFilters.map((af) => (
              <span key={af.key} className="filter-tag">
                {af.label}
                <button type="button" onClick={af.reset} title="Remove filter">
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              type="button"
              className="clear-all-filters-btn"
              onClick={() => {
                setFilterDueDate("All");
                setFilterPayment("All");
                setFilterStatus("All");
                setFilterUnderwriter("All");
              }}
            >
              Reset
            </button>
          </div>
        )}

        {/* Dropdown Filters Tray */}
        {showFilters && (
          <div className="filters-dropdown-tray animated-dropdown">
            {/* Renewal Due Chips */}
            <div style={{ marginBottom: "12px" }}>
              <div className="chips-bar" style={{ margin: 0, padding: "8px 10px" }}>
                <span className="chips-label">
                  <Clock size={13} />
                  Renewal Due:
                </span>

                <button
                  type="button"
                  className={`chip-btn ${filterDueDate === "All" ? "active" : ""}`}
                  onClick={() => setFilterDueDate("All")}
                >
                  All
                  <span className="chip-count">{insurances.length}</span>
                </button>

                <button
                  type="button"
                  className={`chip-btn ${filterDueDate === "1" ? "active" : ""}`}
                  onClick={() => setFilterDueDate("1")}
                >
                  Within 1 Day
                  <span className="chip-count">{count1Day}</span>
                </button>

                <button
                  type="button"
                  className={`chip-btn ${filterDueDate === "7" ? "active" : ""}`}
                  onClick={() => setFilterDueDate("7")}
                >
                  Within 7 Days
                  <span className="chip-count">{count7Days}</span>
                </button>

                <button
                  type="button"
                  className={`chip-btn ${filterDueDate === "15" ? "active" : ""}`}
                  onClick={() => setFilterDueDate("15")}
                >
                  Within 15 Days
                  <span className="chip-count">{count15Days}</span>
                </button>

                <button
                  type="button"
                  className={`chip-btn ${filterDueDate === "30" ? "active" : ""}`}
                  onClick={() => setFilterDueDate("30")}
                >
                  Within 30 Days
                  <span className="chip-count">{count30Days}</span>
                </button>

                <button
                  type="button"
                  className={`chip-btn ${filterDueDate === "expired" ? "active" : ""}`}
                  onClick={() => setFilterDueDate("expired")}
                >
                  Overdue / Expired
                  <span className="chip-count">{countExpired}</span>
                </button>
              </div>
            </div>

            <div className="filters-tray-grid">
              <div className="filter-item">
                <label className="filter-item-label">Payment Status</label>
                <select
                  className="form-select"
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                >
                  <option value="All">All Payments</option>
                  <option value="Due">Pending Dues Only ({policiesWithDue})</option>
                  <option value="Partial">Partially Paid</option>
                  <option value="Paid">Fully Paid</option>
                </select>
              </div>

              <div className="filter-item">
                <label className="filter-item-label">Expiry Status</label>
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Expiry Status</option>
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon (&lt; 30d)</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {underwriters.length > 0 && (
                <div className="filter-item">
                  <label className="filter-item-label">Insurance Underwriter</label>
                  <select
                    className="form-select"
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
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <div className="filters-tray-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setFilterDueDate("All");
                    setFilterPayment("All");
                    setFilterStatus("All");
                    setFilterUnderwriter("All");
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <X size={12} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
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
                : "No policies match the selected expiry, search, or payment filters."}
            </p>
            {insurances.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={onAddInsurance}>
                <Plus size={13} />
                <span>Add First Policy</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-only-table table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle Number</th>
                    <th>Customer (Primary Phone)</th>
                    <th>Policy Details</th>
                    <th>Insurance Company</th>
                    <th>Expiry Date</th>
                    <th>Premium (₹)</th>
                    <th>Paid (₹)</th>
                    <th>Due (₹)</th>
                    <th>Payment Status</th>
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

                    const total = Number(ins.totalAmount) || Number(ins.premiumAmount) || 0;
                    const paid = Number(ins.paidAmount) || 0;
                    const due = Number(ins.dueAmount) !== undefined ? Number(ins.dueAmount) : Math.max(0, total - paid);

                    return (
                      <tr key={ins.id}>
                        <td>
                          <div className="number-plate">
                            <span className="number-plate-ind">IND</span>
                            <span>{ins.vehicleReg}</span>
                          </div>
                        </td>

                        {/* Customer Name & Phone */}
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
                            {ins.coverageType || ins.policyType || "Comprehensive"}
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
                          <div style={{ marginTop: "2px" }}>
                            {isExpired ? (
                              <span className="status-badge status-critical" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                Expired ({Math.abs(days)}d ago)
                              </span>
                            ) : isCritical ? (
                              <span className="status-badge status-critical" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                Due in {days}d
                              </span>
                            ) : isWarning ? (
                              <span className="status-badge status-warning" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                Due in {days}d
                              </span>
                            ) : (
                              <span className="status-badge status-active" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                Valid ({days}d left)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Premium */}
                        <td>
                          <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--text-primary)" }}>
                            {total > 0 ? `₹${total.toLocaleString("en-IN")}` : "-"}
                          </span>
                        </td>

                        {/* Paid Amount */}
                        <td>
                          <span style={{ fontWeight: 600, fontSize: "0.84rem", color: paid > 0 ? "var(--color-success, #16a34a)" : "var(--text-muted)" }}>
                            {paid > 0 ? `₹${paid.toLocaleString("en-IN")}` : "₹0"}
                          </span>
                        </td>

                        {/* Due Balance */}
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: due > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)"
                            }}
                          >
                            {due > 0 ? `₹${due.toLocaleString("en-IN")}` : "₹0 (Cleared)"}
                          </span>
                        </td>

                        {/* Payment Status Badge */}
                        <td>
                          {due === 0 && total > 0 ? (
                            <span className="status-badge status-active">
                              <CheckCircle2 size={11} style={{ marginRight: "3px" }} />
                              Paid
                            </span>
                          ) : paid > 0 && due > 0 ? (
                            <span className="status-badge status-warning">
                              <Clock size={11} style={{ marginRight: "3px" }} />
                              Partial
                            </span>
                          ) : due > 0 ? (
                            <span
                              className="status-badge"
                              style={{
                                background: "rgba(220, 38, 38, 0.1)",
                                color: "#dc2626",
                                border: "1px solid rgba(220, 38, 38, 0.2)"
                              }}
                            >
                              <AlertCircle size={11} style={{ marginRight: "3px" }} />
                              Due
                            </span>
                          ) : (
                            <span className="status-badge status-neutral">No Charges</span>
                          )}
                        </td>

                        <td className="action-cell">
                          <div className="action-group">
                            {(() => {
                              const rawPhone = (ins.customerPhone || "").replace(/\D/g, "");
                              const fullPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                              const text = `नमस्ते ${ins.customerName || "ग्राहक"},\n\nगुरूकृपा यातायात से सादर प्रणाम। 🙏\nआपके वाहन *${ins.vehicleReg}* की बीमा पॉलिसी (*${ins.policyNumber}*) की वैधता *${ins.expiryDate}* को समाप्त हो रही है। समय पर नवीनीकरण करवाएं।\n\nसंपर्क: गुरूकृपा यातायात सेवा केन्द्र`;
                              return fullPhone ? (
                                <a
                                  href={`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-icon-btn"
                                  style={{ color: "#16a34a" }}
                                  title="Send WhatsApp Expiry Reminder"
                                >
                                  <MessageSquare size={13} />
                                </a>
                              ) : null;
                            })()}
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

            {/* Mobile-Friendly Insurance Cards */}
            <div className="mobile-only-cards" style={{ padding: "10px" }}>
              {filteredInsurances.map((ins) => {
                const days = getDaysUntil(ins.expiryDate);
                const isExpired = days < 0;
                const isCritical = days >= 0 && days <= 7;
                const isWarning = days > 7 && days <= 30;
                const historyCount = ins.renewalHistory?.length || 0;

                const total = Number(ins.totalAmount) || Number(ins.premiumAmount) || 0;
                const paid = Number(ins.paidAmount) || 0;
                const due = Number(ins.dueAmount) !== undefined ? Number(ins.dueAmount) : Math.max(0, total - paid);

                const rawPhone = (ins.customerPhone || "").replace(/\D/g, "");
                const fullPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                const waText = `नमस्ते ${ins.customerName || "ग्राहक"},\n\nगुरूकृपा यातायात से सादर प्रणाम। 🙏\nआपके वाहन *${ins.vehicleReg}* की बीमा पॉलिसी (*${ins.policyNumber}*) की वैधता *${ins.expiryDate}* को समाप्त हो रही है। समय पर नवीनीकरण करवाएं।\n\nसंपर्क: गुरूकृपा यातायात सेवा केन्द्र`;

                return (
                  <div key={ins.id} className="mobile-entity-card">
                    {/* Header: Number plate and Expiry Badge */}
                    <div className="mobile-card-header">
                      <div className="number-plate">
                        <span className="number-plate-ind">IND</span>
                        <span>{ins.vehicleReg}</span>
                      </div>

                      <div>
                        {isExpired ? (
                          <span className="status-badge status-critical" style={{ fontSize: "0.72rem" }}>
                            Expired ({Math.abs(days)}d ago)
                          </span>
                        ) : isCritical ? (
                          <span className="status-badge status-critical" style={{ fontSize: "0.72rem" }}>
                            Due in {days}d
                          </span>
                        ) : isWarning ? (
                          <span className="status-badge status-warning" style={{ fontSize: "0.72rem" }}>
                            Due in {days}d
                          </span>
                        ) : (
                          <span className="status-badge status-active" style={{ fontSize: "0.72rem" }}>
                            Valid ({days}d left)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer & Company info */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          {ins.customerName || "Customer"}
                        </div>
                        {ins.customerPhone && (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            <Phone size={12} />
                            <a href={`tel:${ins.customerPhone}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                              +{ins.customerPhone}
                            </a>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                          {ins.insuranceCompany}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {ins.coverageType || ins.policyType || "Comprehensive"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--text-muted)", background: "#ffffff", padding: "4px 0", borderTop: "1px dashed var(--border-default)" }}>
                      <span>Policy: <strong style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{ins.policyNumber}</strong></span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={11} /> Exp: <strong style={{ color: "var(--text-primary)" }}>{ins.expiryDate || "N/A"}</strong>
                      </span>
                    </div>

                    {/* Financial 3-column Grid */}
                    <div className="mobile-card-financial-grid">
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Premium</div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", marginTop: "2px" }}>
                          {total > 0 ? `₹${total.toLocaleString("en-IN")}` : "-"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Paid</div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: paid > 0 ? "var(--color-success, #16a34a)" : "var(--text-muted)", marginTop: "2px" }}>
                          {paid > 0 ? `₹${paid.toLocaleString("en-IN")}` : "₹0"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Due</div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color: due > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)",
                            marginTop: "2px"
                          }}
                        >
                          {due > 0 ? `₹${due.toLocaleString("en-IN")}` : "₹0"}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Bar */}
                    <div className="mobile-card-actions">
                      {fullPhone && (
                        <a
                          href={`https://wa.me/${fullPhone}?text=${encodeURIComponent(waText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{
                            background: "#25D366",
                            color: "#ffffff",
                            borderColor: "#22bf5b",
                            flex: 1,
                            fontWeight: 600
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => onRenewInsurance(ins.id)}
                      >
                        <RotateCw size={12} />
                        <span>Renew</span>
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setHistoryItem(ins);
                          setIsHistoryOpen(true);
                        }}
                        title="History"
                      >
                        <History size={13} />
                        {historyCount > 0 && <span style={{ fontSize: "0.68rem", fontWeight: 700 }}>({historyCount})</span>}
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEditInsurance(ins)}
                        title="Edit Policy"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: "#dc2626" }}
                        onClick={() => onDeleteInsurance(ins.id, ins.policyNumber)}
                        title="Delete Policy"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Renewal History Modal */}
      {isHistoryOpen && (
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => {
            setIsHistoryOpen(false);
            setHistoryItem(null);
          }}
          item={historyItem}
          type="insurance"
        />
      )}
    </div>
  );
}
