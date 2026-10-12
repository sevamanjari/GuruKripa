const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  // Automatically connect to the deployed Render backend when running in production
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://gurukripa.onrender.com/api";
  }
  return "http://localhost:5000/api";
};

const API_BASE = getApiBase();
const TOKEN_KEY = "gurukripa_auth_token";
const USER_KEY = "gurukripa_auth_user";

export const authStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error("Storage error:", e);
    }
  }
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const token = authStorage.getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      // If unauthorized on a protected endpoint, clear storage
      if (endpoint !== "/auth/login") {
        authStorage.clear();
        window.dispatchEvent(new CustomEvent("gurukripa_unauthorized", { detail: data.error }));
      }
      throw new Error(data.error || `Authentication required (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: Failed request`);
    }
    return data;
  } catch (err) {
    if (endpoint !== "/auth/login") {
      console.error(`API Error on [${options.method || "GET"} ${endpoint}]:`, err.message);
    }
    throw err;
  }
};

export const api = {
  // Authentication
  login: async (username, password) => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
    }
    return res;
  },
  getMe: () => request("/auth/me"),
  logout: () => {
    authStorage.clear();
  },

  // Health & Dashboard
  getHealth: () => request("/health"),
  getDashboardStats: () => request("/dashboard/stats"),
  getRtoServices: () => request("/rto-services"),
  resetData: () => request("/reset-data", { method: "POST" }),

  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers${query ? `?${query}` : ""}`);
  },
  getCustomerById: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request("/customers", { method: "POST", body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),

  // Vehicles
  getVehicles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/vehicles${query ? `?${query}` : ""}`);
  },
  getVehicleById: (id) => request(`/vehicles/${id}`),
  createVehicle: (data) => request("/vehicles", { method: "POST", body: JSON.stringify(data) }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: "DELETE" }),

  // Insurance
  getInsurances: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/insurances${query ? `?${query}` : ""}`);
  },
  getInsuranceById: (id) => request(`/insurances/${id}`),
  createInsurance: (data) => request("/insurances", { method: "POST", body: JSON.stringify(data) }),
  updateInsurance: (id, data) => request(`/insurances/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteInsurance: (id) => request(`/insurances/${id}`, { method: "DELETE" }),
  renewInsurance: (id, data) => request(`/insurances/${id}/renew`, { method: "POST", body: JSON.stringify(data) }),

  // Underwriters (Insurance companies/agencies based on user dealings)
  getUnderwriters: () => request("/underwriters"),
  createUnderwriter: (data) => request("/underwriters", { method: "POST", body: JSON.stringify(data) }),
  updateUnderwriter: (id, data) => request(`/underwriters/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUnderwriter: (id) => request(`/underwriters/${id}`, { method: "DELETE" }),

  // Permits
  getPermits: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/permits${query ? `?${query}` : ""}`);
  },
  getPermitById: (id) => request(`/permits/${id}`),
  createPermit: (data) => request("/permits", { method: "POST", body: JSON.stringify(data) }),
  updatePermit: (id, data) => request(`/permits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePermit: (id) => request(`/permits/${id}`, { method: "DELETE" }),
  renewPermit: (id, data) => request(`/permits/${id}/renew`, { method: "POST", body: JSON.stringify(data) }),

  // WhatsApp Automated Reminders
  getReminderStatus: () => request("/reminders/status"),
  getUpcomingReminders: (days = 7) => request(`/reminders/upcoming?days=${days}`),
  getReminderLogs: () => request("/reminders/logs"),
  triggerAutoScan: (days = 7) => request("/reminders/scan", { method: "POST", body: JSON.stringify({ days }) }),
  sendSingleReminder: (data) => request("/reminders/send", { method: "POST", body: JSON.stringify(data) })
};
