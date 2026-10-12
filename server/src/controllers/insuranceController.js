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
      notes: "Auto-registered via Insurance entry",
      createdAt: new Date().toISOString()
    };
    data.customers.unshift(customer);
  }
  return customer;
};

export const getInsurances = (req, res) => {
  try {
    const data = loadData();
    let insurances = data.insurances || [];
    const { search, status, paymentStatus, vehicleId, customerId, customerPhone } = req.query;

    // Recalculate dynamic status based on current date
    insurances = insurances.map((item) => {
      const total = item.totalAmount !== undefined ? item.totalAmount : (item.premiumAmount || 0);
      const paid = item.paidAmount || 0;
      const payment = computePayment(total, paid);
      return {
        ...item,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        dueAmount: payment.dueAmount,
        paymentStatus: item.paymentStatus || payment.paymentStatus,
        computedStatus: computeStatus(item.expiryDate)
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      insurances = insurances.filter(
        (i) =>
          i.policyNumber.toLowerCase().includes(q) ||
          i.vehicleReg.toLowerCase().includes(q) ||
          (i.customerName && i.customerName.toLowerCase().includes(q)) ||
          (i.customerPhone && i.customerPhone.toLowerCase().includes(q)) ||
          i.insuranceCompany.toLowerCase().includes(q) ||
          (i.coverageType && i.coverageType.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      insurances = insurances.filter((i) => (i.computedStatus || i.status) === status);
    }

    if (paymentStatus && paymentStatus !== "All") {
      if (paymentStatus === "Due") {
        insurances = insurances.filter((i) => (Number(i.dueAmount) || 0) > 0);
      } else {
        insurances = insurances.filter((i) => i.paymentStatus === paymentStatus);
      }
    }

    if (vehicleId) {
      insurances = insurances.filter((i) => i.vehicleId === vehicleId);
    }

    if (customerId) {
      insurances = insurances.filter((i) => i.customerId === customerId);
    }

    if (customerPhone) {
      insurances = insurances.filter((i) => (i.customerPhone || "").trim() === customerPhone.trim());
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

    const total = insurance.totalAmount !== undefined ? insurance.totalAmount : (insurance.premiumAmount || 0);
    const paid = insurance.paidAmount || 0;
    const payment = computePayment(total, paid);

    res.json({
      success: true,
      data: {
        ...insurance,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        dueAmount: payment.dueAmount,
        paymentStatus: insurance.paymentStatus || payment.paymentStatus,
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
      customerName,
      customerPhone,
      insuranceCompany,
      coverageType,
      issueDate,
      expiryDate,
      idvAmount,
      premiumAmount,
      totalAmount,
      paidAmount,
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
    const cleanPhone = (customerPhone || "").trim();
    const cleanName = (customerName || "").trim();

    // Primary link via customer phone
    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const newId = `INS-${Date.now().toString().slice(-4)}`;
    const status = computeStatus(expiryDate);

    const total = Number(totalAmount !== undefined ? totalAmount : premiumAmount) || 0;
    const paid = Number(paidAmount) || 0;
    const payment = computePayment(total, paid);

    const newInsurance = {
      id: newId,
      policyNumber: policyNumber.trim().toUpperCase(),
      vehicleId: effVehicleId.trim().toUpperCase(),
      vehicleReg: (req.body.vehicleReg || effVehicleId).toUpperCase().trim(),
      customerId: customer ? customer.id : (req.body.customerId || ""),
      customerName: cleanName || (customer ? customer.name : "Customer"),
      customerPhone: cleanPhone,
      insuranceCompany: insuranceCompany.trim(),
      coverageType: coverageType || "Comprehensive Package",
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate,
      idvAmount: Number(idvAmount) || 0,
      premiumAmount: total,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
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
    const cleanPhone = req.body.customerPhone !== undefined ? (req.body.customerPhone || "").trim() : current.customerPhone;
    const cleanName = req.body.customerName !== undefined ? (req.body.customerName || "").trim() : current.customerName;

    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const total = Number(req.body.totalAmount !== undefined ? req.body.totalAmount : (req.body.premiumAmount !== undefined ? req.body.premiumAmount : (current.totalAmount || current.premiumAmount))) || 0;
    const paid = Number(req.body.paidAmount !== undefined ? req.body.paidAmount : (current.paidAmount || 0)) || 0;
    const payment = computePayment(total, paid);

    const expiry = req.body.expiryDate || current.expiryDate;
    const updatedStatus = computeStatus(expiry);

    const updated = {
      ...current,
      ...req.body,
      customerId: customer ? customer.id : current.customerId,
      customerName: cleanName || (customer ? customer.name : current.customerName),
      customerPhone: cleanPhone,
      premiumAmount: total,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
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
    const { newPolicyNumber, newPremiumAmount, newPaidAmount, newIdvAmount, newNcbPercentage } = req.body;
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
      totalAmount: current.totalAmount || current.premiumAmount,
      paidAmount: current.paidAmount || 0,
      dueAmount: current.dueAmount || 0,
      paymentStatus: current.paymentStatus || "Paid",
      idvAmount: current.idvAmount,
      ncbPercentage: current.ncbPercentage,
      renewedOn: new Date().toISOString().split("T")[0],
      notes: current.notes || ""
    };

    const history = Array.isArray(current.renewalHistory) ? [...current.renewalHistory] : [];
    history.unshift(oldSnapshot);

    const total = newPremiumAmount ? Number(newPremiumAmount) : (current.totalAmount || current.premiumAmount);
    const paid = newPaidAmount !== undefined ? Number(newPaidAmount) : total;
    const payment = computePayment(total, paid);

    const renewed = {
      ...current,
      policyNumber: newPolicyNumber || `${current.policyNumber}-RNW`,
      issueDate: startDate,
      expiryDate: newExpiry,
      premiumAmount: total,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
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
