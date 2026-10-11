import { loadData, resetData } from "../data/dataStore.js";

export const getDashboardStats = (req, res) => {
  try {
    const data = loadData();
    const customers = data.customers || [];
    const vehicles = data.vehicles || [];
    const insurances = data.insurances || [];
    const permits = data.permits || [];

    const pendingCount = customers.filter((c) => c.status === "Pending").length;
    const completedCount = customers.filter((c) => c.status === "Completed").length;
    const inProgressCount = customers.filter((c) => c.status === "In Progress").length;

    // By service type breakdown
    const serviceBreakdown = {};
    customers.forEach((c) => {
      const type = c.serviceType || "Other";
      serviceBreakdown[type] = (serviceBreakdown[type] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalCustomers: customers.length,
        totalVehicles: vehicles.length,
        totalInsurances: insurances.length,
        totalPermits: permits.length,
        pendingCount,
        completedCount,
        inProgressCount,
        serviceBreakdown
      },
      recentCustomers: customers.slice(0, 5),
      lastUpdated: data.lastUpdated || new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRtoServices = (req, res) => {
  try {
    const data = loadData();
    res.json({
      success: true,
      data: data.rtoServices || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resetApplicationData = (req, res) => {
  try {
    const fresh = resetData();
    res.json({
      success: true,
      message: "Data cleared successfully",
      stats: {
        customers: 0,
        vehicles: 0,
        insurances: 0,
        permits: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
