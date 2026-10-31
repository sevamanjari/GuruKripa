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
  FileText,
  Download,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import HistoryModal from "./Modals/HistoryModal.jsx";
import PdfViewerModal from "./Modals/PdfViewerModal.jsx";
import { downloadDocument } from "../services/api.js";
import { formatToIndianDate } from "../utils/dateFormatter.js";

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
  const [filterUnderwriter, setFilterUnderwriter] = useState("All");

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
  const totalBilled = insurances.reduce((sum, i) => sum + (Number(i.totalAmount) || Number(i.premiumAmount) || 0), 0);
  const totalCollected = insurances.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalDue = insurances.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);
  const expiringCount = insurances.filter((i) => {
    const d = getDaysUntil(i.expiryDate);
    return d <= 30 && d >= 0;
  }).length;
  const expiredCount = insurances.filter((i) => getDaysUntil(i.expiryDate) < 0).length;

  const underwriterList = Array.from(
    new Set(insurances.map((i) => i.underwriter || i.insuranceCompany).filter(Boolean))
  );

  const filteredInsurances = insurances.filter((ins) => {
    const q = searchTerm.toLowerCase().trim();
    const und = (ins.underwriter || ins.insuranceCompany || "").toLowerCase();
    const matchesSearch =
      !q ||
      (ins.policyNumber && ins.policyNumber.toLowerCase().includes(q)) ||
      (ins.vehicleReg && ins.vehicleReg.toLowerCase().includes(q)) ||
      (ins.customerName && ins.customerName.toLowerCase().includes(q)) ||
      (ins.customerPhone && ins.customerPhone.toLowerCase().includes(q)) ||
      und.includes(q);

    const days = getDaysUntil(ins.expiryDate);
    let computed = "Active";
    if (days < 0) computed = "Expired";
    else if (days <= 30) computed = "Expiring Soon";

    const matchesStatus =
      filterStatus === "All" ||
      computed === filterStatus ||
      ins.status === filterStatus;

    let matchesPayment = true;
    if (filterPayment === "Due") {
      matchesPayment = (Number(ins.dueAmount) || 0) > 0;
    } else if (filterPayment !== "All") {
      matchesPayment = ins.paymentStatus === filterPayment;
    }

    const matchesUnderwriter =
      filterUnderwriter === "All" ||
      und === filterUnderwriter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment && matchesUnderwriter;
  });

  return (
    <div className="view-container">
      {/* Modern View Header Bar */}
      <div className="view-header" style={{ borderLeft: "4px solid #2563eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className="view-title">Vehicle Insurance Policies</h1>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(37, 99, 235, 0.1)",
                  color: "#2563eb",
                  border: "1px solid rgba(37, 99, 235, 0.2)"
                }}
              >
                {insurances.length} Active Policies
              </span>
            </div>
            <p className="view-subtitle">
              Commercial & private motor insurance renewals, underwriter tracking, and policy document uploads
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {onOpenManageUnderwriters && (
            <button
              className="btn btn-secondary"
              onClick={onOpenManageUnderwriters}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
            >
              <Building2 size={15} />
              <span>Underwriters</span>
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={onAddInsurance}
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              padding: "10px 18px",
              fontSize: "0.86rem"
            }}
          >
            <Plus size={16} />
            <span>New Insurance Policy</span>
          </button>
        </div>
      </div>

      {/* Modern KPI Stats Cards */}
      <div className="stats-grid">
        {/* Card 1: Insured Vehicles */}
        <div className="stat-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <div className="stat-icon-wrap" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb" }}>
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Insured Vehicles</span>
            <span className="stat-value">{insurances.length}</span>
            <span className="stat-subtext">Active policy coverage</span>
          </div>
        </div>

        {/* Card 2: Collected Premium */}
        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="stat-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Collected Premium</span>
            <span className="stat-value" style={{ color: "#059669" }}>
              ₹{totalCollected.toLocaleString("en-IN")}
            </span>
            <span className="stat-subtext">Total Premium: ₹{totalBilled.toLocaleString("en-IN")}</span>
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
              {insurances.filter((i) => (Number(i.dueAmount) || 0) > 0).length} policies with pending fee
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
            placeholder="Search vehicle number, customer, phone, policy number, or underwriter..."
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
                background: filterStatus === st ? "var(--brand-primary, #1e3a8a)" : "var(--bg-subtle)",
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

        {underwriterList.length > 0 && (
          <select
            value={filterUnderwriter}
            onChange={(e) => setFilterUnderwriter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-default)",
              fontSize: "0.82rem",
              background: "#ffffff"
            }}
          >
            <option value="All">All Underwriters</option>
            {underwriterList.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Table */}
      <div className="table-responsive" style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
        {filteredInsurances.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Shield size={40} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
            <h4 style={{ margin: "0 0 6px", fontSize: "1rem", color: "var(--text-primary)" }}>
              No insurance policies found
            </h4>
            <p style={{ margin: "0 0 16px", fontSize: "0.84rem", color: "var(--text-muted)" }}>
              {searchTerm ? "Try adjusting your search criteria" : "Click 'New Insurance Policy' above to add your first policy"}
            </p>
            <button className="btn btn-primary" onClick={onAddInsurance}>
              <Plus size={16} />
              <span>Add First Policy</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle & Policy No</th>
                <th>Customer Name & Mobile</th>
                <th>Underwriter</th>
                <th>Expiry Date</th>
                <th>Policy / PDF</th>
                <th>Premium & Payment</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInsurances.map((ins) => {
                const days = getDaysUntil(ins.expiryDate);
                const total = Number(ins.totalAmount ?? ins.premiumAmount) || 0;
                const paid = Number(ins.paidAmount) || 0;
                const due = Math.max(0, total - paid);

                let statusBadge = { label: "Active", bg: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
                if (days < 0) {
                  statusBadge = { label: `Expired (${Math.abs(days)}d ago)`, bg: "rgba(220, 38, 38, 0.1)", color: "#dc2626" };
                } else if (days <= 30) {
                  statusBadge = { label: `${days}d left`, bg: "rgba(217, 119, 6, 0.1)", color: "#d97706" };
                }

                return (
                  <tr key={ins.id}>
                    {/* Vehicle & Policy */}
                    <td>
                      <span className="number-plate">
                        <span className="number-plate-ind">IND</span>
                        <span>{ins.vehicleReg}</span>
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", fontFamily: "monospace" }}>
                        {ins.policyNumber || "POL-PENDING"}
                      </div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {ins.customerName || "Customer"}
                      </div>
                      {ins.customerPhone && (
                        <a
                          href={`https://wa.me/91${ins.customerPhone.replace(/\D/g, "")}`}
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
                          <span>{ins.customerPhone}</span>
                        </a>
                      )}
                    </td>

                    {/* Underwriter */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building2 size={14} color="#64748b" />
                        <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                          {ins.underwriter || ins.insuranceCompany || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Expiry Date */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {formatToIndianDate(ins.expiryDate)}
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
                      {ins.documentUrl ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setSelectedPdf({ url: ins.documentUrl, title: `Insurance - ${ins.vehicleReg}` })}
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", fontSize: "0.75rem" }}
                          >
                            <Eye size={13} color="var(--brand-primary, #1e3a8a)" />
                            <span>View PDF</span>
                          </button>
                          <button
                            onClick={() => downloadDocument(ins.documentUrl, `Insurance_${ins.vehicleReg || "Policy"}.pdf`)}
                            title="Download Policy"
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
                        {Array.isArray(ins.renewalHistory) && ins.renewalHistory.length > 0 && (
                          <button
                            onClick={() => {
                              setHistoryItem(ins);
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
                          onClick={() => onRenewInsurance(ins.id)}
                          title="Renew Policy"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 8px", color: "var(--brand-primary, #1e3a8a)", fontWeight: 600 }}
                        >
                          <RotateCw size={13} />
                          <span style={{ fontSize: "0.72rem" }}>Renew</span>
                        </button>
                        <button
                          onClick={() => onEditInsurance(ins)}
                          title="Edit Policy"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 8px" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteInsurance(ins.id, ins.policyNumber || ins.vehicleReg)}
                          title="Delete Policy"
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
          type="insurance"
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
