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
  History,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  MessageSquare
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
  const [filterPayment, setFilterPayment] = useState("All");
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

  // Financial aggregates
  const totalBilled = permits.reduce((sum, p) => sum + (Number(p.totalAmount) || Number(p.authFeePaid) || 0), 0);
  const totalCollected = permits.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const totalDue = permits.reduce((sum, p) => sum + (Number(p.dueAmount) || 0), 0);
  const permitsWithDue = permits.filter((p) => (Number(p.dueAmount) || 0) > 0).length;

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

    let matchesPayment = true;
    if (filterPayment === "Due") {
      matchesPayment = (Number(perm.dueAmount) || 0) > 0;
    } else if (filterPayment === "Paid") {
      matchesPayment = perm.paymentStatus === "Paid" || ((Number(perm.totalAmount) || 0) > 0 && (Number(perm.dueAmount) || 0) === 0);
    } else if (filterPayment === "Partial") {
      matchesPayment = perm.paymentStatus === "Partial";
    }

    return matchesSearch && matchesStatus && matchesDueDate && matchesPayment;
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
            Track State Goods, National (NP Form 48), and Tourist permits linked by customer phone. Track fees, collections, and dues.
          </p>
        </div>

        <div className="view-header-actions">
          <button className="btn btn-primary btn-sm" onClick={onAddPermit}>
            <Plus size={14} />
            <span>Add Permit</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="metric-grid">
        <div className="metric-card" style={{ padding: "14px 16px" }}>
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Total Permits</span>
            <div className="metric-icon-wrap">
              <FileText size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: "1.4rem" }}>
            {permits.length}
          </div>
          <div className="metric-caption">All registered vehicle permits</div>
        </div>

        <div className="metric-card" style={{ padding: "14px 16px" }}>
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Total Permit Charges</span>
            <div className="metric-icon-wrap">
              <IndianRupee size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: "1.4rem" }}>
            ₹{totalBilled.toLocaleString("en-IN")}
          </div>
          <div className="metric-caption">Aggregate permit authorization fees</div>
        </div>

        <div className="metric-card" style={{ padding: "14px 16px" }}>
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Fees Collected</span>
            <div className="metric-icon-wrap" style={{ color: "var(--color-success, #16a34a)" }}>
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: "1.4rem", color: "var(--color-success, #16a34a)" }}>
            ₹{totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="metric-caption">Fees paid by customers</div>
        </div>

        <div
          className="metric-card"
          style={{
            padding: "14px 16px",
            borderLeft: totalDue > 0 ? "3px solid var(--color-danger, #dc2626)" : "1px solid var(--border-default)"
          }}
        >
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Outstanding Permit Dues</span>
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
            {permitsWithDue} permit{permitsWithDue === 1 ? "" : "s"} with balance due
          </div>
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
            placeholder="Search by vehicle reg, permit no, type, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "150px" }}
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
        >
          <option value="All">All Payments</option>
          <option value="Due">Pending Dues Only ({permitsWithDue})</option>
          <option value="Partial">Partially Paid</option>
          <option value="Paid">Fully Paid</option>
        </select>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "150px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Expiry Status</option>
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
                ? "No vehicle permits registered yet. Click '+ Add Permit' to register a permit record."
                : "No permits match the selected expiry, search, or payment filters."}
            </p>
            {permits.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={onAddPermit}>
                <Plus size={13} />
                <span>Add First Permit</span>
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
                    <th>Permit Details</th>
                    <th>Jurisdiction</th>
                    <th>Expiry Date</th>
                    <th>Total Fee (₹)</th>
                    <th>Paid (₹)</th>
                    <th>Due (₹)</th>
                    <th>Payment Status</th>
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

                    const total = Number(perm.totalAmount) || Number(perm.authFeePaid) || 0;
                    const paid = Number(perm.paidAmount) || 0;
                    const due = Number(perm.dueAmount) !== undefined ? Number(perm.dueAmount) : Math.max(0, total - paid);

                    return (
                      <tr key={perm.id}>
                        <td>
                          <div className="number-plate">
                            <span className="number-plate-ind">IND</span>
                            <span>{perm.vehicleReg}</span>
                          </div>
                        </td>

                        {/* Customer Name & Phone */}
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

                        {/* Total Fee */}
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
                              const rawPhone = (perm.customerPhone || "").replace(/\D/g, "");
                              const fullPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                              const text = `नमस्ते ${perm.customerName || "ग्राहक"},\n\nगुरूकृपा यातायात से सादर प्रणाम। 🙏\nआपके वाहन *${perm.vehicleReg}* के *${perm.permitType || "परमिट"}* की वैधता दिनांक *${perm.expiryDate}* को समाप्त हो रही है। समय पर नवीनीकरण करवाएं।\n\nसंपर्क: गुरूकृपा यातायात कार्यालय`;
                              return fullPhone ? (
                                <a
                                  href={`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-icon-btn"
                                  style={{ color: "#16a34a" }}
                                  title="Send WhatsApp Permit Reminder"
                                >
                                  <MessageSquare size={13} />
                                </a>
                              ) : null;
                            })()}
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

            {/* Mobile-Friendly Permit Cards */}
            <div className="mobile-only-cards" style={{ padding: "10px" }}>
              {filteredPermits.map((perm) => {
                const days = getDaysUntil(perm.expiryDate);
                const isExpired = days < 0;
                const isCritical = days >= 0 && days <= 7;
                const isWarning = days > 7 && days <= 30;
                const historyCount = perm.renewalHistory?.length || 0;

                const total = Number(perm.totalAmount) || Number(perm.authFeePaid) || 0;
                const paid = Number(perm.paidAmount) || 0;
                const due = Number(perm.dueAmount) !== undefined ? Number(perm.dueAmount) : Math.max(0, total - paid);

                const rawPhone = (perm.customerPhone || "").replace(/\D/g, "");
                const fullPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                const waText = `नमस्ते ${perm.customerName || "ग्राहक"},\n\nगुरूकृपा यातायात से सादर प्रणाम। 🙏\nआपके वाहन *${perm.vehicleReg}* के *${perm.permitType || "परमिट"}* की वैधता दिनांक *${perm.expiryDate}* को समाप्त हो रही है। समय पर नवीनीकरण करवाएं।\n\nसंपर्क: गुरूकृपा यातायात कार्यालय`;

                return (
                  <div key={perm.id} className="mobile-entity-card">
                    {/* Header: Number plate and Expiry Badge */}
                    <div className="mobile-card-header">
                      <div className="number-plate">
                        <span className="number-plate-ind">IND</span>
                        <span>{perm.vehicleReg}</span>
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

                    {/* Customer & Permit Info */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          {perm.customerName || "Customer"}
                        </div>
                        {perm.customerPhone && (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            <Phone size={12} />
                            <a href={`tel:${perm.customerPhone}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                              +{perm.customerPhone}
                            </a>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                          {perm.state || "Madhya Pradesh"}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {perm.permitType || "State Goods Permit"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--text-muted)", background: "#ffffff", padding: "4px 0", borderTop: "1px dashed var(--border-default)" }}>
                      <span>Permit: <strong style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{perm.permitNumber}</strong></span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={11} /> Exp: <strong style={{ color: "var(--text-primary)" }}>{perm.expiryDate || "N/A"}</strong>
                      </span>
                    </div>

                    {/* Financial 3-column Grid */}
                    <div className="mobile-card-financial-grid">
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Fee</div>
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
                        onClick={() => onRenewPermit(perm.id)}
                      >
                        <RotateCw size={12} />
                        <span>Renew</span>
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setHistoryItem(perm);
                          setIsHistoryOpen(true);
                        }}
                        title="History"
                      >
                        <History size={13} />
                        {historyCount > 0 && <span style={{ fontSize: "0.68rem", fontWeight: 700 }}>({historyCount})</span>}
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEditPermit(perm)}
                        title="Edit Permit"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: "#dc2626" }}
                        onClick={() => onDeletePermit(perm.id, perm.permitNumber)}
                        title="Delete Permit"
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
          type="permit"
        />
      )}
    </div>
  );
}
