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
  X,
  Truck
} from "lucide-react";
import HistoryModal from "./Modals/HistoryModal.jsx";
import PdfViewerModal from "./Modals/PdfViewerModal.jsx";
import { downloadDocument } from "../services/api.js";
import { formatToIndianDate } from "../utils/dateFormatter.js";

export default function FitnessView({
  fitnessList = [],
  onAddFitness,
  onEditFitness,
  onDeleteFitness,
  onRenewFitness
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All | Active | Expiring Soon | Expired
  const [filterPayment, setFilterPayment] = useState("All"); // All | Due
  const [filterRto, setFilterRto] = useState("All");
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Financial aggregates
  const totalBilled = fitnessList.reduce((sum, f) => sum + (Number(f.totalAmount) || 0), 0);
  const totalCollected = fitnessList.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
  const totalDue = fitnessList.reduce((sum, f) => sum + (Number(f.dueAmount) || 0), 0);

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return 999;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const expiringCount = fitnessList.filter((f) => {
    const days = getDaysUntil(f.expiryDate);
    return days >= 0 && days <= 30;
  }).length;

  const expiredCount = fitnessList.filter((f) => getDaysUntil(f.expiryDate) < 0).length;

  // Filter RTO options
  const rtoOptions = Array.from(new Set(fitnessList.map((f) => f.rtoAffiliated).filter(Boolean)));

  // Filtered List
  const filteredList = fitnessList.filter((fit) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (fit.vehicleReg && fit.vehicleReg.toLowerCase().includes(q)) ||
      (fit.customerName && fit.customerName.toLowerCase().includes(q)) ||
      (fit.customerPhone && fit.customerPhone.includes(q)) ||
      (fit.fitnessNumber && fit.fitnessNumber.toLowerCase().includes(q)) ||
      (fit.rtoAffiliated && fit.rtoAffiliated.toLowerCase().includes(q));

    const days = getDaysUntil(fit.expiryDate);
    let matchesStatus = true;
    if (filterStatus === "Active") matchesStatus = days > 30;
    else if (filterStatus === "Expiring Soon") matchesStatus = days >= 0 && days <= 30;
    else if (filterStatus === "Expired") matchesStatus = days < 0;

    let matchesPayment = true;
    if (filterPayment === "Due") matchesPayment = (Number(fit.dueAmount) || 0) > 0;

    const matchesRto =
      filterRto === "All" ||
      (fit.rtoAffiliated && fit.rtoAffiliated.toLowerCase() === filterRto.toLowerCase());

    return matchesSearch && matchesStatus && matchesPayment && matchesRto;
  });

  return (
    <div className="view-container">
      {/* Modern View Header Bar */}
      <div className="view-header" style={{ borderLeft: "4px solid #d97706" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)"
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className="view-title">Vehicle Fitness Certificates</h1>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(217, 119, 6, 0.1)",
                  color: "#b45309",
                  border: "1px solid rgba(217, 119, 6, 0.2)"
                }}
              >
                {fitnessList.length} Certificates
              </span>
            </div>
            <p className="view-subtitle">
              Track roadworthiness test validity, RTO affiliation, and customer fee dues
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={onAddFitness}
          style={{
            background: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
            padding: "10px 18px",
            fontSize: "0.86rem"
          }}
        >
          <Plus size={16} />
          <span>New Fitness Entry</span>
        </button>
      </div>

      {/* Modern KPI Stats Cards */}
      <div className="stats-grid">
        {/* Card 1: Total Fleet */}
        <div className="stat-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div className="stat-icon-wrap" style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706" }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Fitness Entries</span>
            <span className="stat-value">{fitnessList.length}</span>
            <span className="stat-subtext">Active commercial fleet</span>
          </div>
        </div>

        {/* Card 2: Collected Fees */}
        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="stat-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Collected Fees</span>
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
              {fitnessList.filter((f) => (Number(f.dueAmount) || 0) > 0).length} vehicles with pending fee
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

      {/* Modern Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "18px",
          background: "#ffffff",
          padding: "12px 18px",
          borderRadius: "12px",
          border: "1px solid var(--border-default)",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)"
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search vehicle number, customer, phone, fitness no, or RTO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 38px",
              borderRadius: "8px",
              border: "1px solid var(--border-default)",
              fontSize: "0.86rem",
              background: "#f8fafc",
              outline: "none"
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)"
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          {["All", "Active", "Expiring Soon", "Expired"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.76rem",
                fontWeight: 600,
                border: filterStatus === st ? "1px solid #b45309" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                background: filterStatus === st ? "linear-gradient(135deg, #b45309 0%, #d97706 100%)" : "#f1f5f9",
                color: filterStatus === st ? "#ffffff" : "#475569",
                boxShadow: filterStatus === st ? "0 2px 6px rgba(217, 119, 6, 0.25)" : "none"
              }}
            >
              {st}
            </button>
          ))}

          <button
            onClick={() => setFilterPayment(filterPayment === "Due" ? "All" : "Due")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.76rem",
              fontWeight: 600,
              border: filterPayment === "Due" ? "1px solid #e11d48" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: filterPayment === "Due" ? "#e11d48" : "#f1f5f9",
              color: filterPayment === "Due" ? "#ffffff" : "#475569",
              boxShadow: filterPayment === "Due" ? "0 2px 6px rgba(225, 29, 72, 0.25)" : "none"
            }}
          >
            Has Due Balance
          </button>
        </div>

        {/* RTO Dropdown */}
        {rtoOptions.length > 0 && (
          <select
            value={filterRto}
            onChange={(e) => setFilterRto(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-default)",
              fontSize: "0.82rem",
              background: "#ffffff",
              color: "var(--text-primary)",
              fontWeight: 500,
              outline: "none"
            }}
          >
            <option value="All">All RTOs ({rtoOptions.length})</option>
            {rtoOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Table / Directory */}
      <div className="table-card">
        {filteredList.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(217, 119, 6, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#d97706"
              }}
            >
              <Activity size={32} />
            </div>
            <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              No Fitness Certificate Records Found
            </h4>
            <p style={{ margin: "0 0 20px", fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
              {searchTerm ? "No fitness certificates match your filter criteria. Try clearing search filters." : "Record your first vehicle fitness certificate with customer details, RTO jurisdiction, and PDF document."}
            </p>
            <button
              className="btn btn-primary"
              onClick={onAddFitness}
              style={{ background: "linear-gradient(135deg, #b45309 0%, #d97706 100%)", border: "none" }}
            >
              <Plus size={16} />
              <span>Issue First Fitness Certificate</span>
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Registration</th>
                  <th>Customer Profile & Mobile</th>
                  <th>RTO Jurisdiction</th>
                  <th>Expiry Date</th>
                  <th>Document / PDF</th>
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

                  let statusBadge = { label: "Active", bg: "rgba(16, 185, 129, 0.1)", color: "#059669", border: "rgba(16, 185, 129, 0.2)" };
                  if (days < 0) {
                    statusBadge = { label: `Expired (${Math.abs(days)}d ago)`, bg: "rgba(239, 68, 68, 0.1)", color: "#dc2626", border: "rgba(239, 68, 68, 0.2)" };
                  } else if (days <= 30) {
                    statusBadge = { label: `${days}d remaining`, bg: "rgba(245, 158, 11, 0.1)", color: "#d97706", border: "rgba(245, 158, 11, 0.2)" };
                  }

                  return (
                    <tr key={fit.id}>
                      {/* Vehicle Number */}
                      <td>
                        <span className="number-plate">
                          <span className="number-plate-ind">IND</span>
                          {fit.vehicleReg}
                        </span>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "monospace", marginTop: "3px" }}>
                          #{fit.fitnessNumber || "FIT-RECORD"}
                        </div>
                      </td>

                      {/* Customer Name & Mobile */}
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                          {fit.customerName}
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
                              color: "#059669",
                              textDecoration: "none",
                              marginTop: "2px",
                              fontWeight: 500
                            }}
                          >
                            <Phone size={11} />
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
                          {formatToIndianDate(fit.expiryDate)}
                        </div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "3px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`
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
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 9px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#b45309",
                                borderColor: "rgba(217, 119, 6, 0.3)"
                              }}
                            >
                              <Eye size={13} />
                              <span>View PDF</span>
                            </button>
                            <button
                              onClick={() => downloadDocument(fit.documentUrl, `Fitness_${fit.vehicleReg || "Certificate"}.pdf`)}
                              title="Download PDF"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px", color: "var(--text-muted)" }}
                            >
                              <Download size={13} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                            No PDF attached
                          </span>
                        )}
                      </td>

                      {/* Payment Info */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--text-primary)" }}>
                          ₹{total.toLocaleString("en-IN")}
                        </div>
                        {due > 0 ? (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: "#dc2626",
                              background: "rgba(220, 38, 38, 0.08)",
                              padding: "2px 7px",
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
                              color: "#059669",
                              background: "rgba(16, 185, 129, 0.08)",
                              padding: "2px 7px",
                              borderRadius: "10px",
                              display: "inline-block",
                              marginTop: "2px"
                            }}
                          >
                            Paid in Full
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {Array.isArray(fit.renewalHistory) && fit.renewalHistory.length > 0 && (
                            <button
                              className="action-icon-btn has-history"
                              title={`View ${fit.renewalHistory.length} Past Renewal Records`}
                              onClick={() => setSelectedHistory({
                                type: "Fitness Certificate",
                                identifier: fit.vehicleReg,
                                history: fit.renewalHistory
                              })}
                            >
                              <History size={13} />
                            </button>
                          )}

                          <button
                            className="btn btn-secondary btn-sm"
                            title="Renew Fitness Certificate"
                            onClick={() => onRenewFitness(fit)}
                            style={{ fontSize: "0.75rem", padding: "4px 8px", color: "#b45309" }}
                          >
                            <RotateCw size={12} />
                            <span>Renew</span>
                          </button>

                          <button
                            className="action-icon-btn"
                            title="Edit Record"
                            onClick={() => onEditFitness(fit)}
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            className="action-icon-btn action-icon-danger"
                            title="Delete Record"
                            onClick={() => onDeleteFitness(fit.id)}
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

      {/* Renewal History Modal */}
      <HistoryModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        type={selectedHistory?.type}
        identifier={selectedHistory?.identifier}
        history={selectedHistory?.history || []}
      />

      {/* PDF Document Viewer Modal */}
      <PdfViewerModal
        isOpen={!!selectedPdf}
        onClose={() => setSelectedPdf(null)}
        documentUrl={selectedPdf?.url}
        title={selectedPdf?.title}
      />
    </div>
  );
}
