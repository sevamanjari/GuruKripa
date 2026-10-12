import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  RotateCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Shield,
  FileText,
  DollarSign,
  ExternalLink,
  Sparkles,
  Info,
  Calendar,
  Search,
  Filter,
  Check
} from "lucide-react";
import { api } from "../services/api.js";

export default function RemindersView({ showToast }) {
  const [configStatus, setConfigStatus] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("all"); // 'all' | 'insurance' | 'permit' | 'due' | 'logs'
  const [thresholdDays, setThresholdDays] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");

  // Message preview modal state
  const [previewItem, setPreviewItem] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [sendingSingle, setSendingSingle] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, upcomingRes, logsRes] = await Promise.all([
        api.getReminderStatus().catch(() => ({})),
        api.getUpcomingReminders(thresholdDays).catch(() => ({ data: [] })),
        api.getReminderLogs().catch(() => ({ data: [] }))
      ]);

      setConfigStatus(statusRes);
      setCandidates(upcomingRes.data || []);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error("Failed to load reminders data:", err);
      showToast?.("Failed to load reminder records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [thresholdDays]);

  const handleRunAutoScan = async () => {
    setScanning(true);
    try {
      const res = await api.triggerAutoScan(thresholdDays);
      showToast?.(
        res.message || `Automated scan completed! ${res.result?.processed || 0} reminders processed.`,
        "success"
      );
      await fetchData();
    } catch (err) {
      showToast?.(`Scan failed: ${err.message}`, "error");
    } finally {
      setScanning(false);
    }
  };

  const handleSendSingle = async (item, messageToSend) => {
    setSendingSingle(true);
    try {
      const res = await api.sendSingleReminder({
        to: item.customerPhone,
        customerName: item.customerName,
        message: messageToSend || item.message,
        type: item.type,
        referenceId: item.referenceId,
        vehicleReg: item.vehicleReg
      });
      showToast?.(res.message || "Reminder dispatched!", "success");
      setPreviewItem(null);
      await fetchData();
    } catch (err) {
      showToast?.(`Failed to send: ${err.message}`, "error");
    } finally {
      setSendingSingle(false);
    }
  };

  // Filter candidates by search and subTab
  const filteredCandidates = candidates.filter((cand) => {
    if (activeSubTab === "insurance" && cand.type !== "insurance_renewal") return false;
    if (activeSubTab === "permit" && cand.type !== "permit_renewal") return false;
    if (activeSubTab === "due" && cand.type !== "payment_due") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (cand.customerName && cand.customerName.toLowerCase().includes(q)) ||
      (cand.customerPhone && cand.customerPhone.includes(q)) ||
      (cand.vehicleReg && cand.vehicleReg.toLowerCase().includes(q))
    );
  });

  const insuranceCount = candidates.filter((c) => c.type === "insurance_renewal").length;
  const permitCount = candidates.filter((c) => c.type === "permit_renewal").length;
  const dueCount = candidates.filter((c) => c.type === "payment_due").length;
  const criticalCount = candidates.filter((c) => c.daysLeft !== null && c.daysLeft <= 3).length;

  return (
    <div className="reminders-view-wrap">
      {/* Workspace Header */}
      <div className="view-header" style={{ marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 className="view-title" style={{ margin: 0 }}>
              WhatsApp Reminders & Automations
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 9px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: configStatus?.isConfigured
                  ? "rgba(22, 163, 74, 0.12)"
                  : "rgba(37, 99, 235, 0.12)",
                color: configStatus?.isConfigured ? "#15803d" : "#2563eb",
                border: `1px solid ${configStatus?.isConfigured ? "rgba(22, 163, 74, 0.3)" : "rgba(37, 99, 235, 0.3)"}`
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: configStatus?.isConfigured ? "#16a34a" : "#3b82f6"
                }}
              />
              {configStatus?.isConfigured ? "Meta Cloud API Live" : "Simulation & 1-Click Ready"}
            </span>
          </div>
          <p className="view-subtitle" style={{ marginTop: "4px" }}>
            Automated daily reminder engine for expiring insurance, permits, and payment balances. Dispatches in background and provides 1-click WhatsApp messaging.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchData}
            disabled={loading}
            title="Refresh records"
          >
            <RotateCw size={13} className={loading ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleRunAutoScan}
            disabled={scanning}
            style={{
              background: "#16a34a",
              borderColor: "#15803d",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Sparkles size={14} />
            <span>{scanning ? "Running Auto Scan..." : "⚡ Run Auto Scan Now"}</span>
          </button>
        </div>
      </div>

      {/* Scheduler Info Box */}
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={18} color="#15803d" />
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#14532d" }}>
              Daily Automated Background Scheduler: Active
            </div>
            <div style={{ fontSize: "0.78rem", color: "#166534" }}>
              Runs automatically every morning at <strong>09:00 AM</strong> to scan expiring policies and dues. Audit logs are preserved in MongoDB.
            </div>
          </div>
        </div>

        {!configStatus?.isConfigured && (
          <div
            style={{
              fontSize: "0.78rem",
              background: "#ffffff",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              color: "#475569"
            }}
          >
            💡 <em>Meta API keys not yet added in <code>.env</code>. Messages run in simulation mode + instant 1-click WhatsApp Web button works immediately!</em>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "16px"
        }}
      >
        <div className="metric-card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            TOTAL PENDING REMINDERS
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
            {candidates.length}
          </div>
          <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "2px" }}>
            Within next {thresholdDays} days
          </div>
        </div>

        <div className="metric-card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            CRITICAL (≤ 3 DAYS / EXPIRED)
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: "0.74rem", color: "#dc2626", marginTop: "2px" }}>
            Needs immediate attention
          </div>
        </div>

        <div className="metric-card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            INSURANCE RENEWALS
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
            {insuranceCount}
          </div>
          <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "2px" }}>
            Vehicles needing renewal
          </div>
        </div>

        <div className="metric-card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            PAYMENT DUES
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#d97706", marginTop: "4px" }}>
            {dueCount}
          </div>
          <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "2px" }}>
            Customers with pending balance
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "14px",
          background: "#ffffff",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid var(--border-default)"
        }}
      >
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveSubTab("all")}
            className={`btn btn-sm ${activeSubTab === "all" ? "btn-primary" : "btn-secondary"}`}
          >
            All Pending ({candidates.length})
          </button>
          <button
            onClick={() => setActiveSubTab("insurance")}
            className={`btn btn-sm ${activeSubTab === "insurance" ? "btn-primary" : "btn-secondary"}`}
          >
            <Shield size={13} style={{ marginRight: "4px" }} />
            Insurance ({insuranceCount})
          </button>
          <button
            onClick={() => setActiveSubTab("permit")}
            className={`btn btn-sm ${activeSubTab === "permit" ? "btn-primary" : "btn-secondary"}`}
          >
            <FileText size={13} style={{ marginRight: "4px" }} />
            Permits ({permitCount})
          </button>
          <button
            onClick={() => setActiveSubTab("due")}
            className={`btn btn-sm ${activeSubTab === "due" ? "btn-primary" : "btn-secondary"}`}
          >
            <DollarSign size={13} style={{ marginRight: "4px" }} />
            Payment Dues ({dueCount})
          </button>
          <button
            onClick={() => setActiveSubTab("logs")}
            className={`btn btn-sm ${activeSubTab === "logs" ? "btn-primary" : "btn-secondary"}`}
          >
            <Clock size={13} style={{ marginRight: "4px" }} />
            Audit Logs ({logs.length})
          </button>
        </div>

        {activeSubTab !== "logs" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search name, vehicle, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "6px 10px 6px 30px",
                  fontSize: "0.82rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border-default)",
                  outline: "none",
                  width: "200px"
                }}
              />
            </div>

            <select
              value={thresholdDays}
              onChange={(e) => setThresholdDays(Number(e.target.value))}
              style={{
                padding: "6px 10px",
                fontSize: "0.82rem",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                background: "#ffffff",
                cursor: "pointer"
              }}
            >
              <option value="3">Within 3 Days</option>
              <option value="7">Within 7 Days</option>
              <option value="15">Within 15 Days</option>
              <option value="30">Within 30 Days</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content: Candidates Table vs Audit Logs */}
      {activeSubTab === "logs" ? (
        /* Audit Logs Table */
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Recipient Phone</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Channel</th>
                <th>Message Snippet</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No automated reminder logs recorded yet. Click "⚡ Run Auto Scan Now" to generate initial dispatches.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id || log._id}>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(log.sentAt || log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td>
                      <span className="status-badge status-neutral" style={{ fontSize: "0.75rem" }}>
                        {log.type?.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.recipientName || "-"}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>+{log.recipientPhone}</td>
                    <td style={{ fontWeight: 600 }}>{log.vehicleReg || "-"}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: log.status === "sent" ? "rgba(22, 163, 74, 0.12)" : "rgba(59, 130, 246, 0.12)",
                          color: log.status === "sent" ? "#16a34a" : "#2563eb",
                          border: `1px solid ${log.status === "sent" ? "rgba(22, 163, 74, 0.3)" : "rgba(59, 130, 246, 0.3)"}`
                        }}
                      >
                        {log.status === "sent" ? "Sent" : "Simulated"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {log.channel === "whatsapp_cloud_api" ? "Meta Cloud API" : "Simulated / Dev"}
                    </td>
                    <td
                      style={{
                        maxWidth: "280px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)"
                      }}
                      title={log.message}
                    >
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Candidates Table */
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Category</th>
                <th>Vehicle Reg</th>
                <th>Phone</th>
                <th>Expiry / Due</th>
                <th>Urgency</th>
                <th>Amount</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    <CheckCircle2 size={32} color="#16a34a" style={{ margin: "0 auto 10px", display: "block" }} />
                    <strong>No upcoming expiries or dues found for this filter.</strong>
                    <p style={{ margin: "6px 0 0", fontSize: "0.82rem" }}>
                      All vehicle policies and dues are up to date!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <tr key={cand.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {cand.customerName || "Customer"}
                      </div>
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={{
                          fontSize: "0.75rem",
                          background:
                            cand.type === "insurance_renewal"
                              ? "rgba(37, 99, 235, 0.08)"
                              : cand.type === "permit_renewal"
                              ? "rgba(124, 58, 237, 0.08)"
                              : "rgba(217, 119, 6, 0.08)",
                          color:
                            cand.type === "insurance_renewal"
                              ? "#2563eb"
                              : cand.type === "permit_renewal"
                              ? "#7c3aed"
                              : "#d97706",
                          border: "1px solid currentColor"
                        }}
                      >
                        {cand.category}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {cand.vehicleReg}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: "0.82rem" }}>
                          {cand.customerPhone || <em style={{ color: "var(--text-muted)" }}>No Phone</em>}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.82rem" }}>{cand.expiryDate}</span>
                    </td>

                    <td>
                      {cand.urgency === "expired" ? (
                        <span className="status-badge" style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" }}>
                          <AlertTriangle size={11} style={{ marginRight: "3px" }} />
                          Expired
                        </span>
                      ) : cand.urgency === "critical" ? (
                        <span className="status-badge" style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d" }}>
                          <Clock size={11} style={{ marginRight: "3px" }} />
                          {cand.daysLeft}d left
                        </span>
                      ) : cand.daysLeft !== null ? (
                        <span className="status-badge status-neutral">
                          {cand.daysLeft} days
                        </span>
                      ) : (
                        <span className="status-badge status-warning">
                          Due
                        </span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, fontSize: "0.82rem", color: cand.dueAmount > 0 ? "#dc2626" : "var(--text-muted)" }}>
                        {cand.dueAmount > 0 ? `₹${cand.dueAmount.toLocaleString("en-IN")}` : "₹0"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        {/* 1-Click WhatsApp Button (Instant deep link) */}
                        {cand.customerPhone && (
                          <a
                            href={cand.waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{
                              background: "#25D366",
                              color: "#ffffff",
                              borderColor: "#22bf5b",
                              padding: "4px 8px",
                              fontSize: "0.76rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "none"
                            }}
                            title="Open in WhatsApp Web / App"
                          >
                            <MessageSquare size={12} />
                            <span>WhatsApp</span>
                            <ExternalLink size={10} />
                          </a>
                        )}

                        {/* Preview & Edit Modal */}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.76rem" }}
                          onClick={() => {
                            setPreviewItem(cand);
                            setCustomMessage(cand.message);
                          }}
                          title="Preview or Edit Reminder Text"
                        >
                          Preview
                        </button>

                        {/* Auto-Send via API or Simulator */}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.76rem" }}
                          onClick={() => handleSendSingle(cand, cand.message)}
                          title="Dispatch Reminder via Backend"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Preview & Customizer Modal */}
      {previewItem && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "560px", width: "90%" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageSquare size={18} color="#16a34a" />
                <h3 className="modal-title">WhatsApp Reminder Preview</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setPreviewItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: "16px 20px" }}>
              <div
                style={{
                  background: "var(--bg-app)",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  marginBottom: "14px",
                  fontSize: "0.82rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Recipient: </span>
                  <strong>{previewItem.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Phone: </span>
                  <strong>+{previewItem.customerPhone}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Vehicle: </span>
                  <strong>{previewItem.vehicleReg}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Type: </span>
                  <strong>{previewItem.category}</strong>
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "var(--text-primary)"
                }}
              >
                Message Text (Editable):
              </label>
              <textarea
                rows="9"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border-default)",
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "0.74rem",
                  color: "var(--text-muted)"
                }}
              >
                💡 Includes professional Hindi greeting, vehicle number, expiry alert, and agency details.
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 20px"
              }}
            >
              <a
                href={`https://wa.me/${previewItem.customerPhone ? previewItem.customerPhone.replace(/\D/g, "") : ""}?text=${encodeURIComponent(customMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  background: "#25D366",
                  color: "#ffffff",
                  borderColor: "#22bf5b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none"
                }}
              >
                <MessageSquare size={14} />
                <span>Open in WhatsApp Web</span>
                <ExternalLink size={12} />
              </a>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreviewItem(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSendSingle(previewItem, customMessage)}
                  disabled={sendingSingle}
                >
                  <Send size={14} style={{ marginRight: "4px" }} />
                  <span>{sendingSingle ? "Dispatching..." : "Dispatch via Backend"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
