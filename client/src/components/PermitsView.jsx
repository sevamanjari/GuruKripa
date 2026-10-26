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
  Building2,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye
} from "lucide-react";
import HistoryModal from "./Modals/HistoryModal.jsx";
import PdfViewerModal from "./Modals/PdfViewerModal.jsx";
import { downloadDocument } from "../services/api.js";

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
  const [filterRto, setFilterRto] = useState("All");

  // History & PDF Modal States
  const [historyItem, setHistoryItem] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

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
  const expiringCount = permits.filter((p) => {
    const d = getDaysUntil(p.expiryDate);
    return d <= 30 && d >= 0;
  }).length;
  const expiredCount = permits.filter((p) => getDaysUntil(p.expiryDate) < 0).length;

  const rtoOptions = Array.from(
    new Set(permits.map((p) => p.rtoAffiliated || p.issuingRto).filter(Boolean))
  );

  const filteredPermits = permits.filter((pmt) => {
    const q = searchTerm.toLowerCase().trim();
    const rto = (pmt.rtoAffiliated || pmt.issuingRto || "").toLowerCase();
    const matchesSearch =
      !q ||
      (pmt.permitNumber && pmt.permitNumber.toLowerCase().includes(q)) ||
      (pmt.vehicleReg && pmt.vehicleReg.toLowerCase().includes(q)) ||
      (pmt.customerName && pmt.customerName.toLowerCase().includes(q)) ||
      (pmt.customerPhone && pmt.customerPhone.toLowerCase().includes(q)) ||
      rto.includes(q);

    const days = getDaysUntil(pmt.expiryDate);
    let computed = "Active";
    if (days < 0) computed = "Expired";
    else if (days <= 30) computed = "Expiring Soon";

    const matchesStatus =
      filterStatus === "All" ||
      computed === filterStatus ||
      pmt.status === filterStatus;

    let matchesPayment = true;
    if (filterPayment === "Due") {
      matchesPayment = (Number(pmt.dueAmount) || 0) > 0;
    } else if (filterPayment !== "All") {
      matchesPayment = pmt.paymentStatus === filterPayment;
    }

    const matchesRto =
      filterRto === "All" ||
      rto === filterRto.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment && matchesRto;
  });

  return (
    <div className="view-container">
      {/* Modern View Header Bar */}
      <div className="view-header" style={{ borderLeft: "4px solid #059669" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #047857 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)"
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className="view-title">Transport Permits</h1>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(5, 150, 105, 0.1)",
                  color: "#047857",
                  border: "1px solid rgba(5, 150, 105, 0.2)"
                }}
              >
                {permits.length} Issued Permits
              </span>
            </div>
            <p className="view-subtitle">
              Manage State Goods Permits, National Permits, RTO Affiliation & PDF documents
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={onAddPermit}
          style={{
            background: "linear-gradient(135deg, #047857 0%, #059669 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
            padding: "10px 18px",
            fontSize: "0.86rem"
          }}
        >
          <Plus size={16} />
          <span>New Transport Permit</span>
        </button>
      </div>

      {/* Modern KPI Stats Cards */}
      <div className="stats-grid">
        {/* Card 1: Total Permits */}
        <div className="stat-card" style={{ borderLeft: "4px solid #059669" }}>
          <div className="stat-icon-wrap" style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669" }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Permits Issued</span>
            <span className="stat-value">{permits.length}</span>
            <span className="stat-subtext">Active transport fleet</span>
          </div>
        </div>

        {/* Card 2: Collected Fees */}
        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="stat-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Collected Govt Fee</span>
            <span className="stat-value" style={{ color: "#059669" }}>
              ₹{totalCollected.toLocaleString("en-IN")}
            </span>
            <span className="stat-subtext">Total Billed: ₹{totalBilled.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Card 3: Due Amount */}
        <div className="stat-card" style={{ borderLeft: totalDue > 0 ? "4px solid #f43f5e" : "4px solid #cbd5e1" }}>
          <div className="stat-icon-wrap" style={{ background: totalDue > 0 ? "rgba(244, 63, 94, 0.12)" : "rgba(100, 116, 139, 0.12)", color: totalDue > 0 ? "#f43f5e" : "#64748b" }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Balance Due</span>
            <span className="stat-value" style={{ color: totalDue > 0 ? "#e11d48" : "inherit" }}>
              ₹{totalDue.toLocaleString("en-IN")}
            </span>
            <span className="stat-subtext">
              {permits.filter((p) => (Number(p.dueAmount) || 0) > 0).length} vehicles with pending fee
            </span>
          </div>
        </div>

        {/* Card 4: Expiries */}
        <div className="stat-card" style={{ borderLeft: expiredCount > 0 ? "4px solid #f43f5e" : expiringCount > 0 ? "4px solid #f59e0b" : "4px solid #10b981" }}>
          <div className="stat-icon-wrap" style={{ background: expiredCount > 0 ? "rgba(244, 63, 94, 0.12)" : "rgba(245, 158, 11, 0.12)", color: expiredCount > 0 ? "#f43f5e" : "#d97706" }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Expiring / Expired</span>
            <span className="stat-value" style={{ color: expiredCount > 0 ? "#e11d48" : expiringCount > 0 ? "#d97706" : "#059669" }}>
              {expiringCount + expiredCount}
            </span>
            <span className="stat-subtext">
              {expiredCount > 0 ? `${expiredCount} expired • ` : ""}{expiringCount} within 30 days
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
          background: "#ffffff",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid var(--border-default)"
        }}
      >
        <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search vehicle number, customer, phone, permit number, or RTO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              borderRadius: "8px",
              border: "1px solid var(--border-default)",
              fontSize: "0.88rem"
            }}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          {["All", "Active", "Expiring Soon", "Expired"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: filterStatus === st ? "#059669" : "var(--bg-subtle)",
                color: filterStatus === st ? "#ffffff" : "var(--text-secondary)"
              }}
            >
              {st}
            </button>
          ))}
          <button
            onClick={() => setFilterPayment(filterPayment === "Due" ? "All" : "Due")}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: filterPayment === "Due" ? "#dc2626" : "var(--bg-subtle)",
              color: filterPayment === "Due" ? "#ffffff" : "var(--text-secondary)"
            }}
          >
            Has Due Balance
          </button>
        </div>

        {rtoOptions.length > 0 && (
          <select
            value={filterRto}
            onChange={(e) => setFilterRto(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-default)",
              fontSize: "0.82rem",
              background: "#ffffff"
            }}
          >
            <option value="All">All RTOs</option>
            {rtoOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Table */}
      <div className="table-responsive" style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
        {filteredPermits.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <FileText size={40} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
            <h4 style={{ margin: "0 0 6px", fontSize: "1rem", color: "var(--text-primary)" }}>
              No permits found
            </h4>
            <p style={{ margin: "0 0 16px", fontSize: "0.84rem", color: "var(--text-muted)" }}>
              {searchTerm ? "Try adjusting your search criteria" : "Click 'New Transport Permit' above to create your first permit"}
            </p>
            <button className="btn btn-primary" onClick={onAddPermit} style={{ background: "#059669" }}>
              <Plus size={16} />
              <span>Add First Permit</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle & Permit No</th>
                <th>Customer Name & Mobile</th>
                <th>RTO Affiliated</th>
                <th>Expiry Date</th>
                <th>Permit / PDF</th>
                <th>Fee & Payment</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermits.map((pmt) => {
                const days = getDaysUntil(pmt.expiryDate);
                const total = Number(pmt.totalAmount ?? pmt.authFeePaid) || 0;
                const paid = Number(pmt.paidAmount) || 0;
                const due = Math.max(0, total - paid);

                let statusBadge = { label: "Active", bg: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
                if (days < 0) {
                  statusBadge = { label: `Expired (${Math.abs(days)}d ago)`, bg: "rgba(220, 38, 38, 0.1)", color: "#dc2626" };
                } else if (days <= 30) {
                  statusBadge = { label: `${days}d left`, bg: "rgba(217, 119, 6, 0.1)", color: "#d97706" };
                }

                return (
                  <tr key={pmt.id}>
                    {/* Vehicle & Permit No */}
                    <td>
                      <span className="number-plate">
                        <span className="number-plate-ind">IND</span>
                        <span>{pmt.vehicleReg}</span>
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", fontFamily: "monospace" }}>
                        {pmt.permitNumber || "PRM-PENDING"}
                      </div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {pmt.customerName || "Customer"}
                      </div>
                      {pmt.customerPhone && (
                        <a
                          href={`https://wa.me/91${pmt.customerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.76rem",
                            color: "#16a34a",
                            textDecoration: "none",
                            marginTop: "2px"
                          }}
                        >
                          <Phone size={12} />
                          <span>{pmt.customerPhone}</span>
                        </a>
                      )}
                    </td>

                    {/* RTO Affiliated */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building2 size={14} color="#64748b" />
                        <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                          {pmt.rtoAffiliated || pmt.issuingRto || "RTO Indore (MP-09)"}
                        </span>
                      </div>
                    </td>

                    {/* Expiry Date */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {pmt.expiryDate}
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "3px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "12px",
                          background: statusBadge.bg,
                          color: statusBadge.color
                        }}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* PDF Document */}
                    <td>
                      {pmt.documentUrl ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setSelectedPdf({ url: pmt.documentUrl, title: `Permit - ${pmt.vehicleReg}` })}
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", fontSize: "0.75rem" }}
                          >
                            <Eye size={13} color="#059669" />
                            <span>View PDF</span>
                          </button>
                          <button
                            onClick={() => downloadDocument(pmt.documentUrl, `Permit_${pmt.vehicleReg || "Permit"}.pdf`)}
                            title="Download Permit"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", display: "inline-flex", alignItems: "center" }}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          No PDF uploaded
                        </span>
                      )}
                    </td>

                    {/* Payment Info */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        ₹{total.toLocaleString("en-IN")}
                      </div>
                      {due > 0 ? (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#dc2626",
                            background: "rgba(220, 38, 38, 0.08)",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            display: "inline-block",
                            marginTop: "2px"
                          }}
                        >
                          Due: ₹{due.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#16a34a",
                            background: "rgba(22, 163, 74, 0.08)",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            display: "inline-block",
                            marginTop: "2px"
                          }}
                        >
                          Paid
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {Array.isArray(pmt.renewalHistory) && pmt.renewalHistory.length > 0 && (
                          <button
                            onClick={() => {
                              setHistoryItem(pmt);
                              setIsHistoryOpen(true);
                            }}
                            title="View Renewal History"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "5px 8px" }}
                          >
                            <History size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onRenewPermit(pmt.id)}
                          title="Renew Permit"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 8px", color: "#059669", fontWeight: 600 }}
                        >
                          <RotateCw size={13} />
                          <span style={{ fontSize: "0.72rem" }}>Renew</span>
                        </button>
                        <button
                          onClick={() => onEditPermit(pmt)}
                          title="Edit Permit"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 8px" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeletePermit(pmt.id, pmt.permitNumber || pmt.vehicleReg)}
                          title="Delete Permit"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 8px", color: "#ef4444" }}
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
        )}
      </div>

      {/* History Modal */}
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

      {/* PDF Document Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={!!selectedPdf}
          onClose={() => setSelectedPdf(null)}
          documentUrl={selectedPdf.url}
          title={selectedPdf.title}
        />
      )}
    </div>
  );
}
