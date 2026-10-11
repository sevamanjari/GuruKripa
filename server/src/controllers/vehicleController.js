import { loadData, saveData } from "../data/dataStore.js";

export const getVehicles = (req, res) => {
  try {
    const data = loadData();
    let vehicles = data.vehicles || [];
    const { search, type, status, customerId } = req.query;

    if (search) {
      const q = search.toLowerCase().trim();
      vehicles = vehicles.filter(
        (v) =>
          v.regNumber.toLowerCase().includes(q) ||
          (v.customerName && v.customerName.toLowerCase().includes(q)) ||
          (v.make && v.make.toLowerCase().includes(q)) ||
          (v.model && v.model.toLowerCase().includes(q)) ||
          (v.chassisNumber && v.chassisNumber.toLowerCase().includes(q))
      );
    }

    if (type && type !== "All") {
      vehicles = vehicles.filter((v) => v.vehicleType === type);
    }

    if (status && status !== "All") {
      vehicles = vehicles.filter((v) => v.status === status);
    }

    if (customerId) {
      vehicles = vehicles.filter((v) => v.customerId === customerId);
    }

    // Attach active insurance and permit summary to each vehicle
    const enriched = vehicles.map((v) => {
      const activeInsurance = (data.insurances || []).find((i) => i.vehicleId === v.id || i.vehicleReg === v.regNumber);
      const activePermit = (data.permits || []).find((p) => p.vehicleId === v.id || p.vehicleReg === v.regNumber);

      return {
        ...v,
        currentInsurance: activeInsurance || null,
        currentPermit: activePermit || null
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getVehicleById = (req, res) => {
  try {
    const data = loadData();
    const vehicle = (data.vehicles || []).find((v) => v.id === req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, error: "Vehicle not found" });
    }

    const insurances = (data.insurances || []).filter(
      (i) => i.vehicleId === vehicle.id || i.vehicleReg === vehicle.regNumber
    );
    const permits = (data.permits || []).filter(
      (p) => p.vehicleId === vehicle.id || p.vehicleReg === vehicle.regNumber
    );
    const customer = (data.customers || []).find((c) => c.id === vehicle.customerId);

    res.json({
      success: true,
      data: {
        ...vehicle,
        customer: customer || null,
        insurances,
        permits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createVehicle = (req, res) => {
  try {
    const {
      regNumber,
      customerId,
      vehicleType,
      make,
      model,
      chassisNumber,
      engineNumber,
      manufacturingYear,
      fuelType,
      gvwKg,
      fitnessExpiry,
      taxValidUpto,
      pucExpiry,
      hypothecation,
      status
    } = req.body;

    if (!regNumber || !customerId) {
      return res.status(400).json({ success: false, error: "Registration Number and Customer are required." });
    }

    const data = loadData();
    const customer = (data.customers || []).find((c) => c.id === customerId);

    // Normalize reg number MP 09 GH 1234
    const cleanReg = regNumber.toUpperCase().trim();
    const exists = (data.vehicles || []).some((v) => v.regNumber === cleanReg);
    if (exists) {
      return res.status(400).json({ success: false, error: `Vehicle with registration ${cleanReg} already exists.` });
    }

    const newId = `VEH-${Date.now().toString().slice(-4)}`;

    const newVehicle = {
      id: newId,
      regNumber: cleanReg,
      customerId,
      customerName: customer ? customer.name : "Unknown Customer",
      vehicleType: vehicleType || "Heavy Commercial Truck (16-Wheel)",
      make: (make || "Tata Motors").trim(),
      model: (model || "Commercial Vehicle").trim(),
      chassisNumber: (chassisNumber || `CHAS${Date.now().toString().slice(-8)}`).toUpperCase().trim(),
      engineNumber: (engineNumber || `ENG${Date.now().toString().slice(-6)}`).toUpperCase().trim(),
      manufacturingYear: Number(manufacturingYear) || new Date().getFullYear(),
      fuelType: fuelType || "Diesel",
      gvwKg: Number(gvwKg) || 16000,
      fitnessExpiry: fitnessExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      taxValidUpto: taxValidUpto || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      pucExpiry: pucExpiry || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      hypothecation: (hypothecation || "None").trim(),
      status: status || "Active",
      createdAt: new Date().toISOString()
    };

    data.vehicles.unshift(newVehicle);
    saveData(data);

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: newVehicle
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateVehicle = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.vehicles || []).findIndex((v) => v.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Vehicle not found" });
    }

    const prevReg = data.vehicles[idx].regNumber;
    let customerName = data.vehicles[idx].customerName;

    if (req.body.customerId && req.body.customerId !== data.vehicles[idx].customerId) {
      const customer = (data.customers || []).find((c) => c.id === req.body.customerId);
      if (customer) {
        customerName = customer.name;
      }
    }

    const updated = {
      ...data.vehicles[idx],
      ...req.body,
      customerName,
      id
    };

    data.vehicles[idx] = updated;

    // Propagate vehicle registration updates
    if (req.body.regNumber && req.body.regNumber !== prevReg) {
      const newReg = req.body.regNumber.toUpperCase().trim();
      updated.regNumber = newReg;
      data.insurances = (data.insurances || []).map((i) =>
        i.vehicleId === id ? { ...i, vehicleReg: newReg } : i
      );
      data.permits = (data.permits || []).map((p) =>
        p.vehicleId === id ? { ...p, vehicleReg: newReg } : p
      );
    }

    saveData(data);

    res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteVehicle = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.vehicles || []).findIndex((v) => v.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Vehicle not found" });
    }

    const removed = data.vehicles.splice(idx, 1)[0];
    saveData(data);

    res.json({
      success: true,
      message: `Vehicle ${removed.regNumber} removed successfully`,
      data: removed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
