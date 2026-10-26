import { loadData, resetData } from "../data/dataStore.js";

export const getDashboardStats = (req, res) => {
  try {
    const data = loadData();
    const customers = data.customers || [];
    const vehicles = data.vehicles || [];
    const insurances = data.insurances || [];
    const permits = data.permits || [];
    const fitnessList = data.fitness || [];
    const dlList = data.drivingLicences || [];

    // Customer financial totals
    const custDue = customers.reduce((sum, c) => sum + (Number(c.dueAmount) || 0), 0);
    const custPaid = customers.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
    const custBilled = customers.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
    const dueCustomersCount = customers.filter((c) => (Number(c.dueAmount) || 0) > 0).length;
    const paidCustomersCount = customers.filter((c) => c.paymentStatus === "Paid").length;
    const partialCustomersCount = customers.filter((c) => c.paymentStatus === "Partial").length;

    // Insurance financial totals
    const insBilled = insurances.reduce((sum, i) => sum + (Number(i.totalAmount ?? i.premiumAmount) || 0), 0);
    const insPaid = insurances.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
    const insDue = insurances.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);

    // Permit financial totals
    const permitBilled = permits.reduce((sum, p) => sum + (Number(p.totalAmount ?? p.authFeePaid) || 0), 0);
    const permitPaid = permits.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const permitDue = permits.reduce((sum, p) => sum + (Number(p.dueAmount) || 0), 0);

    // Fitness financial totals
    const fitnessBilled = fitnessList.reduce((sum, f) => sum + (Number(f.totalAmount) || 0), 0);
    const fitnessPaid = fitnessList.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
    const fitnessDue = fitnessList.reduce((sum, f) => sum + (Number(f.dueAmount) || 0), 0);

    // Driving Licence financial totals
    const dlBilled = dlList.reduce((sum, d) => sum + (Number(d.totalAmount) || 0), 0);
    const dlPaid = dlList.reduce((sum, d) => sum + (Number(d.paidAmount) || 0), 0);
    const dlDue = dlList.reduce((sum, d) => sum + (Number(d.dueAmount) || 0), 0);

    // Combined grand monetary totals
    const totalBilledAmount = custBilled + insBilled + permitBilled + fitnessBilled + dlBilled;
    const totalPaidAmount = custPaid + insPaid + permitPaid + fitnessPaid + dlPaid;
    const totalDueAmount = custDue + insDue + permitDue + fitnessDue + dlDue;

    // Expiry alerts (items expiring in 30 days or already expired)
    const now = new Date();
    const criticalInsurances = insurances
      .filter((i) => {
        if (!i.expiryDate) return false;
        const diff = Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((i) => ({
        type: "Insurance",
        id: i.id,
        policyNumber: i.policyNumber,
        vehicleReg: i.vehicleReg,
        customerName: i.customerName,
        customerPhone: i.customerPhone,
        date: i.expiryDate,
        daysLeft: Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24)),
        dueAmount: Number(i.dueAmount) || 0,
        status: i.status
      }));

    const criticalPermits = permits
      .filter((p) => {
        const exp = p.expiryDate || p.validUpto;
        if (!exp) return false;
        const diff = Math.ceil((new Date(exp) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((p) => ({
        type: "Permit",
        id: p.id,
        permitNumber: p.permitNumber,
        permitType: p.permitType,
        vehicleReg: p.vehicleReg,
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        date: p.expiryDate || p.validUpto,
        daysLeft: Math.ceil((new Date(p.expiryDate || p.validUpto) - now) / (1000 * 60 * 60 * 24)),
        dueAmount: Number(p.dueAmount) || 0,
        status: p.status
      }));

    const criticalFitness = fitnessList
      .filter((f) => {
        if (!f.expiryDate) return false;
        const diff = Math.ceil((new Date(f.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((f) => ({
        type: "Fitness",
        id: f.id,
        vehicleReg: f.vehicleReg,
        customerName: f.customerName,
        customerPhone: f.customerPhone,
        date: f.expiryDate,
        daysLeft: Math.ceil((new Date(f.expiryDate) - now) / (1000 * 60 * 60 * 24)),
        dueAmount: Number(f.dueAmount) || 0,
        status: f.status
      }));

    const criticalDL = dlList
      .filter((d) => {
        if (!d.expiryDate) return false;
        const diff = Math.ceil((new Date(d.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map((d) => ({
        type: "Driving Licence",
        id: d.id,
        dlNumber: d.dlNumber,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        date: d.expiryDate,
        daysLeft: Math.ceil((new Date(d.expiryDate) - now) / (1000 * 60 * 60 * 24)),
        dueAmount: Number(d.dueAmount) || 0,
        status: d.status
      }));

    const criticalExpiries = [...criticalInsurances, ...criticalPermits, ...criticalFitness, ...criticalDL].sort(
      (a, b) => a.daysLeft - b.daysLeft
    );

    res.json({
      success: true,
      stats: {
        totalCustomers: customers.length,
        totalVehicles: vehicles.length,
        totalInsurances: insurances.length,
        totalPermits: permits.length,
        totalFitness: fitnessList.length,
        totalDrivingLicences: dlList.length,

        // Cross-service monetary aggregates
        totalDueAmount,
        totalPaidAmount,
        totalBilledAmount,

        // Customer billing stream
        custBilled,
        custPaid,
        custDue,
        dueCustomersCount,
        paidCustomersCount,

        // Insurance stream
        insBilled,
        insPaid,
        insDue,
        activeInsurances: insurances.filter((i) => i.status === "Active").length,
        expiringInsurancesCount: criticalInsurances.length,

        // Permit stream
        permitBilled,
        permitPaid,
        permitDue,
        activePermits: permits.filter((p) => p.status === "Active").length,
        expiringPermitsCount: criticalPermits.length,

        // Fitness stream
        fitnessBilled,
        fitnessPaid,
        fitnessDue,
        activeFitness: fitnessList.filter((f) => f.status === "Active").length,
        expiringFitnessCount: criticalFitness.length,

        // DL stream
        dlBilled,
        dlPaid,
        dlDue,
        activeDrivingLicences: dlList.filter((d) => d.status === "Active").length,
        expiringDLCount: criticalDL.length,

        totalExpiringSoon: criticalExpiries.length,
        pendingCount: dueCustomersCount,
        completedCount: paidCustomersCount,
        inProgressCount: partialCustomersCount
      },
      criticalExpiries: criticalExpiries.slice(0, 10),
      recentCustomers: customers.slice(0, 8),
      recentInsurances: insurances.slice(0, 6),
      recentPermits: permits.slice(0, 6),
      recentFitness: fitnessList.slice(0, 6),
      recentDrivingLicences: dlList.slice(0, 6),
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
