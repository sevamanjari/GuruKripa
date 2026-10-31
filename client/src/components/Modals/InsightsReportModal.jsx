import React from "react";
import {
  X,
  Printer,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Shield,
  FileCheck,
  IndianRupee,
  Calendar
} from "lucide-react";
import { formatToIndianDate } from "../../utils/dateFormatter.js";

export default function InsightsReportModal({
  isOpen,
  onClose,
  stats,
  customers = [],
  insurances = [],
  permits = []
}) {
  if (!isOpen) return null;

  // Financial aggregates
  const custBilled = stats?.custBilled ?? customers.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
  const custPaid = stats?.custPaid ?? customers.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
  const custDue = stats?.custDue ?? customers.reduce((sum, c) => sum + (Number(c.dueAmount) || 0), 0);

  const insBilled = stats?.insBilled ?? insurances.reduce((sum, i) => sum + (Number(i.totalAmount ?? i.premiumAmount) || 0), 0);
  const insPaid = stats?.insPaid ?? insurances.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const insDue = stats?.insDue ?? insurances.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);

  const permitBilled = stats?.permitBilled ?? permits.reduce((sum, p) => sum + (Number(p.totalAmount ?? p.feeAmount) || 0), 0);
  const permitPaid = stats?.permitPaid ?? permits.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const permitDue = stats?.permitDue ?? permits.reduce((sum, p) => sum + (Number(p.dueAmount) || 0), 0);

  const totalBilled = stats?.totalBilledAmount ?? (custBilled + insBilled + permitBilled);
  const totalPaid = stats?.totalPaidAmount ?? (custPaid + insPaid + permitPaid);
  const totalDue = stats?.totalDueAmount ?? (custDue + insDue + permitDue);

  const recoveryRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;

  // Critical expiries within 30 days
  const now = new Date();
  const criticalExpiries = [
    ...insurances
      .filter((i) => {
        if (!i.expiryDate) return false;
        const diff = Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((i) => ({
        stream: "Insurance",
        ref: i.policyNumber || "N/A",
        vehicle: i.vehicleReg,
        customer: i.customerName,
        phone: i.customerPhone,
        date: i.expiryDate,
        daysLeft: Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24))
      })),
    ...permits
      .filter((p) => {
        if (!p.validUpto) return false;
        const diff = Math.ceil((new Date(p.validUpto) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((p) => ({
        stream: "Permit",
        ref: p.permitNumber || "N/A",
        vehicle: p.vehicleReg,
        customer: p.customerName,
        phone: p.customerPhone,
        date: p.validUpto,
        daysLeft: Math.ceil((new Date(p.validUpto) - now) / (1000 * 60 * 60 * 24))
      }))
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  // Top Debtors
  const topDebtors = customers
    .filter((c) => (Number(c.dueAmount) || 0) > 0)
    .sort((a, b) => (Number(b.dueAmount) || 0) - (Number(a.dueAmount) || 0))
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "860px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Business & Financial Insights Audit Report
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Document */}
        <div
          className="modal-body"
          style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", padding: "24px" }}
        >
          {/* Document Header */}
          <div
            style={{
              borderBottom: "2px solid #0f172a",
              paddingBottom: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                GURUKRIPA YATAYAT
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "2px" }}>
                Commercial Transport Agency, National Permits & Vehicle Insurance Operations
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Report Generated On:</div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>
                {currentDateStr}
              </div>
            </div>
          </div>

          {/* Section 1: Executive Performance Summary Narrative */}
          <div
            style={{
              background: "var(--bg-subtle, #f8fafc)",
              border: "1px solid var(--border-default, #e2e8f0)",
              borderRadius: "8px",
              padding: "16px 20px"
            }}
          >
            <h4
              style={{
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--brand-primary)",
                fontWeight: 700,
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <TrendingUp size={14} />
              <span>Executive Operations Assessment</span>
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.6, margin: 0 }}>
              GuruKripa Yatayat has logged an aggregate operational turnover of{" "}
              <strong>₹{totalBilled.toLocaleString("en-IN")}</strong> across registered customer accounts, vehicle insurance policies, and national permits. Realized cash collections stand at{" "}
              <strong style={{ color: "#16a34a" }}>₹{totalPaid.toLocaleString("en-IN")}</strong>, representing a{" "}
              <strong>{recoveryRate}% recovery efficiency</strong>. Outstanding credit exposure sits at{" "}
              <strong style={{ color: totalDue > 0 ? "#dc2626" : "#16a34a" }}>
                ₹{totalDue.toLocaleString("en-IN")}
              </strong>{" "}
              with {topDebtors.length > 0 ? `${topDebtors.length} major customer accounts requiring immediate recovery follow-up` : "zero overdue debtor risk"}.
            </p>
          </div>

          {/* Section 2: Department Monetary Breakdown Table */}
          <div>
            <h4
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "10px"
              }}
            >
              1. Department Revenue & Recovery Breakdown
            </h4>
            <table className="data-table" style={{ width: "100%", fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th>Operational Stream</th>
                  <th>Volume</th>
                  <th>Total Billed</th>
                  <th>Paid / Realized</th>
                  <th>Pending Due</th>
                  <th>Recovery %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                      <Users size={13} color="#1e3a8a" />
                      <span>Customer Direct Accounts</span>
                    </div>
                  </td>
                  <td>{customers.length} Profiles</td>
                  <td style={{ fontWeight: 600 }}>₹{custBilled.toLocaleString("en-IN")}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>₹{custPaid.toLocaleString("en-IN")}</td>
                  <td style={{ color: custDue > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>₹{custDue.toLocaleString("en-IN")}</td>
                  <td style={{ fontWeight: 700 }}>
                    {custBilled > 0 ? `${Math.round((custPaid / custBilled) * 100)}%` : "100%"}
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                      <Shield size={13} color="#2563eb" />
                      <span>Vehicle Insurance Premiums</span>
                    </div>
                  </td>
                  <td>{insurances.length} Policies</td>
                  <td style={{ fontWeight: 600 }}>₹{insBilled.toLocaleString("en-IN")}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>₹{insPaid.toLocaleString("en-IN")}</td>
                  <td style={{ color: insDue > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>₹{insDue.toLocaleString("en-IN")}</td>
                  <td style={{ fontWeight: 700 }}>
                    {insBilled > 0 ? `${Math.round((insPaid / insBilled) * 100)}%` : "100%"}
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                      <FileCheck size={13} color="#059669" />
                      <span>RTO & National Permits</span>
                    </div>
                  </td>
                  <td>{permits.length} Permits</td>
                  <td style={{ fontWeight: 600 }}>₹{permitBilled.toLocaleString("en-IN")}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>₹{permitPaid.toLocaleString("en-IN")}</td>
                  <td style={{ color: permitDue > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>₹{permitDue.toLocaleString("en-IN")}</td>
                  <td style={{ fontWeight: 700 }}>
                    {permitBilled > 0 ? `${Math.round((permitPaid / permitBilled) * 100)}%` : "100%"}
                  </td>
                </tr>

                {/* Grand Total Row */}
                <tr style={{ background: "var(--bg-subtle, #f8fafc)", fontWeight: 800 }}>
                  <td>CONSOLIDATED TOTALS</td>
                  <td>{customers.length + insurances.length + permits.length} Records</td>
                  <td>₹{totalBilled.toLocaleString("en-IN")}</td>
                  <td style={{ color: "#16a34a" }}>₹{totalPaid.toLocaleString("en-IN")}</td>
                  <td style={{ color: totalDue > 0 ? "#dc2626" : "#16a34a" }}>₹{totalDue.toLocaleString("en-IN")}</td>
                  <td style={{ color: recoveryRate >= 80 ? "#16a34a" : "#dc2626" }}>{recoveryRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: High Priority Action List (Top Overdue Balances) */}
          {topDebtors.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px"
                }}
              >
                2. Top Priority Outstanding Debtor Accounts
              </h4>
              <table className="data-table" style={{ width: "100%", fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Mobile Contact</th>
                    <th>Location</th>
                    <th>Total Billed</th>
                    <th>Paid Amount</th>
                    <th>Outstanding Due</th>
                  </tr>
                </thead>
                <tbody>
                  {topDebtors.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td>{c.phone || "-"}</td>
                      <td>{c.address || "-"}</td>
                      <td>₹{(Number(c.totalAmount) || 0).toLocaleString("en-IN")}</td>
                      <td style={{ color: "#16a34a" }}>₹{(Number(c.paidAmount) || 0).toLocaleString("en-IN")}</td>
                      <td style={{ color: "#dc2626", fontWeight: 700 }}>₹{(Number(c.dueAmount) || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 4: Upcoming Renewals (Next 30 Days) */}
          {criticalExpiries.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: "10px"
                }}
              >
                3. Critical Renewals Approaching (Next 30 Days Pipeline)
              </h4>
              <table className="data-table" style={{ width: "100%", fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Vehicle Reg</th>
                    <th>Reference / Policy</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Expiry Date</th>
                    <th>Days Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalExpiries.slice(0, 6).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.stream}</td>
                      <td style={{ fontWeight: 700 }}>{item.vehicle}</td>
                      <td>{item.ref}</td>
                      <td>{item.customer}</td>
                      <td>{item.phone}</td>
                      <td>{formatToIndianDate(item.date)}</td>
                      <td style={{ color: item.daysLeft < 0 ? "#dc2626" : "#d97706", fontWeight: 700 }}>
                        {item.daysLeft < 0 ? "Expired" : `${item.daysLeft} days`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Auditor / Manager Verification Footer */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "24px",
              borderTop: "1px dashed var(--border-medium, #cbd5e1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: "0.8rem",
              color: "#64748b"
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b" }}>GuruKripa Transport Office Operations</div>
              <div>System Auto-Generated Audit Sheet • Enterprise Solution by <strong style={{ color: "var(--brand-primary, #1e3a8a)" }}>SevaManjari Labs Private Limited</strong></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "180px", borderBottom: "1px solid #94a3b8", marginBottom: "4px" }} />
              <div>Authorized Signatory / Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
