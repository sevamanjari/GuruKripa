import React from "react";
import {
  Truck,
  Users,
  Shield,
  FileText,
  LayoutDashboard,
  LogOut,
  UserCheck
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  counts,
  currentUser,
  onLogout
}) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
    { id: "customers", label: "Customers & RTO", shortLabel: "Customers", count: counts.customers, icon: Users },
    { id: "insurance", label: "Vehicle Insurance", shortLabel: "Insurance", count: counts.insurances, icon: Shield },
    { id: "permits", label: "Permits", shortLabel: "Permits", count: counts.permits, icon: FileText }
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="app-top-header">
        <div className="app-top-header-inner">
          {/* Brand */}
          <div
            className="navbar-brand"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="brand-logo-box">
              <Truck size={18} />
            </div>
            <div className="brand-text-wrap">
              <span className="brand-name">
                GuruKripa Yatayat
              </span>
              <span className="brand-badge-tag">
                RTO Operations
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="desktop-nav-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`desktop-tab-btn ${isActive ? "active" : ""}`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="tab-counter-badge">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Sign Out */}
          <div className="navbar-user-section">
            {currentUser && (
              <div className="user-profile-chip">
                <UserCheck size={14} color="var(--brand-primary)" className="user-chip-icon" />
                <div className="user-details-col">
                  <span className="user-name-text">
                    {currentUser.name || currentUser.username}
                  </span>
                  <span className="user-role-text">
                    {currentUser.role || "Staff"}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out of Session"
                  className="user-logout-btn"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible on Phones & Tablets <= 768px) */}
      <nav className="mobile-bottom-nav-bar" aria-label="Mobile Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-nav-btn ${isActive ? "active" : ""}`}
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={19} />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="mobile-counter-dot">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className="mobile-nav-label">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
