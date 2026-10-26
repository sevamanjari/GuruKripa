import React, { useState } from "react";
import {
  Activity,
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
  FileText,
  Download,
  Eye,
  SlidersHorizontal,
  X
} from "lucide-react";
import HistoryModal from "./Modals/HistoryModal.jsx";
import PdfViewerModal from "./Modals/PdfViewerModal.jsx";
import { downloadDocument } from "../services/api.js";

export default function FitnessView({
  fitnessList = [],
  onAddFitness,
  onEditFitness,
  onDeleteFitness,
  onRenewFitness
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All | Active | Expiring Soon | Expired
  const [filterPayment, setFilterPayment] = useState("All"); // All | Paid | Partial | Due
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
  const totalBilled = fitnessList.reduce((sum, f) => sum + (Number(f.totalAmount) || 0), 0);
  const totalCollected = fitnessList.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
  const totalDue = fitnessList.reduce((sum, f) => sum + (Number(f.dueAmount) || 0), 0);
  const expiringCount = fitnessList.filter((f) => {
    const d = getDaysUntil(f.expiryDate);
    return d <= 30 && d >= 0;
  }).length;
  const expiredCount = fitnessList.filter((f) => getDaysUntil(f.expiryDate) < 0).length;

  const rtoOptions = Array.from(new Set(fitnessList.map((f) => f.rtoAffiliated).filter(Boolean)));

  const filteredList = fitnessList.filter((fit) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (fit.vehicleReg && fit.vehicleReg.toLowerCase().includes(q)) ||
      (fit.customerName && fit.customerName.toLowerCase().includes(q)) ||
      (fit.customerPhone && fit.customerPhone.toLowerCase().includes(q)) ||
      (fit.fitnessNumber && fit.fitnessNumber.toLowerCase().includes(q)) ||
      (fit.rtoAffiliated && fit.rtoAffiliated.toLowerCase().includes(q));

    const days = getDaysUntil(fit.expiryDate);
    let computed = "Active";
    if (days < 0) computed = "Expired";
    else if (days <= 30) computed = "Expiring Soon";

    const matchesStatus =
      filterStatus === "All" ||
      computed === filterStatus ||
      fit.status === filterStatus;

    let matchesPayment = true;
    if (filterPayment === "Due") {
      matchesPayment = (Number(fit.dueAmount) || 0) > 0;
    } else if (filterPayment !== "All") {
      matchesPayment = fit.paymentStatus === filterPayment;
    }

    const matchesRto =
      filterRto === "All" ||
      (fit.rtoAffiliated && fit.rtoAffiliated.toLowerCase() === filterRto.toLowerCase());

    return matchesSearch && matchesStatus && matchesPayment && matchesRto;
  });

  return (
    <div className="view-container">
      {/* Header Bar */}
      <div className="view-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 className="view-title">Vehicle Fitness Certificates</h1>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
                background: "rgba(217, 119, 6, 0.12)",
                color: "#d97706"
              }}
            >
              {fitnessList.length} Records
            </span>
          </div>
          <p className="view-subtitle">
            Track roadworthiness certificates, RTO affiliation, and customer dues
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={onAddFitness}
          style={{ background: "#d97706", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={16} />
          <span>New Fitness Entry</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706" }}>
            <Activity size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Fitness Entries</span>
            <span className="stat-value">{fitnessList.length}</span>
            <span className="stat-subtext">Active Fleet</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(22, 163, 74, 0.12)", color: "#16a34a" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Collected Fees</span>
            <span className="stat-value">₹{totalCollected.toLocaleString("en-IN")}</span>
            <span className="stat-subtext">Total Billed: ₹{totalBilled.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(220, 38, 38, 0.12)", color: "#dc2626" }}>
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Due Amount</span>
            <span className="stat-value" style={{ color: totalDue > 0 ? "#dc2626" : "inherit" }}>
              ₹{totalDue.toLocaleString("en-IN")}
            </span>
            <span className="stat-subtext">
              {fitnessList.filter((f) => (Number(f.dueAmount) || 0) > 0).length} vehicles with pending fee
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: "rgba(234, 88, 12, 0.12)", color: "#ea580c" }}>
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Expiring / Expired</span>
            <span className="stat-value" style={{ color: expiredCount > 0 ? "#dc2626" : "#ea580c" }}>
              {expiringCount + expiredCount}
            </span>
            <span className="stat-subtext">
              {expiredCount > 0 ? `${expiredCount} expired, ` : ""}{expiringCount} within 30 days
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
            placeholder="Search vehicle number, customer, phone, or RTO..."
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
                background: filterStatus === st ? "#d97706" : "var(--bg-subtle)",
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

      {/* Main Table / List */}
      <div className="table-responsive" style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Activity size={40} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
            <h4 style={{ margin: "0 0 6px", fontSize: "1rem", color: "var(--text-primary)" }}>
              No fitness certificate records found
            </h4>
            <p style={{ margin: "0 0 16px", fontSize: "0.84rem", color: "var(--text-muted)" }}>
              {searchTerm ? "Try adjusting your search criteria" : "Click 'New Fitness Entry' above to add your first vehicle"}
            </p>
            <button className="btn btn-primary" onClick={onAddFitness} style={{ background: "#d97706" }}>
              <Plus size={16} />
              <span>Add First Fitness Entry</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Customer Name & Mobile</th>
                <th>RTO Affiliated</th>
                <th>Expiry Date</th>
                <th>Policy / PDF</th>
                <th>Fee & Payment</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((fit) => {
                const days = getDaysUntil(fit.expiryDate);
                const total = Number(fit.totalAmount) || 0;
                const paid = Number(fit.paidAmount) || 0;
                const due = Math.max(0, total - paid);

                let statusBadge = { label: "Active", bg: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
                if (days < 0) {
                  statusBadge = { label: `Expired (${Math.abs(days)}d ago)`, bg: "rgba(220, 38, 38, 0.1)", color: "#dc2626" };
                } else if (days <= 30) {
                  statusBadge = { label: `${days}d left`, bg: "rgba(217, 119, 6, 0.1)", color: "#d97706" };
                }

                return (
                  <tr key={fit.id}>
                    {/* Vehicle Reg */}
                    <td>
                      <span className="number-plate">
                        <span className="number-plate-ind">IND</span>
                        <span>{fit.vehicleReg}</span>
                      </span>
                      {fit.fitnessNumber && (
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          No: {fit.fitnessNumber}
                        </div>
                      )}
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {fit.customerName || "Customer"}
                      </div>
                      {fit.customerPhone && (
                        <a
                          href={`https://wa.me/91${fit.customerPhone.replace(/\D/g, "")}`}
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
                          <span>{fit.customerPhone}</span>
                        </a>
                      )}
                    </td>

                    {/* RTO Affiliated */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building2 size={14} color="#64748b" />
                        <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                          {fit.rtoAffiliated || "RTO Indore (MP-09)"}
                        </span>
                      </div>
                    </td>

                    {/* Expiry Date */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {fit.expiryDate}
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
                      {fit.documentUrl ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setSelectedPdf({ url: fit.documentUrl, title: `Fitness - ${fit.vehicleReg}` })}
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", fontSize: "0.75rem" }}
                          >
                            <Eye size={13} color="#d97706" />
                            <span>View PDF</span>
                          </button>
                          <button
                            onClick={() => downloadDocument(fit.documentUrl, `Fitness_${fit.vehicleReg || "Certificate"}.pdf`)}
                            title="Download Document"
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
                        {Array.isArray(fit.renewalHistory) && fit.renewalHistory.length > 0 && (
                          <button
                            onClick={() => {
                              setHistoryItem(fit);
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
                          onClick={() => onRenewFitness(fit.id)}
                          title="Renew Certificate"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 8px", color: "#d97706", fontWeight: 600 }}
                        >
                          <RotateCw size={13} />
                          <span style={{ fontSize: "0.72rem" }}>Renew</span>
                        </button>
                        <button
                          onClick={() => onEditFitness(fit)}
                          title="Edit Entry"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 8px" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteFitness(fit.id, fit.vehicleReg)}
                          title="Delete Entry"
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
          type="fitness"
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
