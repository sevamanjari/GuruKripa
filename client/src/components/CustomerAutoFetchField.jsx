import React, { useState, useEffect, useRef } from "react";
import { Phone, CheckCircle2, UserPlus, Search, X, UserCheck } from "lucide-react";

export default function CustomerAutoFetchField({
  phone = "",
  name = "",
  onPhoneChange,
  onNameChange,
  onCustomerSelect,
  customers = [],
  required = true
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  const cleanPhone = (phone || "").replace(/\D/g, "");

  // Find exact match (either exact string or normalized digits)
  const matchedCustomer = customers.find((c) => {
    if (!c.phone) return false;
    const cClean = c.phone.replace(/\D/g, "");
    return cClean === cleanPhone && cleanPhone.length >= 7;
  });

  // Filter matching suggestions while typing (at least 2 digits)
  const suggestions = cleanPhone.length >= 2 && !matchedCustomer
    ? customers
        .filter((c) => {
          if (!c.phone) return false;
          const cClean = c.phone.replace(/\D/g, "");
          return cClean.includes(cleanPhone) || (c.name && c.name.toLowerCase().includes(phone.toLowerCase()));
        })
        .slice(0, 5)
    : [];

  // Close suggestions popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (val) => {
    onPhoneChange(val);
    setShowSuggestions(true);

    // Auto-fetch if exact digits match an existing customer
    const valClean = val.replace(/\D/g, "");
    const directMatch = customers.find((c) => {
      if (!c.phone) return false;
      return c.phone.replace(/\D/g, "") === valClean && valClean.length >= 7;
    });

    if (directMatch) {
      if (directMatch.name) onNameChange(directMatch.name);
      if (onCustomerSelect) onCustomerSelect(directMatch);
    }
  };

  const handleSelectSuggestion = (c) => {
    onPhoneChange(c.phone || "");
    if (c.name) onNameChange(c.name);
    if (onCustomerSelect) onCustomerSelect(c);
    setShowSuggestions(false);
  };

  const handleClearPhone = () => {
    onPhoneChange("");
    if (onCustomerSelect) onCustomerSelect(null);
    setShowSuggestions(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        padding: "12px 14px",
        borderRadius: "8px",
        background: "var(--bg-subtle, #f1f5f9)",
        border: "1px solid var(--border-default, #e2e8f0)",
        marginBottom: "14px",
        position: "relative"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }}
      >
        <span
          style={{
            fontSize: "0.76rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--brand-primary)",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <Phone size={13} />
          <span>Customer Mobile (Auto-Fetch by Number)</span>
        </span>

        {cleanPhone.length >= 7 && (
          <div>
            {matchedCustomer ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#16a34a",
                  background: "rgba(22, 163, 74, 0.12)",
                  padding: "2px 7px",
                  borderRadius: "999px"
                }}
              >
                <CheckCircle2 size={11} />
                <span>Existing Customer Found</span>
              </span>
            ) : cleanPhone.length === 10 ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#0284c7",
                  background: "rgba(2, 132, 199, 0.12)",
                  padding: "2px 7px",
                  borderRadius: "999px"
                }}
              >
                <UserPlus size={11} />
                <span>New Customer (Auto-registers)</span>
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "10px" }}>
        {/* Phone Input with Search & Clear */}
        <div className="form-group" style={{ marginBottom: 0, position: "relative" }}>
          <label className="form-label" style={{ fontSize: "0.76rem" }}>
            Mobile Number *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="tel"
              className="form-input"
              required={required}
              placeholder="Type 10-digit mobile..."
              value={phone}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              style={{
                paddingRight: phone ? "28px" : "10px",
                fontFamily: cleanPhone.length >= 7 ? "monospace" : "inherit",
                fontWeight: cleanPhone.length >= 7 ? 600 : "normal"
              }}
            />
            {phone && (
              <button
                type="button"
                onClick={handleClearPhone}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-light)",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Clear number"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Instant Auto-Search Dropdown Popover */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                background: "#ffffff",
                border: "1px solid var(--border-default, #e2e8f0)",
                borderRadius: "6px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                zIndex: 50,
                overflow: "hidden",
                maxHeight: "220px",
                overflowY: "auto"
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  padding: "5px 10px",
                  background: "var(--bg-subtle, #f8fafc)",
                  borderBottom: "1px solid var(--border-default, #e2e8f0)",
                  color: "var(--text-muted)",
                  fontWeight: 600
                }}
              >
                Matching Customers ({suggestions.length})
              </div>
              {suggestions.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectSuggestion(c)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-default, #f1f5f9)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "background 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--brand-primary)", fontFamily: "monospace" }}>
                      {c.phone}
                    </div>
                  </div>
                  {c.address && (
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {c.address}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Name Input (Auto-filled on phone match) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: "0.76rem" }}>
            Customer Name * {matchedCustomer ? "(Auto-Fetched)" : ""}
          </label>
          <input
            type="text"
            className="form-input"
            required={required}
            placeholder="Auto-filled or enter name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            style={{
              borderColor: matchedCustomer ? "#86efac" : undefined,
              background: matchedCustomer ? "rgba(240, 253, 244, 0.5)" : undefined
            }}
          />
        </div>
      </div>

      {/* Matched Customer Context Helper Banner */}
      {matchedCustomer && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "0.73rem",
            color: "#166534",
            background: "#dcfce7",
            padding: "5px 9px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span>
            Linked to profile <strong>{matchedCustomer.name}</strong>
            {matchedCustomer.address ? ` (${matchedCustomer.address})` : ""}
          </span>
          <span style={{ fontSize: "0.7rem", color: "#15803d" }}>
            {matchedCustomer.linkedServices?.totalCount
              ? `${matchedCustomer.linkedServices.totalCount} active service(s)`
              : "Account verified"}
          </span>
        </div>
      )}
    </div>
  );
}
