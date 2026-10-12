import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare
} from "lucide-react";

export default function CustomersView({
  customers = [],
  insurances = [],
  permits = [],
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterService, setFilterService] = useState("All");
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  // Financial aggregates across all customers
  const totalCustomers = customers.length;
  const totalBilled = customers.reduce((sum, c) => sum + (Number(c.financials?.combinedTotal ?? c.totalAmount) || 0), 0);
  const totalCollected = customers.reduce((sum, c) => sum + (Number(c.financials?.combinedPaid ?? c.paidAmount) || 0), 0);
  const totalDue = customers.reduce((sum, c) => sum + (Number(c.financials?.combinedDue ?? c.dueAmount) || 0), 0);
  const customersWithDue = customers.filter(
    (c) => (Number(c.financials?.combinedDue ?? c.dueAmount) || 0) > 0
  ).length;

  const toggleExpand = (id) => {
    setExpandedCustomerId(expandedCustomerId === id ? null : id);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();

    // Find linked services for this customer
    const cleanPhone = (c.phone || "").trim().toLowerCase();
    const custIns = c.linkedServices?.insurances ?? insurances.filter(
      (i) => (i.customerPhone && i.customerPhone.trim().toLowerCase() === cleanPhone) || i.customerId === c.id
    );
    const custPerm = c.linkedServices?.permits ?? permits.filter(
      (p) => (p.customerPhone && p.customerPhone.trim().toLowerCase() === cleanPhone) || p.customerId === c.id
    );

    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q)) ||
      custIns.some((i) => i.vehicleReg?.toLowerCase().includes(q) || i.policyNumber?.toLowerCase().includes(q)) ||
      custPerm.some((p) => p.vehicleReg?.toLowerCase().includes(q) || p.permitNumber?.toLowerCase().includes(q));

    const combinedDue = Number(c.financials?.combinedDue ?? c.dueAmount) || 0;
    const combinedTotal = Number(c.financials?.combinedTotal ?? c.totalAmount) || 0;
    const combinedPaid = Number(c.financials?.combinedPaid ?? c.paidAmount) || 0;

    let matchesPayment = true;
    if (filterPayment === "Due") {
      matchesPayment = combinedDue > 0;
    } else if (filterPayment === "Paid") {
      matchesPayment = combinedTotal > 0 && combinedDue === 0;
    } else if (filterPayment === "Partial") {
      matchesPayment = combinedPaid > 0 && combinedDue > 0;
    }

    let matchesService = true;
    if (filterService === "Insurance") {
      matchesService = custIns.length > 0;
    } else if (filterService === "Permit") {
      matchesService = custPerm.length > 0;
    } else if (filterService === "Multiple") {
      matchesService = custIns.length > 0 && custPerm.length > 0;
    }

    return matchesSearch && matchesPayment && matchesService;
  });

  return (
    <div>
      {/* Uniform Workspace Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Customer Directory & Linked Services</h1>
          <p className="view-subtitle">
            Customer mobile number is the primary key linking all vehicle insurances, commercial permits, and outstanding payment accounts.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onAddCustomer}>
          <Plus size={14} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "16px"
        }}
      >
        <div className="metric-card" style={{ padding: "14px 16px" }}>
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Total Registered Customers</span>
            <div className="metric-icon-wrap">
              <Users size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: "1.4rem" }}>
            {totalCustomers}
          </div>
          <div className="metric-caption">
            {customersWithDue > 0 ? `${customersWithDue} accounts with pending dues` : "All accounts clear"}
          </div>
        </div>

        <div className="metric-card" style={{ padding: "14px 16px" }}>
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Total Services Billed</span>
            <div className="metric-icon-wrap">
              <IndianRupee size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: "1.4rem" }}>
            ₹{totalBilled.toLocaleString("en-IN")}
          </div>
          <div className="metric-caption">Combined charges (Direct + Policies + Permits)</div>
        </div>

        <div className="metric-card" style={{ padding: "14px 16px" }}>
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Total Payments Received</span>
            <div className="metric-icon-wrap" style={{ color: "var(--color-success, #16a34a)" }}>
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: "1.4rem", color: "var(--color-success, #16a34a)" }}>
            ₹{totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="metric-caption">Total client collections across all services</div>
        </div>

        <div
          className="metric-card"
          style={{
            padding: "14px 16px",
            borderLeft: totalDue > 0 ? "3px solid var(--color-danger, #dc2626)" : "1px solid var(--border-default)"
          }}
        >
          <div className="metric-top" style={{ marginBottom: "6px" }}>
            <span className="metric-label">Combined Outstanding Dues</span>
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
            {customersWithDue} customer{customersWithDue === 1 ? "" : "s"} with unpaid balance
          </div>
        </div>
      </div>

      {/* Uniform Search and Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by customer phone, name, vehicle reg, policy no, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "170px" }}
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
        >
          <option value="All">All Opted Services</option>
          <option value="Insurance">Has Insurance Policies</option>
          <option value="Permit">Has Transport Permits</option>
          <option value="Multiple">Opted for Multiple Services</option>
        </select>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "170px" }}
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
        >
          <option value="All">All Payment Accounts</option>
          <option value="Due">Pending Dues Only ({customersWithDue})</option>
          <option value="Partial">Partially Paid</option>
          <option value="Paid">Fully Paid</option>
        </select>
      </div>

      {/* Uniform Table Card */}
      <div className="table-card">
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={20} />
            </div>
            <h3 className="empty-state-title">No Matching Customers Found</h3>
            <p className="empty-state-desc">
              {customers.length === 0
                ? "No customer accounts exist yet. Click '+ Add Customer' to register a customer."
                : "No customer records match your active search, service, or payment filter criteria."}
            </p>
            {customers.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={onAddCustomer}>
                <Plus size={13} />
                <span>Add First Customer</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Primary Customer Mobile & Name</th>
                  <th>Opted Services</th>
                  <th>Location</th>
                  <th>Total Billed</th>
                  <th>Paid Amount</th>
                  <th>Due Balance</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => {
                  const cleanPhone = (c.phone || "").trim().toLowerCase();
                  const custIns = c.linkedServices?.insurances ?? insurances.filter(
                    (i) => (i.customerPhone && i.customerPhone.trim().toLowerCase() === cleanPhone) || i.customerId === c.id
                  );
                  const custPerm = c.linkedServices?.permits ?? permits.filter(
                    (p) => (p.customerPhone && p.customerPhone.trim().toLowerCase() === cleanPhone) || p.customerId === c.id
                  );

                  const combinedTotal = Number(c.financials?.combinedTotal ?? c.totalAmount) || 0;
                  const combinedPaid = Number(c.financials?.combinedPaid ?? c.paidAmount) || 0;
                  const combinedDue = Number(c.financials?.combinedDue ?? c.dueAmount) || 0;

                  const isExpanded = expandedCustomerId === c.id;
                  const totalServicesCount = custIns.length + custPerm.length;

                  return (
                    <React.Fragment key={c.id}>
                      <tr>
                        {/* Primary Customer Phone & Name */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontWeight: 700,
                                fontSize: "0.88rem",
                                color: "var(--brand-primary)"
                              }}
                            >
                              {c.phone}
                            </span>
                            <span
                              style={{
                                fontSize: "0.68rem",
                                background: "rgba(14, 165, 233, 0.12)",
                                color: "var(--brand-primary)",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                fontWeight: 700
                              }}
                            >
                              PRIMARY
                            </span>
                          </div>

                          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                            {c.name}
                          </div>

                          {c.email && (
                            <div
                              style={{
                                fontSize: "0.74rem",
                                color: "var(--text-light, #94a3b8)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "1px"
                              }}
                            >
                              <Mail size={10} />
                              <span>{c.email}</span>
                            </div>
                          )}
                        </td>

                        {/* Opted Services Badges */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
                              {custIns.length > 0 && (
                                <span
                                  className="status-badge"
                                  style={{
                                    background: "rgba(37, 99, 235, 0.1)",
                                    color: "#2563eb",
                                    border: "1px solid rgba(37, 99, 235, 0.2)",
                                    fontSize: "0.72rem",
                                    padding: "2px 6px"
                                  }}
                                >
                                  <Shield size={10} style={{ marginRight: "3px" }} />
                                  {custIns.length} Insurance{custIns.length > 1 ? "s" : ""}
                                </span>
                              )}

                              {custPerm.length > 0 && (
                                <span
                                  className="status-badge"
                                  style={{
                                    background: "rgba(147, 51, 234, 0.1)",
                                    color: "#9333ea",
                                    border: "1px solid rgba(147, 51, 234, 0.2)",
                                    fontSize: "0.72rem",
                                    padding: "2px 6px"
                                  }}
                                >
                                  <FileText size={10} style={{ marginRight: "3px" }} />
                                  {custPerm.length} Permit{custPerm.length > 1 ? "s" : ""}
                                </span>
                              )}

                              {totalServicesCount === 0 && (
                                <span style={{ color: "var(--text-light)", fontSize: "0.76rem" }}>
                                  No linked policies
                                </span>
                              )}
                            </div>

                            {totalServicesCount > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(c.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--brand-primary)",
                                  fontSize: "0.73rem",
                                  cursor: "pointer",
                                  padding: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  fontWeight: 600
                                }}
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Hide Opted Services</span>
                                    <ChevronUp size={11} />
                                  </>
                                ) : (
                                  <>
                                    <span>View {totalServicesCount} Opted Services</span>
                                    <ChevronDown size={11} />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td>
                          {c.address ? (
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <MapPin size={12} color="var(--text-muted)" />
                              <span>{c.address}</span>
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>-</span>
                          )}
                        </td>

                        {/* Total Charges Billed */}
                        <td>
                          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                            ₹{combinedTotal.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Paid Amount */}
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              color: combinedPaid > 0 ? "var(--color-success, #16a34a)" : "var(--text-muted)"
                            }}
                          >
                            ₹{combinedPaid.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Due Payment */}
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.86rem",
                              color: combinedDue > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)"
                            }}
                          >
                            {combinedDue > 0 ? `₹${combinedDue.toLocaleString("en-IN")}` : "₹0 (Cleared)"}
                          </span>
                        </td>

                        {/* Payment Status Badge */}
                        <td>
                          {combinedDue === 0 && combinedTotal > 0 ? (
                            <span className="status-badge status-active">
                              <CheckCircle2 size={11} style={{ marginRight: "3px" }} />
                              Paid
                            </span>
                          ) : combinedPaid > 0 && combinedDue > 0 ? (
                            <span className="status-badge status-warning">
                              <Clock size={11} style={{ marginRight: "3px" }} />
                              Partial
                            </span>
                          ) : combinedDue > 0 ? (
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

                        {/* Actions */}
                        <td className="action-cell">
                          <div className="action-group">
                            {(() => {
                              const rawPhone = (c.phone || "").replace(/\D/g, "");
                              const fullPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                              const text = combinedDue > 0
                                ? `नमस्ते ${c.name || "ग्राहक"},\n\nगुरूकृपा यातायात से सादर प्रणाम। 🙏\nआपके खाते में सेवा/पॉलिसी शुल्क के रूप में *₹${combinedDue}* का बकाया शेष है।\nकृपया असुविधा से बचने हेतु बकाया राशि का भुगतान करें।\n\nधन्यवाद,\nगुरूकृपा यातायात`
                                : `नमस्ते ${c.name || "ग्राहक"},\n\nगुरूकृपा यातायात से सादर प्रणाम। 🙏\nकिसी भी RTO कार्य, बीमा नवीनीकरण अथवा वाहन सेवा हेतु संपर्क करें।\n\nगुरूकृपा यातायात सेवा केन्द्र`;
                              return fullPhone ? (
                                <a
                                  href={`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-icon-btn"
                                  style={{ color: "#16a34a" }}
                                  title={combinedDue > 0 ? "Send WhatsApp Due Reminder" : "Open WhatsApp Chat"}
                                >
                                  <MessageSquare size={13} />
                                </a>
                              ) : null;
                            })()}
                            <button
                              className="action-icon-btn"
                              onClick={() => onEditCustomer(c)}
                              title="Edit Customer Details"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="action-icon-btn action-icon-danger"
                              onClick={() => onDeleteCustomer(c.id, c.name)}
                              title="Delete Customer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Opted Services Drawer */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={8}
                            style={{
                              background: "var(--bg-subtle, #f8fafc)",
                              padding: "16px 20px",
                              borderTop: "1px solid var(--border-default)",
                              borderBottom: "1px solid var(--border-default)"
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                  Opted Services for {c.name} ({c.phone})
                                </div>
                                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                                  Direct Fee: ₹{(Number(c.totalAmount) || 0).toLocaleString("en-IN")} • Combined Dues: ₹{combinedDue.toLocaleString("en-IN")}
                                </div>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                                {/* Insurance Policies Card */}
                                <div
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid var(--border-default)",
                                    borderRadius: "6px",
                                    padding: "12px"
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      color: "#2563eb",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      marginBottom: "8px"
                                    }}
                                  >
                                    <Shield size={13} />
                                    <span>Vehicle Insurance Policies ({custIns.length})</span>
                                  </div>

                                  {custIns.length === 0 ? (
                                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                                      No insurance policies registered for this customer phone.
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      {custIns.map((ins) => (
                                        <div
                                          key={ins.id}
                                          style={{
                                            fontSize: "0.76rem",
                                            padding: "6px 8px",
                                            background: "var(--bg-subtle)",
                                            borderRadius: "4px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                          }}
                                        >
                                          <div>
                                            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                                              {ins.vehicleReg}
                                            </span>
                                            <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>
                                              Pol: {ins.policyNumber} ({ins.insuranceCompany})
                                            </span>
                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                              Exp: {ins.expiryDate}
                                            </div>
                                          </div>

                                          <div style={{ textAlign: "right" }}>
                                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                              ₹{(Number(ins.totalAmount) || Number(ins.premiumAmount) || 0).toLocaleString("en-IN")}
                                            </div>
                                            <div
                                              style={{
                                                fontSize: "0.7rem",
                                                fontWeight: 700,
                                                color: (Number(ins.dueAmount) || 0) > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)"
                                              }}
                                            >
                                              {(Number(ins.dueAmount) || 0) > 0 ? `₹${(Number(ins.dueAmount)).toLocaleString("en-IN")} Due` : "Paid"}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Transport Permits Card */}
                                <div
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid var(--border-default)",
                                    borderRadius: "6px",
                                    padding: "12px"
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      color: "#9333ea",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      marginBottom: "8px"
                                    }}
                                  >
                                    <FileText size={13} />
                                    <span>Commercial Permits ({custPerm.length})</span>
                                  </div>

                                  {custPerm.length === 0 ? (
                                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                                      No transport permits registered for this customer phone.
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      {custPerm.map((perm) => (
                                        <div
                                          key={perm.id}
                                          style={{
                                            fontSize: "0.76rem",
                                            padding: "6px 8px",
                                            background: "var(--bg-subtle)",
                                            borderRadius: "4px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                          }}
                                        >
                                          <div>
                                            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                                              {perm.vehicleReg}
                                            </span>
                                            <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>
                                              Permit: {perm.permitNumber} ({perm.permitType})
                                            </span>
                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                              Exp: {perm.expiryDate}
                                            </div>
                                          </div>

                                          <div style={{ textAlign: "right" }}>
                                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                              ₹{(Number(perm.totalAmount) || Number(perm.authFeePaid) || 0).toLocaleString("en-IN")}
                                            </div>
                                            <div
                                              style={{
                                                fontSize: "0.7rem",
                                                fontWeight: 700,
                                                color: (Number(perm.dueAmount) || 0) > 0 ? "var(--color-danger, #dc2626)" : "var(--color-success, #16a34a)"
                                              }}
                                            >
                                              {(Number(perm.dueAmount) || 0) > 0 ? `₹${(Number(perm.dueAmount)).toLocaleString("en-IN")} Due` : "Paid"}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
