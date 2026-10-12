import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Phone,
  Edit2,
  Trash2,
  FileText,
  IndianRupee,
  Clock,
  Shield,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  BarChart3,
  PieChart
} from "lucide-react";
import {
  RevenueStreamBarChart,
  StreamDistributionDonutChart,
  RecoveryGauge,
  TopDebtorsBarChart
} from "./DashboardCharts.jsx";
import InsightsReportModal from "./Modals/InsightsReportModal.jsx";

export default function DashboardView({
  stats,
  customers = [],
  insurances = [],
  permits = [],
  onNavigate,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddInsurance,
  onAddPermit
}) {
  const [activeTab, setActiveTab] = useState("customers"); // "customers" | "insurance" | "permits" | "dues"
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Comprehensive Monetary Aggregates
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

  const totalCustomers = stats?.totalCustomers ?? customers.length;
  const dueCustomersCount = stats?.dueCustomersCount ?? customers.filter((c) => (Number(c.dueAmount) || 0) > 0).length;

  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;

  // Chart datasets
  const barChartData = [
    {
      label: "Customer Accts",
      billed: custBilled,
      collected: custPaid,
      due: custDue
    },
    {
      label: "Vehicle Insurance",
      billed: insBilled,
      collected: insPaid,
      due: insDue
    },
    {
      label: "RTO Permits",
      billed: permitBilled,
      collected: permitPaid,
      due: permitDue
    }
  ];

  const streamDonutData = [
    {
      label: "Customer Accounts",
      value: custBilled,
      color: "#1e3a8a"
    },
    {
      label: "Vehicle Insurance",
      value: insBilled,
      color: "#2563eb"
    },
    {
      label: "RTO Permits",
      value: permitBilled,
      color: "#059669"
    }
  ];

  const topDebtors = customers
    .filter((c) => (Number(c.dueAmount) || 0) > 0)
    .sort((a, b) => (Number(b.dueAmount) || 0) - (Number(a.dueAmount) || 0));

  // Critical Expiries within 30 days
  const now = new Date();
  const criticalExpiries = [
    ...insurances
      .filter((i) => {
        if (!i.expiryDate) return false;
        const diff = Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((i) => ({
        type: "Insurance",
        title: `Insurance Policy #${i.policyNumber || "N/A"}`,
        reg: i.vehicleReg,
        customerName: i.customerName,
        customerPhone: i.customerPhone,
        date: i.expiryDate,
        daysLeft: Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24)),
        dueAmount: Number(i.dueAmount) || 0
      })),
    ...permits
      .filter((p) => {
        if (!p.validUpto) return false;
        const diff = Math.ceil((new Date(p.validUpto) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((p) => ({
        type: "Permit",
        title: `${p.permitType || "Permit"} #${p.permitNumber || "N/A"}`,
        reg: p.vehicleReg,
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        date: p.validUpto,
        daysLeft: Math.ceil((new Date(p.validUpto) - now) / (1000 * 60 * 60 * 24)),
        dueAmount: Number(p.dueAmount) || 0
      }))
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  // All Outstanding Dues list
  const pendingDuesList = [
    ...customers
      .filter((c) => (Number(c.dueAmount) || 0) > 0)
      .map((c) => ({
        source: "Customer Account",
        name: c.name,
        phone: c.phone,
        identifier: c.address || "Direct Account",
        dueAmount: Number(c.dueAmount) || 0,
        paidAmount: Number(c.paidAmount) || 0,
        totalAmount: Number(c.totalAmount) || 0,
        navigateTarget: "customers"
      })),
    ...insurances
      .filter((i) => (Number(i.dueAmount) || 0) > 0)
      .map((i) => ({
        source: "Insurance Premium",
        name: i.customerName,
        phone: i.customerPhone,
        identifier: `${i.vehicleReg || ""} • ${i.insuranceCompany || "Policy"}`,
        dueAmount: Number(i.dueAmount) || 0,
        paidAmount: Number(i.paidAmount) || 0,
        totalAmount: Number(i.totalAmount ?? i.premiumAmount) || 0,
        navigateTarget: "insurance"
      })),
    ...permits
      .filter((p) => (Number(p.dueAmount) || 0) > 0)
      .map((p) => ({
        source: "Permit Govt Fee",
        name: p.customerName,
        phone: p.customerPhone,
        identifier: `${p.vehicleReg || ""} • ${p.permitType || "Permit"}`,
        dueAmount: Number(p.dueAmount) || 0,
        paidAmount: Number(p.paidAmount) || 0,
        totalAmount: Number(p.totalAmount ?? p.feeAmount) || 0,
        navigateTarget: "permits"
      }))
  ].sort((a, b) => b.dueAmount - a.dueAmount);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Workspace Header with Quick Action Suite & Report Generator */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Operations & Visual Insights Command Center</h1>
          <p className="view-subtitle">
            GuruKripa Yatayat • Unified financial analytics, graphical turnover trends, collection recovery, and service records.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Executive Insights Report Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsReportModalOpen(true)}
            style={{
              background: "#eff6ff",
              borderColor: "#bfdbfe",
              color: "#1d4ed8",
              fontWeight: 600
            }}
          >
            <FileText size={13} color="#2563eb" />
            <span>Generate Insights Report</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onAddInsurance}>
            <Shield size={13} color="#2563eb" />
            <span>+ Add Insurance</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onAddPermit}>
            <FileCheck size={13} color="#059669" />
            <span>+ Add Permit</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onAddCustomer}>
            <Plus size={14} />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Monetary & Directory Metric Cards */}
      <div className="metric-grid">
        {/* Total Customers */}
        <div className="metric-card interactive" onClick={() => onNavigate("customers")}>
          <div className="metric-top">
            <span className="metric-label">Total Customers</span>
            <div className="metric-icon-wrap">
              <Users size={16} />
            </div>
          </div>
          <div className="metric-value">{totalCustomers.toLocaleString("en-IN")}</div>
          <div className="metric-caption">All registered customer accounts</div>
        </div>

        {/* Total Billed */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Total Billed Operations</span>
            <div className="metric-icon-wrap" style={{ color: "var(--brand-primary)" }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="metric-value">₹{totalBilled.toLocaleString("en-IN")}</div>
          <div className="metric-caption">
            Across accounts, insurance & permits
          </div>
        </div>

        {/* Total Payments Collected */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Payments Collected</span>
            <div className="metric-icon-wrap" style={{ color: "#16a34a" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ color: "#16a34a" }}>
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
          <div className="metric-caption" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <TrendingUp size={12} color="#16a34a" />
            <span>{collectionRate}% collection recovery rate</span>
          </div>
        </div>

        {/* Total Outstanding Dues */}
        <div
          className="metric-card interactive"
          onClick={() => setActiveTab("dues")}
          style={{
            borderLeft: totalDue > 0 ? "3px solid #dc2626" : "1px solid var(--border-default)"
          }}
        >
          <div className="metric-top">
            <span className="metric-label">Outstanding Balance Due</span>
            <div className="metric-icon-wrap" style={{ color: totalDue > 0 ? "#dc2626" : "#16a34a" }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div
            className="metric-value"
            style={{ color: totalDue > 0 ? "#dc2626" : "#16a34a" }}
          >
            ₹{totalDue.toLocaleString("en-IN")}
          </div>
          <div className="metric-caption">
            {dueCustomersCount > 0 ? `${dueCustomersCount} client(s) with pending balance` : "All collections up to date"}
          </div>
        </div>
      </div>

      {/* VISUAL GRAPHS & INSIGHTS ANALYTICS SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "16px" }}>
        {/* Graph 1: Revenue & Realization Grouped Bar Chart + Top Debtors */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Revenue Realization by Department
                </h3>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Billed vs Collected
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
              Live comparison between turnover billed and actual cash collected per operational service.
            </p>
          </div>

          {/* Bar Chart Component */}
          <RevenueStreamBarChart data={barChartData} />

          {/* Top Debtors Mini Section */}
          <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border-default)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Highest Outstanding Receivables (Top Debtors)
              </h4>
              <button
                onClick={() => setActiveTab("dues")}
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
              >
                View all ({pendingDuesList.length})
              </button>
            </div>
            <TopDebtorsBarChart debtors={topDebtors} onSelectCustomer={() => onNavigate("customers")} />
          </div>
        </div>

        {/* Graph 2: Donut Distribution Chart & Recovery Gauge */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            justifyContent: "space-between"
          }}
        >
          {/* Donut Chart */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <PieChart size={16} color="#2563eb" />
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Operations Turnover Share
              </h3>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              Proportional share of revenue across business streams.
            </p>
            <StreamDistributionDonutChart data={streamDonutData} />
          </div>

          {/* Recovery Speedometer Gauge */}
          <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border-default)" }}>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Cash Flow Recovery Health
              </h4>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Proportion of billed credit converted into realized funds.
              </p>
            </div>
            <RecoveryGauge
              rate={collectionRate}
              totalBilled={totalBilled}
              totalPaid={totalPaid}
              totalDue={totalDue}
            />
          </div>
        </div>
      </div>

      {/* 3 Department Breakdown Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {/* Customer Accounts Stream */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(30, 58, 138, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                  <Users size={15} />
                </div>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Customer Accounts</h3>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-primary)", background: "rgba(30, 58, 138, 0.08)", padding: "2px 8px", borderRadius: "999px" }}>
                {customers.length} Profiles
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "var(--bg-subtle, #f8fafc)", padding: "10px", borderRadius: "6px" }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Billed</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>₹{custBilled.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Paid</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#16a34a" }}>₹{custPaid.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Due</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: custDue > 0 ? "#dc2626" : "#16a34a" }}>₹{custDue.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("customers")}
            style={{
              marginTop: "12px",
              background: "none",
              border: "none",
              padding: "4px 0",
              color: "var(--brand-primary)",
              fontWeight: 600,
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer"
            }}
          >
            <span>Open Customer Directory</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Insurance Desk Stream */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(37, 99, 235, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                  <Shield size={15} />
                </div>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Vehicle Insurance Desk</h3>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", background: "rgba(37, 99, 235, 0.08)", padding: "2px 8px", borderRadius: "999px" }}>
                {insurances.length} Policies
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "var(--bg-subtle, #f8fafc)", padding: "10px", borderRadius: "6px" }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Premium</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>₹{insBilled.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Paid</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#16a34a" }}>₹{insPaid.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Due</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: insDue > 0 ? "#dc2626" : "#16a34a" }}>₹{insDue.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("insurance")}
            style={{
              marginTop: "12px",
              background: "none",
              border: "none",
              padding: "4px 0",
              color: "#2563eb",
              fontWeight: 600,
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer"
            }}
          >
            <span>Open Insurance Management</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Permits Stream */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(5, 150, 105, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                  <FileCheck size={15} />
                </div>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>RTO & National Permits</h3>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669", background: "rgba(5, 150, 105, 0.08)", padding: "2px 8px", borderRadius: "999px" }}>
                {permits.length} Permits
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "var(--bg-subtle, #f8fafc)", padding: "10px", borderRadius: "6px" }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Govt Fee</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>₹{permitBilled.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Paid</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#16a34a" }}>₹{permitPaid.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Due</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: permitDue > 0 ? "#dc2626" : "#16a34a" }}>₹{permitDue.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("permits")}
            style={{
              marginTop: "12px",
              background: "none",
              border: "none",
              padding: "4px 0",
              color: "#059669",
              fontWeight: 600,
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer"
            }}
          >
            <span>Open Permits Register</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Critical Expiries Alert Section (if any within 30 days) */}
      {criticalExpiries.length > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            padding: "14px 18px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={16} color="#d97706" />
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#92400e", margin: 0 }}>
                Attention: {criticalExpiries.length} Service(s) Expiring Soon (Next 30 Days)
              </h3>
            </div>
            <span style={{ fontSize: "0.72rem", color: "#b45309", fontWeight: 600 }}>Action Required</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
            {criticalExpiries.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  border: "1px solid #fef3c7",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)" }}>
                    {item.reg} • <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {item.customerName} ({item.customerPhone})
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: item.daysLeft < 0 ? "#dc2626" : "#d97706",
                      background: item.daysLeft < 0 ? "rgba(220, 38, 38, 0.1)" : "rgba(217, 119, 6, 0.1)",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    {item.daysLeft < 0 ? "Expired" : `${item.daysLeft}d left`}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {item.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operations Table with Activity Tabs */}
      <div className="table-card">
        {/* Table Header & Navigation Tabs */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          {/* Tab buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setActiveTab("customers")}
              className={`btn btn-sm ${activeTab === "customers" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.78rem" }}
            >
              <Users size={12} />
              <span>Recent Customers ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("insurance")}
              className={`btn btn-sm ${activeTab === "insurance" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.78rem" }}
            >
              <Shield size={12} />
              <span>Recent Policies ({insurances.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("permits")}
              className={`btn btn-sm ${activeTab === "permits" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.78rem" }}
            >
              <FileCheck size={12} />
              <span>Recent Permits ({permits.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("dues")}
              className={`btn btn-sm ${activeTab === "dues" ? "btn-primary" : "btn-secondary"}`}
              style={{
                fontSize: "0.78rem",
                color: activeTab === "dues" ? "#ffffff" : pendingDuesList.length > 0 ? "#dc2626" : undefined
              }}
            >
              <AlertCircle size={12} />
              <span>Pending Dues ({pendingDuesList.length})</span>
            </button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate(activeTab === "insurance" ? "insurance" : activeTab === "permits" ? "permits" : "customers")}
          >
            <span>View Full Directory</span>
            <ExternalLink size={12} />
          </button>
        </div>

        {/* TAB 1: RECENT CUSTOMERS */}
        {activeTab === "customers" && (
          <div>
            {customers.length === 0 ? (
              <div className="empty-state">
                <FileText size={20} />
                <h3 className="empty-state-title">No Customers Found</h3>
                <p className="empty-state-desc">Add a customer entry to start tracking accounts.</p>
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
                      <th>Customer Profile & Phone</th>
                      <th>Address</th>
                      <th>Billed Amount</th>
                      <th>Paid Amount</th>
                      <th>Due Balance</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 8).map((c) => {
                      const total = Number(c.totalAmount) || 0;
                      const paid = Number(c.paidAmount) || 0;
                      const due = Number(c.dueAmount) !== undefined ? Number(c.dueAmount) : Math.max(0, total - paid);

                      return (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                              <Phone size={11} />
                              <a href={`tel:${c.phone}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{c.phone}</a>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{c.address || "-"}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{total > 0 ? `₹${total.toLocaleString("en-IN")}` : "₹0"}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: "0.85rem", color: paid > 0 ? "#16a34a" : "var(--text-muted)" }}>
                              {paid > 0 ? `₹${paid.toLocaleString("en-IN")}` : "₹0"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, fontSize: "0.86rem", color: due > 0 ? "#dc2626" : "#16a34a" }}>
                              {due > 0 ? `₹${due.toLocaleString("en-IN")}` : "₹0 (Cleared)"}
                            </span>
                          </td>
                          <td>
                            {due === 0 && total > 0 ? (
                              <span className="status-badge status-active"><CheckCircle2 size={11} style={{ marginRight: "3px" }} />Paid</span>
                            ) : paid > 0 && due > 0 ? (
                              <span className="status-badge status-warning"><Clock size={11} style={{ marginRight: "3px" }} />Partial</span>
                            ) : due > 0 ? (
                              <span className="status-badge" style={{ background: "rgba(220, 38, 38, 0.1)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                                <AlertCircle size={11} style={{ marginRight: "3px" }} />Due
                              </span>
                            ) : (
                              <span className="status-badge status-neutral">No Charges</span>
                            )}
                          </td>
                          <td className="action-cell">
                            <div className="action-group">
                              <button className="action-icon-btn" onClick={() => onEditCustomer(c)} title="Edit Customer">
                                <Edit2 size={13} />
                              </button>
                              <button className="action-icon-btn action-icon-danger" onClick={() => onDeleteCustomer(c.id, c.name)} title="Delete Customer">
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
        )}

        {/* TAB 2: RECENT INSURANCE POLICIES */}
        {activeTab === "insurance" && (
          <div>
            {insurances.length === 0 ? (
              <div className="empty-state">
                <Shield size={20} />
                <h3 className="empty-state-title">No Insurance Policies Yet</h3>
                <p className="empty-state-desc">Record policies with premium payment and renewal dates.</p>
                <button className="btn btn-primary btn-sm" onClick={onAddInsurance}>
                  <Plus size={13} />
                  <span>Add First Policy</span>
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehicle & Policy No</th>
                      <th>Customer & Mobile</th>
                      <th>Underwriter</th>
                      <th>Total Premium</th>
                      <th>Paid / Due</th>
                      <th>Policy Expiry</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insurances.slice(0, 8).map((ins) => {
                      const total = Number(ins.totalAmount ?? ins.premiumAmount) || 0;
                      const paid = Number(ins.paidAmount) || 0;
                      const due = Number(ins.dueAmount) !== undefined ? Number(ins.dueAmount) : Math.max(0, total - paid);

                      return (
                        <tr key={ins.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{ins.vehicleReg}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>#{ins.policyNumber}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ins.customerName || "Customer"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{ins.customerPhone || "-"}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{ins.insuranceCompany || "-"}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>₹{total.toLocaleString("en-IN")}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}>Paid: ₹{paid.toLocaleString("en-IN")}</div>
                            <div style={{ fontSize: "0.76rem", color: due > 0 ? "#dc2626" : "var(--text-muted)", fontWeight: 600 }}>
                              Due: ₹{due.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{ins.expiryDate || "-"}</span>
                          </td>
                          <td>
                            {due === 0 && total > 0 ? (
                              <span className="status-badge status-active"><CheckCircle2 size={11} style={{ marginRight: "3px" }} />Paid</span>
                            ) : paid > 0 && due > 0 ? (
                              <span className="status-badge status-warning"><Clock size={11} style={{ marginRight: "3px" }} />Partial</span>
                            ) : (
                              <span className="status-badge" style={{ background: "rgba(220, 38, 38, 0.1)", color: "#dc2626" }}>Due</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RECENT PERMITS */}
        {activeTab === "permits" && (
          <div>
            {permits.length === 0 ? (
              <div className="empty-state">
                <FileCheck size={20} />
                <h3 className="empty-state-title">No Permits Yet</h3>
                <p className="empty-state-desc">Record commercial national and state permits.</p>
                <button className="btn btn-primary btn-sm" onClick={onAddPermit}>
                  <Plus size={13} />
                  <span>Issue First Permit</span>
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehicle & Permit No</th>
                      <th>Customer & Mobile</th>
                      <th>Permit Type</th>
                      <th>Fee Amount</th>
                      <th>Paid / Due</th>
                      <th>Valid Upto</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permits.slice(0, 8).map((p) => {
                      const total = Number(p.totalAmount ?? p.feeAmount) || 0;
                      const paid = Number(p.paidAmount) || 0;
                      const due = Number(p.dueAmount) !== undefined ? Number(p.dueAmount) : Math.max(0, total - paid);

                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{p.vehicleReg}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>#{p.permitNumber}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.customerName || "Customer"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.customerPhone || "-"}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{p.permitType}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>₹{total.toLocaleString("en-IN")}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}>Paid: ₹{paid.toLocaleString("en-IN")}</div>
                            <div style={{ fontSize: "0.76rem", color: due > 0 ? "#dc2626" : "var(--text-muted)", fontWeight: 600 }}>
                              Due: ₹{due.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{p.validUpto || "-"}</span>
                          </td>
                          <td>
                            {due === 0 && total > 0 ? (
                              <span className="status-badge status-active"><CheckCircle2 size={11} style={{ marginRight: "3px" }} />Paid</span>
                            ) : paid > 0 && due > 0 ? (
                              <span className="status-badge status-warning"><Clock size={11} style={{ marginRight: "3px" }} />Partial</span>
                            ) : (
                              <span className="status-badge" style={{ background: "rgba(220, 38, 38, 0.1)", color: "#dc2626" }}>Due</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ALL OUTSTANDING DUES ACROSS SERVICES */}
        {activeTab === "dues" && (
          <div>
            {pendingDuesList.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={24} color="#16a34a" />
                <h3 className="empty-state-title" style={{ color: "#16a34a" }}>All Payments Cleared!</h3>
                <p className="empty-state-desc">There are currently zero outstanding dues across all accounts, insurance policies, and permits.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer & Contact</th>
                      <th>Service Stream</th>
                      <th>Details / Reference</th>
                      <th>Total Billed</th>
                      <th>Paid So Far</th>
                      <th>Balance Due</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDuesList.map((dueItem, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{dueItem.name || "Customer"}</div>
                          {dueItem.phone && (
                            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                              <Phone size={11} />
                              <a href={`tel:${dueItem.phone}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{dueItem.phone}</a>
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background:
                                dueItem.source === "Insurance Premium"
                                  ? "rgba(37, 99, 235, 0.1)"
                                  : dueItem.source === "Permit Govt Fee"
                                  ? "rgba(5, 150, 105, 0.1)"
                                  : "rgba(30, 58, 138, 0.1)",
                              color:
                                dueItem.source === "Insurance Premium"
                                  ? "#2563eb"
                                  : dueItem.source === "Permit Govt Fee"
                                  ? "#059669"
                                  : "var(--brand-primary)"
                            }}
                          >
                            {dueItem.source}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{dueItem.identifier}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>₹{dueItem.totalAmount.toLocaleString("en-IN")}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 600 }}>₹{dueItem.paidAmount.toLocaleString("en-IN")}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.88rem", color: "#dc2626", fontWeight: 700 }}>
                            ₹{dueItem.dueAmount.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: "0.74rem", padding: "3px 8px" }}
                            onClick={() => onNavigate(dueItem.navigateTarget)}
                          >
                            <span>Open</span>
                            <ArrowRight size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Executive Insights & Audit Report Modal */}
      <InsightsReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        stats={stats}
        customers={customers}
        insurances={insurances}
        permits={permits}
      />
    </div>
  );
}
