import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar.jsx";
import Toast from "./components/Toast.jsx";
import LoginView from "./components/LoginView.jsx";
import DashboardView from "./components/DashboardView.jsx";
import CustomersView from "./components/CustomersView.jsx";
import InsuranceView from "./components/InsuranceView.jsx";
import PermitsView from "./components/PermitsView.jsx";
import RemindersView from "./components/RemindersView.jsx";

import CustomerModal from "./components/Modals/CustomerModal.jsx";
import InsuranceModal from "./components/Modals/InsuranceModal.jsx";
import PermitModal from "./components/Modals/PermitModal.jsx";
import FitnessModal from "./components/Modals/FitnessModal.jsx";
import DrivingLicenceModal from "./components/Modals/DrivingLicenceModal.jsx";
import RenewModal from "./components/Modals/RenewModal.jsx";
import UnderwriterManageModal from "./components/Modals/UnderwriterManageModal.jsx";
import FitnessView from "./components/FitnessView.jsx";
import DrivingLicenceView from "./components/DrivingLicenceView.jsx";

import { api, authStorage, startClientKeepAlive } from "./services/api.js";

const VALID_TABS = ["dashboard", "customers", "insurance", "permits", "fitness", "driving-licences", "reminders"];

export default function App() {
  // Session & Authentication state
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!authStorage.getToken());
  const [isServerWaking, setIsServerWaking] = useState(false);

  // URL Hash route synchronization
  const getTabFromHash = () => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    return VALID_TABS.includes(hash) ? hash : "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [toast, setToast] = useState(null);

  // Data
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [permits, setPermits] = useState([]);
  const [fitnessList, setFitnessList] = useState([]);
  const [drivingLicences, setDrivingLicences] = useState([]);
  const [underwriters, setUnderwriters] = useState([]);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);

  const [isUnderwriterModalOpen, setIsUnderwriterModalOpen] = useState(false);

  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);

  const [isFitnessModalOpen, setIsFitnessModalOpen] = useState(false);
  const [editingFitness, setEditingFitness] = useState(null);

  const [isDrivingLicenceModalOpen, setIsDrivingLicenceModalOpen] = useState(false);
  const [editingDrivingLicence, setEditingDrivingLicence] = useState(null);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewingItem, setRenewingItem] = useState(null);
  const [renewType, setRenewType] = useState("insurance");

  const remindersCount = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expInsurances = (Array.isArray(insurances) ? insurances : []).filter((i) => {
      if (!i || !i.expiryDate) return false;
      const d = Math.ceil((new Date(i.expiryDate) - today) / (1000 * 60 * 60 * 24));
      return d <= 7 && d >= -15;
    }).length;
    const expPermits = (Array.isArray(permits) ? permits : []).filter((p) => {
      if (!p || !p.expiryDate) return false;
      const d = Math.ceil((new Date(p.expiryDate) - today) / (1000 * 60 * 60 * 24));
      return d <= 7 && d >= -15;
    }).length;
    const expFitness = (Array.isArray(fitnessList) ? fitnessList : []).filter((f) => {
      if (!f || !f.expiryDate) return false;
      const d = Math.ceil((new Date(f.expiryDate) - today) / (1000 * 60 * 60 * 24));
      return d <= 7 && d >= -15;
    }).length;
    const expDL = (Array.isArray(drivingLicences) ? drivingLicences : []).filter((dl) => {
      if (!dl || !dl.expiryDate) return false;
      const d = Math.ceil((new Date(dl.expiryDate) - today) / (1000 * 60 * 60 * 24));
      return d <= 7 && d >= -15;
    }).length;
    const dues = (Array.isArray(customers) ? customers : []).filter((c) => c && (c.dueAmount || 0) > 0).length;
    return expInsurances + expPermits + expFitness + expDL + dues;
  }, [insurances, permits, fitnessList, drivingLicences, customers]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Switch tab with URL hash update
  const handleTabChange = (tab) => {
    const target = VALID_TABS.includes(tab) ? tab : "dashboard";
    setActiveTab(target);
    window.location.hash = target;
  };

  // URL Edit Guard: Synchronize tab when user edits the address bar URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const target = getTabFromHash();
      setActiveTab(target);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Listen to unauthorized event from API calls
  useEffect(() => {
    const handleUnauthorized = (e) => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      showToast(e.detail || "Session expired. Please log in again.", "warning");
    };

    window.addEventListener("gurukripa_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("gurukripa_unauthorized", handleUnauthorized);
  }, []);

  // Client Keep-Alive (every 10m) & Cold-Start Wake-Up listener
  useEffect(() => {
    const cleanupKeepAlive = startClientKeepAlive();

    const handleServerWaking = (e) => {
      setIsServerWaking(!!e.detail?.isWaking);
    };

    window.addEventListener("gurukripa_server_waking", handleServerWaking);
    return () => {
      cleanupKeepAlive();
      window.removeEventListener("gurukripa_server_waking", handleServerWaking);
    };
  }, []);

  // Load data only when authenticated
  const loadAllData = useCallback(async () => {
    if (!authStorage.getToken()) return;

    try {
      const [dashRes, custRes, insRes, permRes, fitRes, dlRes, undRes] = await Promise.all([
        api.getDashboardStats(),
        api.getCustomers(),
        api.getInsurances(),
        api.getPermits(),
        api.getFitness(),
        api.getDrivingLicences(),
        api.getUnderwriters()
      ]);

      setStats(dashRes.stats);
      setCustomers(custRes.data || []);
      setInsurances(insRes.data || []);
      setPermits(permRes.data || []);
      setFitnessList(fitRes.data || []);
      setDrivingLicences(dlRes.data || []);
      setUnderwriters(undRes.data || []);
    } catch (err) {
      console.error("Failed to load application data:", err.message);
    }
  }, []);

  const refreshUnderwriters = async () => {
    try {
      const res = await api.getUnderwriters();
      setUnderwriters(res.data || []);
    } catch (err) {
      console.error("Failed to refresh underwriters:", err.message);
    }
  };

  const handleCreateUnderwriter = async (undData) => {
    const res = await api.createUnderwriter(undData);
    await refreshUnderwriters();
    return res;
  };

  const handleDeleteUnderwriter = async (id) => {
    await api.deleteUnderwriter(id);
    showToast("Underwriter removed.", "info");
    await refreshUnderwriters();
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // Login handler
  const handleLogin = async (username, password) => {
    const res = await api.login(username, password);
    setIsAuthenticated(true);
    setCurrentUser(res.user || {});
    showToast(`Signed in successfully as ${res.user?.name || res.user?.username || "Admin"}`);
    try {
      await loadAllData();
    } catch (e) {
      console.warn("Initial data load warning:", e);
    }
    window.location.hash = activeTab || "dashboard";
  };

  // Logout handler
  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setStats(null);
    setCustomers([]);
    setInsurances([]);
    setPermits([]);
    setFitnessList([]);
    setDrivingLicences([]);
    setUnderwriters([]);
    showToast("Signed out of session successfully.", "info");
  };

  // Customer CRUD
  const handleSaveCustomer = async (formData) => {
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
        showToast(`Customer '${formData.name}' updated!`);
      } else {
        await api.createCustomer(formData);
        showToast(`Customer '${formData.name}' added successfully!`);
      }
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      await loadAllData();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Delete customer entry for '${name}'?`)) return;
    try {
      await api.deleteCustomer(id);
      showToast(`Customer '${name}' deleted successfully`, "info");
      await loadAllData();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  // Insurance CRUD & Renew
  const handleSaveInsurance = async (formData) => {
    try {
      if (editingInsurance) {
        await api.updateInsurance(editingInsurance.id, formData);
        showToast(`Insurance policy updated!`);
      } else {
        await api.createInsurance(formData);
        showToast(`Insurance policy issued!`);
      }
      setIsInsuranceModalOpen(false);
      setEditingInsurance(null);
      await loadAllData();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleDeleteInsurance = async (id, policyNo) => {
    if (!window.confirm(`Delete insurance policy '${policyNo}'?`)) return;
    try {
      await api.deleteInsurance(id);
      showToast(`Policy '${policyNo}' deleted`, "info");
      await loadAllData();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleOpenRenewInsurance = (id) => {
    const item = insurances.find((i) => i.id === id);
    if (!item) return;
    setRenewingItem(item);
    setRenewType("insurance");
    setIsRenewModalOpen(true);
  };

  // Permit CRUD & Renew
  const handleSavePermit = async (formData) => {
    try {
      if (editingPermit) {
        await api.updatePermit(editingPermit.id, formData);
        showToast(`Permit updated!`);
      } else {
        await api.createPermit(formData);
        showToast(`Permit created!`);
      }
      setIsPermitModalOpen(false);
      setEditingPermit(null);
      await loadAllData();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleDeletePermit = async (id, permNo) => {
    if (!window.confirm(`Delete permit '${permNo}'?`)) return;
    try {
      await api.deletePermit(id);
      showToast(`Permit '${permNo}' deleted`, "info");
      await loadAllData();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleOpenRenewPermit = (id) => {
    const item = permits.find((p) => p.id === id);
    if (!item) return;
    setRenewingItem(item);
    setRenewType("permit");
    setIsRenewModalOpen(true);
  };

  // Fitness CRUD & Renew
  const handleSaveFitness = async (formData) => {
    try {
      if (editingFitness) {
        await api.updateFitness(editingFitness.id, formData);
        showToast("Fitness certificate updated successfully!");
      } else {
        await api.createFitness(formData);
        showToast("Fitness certificate saved successfully!");
      }
      setIsFitnessModalOpen(false);
      setEditingFitness(null);
      await loadAllData();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleDeleteFitness = async (id, vNo) => {
    if (!window.confirm(`Delete fitness record for '${vNo}'?`)) return;
    try {
      await api.deleteFitness(id);
      showToast(`Fitness record for '${vNo}' deleted`, "info");
      await loadAllData();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleOpenRenewFitness = (id) => {
    const item = fitnessList.find((f) => f.id === id);
    if (!item) return;
    setRenewingItem(item);
    setRenewType("fitness");
    setIsRenewModalOpen(true);
  };

  // Driving Licence CRUD & Renew
  const handleSaveDL = async (formData) => {
    try {
      if (editingDrivingLicence) {
        await api.updateDrivingLicence(editingDrivingLicence.id, formData);
        showToast("Driving licence updated successfully!");
      } else {
        await api.createDrivingLicence(formData);
        showToast("Driving licence recorded successfully!");
      }
      setIsDrivingLicenceModalOpen(false);
      setEditingDrivingLicence(null);
      await loadAllData();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleDeleteDL = async (id, custName) => {
    if (!window.confirm(`Delete driving licence for '${custName}'?`)) return;
    try {
      await api.deleteDrivingLicence(id);
      showToast(`Driving licence for '${custName}' deleted`, "info");
      await loadAllData();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleOpenRenewDL = (id) => {
    const item = drivingLicences.find((d) => d.id === id);
    if (!item) return;
    setRenewingItem(item);
    setRenewType("drivingLicence");
    setIsRenewModalOpen(true);
  };

  const handleConfirmRenewal = async (id, renewalData) => {
    try {
      if (renewType === "insurance") {
        await api.renewInsurance(id, renewalData);
        showToast(`Insurance renewed successfully! Previous term archived to history.`);
      } else if (renewType === "permit") {
        await api.renewPermit(id, renewalData);
        showToast(`Permit renewed successfully! Previous term archived to history.`);
      } else if (renewType === "fitness") {
        await api.renewFitness(id, renewalData);
        showToast(`Fitness certificate renewed successfully! Previous term archived.`);
      } else {
        await api.renewDrivingLicence(id, renewalData);
        showToast(`Driving licence renewed successfully! Previous term archived.`);
      }
      setIsRenewModalOpen(false);
      setRenewingItem(null);
      await loadAllData();
    } catch (err) {
      showToast(`Renewal failed: ${err.message}`, "error");
    }
  };

  // ==========================================
  // AUTH GUARD BARRIER
  // If not authenticated, render LoginView regardless of URL or hash
  // ==========================================
  if (!isAuthenticated) {
    return (
      <>
        <LoginView onLoginSuccess={handleLogin} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Render Free Tier Cold-Start Spin-Up Notification Banner */}
      {isServerWaking && (
        <div
          style={{
            background: "linear-gradient(90deg, #1e3a8a, #2563eb)",
            color: "#ffffff",
            padding: "8px 16px",
            fontSize: "0.8rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textAlign: "center"
          }}
        >
          <span style={{ display: "inline-block", animation: "spin 1.5s linear infinite" }}>⚡</span>
          <span>Connecting to cloud server (Render free tier waking up ~30s)... Please wait a moment.</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        counts={{
          customers: customers.length,
          insurances: insurances.length,
          permits: permits.length,
          fitness: fitnessList.length,
          drivingLicences: drivingLicences.length,
          reminders: remindersCount
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="app-main-workspace">
        {activeTab === "dashboard" && (
          <DashboardView
            stats={stats}
            customers={customers}
            insurances={insurances}
            permits={permits}
            fitnessList={fitnessList}
            drivingLicences={drivingLicences}
            onNavigate={handleTabChange}
            onAddCustomer={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            onEditCustomer={(c) => {
              setEditingCustomer(c);
              setIsCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onAddInsurance={() => {
              setEditingInsurance(null);
              setIsInsuranceModalOpen(true);
            }}
            onAddPermit={() => {
              setEditingPermit(null);
              setIsPermitModalOpen(true);
            }}
            onAddFitness={() => {
              setEditingFitness(null);
              setIsFitnessModalOpen(true);
            }}
            onAddDL={() => {
              setEditingDrivingLicence(null);
              setIsDrivingLicenceModalOpen(true);
            }}
          />
        )}

        {activeTab === "customers" && (
          <CustomersView
            customers={customers}
            insurances={insurances}
            permits={permits}
            onAddCustomer={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            onEditCustomer={(c) => {
              setEditingCustomer(c);
              setIsCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {activeTab === "insurance" && (
          <InsuranceView
            insurances={insurances}
            underwriters={underwriters}
            onAddInsurance={() => {
              setEditingInsurance(null);
              setIsInsuranceModalOpen(true);
            }}
            onEditInsurance={(ins) => {
              setEditingInsurance(ins);
              setIsInsuranceModalOpen(true);
            }}
            onDeleteInsurance={handleDeleteInsurance}
            onRenewInsurance={handleOpenRenewInsurance}
            onOpenManageUnderwriters={() => setIsUnderwriterModalOpen(true)}
          />
        )}

        {activeTab === "permits" && (
          <PermitsView
            permits={permits}
            onAddPermit={() => {
              setEditingPermit(null);
              setIsPermitModalOpen(true);
            }}
            onEditPermit={(p) => {
              setEditingPermit(p);
              setIsPermitModalOpen(true);
            }}
            onDeletePermit={handleDeletePermit}
            onRenewPermit={handleOpenRenewPermit}
          />
        )}

        {activeTab === "fitness" && (
          <FitnessView
            fitnessList={fitnessList}
            onAddFitness={() => {
              setEditingFitness(null);
              setIsFitnessModalOpen(true);
            }}
            onEditFitness={(f) => {
              setEditingFitness(f);
              setIsFitnessModalOpen(true);
            }}
            onDeleteFitness={handleDeleteFitness}
            onRenewFitness={handleOpenRenewFitness}
          />
        )}

        {activeTab === "driving-licences" && (
          <DrivingLicenceView
            drivingLicences={drivingLicences}
            onAddDL={() => {
              setEditingDrivingLicence(null);
              setIsDrivingLicenceModalOpen(true);
            }}
            onEditDL={(d) => {
              setEditingDrivingLicence(d);
              setIsDrivingLicenceModalOpen(true);
            }}
            onDeleteDL={handleDeleteDL}
            onRenewDL={handleOpenRenewDL}
          />
        )}

        {activeTab === "reminders" && (
          <RemindersView showToast={showToast} />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-default)",
          background: "#ffffff",
          padding: "18px 24px",
          fontSize: "0.82rem",
          color: "var(--text-muted)"
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>GuruKripa Yatayat</span>
            <span style={{ color: "var(--border-default)" }}>•</span>
            <span>Commercial Fleet, Insurance & RTO Operations</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span>Developed & Engineered by</span>
            <strong style={{ color: "var(--brand-primary, #1e3a8a)" }}>
              SevaManjari Labs Private Limited
            </strong>
            <span
              style={{
                fontSize: "0.72rem",
                background: "rgba(30, 58, 138, 0.08)",
                color: "var(--brand-primary, #1e3a8a)",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600
              }}
            >
              Enterprise
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      <InsuranceModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        onSave={handleSaveInsurance}
        insurance={editingInsurance}
        customers={customers}
        underwriters={underwriters}
        onOpenManageUnderwriters={() => setIsUnderwriterModalOpen(true)}
      />

      <UnderwriterManageModal
        isOpen={isUnderwriterModalOpen}
        onClose={() => setIsUnderwriterModalOpen(false)}
        underwriters={underwriters}
        onCreateUnderwriter={handleCreateUnderwriter}
        onDeleteUnderwriter={handleDeleteUnderwriter}
      />

      <PermitModal
        isOpen={isPermitModalOpen}
        onClose={() => setIsPermitModalOpen(false)}
        onSave={handleSavePermit}
        permit={editingPermit}
        customers={customers}
        vehicles={[]}
      />

      <FitnessModal
        isOpen={isFitnessModalOpen}
        onClose={() => setIsFitnessModalOpen(false)}
        onSave={handleSaveFitness}
        fitness={editingFitness}
        customers={customers}
      />

      <DrivingLicenceModal
        isOpen={isDrivingLicenceModalOpen}
        onClose={() => setIsDrivingLicenceModalOpen(false)}
        onSave={handleSaveDL}
        dl={editingDrivingLicence}
        customers={customers}
      />

      <RenewModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        onConfirm={handleConfirmRenewal}
        item={renewingItem}
        type={renewType}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
