import React, { useState } from "react";
import { X, Building2, Plus, Trash2, Phone, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UnderwriterManageModal({
  isOpen,
  onClose,
  underwriters = [],
  onCreateUnderwriter,
  onDeleteUnderwriter
}) {
  const [formData, setFormData] = useState({
    name: "",
    agencyCode: "",
    phone: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Please enter the insurance underwriter / company name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await onCreateUnderwriter(formData);
      setSuccessMsg(`Underwriter '${formData.name.trim()}' added successfully!`);
      setFormData({ name: "", agencyCode: "", phone: "", notes: "" });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to add underwriter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove underwriter '${name}' from your list of dealings?`)) return;
    try {
      await onDeleteUnderwriter(id);
    } catch (err) {
      setErrorMsg(err.message || "Failed to remove underwriter.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "620px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Building2 size={18} color="var(--brand-primary)" />
            <div>
              <h3 className="modal-title">Insurance Underwriters & Company Dealings</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Manage the insurance companies and agency tie-ups your transport office works with.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: "auto", padding: "18px 20px" }}>
          {/* Feedback banners */}
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--badge-danger-bg)",
                border: "1px solid var(--badge-danger-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--badge-danger-text)",
                fontSize: "0.82rem",
                marginBottom: "14px"
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--badge-success-bg)",
                border: "1px solid var(--badge-success-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--badge-success-text)",
                fontSize: "0.82rem",
                marginBottom: "14px"
              }}
            >
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick-add form box */}
          <div
            style={{
              padding: "14px 16px",
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              marginBottom: "18px"
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
              + Add New Underwriter / Company
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>
                    Company / Underwriter Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Tata AIG, Go Digit, Shriram, ICICI"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>
                    Agency / Broker / POSP Code
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AGNT-9821 / POSP-10"
                    value={formData.agencyCode}
                    onChange={(e) => setFormData({ ...formData, agencyCode: e.target.value })}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>
                    Contact Phone / Desk
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 9826012345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>
                    Dealings & Policy Notes
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Commercial goods vehicle 15% discount"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                  style={{ gap: "6px" }}
                >
                  <Plus size={14} />
                  <span>{isSubmitting ? "Adding..." : "Register Underwriter"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Underwriters List Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Active Underwriters ({underwriters.length})
            </span>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Selectable across all policy forms
            </span>
          </div>

          {/* Underwriters List */}
          {underwriters.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 16px",
                border: "1px dashed var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-muted)",
                fontSize: "0.84rem"
              }}
            >
              <Building2 size={24} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
              <div>No underwriters registered yet.</div>
              <div style={{ fontSize: "0.76rem", marginTop: "4px" }}>
                Add your insurance agency partners and underwriting companies above to get started.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {underwriters.map((und) => (
                <div
                  key={und.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#ffffff",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    gap: "12px"
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                        {und.name}
                      </span>
                      {und.agencyCode && (
                        <span
                          className="status-badge status-neutral"
                          style={{ fontSize: "0.7rem", padding: "1px 6px" }}
                        >
                          Code: {und.agencyCode}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        fontSize: "0.76rem",
                        color: "var(--text-muted)",
                        marginTop: "3px",
                        flexWrap: "wrap"
                      }}
                    >
                      {und.phone && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={11} /> {und.phone}
                        </span>
                      )}
                      {und.notes && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FileText size={11} /> {und.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="action-pill-btn btn-danger"
                    title={`Delete underwriter ${und.name}`}
                    onClick={() => handleDelete(und.id, und.name)}
                    style={{ width: "28px", height: "28px", padding: 0 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: "1px solid var(--border-default)", padding: "12px 20px" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
