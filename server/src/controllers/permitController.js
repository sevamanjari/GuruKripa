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

const computePayment = (total, paid) => {
  const t = Math.max(0, Number(total) || 0);
  const p = Math.max(0, Number(paid) || 0);
  const due = Math.max(0, t - p);
  let status = "No Charges";
  if (t > 0) {
    if (due === 0) status = "Paid";
    else if (p > 0) status = "Partial";
    else status = "Due";
  }
  return { totalAmount: t, paidAmount: p, dueAmount: due, paymentStatus: status };
};

// Helper to ensure customer exists and is linked by primary phone number
const linkOrCreateCustomer = (data, phone, name) => {
  if (!phone) return null;
  const cleanPhone = phone.trim();
  const cleanName = (name || "Customer").trim();

  let customer = (data.customers || []).find(
    (c) => c.phone && c.phone.trim().toLowerCase() === cleanPhone.toLowerCase()
  );

  if (!customer && cleanName) {
    customer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      phone: cleanPhone,
      email: "",
      address: "",
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      paymentStatus: "No Charges",
      notes: "Auto-registered via Permit entry",
      createdAt: new Date().toISOString()
    };
    data.customers.unshift(customer);
  }
  return customer;
};

export const getPermits = (req, res) => {
  try {
    const data = loadData();
    let permits = data.permits || [];
    const { search, status, paymentStatus, vehicleId, customerId, customerPhone } = req.query;

    permits = permits.map((item) => {
      const total = item.totalAmount !== undefined ? item.totalAmount : (item.authFeePaid || 0);
      const paid = item.paidAmount || 0;
      const payment = computePayment(total, paid);
      return {
        ...item,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        dueAmount: payment.dueAmount,
        paymentStatus: item.paymentStatus || payment.paymentStatus,
        computedStatus: computePermitStatus(item.expiryDate)
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      permits = permits.filter(
        (p) =>
          p.permitNumber.toLowerCase().includes(q) ||
          p.vehicleReg.toLowerCase().includes(q) ||
          (p.customerName && p.customerName.toLowerCase().includes(q)) ||
          (p.customerPhone && p.customerPhone.toLowerCase().includes(q)) ||
          (p.rtoAffiliated && p.rtoAffiliated.toLowerCase().includes(q)) ||
          (p.issuingRto && p.issuingRto.toLowerCase().includes(q)) ||
          p.permitType.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q)
      );
    }

    if (status && status !== "All") {
      permits = permits.filter((p) => (p.computedStatus || p.status) === status);
    }

    if (paymentStatus && paymentStatus !== "All") {
      if (paymentStatus === "Due") {
        permits = permits.filter((p) => (Number(p.dueAmount) || 0) > 0);
      } else {
        permits = permits.filter((p) => p.paymentStatus === paymentStatus);
      }
    }

    if (vehicleId) {
      permits = permits.filter((p) => p.vehicleId === vehicleId);
    }

    if (customerId) {
      permits = permits.filter((p) => p.customerId === customerId);
    }

    if (customerPhone) {
      permits = permits.filter((p) => (p.customerPhone || "").trim() === customerPhone.trim());
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

    const total = permit.totalAmount !== undefined ? permit.totalAmount : (permit.authFeePaid || 0);
    const paid = permit.paidAmount || 0;
    const payment = computePayment(total, paid);

    res.json({
      success: true,
      data: {
        ...permit,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        dueAmount: payment.dueAmount,
        paymentStatus: permit.paymentStatus || payment.paymentStatus,
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
      customerName,
      customerPhone,
      permitType,
      issueDate,
      expiryDate,
      issuingRto,
      rtoAffiliated,
      authorizedStates,
      state,
      authFeePaid,
      totalAmount,
      paidAmount,
      documentUrl,
      documentName,
      documentSize,
      notes
    } = req.body;

    const effVehicleId = vehicleId || req.body.vehicleReg;
    if (!effVehicleId || !expiryDate) {
      return res.status(400).json({
        success: false,
        error: "Vehicle number and Expiry Date are required."
      });
    }

    const data = loadData();
    const cleanPhone = (customerPhone || "").trim();
    const cleanName = (customerName || "").trim();

    // Primary link via customer phone
    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const newId = `PERM-${Date.now().toString().slice(-4)}`;
    const status = computePermitStatus(expiryDate);

    const total = Number(totalAmount !== undefined ? totalAmount : authFeePaid) || 0;
    const paid = Number(paidAmount) || 0;
    const payment = computePayment(total, paid);
    const assignedRto = (rtoAffiliated || issuingRto || "RTO Indore (MP-09)").trim();
    const assignedPermitNumber = (permitNumber || `PRM-${Date.now().toString().slice(-6)}`).trim().toUpperCase();

    const newPermit = {
      id: newId,
      permitNumber: assignedPermitNumber,
      vehicleId: effVehicleId.trim().toUpperCase(),
      vehicleReg: (req.body.vehicleReg || effVehicleId).toUpperCase().trim(),
      customerId: customer ? customer.id : (req.body.customerId || ""),
      customerName: cleanName || (customer ? customer.name : "Customer"),
      customerPhone: cleanPhone,
      permitType: (permitType || "State Goods Permit").trim(),
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate,
      issuingRto: assignedRto,
      rtoAffiliated: assignedRto,
      authorizedStates: authorizedStates || "All India (National Permit)",
      state: state || "All India",
      authFeePaid: total,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      documentUrl: documentUrl || "",
      documentName: documentName || "",
      documentSize: Number(documentSize) || 0,
      uploadedAt: documentUrl ? new Date().toISOString() : "",
      status,
      notes: (notes || "").trim(),
      renewalHistory: [],
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
    const cleanPhone = req.body.customerPhone !== undefined ? (req.body.customerPhone || "").trim() : current.customerPhone;
    const cleanName = req.body.customerName !== undefined ? (req.body.customerName || "").trim() : current.customerName;

    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const total = Number(req.body.totalAmount !== undefined ? req.body.totalAmount : (req.body.authFeePaid !== undefined ? req.body.authFeePaid : (current.totalAmount || current.authFeePaid))) || 0;
    const paid = Number(req.body.paidAmount !== undefined ? req.body.paidAmount : (current.paidAmount || 0)) || 0;
    const payment = computePayment(total, paid);

    const expiry = req.body.expiryDate || current.expiryDate;
    const updatedStatus = computePermitStatus(expiry);
    const assignedRto = req.body.rtoAffiliated || req.body.issuingRto || current.rtoAffiliated || current.issuingRto;

    const updated = {
      ...current,
      ...req.body,
      customerId: customer ? customer.id : current.customerId,
      customerName: cleanName || (customer ? customer.name : current.customerName),
      customerPhone: cleanPhone,
      rtoAffiliated: assignedRto,
      issuingRto: assignedRto,
      documentUrl: req.body.documentUrl !== undefined ? req.body.documentUrl : current.documentUrl,
      documentName: req.body.documentName !== undefined ? req.body.documentName : current.documentName,
      documentSize: req.body.documentSize !== undefined ? Number(req.body.documentSize) : current.documentSize,
      uploadedAt: req.body.documentUrl ? new Date().toISOString() : current.uploadedAt,
      authFeePaid: total,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
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
    const { newPermitNumber, newExpiryDate, newAuthFeePaid, newPaidAmount, documentUrl, documentName, documentSize } = req.body;
    const data = loadData();
    const idx = (data.permits || []).findIndex((p) => p.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Permit not found" });
    }

    const current = data.permits[idx];

    const baseExpiry = current.expiryDate ? new Date(current.expiryDate) : new Date();
    const nextYear = new Date(baseExpiry);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const calculatedExpiry = nextYear.toISOString().split("T")[0];

    const oldSnapshot = {
      id: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      permitNumber: current.permitNumber,
      permitType: current.permitType,
      rtoAffiliated: current.rtoAffiliated || current.issuingRto,
      state: current.state,
      issueDate: current.issueDate,
      expiryDate: current.expiryDate,
      authFeePaid: current.authFeePaid,
      totalAmount: current.totalAmount || current.authFeePaid,
      paidAmount: current.paidAmount || 0,
      dueAmount: current.dueAmount || 0,
      paymentStatus: current.paymentStatus || "Paid",
      documentUrl: current.documentUrl,
      documentName: current.documentName,
      renewedOn: new Date().toISOString().split("T")[0],
      notes: current.notes || ""
    };

    const history = Array.isArray(current.renewalHistory) ? [...current.renewalHistory] : [];
    history.unshift(oldSnapshot);

    const total = newAuthFeePaid ? Number(newAuthFeePaid) : (current.totalAmount || current.authFeePaid);
    const paid = newPaidAmount !== undefined ? Number(newPaidAmount) : total;
    const payment = computePayment(total, paid);

    const renewed = {
      ...current,
      permitNumber: newPermitNumber || `${current.permitNumber}-RNW`,
      expiryDate: newExpiryDate || calculatedExpiry,
      authFeePaid: total,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      documentUrl: documentUrl !== undefined ? documentUrl : current.documentUrl,
      documentName: documentName !== undefined ? documentName : current.documentName,
      documentSize: documentSize !== undefined ? Number(documentSize) : current.documentSize,
      status: "Active",
      renewalHistory: history,
      notes: `Renewed on ${new Date().toISOString().split("T")[0]}. Previous permit: ${current.permitNumber}`
    };

    data.permits[idx] = renewed;
    saveData(data);

    res.json({
      success: true,
      message: `Permit successfully renewed until ${renewed.expiryDate}`,
      data: renewed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
