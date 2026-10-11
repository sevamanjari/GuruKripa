import { loadData, saveData } from "../data/dataStore.js";

export const getCustomers = (req, res) => {
  try {
    const data = loadData();
    let customers = data.customers || [];
    const { search, serviceType, status } = req.query;

    if (search) {
      const q = search.toLowerCase().trim();
      customers = customers.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(q)) ||
          (c.docNumber && c.docNumber.toLowerCase().includes(q)) ||
          (c.serviceType && c.serviceType.toLowerCase().includes(q))
      );
    }

    if (serviceType && serviceType !== "All") {
      customers = customers.filter((c) => c.serviceType === serviceType);
    }

    if (status && status !== "All") {
      customers = customers.filter((c) => c.status === status);
    }

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCustomerById = (req, res) => {
  try {
    const data = loadData();
    const customer = (data.customers || []).find((c) => c.id === req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCustomer = (req, res) => {
  try {
    const {
      name,
      phone,
      serviceType,
      vehicleNumber,
      docNumber,
      dueDate,
      amount,
      status,
      notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: "Name and Phone number are required." });
    }

    const data = loadData();
    const newId = `CUST-${Date.now().toString().slice(-4)}`;

    const newCustomer = {
      id: newId,
      name: name.trim(),
      phone: phone.trim(),
      serviceType: serviceType || "DL (Driving Licence)",
      vehicleNumber: vehicleNumber ? vehicleNumber.toUpperCase().trim() : "",
      docNumber: docNumber ? docNumber.trim().toUpperCase() : "",
      dueDate: dueDate || "",
      amount: Number(amount) || 0,
      status: status || "Pending",
      notes: (notes || "").trim(),
      createdAt: new Date().toISOString()
    };

    data.customers.unshift(newCustomer);

    // If it is insurance or permit, also record in respective list for easy tracking
    if (serviceType === "Vehicle Insurance" && vehicleNumber) {
      data.insurances.unshift({
        id: `INS-${Date.now().toString().slice(-4)}`,
        customerId: newId,
        customerName: newCustomer.name,
        customerPhone: newCustomer.phone,
        vehicleReg: newCustomer.vehicleNumber,
        policyNumber: docNumber || `POL-${Date.now().toString().slice(-4)}`,
        insuranceCompany: notes || "General Insurance",
        expiryDate: dueDate || "",
        premiumAmount: Number(amount) || 0,
        status: status === "Completed" ? "Active" : "Pending",
        createdAt: new Date().toISOString()
      });
    } else if (serviceType === "Permit" && vehicleNumber) {
      data.permits.unshift({
        id: `PERM-${Date.now().toString().slice(-4)}`,
        customerId: newId,
        customerName: newCustomer.name,
        customerPhone: newCustomer.phone,
        vehicleReg: newCustomer.vehicleNumber,
        permitNumber: docNumber || `PERM-${Date.now().toString().slice(-4)}`,
        permitType: "State / National Permit",
        expiryDate: dueDate || "",
        authFeePaid: Number(amount) || 0,
        status: status === "Completed" ? "Active" : "Pending",
        createdAt: new Date().toISOString()
      });
    }

    saveData(data);

    res.status(201).json({
      success: true,
      message: "Customer entry added successfully",
      data: newCustomer
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCustomer = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.customers || []).findIndex((c) => c.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    const updated = {
      ...data.customers[idx],
      ...req.body,
      id
    };

    data.customers[idx] = updated;
    saveData(data);

    res.json({
      success: true,
      message: "Customer entry updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCustomer = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.customers || []).findIndex((c) => c.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    const removed = data.customers.splice(idx, 1)[0];
    saveData(data);

    res.json({
      success: true,
      message: `Customer ${removed.name} removed successfully`,
      data: removed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
