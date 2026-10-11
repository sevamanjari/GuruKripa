import { loadData, saveData } from "../data/dataStore.js";

const computeStatus = (expiryDate) => {
  if (!expiryDate) return "Active";
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 30) return "Expiring Soon";
  return "Active";
};

export const getInsurances = (req, res) => {
  try {
    const data = loadData();
    let insurances = data.insurances || [];
    const { search, status, vehicleId, customerId } = req.query;

    // Recalculate dynamic status based on current date
    insurances = insurances.map((item) => ({
      ...item,
      computedStatus: computeStatus(item.expiryDate)
    }));

    if (search) {
      const q = search.toLowerCase().trim();
      insurances = insurances.filter(
        (i) =>
          i.policyNumber.toLowerCase().includes(q) ||
          i.vehicleReg.toLowerCase().includes(q) ||
          (i.customerName && i.customerName.toLowerCase().includes(q)) ||
          i.insuranceCompany.toLowerCase().includes(q) ||
          (i.coverageType && i.coverageType.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      insurances = insurances.filter((i) => (i.computedStatus || i.status) === status);
    }

    if (vehicleId) {
      insurances = insurances.filter((i) => i.vehicleId === vehicleId);
    }

    if (customerId) {
      insurances = insurances.filter((i) => i.customerId === customerId);
    }

    res.json({
      success: true,
      count: insurances.length,
      data: insurances
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInsuranceById = (req, res) => {
  try {
    const data = loadData();
    const insurance = (data.insurances || []).find((i) => i.id === req.params.id);

    if (!insurance) {
      return res.status(404).json({ success: false, error: "Insurance record not found" });
    }

    res.json({
      success: true,
      data: {
        ...insurance,
        computedStatus: computeStatus(insurance.expiryDate)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createInsurance = (req, res) => {
  try {
    const {
      policyNumber,
      vehicleId,
      insuranceCompany,
      coverageType,
      issueDate,
      expiryDate,
      idvAmount,
      premiumAmount,
      ncbPercentage,
      notes
    } = req.body;

    const effVehicleId = vehicleId || req.body.vehicleReg;
    if (!policyNumber || !effVehicleId || !insuranceCompany || !expiryDate) {
      return res.status(400).json({
        success: false,
        error: "Policy Number, Vehicle, Insurance Company, and Expiry Date are required."
      });
    }

    const data = loadData();
    const vehicle = (data.vehicles || []).find((v) => v.id === vehicleId || v.regNumber === vehicleId);
    const customer = vehicle ? (data.customers || []).find((c) => c.id === vehicle.customerId) : null;

    const newId = `INS-${Date.now().toString().slice(-4)}`;
    const status = computeStatus(expiryDate);

    const newInsurance = {
      id: newId,
      policyNumber: policyNumber.trim().toUpperCase(),
      vehicleId: vehicle ? vehicle.id : (req.body.vehicleReg || vehicleId),
      vehicleReg: (req.body.vehicleReg || (vehicle ? vehicle.regNumber : vehicleId)).toUpperCase().trim(),
      customerId: vehicle ? vehicle.customerId : (customer ? customer.id : ""),
      customerName: req.body.customerName || (customer ? customer.name : (vehicle ? vehicle.customerName : "Customer")),
      customerPhone: req.body.customerPhone || (customer ? customer.phone : ""),
      insuranceCompany: insuranceCompany.trim(),
      coverageType: coverageType || "Comprehensive Package",
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate,
      idvAmount: Number(idvAmount) || 0,
      premiumAmount: Number(premiumAmount) || 0,
      ncbPercentage: Number(ncbPercentage) || 0,
      status,
      notes: (notes || "").trim(),
      createdAt: new Date().toISOString()
    };

    data.insurances.unshift(newInsurance);
    saveData(data);

    res.status(201).json({
      success: true,
      message: "Insurance policy created successfully",
      data: newInsurance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateInsurance = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.insurances || []).findIndex((i) => i.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Insurance record not found" });
    }

    const current = data.insurances[idx];
    let vehicleReg = current.vehicleReg;
    let customerId = current.customerId;
    let customerName = current.customerName;

    if (req.body.vehicleId && req.body.vehicleId !== current.vehicleId) {
      const vehicle = (data.vehicles || []).find((v) => v.id === req.body.vehicleId);
      if (vehicle) {
        vehicleReg = vehicle.regNumber;
        customerId = vehicle.customerId;
        customerName = vehicle.customerName;
      }
    }

    const expiry = req.body.expiryDate || current.expiryDate;
    const updatedStatus = computeStatus(expiry);

    const updated = {
      ...current,
      ...req.body,
      vehicleReg,
      customerId,
      customerName,
      status: updatedStatus,
      id
    };

    data.insurances[idx] = updated;
    saveData(data);

    res.json({
      success: true,
      message: "Insurance policy updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteInsurance = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.insurances || []).findIndex((i) => i.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Insurance record not found" });
    }

    const removed = data.insurances.splice(idx, 1)[0];
    saveData(data);

    res.json({
      success: true,
      message: `Insurance policy ${removed.policyNumber} deleted successfully`,
      data: removed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const renewInsurance = (req, res) => {
  try {
    const { id } = req.params;
    const { newPolicyNumber, newPremiumAmount, newIdvAmount, newNcbPercentage } = req.body;
    const data = loadData();
    const idx = (data.insurances || []).findIndex((i) => i.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Insurance record not found" });
    }

    const current = data.insurances[idx];

    // Calculate new 1-year window
    const baseDate = new Date(current.expiryDate) > new Date() ? new Date(current.expiryDate) : new Date();
    const startDate = baseDate.toISOString().split("T")[0];
    const nextYear = new Date(baseDate);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const newExpiry = nextYear.toISOString().split("T")[0];

    const oldSnapshot = {
      id: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      policyNumber: current.policyNumber,
      insuranceCompany: current.insuranceCompany,
      coverageType: current.coverageType,
      issueDate: current.issueDate || current.startDate,
      expiryDate: current.expiryDate,
      premiumAmount: current.premiumAmount,
      idvAmount: current.idvAmount,
      ncbPercentage: current.ncbPercentage,
      renewedOn: new Date().toISOString().split("T")[0],
      notes: current.notes || ""
    };

    const history = Array.isArray(current.renewalHistory) ? [...current.renewalHistory] : [];
    history.unshift(oldSnapshot);

    const renewed = {
      ...current,
      policyNumber: newPolicyNumber || `${current.policyNumber}-RNW`,
      issueDate: startDate,
      expiryDate: newExpiry,
      premiumAmount: newPremiumAmount ? Number(newPremiumAmount) : current.premiumAmount,
      idvAmount: newIdvAmount ? Number(newIdvAmount) : current.idvAmount,
      ncbPercentage: newNcbPercentage !== undefined ? Number(newNcbPercentage) : Math.min(50, (current.ncbPercentage || 20) + 5),
      status: "Active",
      renewalHistory: history,
      notes: `Renewed on ${new Date().toISOString().split("T")[0]}. Previous policy: ${current.policyNumber}`
    };

    data.insurances[idx] = renewed;
    saveData(data);

    res.json({
      success: true,
      message: `Policy successfully renewed until ${newExpiry}`,
      data: renewed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
