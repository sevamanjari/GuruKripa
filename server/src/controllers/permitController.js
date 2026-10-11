import { loadData, saveData } from "../data/dataStore.js";

const computePermitStatus = (expiryDate) => {
  if (!expiryDate) return "Active";
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 30) return "Expiring Soon";
  return "Active";
};

export const getPermits = (req, res) => {
  try {
    const data = loadData();
    let permits = data.permits || [];
    const { search, type, status, vehicleId, customerId } = req.query;

    permits = permits.map((item) => ({
      ...item,
      computedStatus: computePermitStatus(item.expiryDate)
    }));

    if (search) {
      const q = search.toLowerCase().trim();
      permits = permits.filter(
        (p) =>
          p.permitNumber.toLowerCase().includes(q) ||
          p.vehicleReg.toLowerCase().includes(q) ||
          (p.customerName && p.customerName.toLowerCase().includes(q)) ||
          p.permitType.toLowerCase().includes(q) ||
          (p.issuingRto && p.issuingRto.toLowerCase().includes(q))
      );
    }

    if (type && type !== "All") {
      permits = permits.filter((p) => p.permitType === type);
    }

    if (status && status !== "All") {
      permits = permits.filter((p) => (p.computedStatus || p.status) === status);
    }

    if (vehicleId) {
      permits = permits.filter((p) => p.vehicleId === vehicleId);
    }

    if (customerId) {
      permits = permits.filter((p) => p.customerId === customerId);
    }

    res.json({
      success: true,
      count: permits.length,
      data: permits
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPermitById = (req, res) => {
  try {
    const data = loadData();
    const permit = (data.permits || []).find((p) => p.id === req.params.id);

    if (!permit) {
      return res.status(404).json({ success: false, error: "Permit not found" });
    }

    res.json({
      success: true,
      data: {
        ...permit,
        computedStatus: computePermitStatus(permit.expiryDate)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPermit = (req, res) => {
  try {
    const {
      permitNumber,
      vehicleId,
      permitType,
      issueDate,
      expiryDate,
      issuingRto,
      authorizedStates,
      authFeePaid,
      notes
    } = req.body;

    const effVehicleId = vehicleId || req.body.vehicleReg;
    if (!permitNumber || !effVehicleId || !permitType || !expiryDate) {
      return res.status(400).json({
        success: false,
        error: "Permit Number, Vehicle, Permit Type, and Expiry Date are required."
      });
    }

    const data = loadData();
    const vehicle = (data.vehicles || []).find((v) => v.id === vehicleId || v.regNumber === vehicleId);
    const customer = vehicle ? (data.customers || []).find((c) => c.id === vehicle.customerId) : null;

    const newId = `PERM-${Date.now().toString().slice(-4)}`;
    const status = computePermitStatus(expiryDate);

    const newPermit = {
      id: newId,
      permitNumber: permitNumber.trim().toUpperCase(),
      vehicleId: vehicle ? vehicle.id : (req.body.vehicleReg || vehicleId),
      vehicleReg: (req.body.vehicleReg || (vehicle ? vehicle.regNumber : vehicleId)).toUpperCase().trim(),
      customerId: vehicle ? vehicle.customerId : (customer ? customer.id : ""),
      customerName: req.body.customerName || (customer ? customer.name : (vehicle ? vehicle.customerName : "Customer")),
      customerPhone: req.body.customerPhone || (customer ? customer.phone : ""),
      permitType: permitType.trim(),
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate,
      issuingRto: issuingRto || "RTO Indore (MP-09)",
      authorizedStates: authorizedStates || "All India (National Permit)",
      authFeePaid: Number(authFeePaid) || 16500,
      status,
      notes: (notes || "").trim(),
      createdAt: new Date().toISOString()
    };

    data.permits.unshift(newPermit);
    saveData(data);

    res.status(201).json({
      success: true,
      message: "Permit created successfully",
      data: newPermit
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePermit = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.permits || []).findIndex((p) => p.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Permit not found" });
    }

    const current = data.permits[idx];
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
    const updatedStatus = computePermitStatus(expiry);

    const updated = {
      ...current,
      ...req.body,
      vehicleReg,
      customerId,
      customerName,
      status: updatedStatus,
      id
    };

    data.permits[idx] = updated;
    saveData(data);

    res.json({
      success: true,
      message: "Permit updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePermit = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.permits || []).findIndex((p) => p.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Permit not found" });
    }

    const removed = data.permits.splice(idx, 1)[0];
    saveData(data);

    res.json({
      success: true,
      message: `Permit ${removed.permitNumber} deleted successfully`,
      data: removed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const renewPermit = (req, res) => {
  try {
    const { id } = req.params;
    const { newPermitNumber, newAuthFeePaid, newExpiryDate } = req.body;
    const data = loadData();
    const idx = (data.permits || []).findIndex((p) => p.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Permit not found" });
    }

    const current = data.permits[idx];
    const baseDate = new Date(current.expiryDate) > new Date() ? new Date(current.expiryDate) : new Date();
    const startDate = baseDate.toISOString().split("T")[0];

    let newExpiry = newExpiryDate;
    if (!newExpiry) {
      const nextYear = new Date(baseDate);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      newExpiry = nextYear.toISOString().split("T")[0];
    }

    const oldSnapshot = {
      id: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      permitNumber: current.permitNumber,
      permitType: current.permitType,
      state: current.state,
      issueDate: current.issueDate || current.startDate,
      expiryDate: current.expiryDate,
      authFeePaid: current.authFeePaid,
      renewedOn: new Date().toISOString().split("T")[0],
      notes: current.notes || ""
    };

    const history = Array.isArray(current.renewalHistory) ? [...current.renewalHistory] : [];
    history.unshift(oldSnapshot);

    const renewed = {
      ...current,
      permitNumber: newPermitNumber || `${current.permitNumber}/R1`,
      issueDate: startDate,
      expiryDate: newExpiry,
      authFeePaid: newAuthFeePaid ? Number(newAuthFeePaid) : current.authFeePaid,
      status: "Active",
      renewalHistory: history,
      notes: `Renewed on ${new Date().toISOString().split("T")[0]}. Previous permit: ${current.permitNumber}`
    };

    data.permits[idx] = renewed;
    saveData(data);

    res.json({
      success: true,
      message: `Permit successfully renewed until ${newExpiry}`,
      data: renewed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
