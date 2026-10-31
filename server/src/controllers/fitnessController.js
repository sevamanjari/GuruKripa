import { loadData, saveData } from "../data/dataStore.js";
import { normalizeDateToISO } from "../utils/dateNormalizer.js";

const computeStatus = (expiryDate) => {
  if (!expiryDate) return "Active";
  const now = new Date();
  const expiry = new Date(normalizeDateToISO(expiryDate));
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
      notes: "Auto-registered via Fitness entry",
      createdAt: new Date().toISOString()
    };
    if (!data.customers) data.customers = [];
    data.customers.unshift(customer);
  }
  return customer;
};

export const getFitnessList = (req, res) => {
  try {
    const data = loadData();
    let fitnessList = data.fitness || [];
    const { search, status, paymentStatus, vehicleReg, customerPhone } = req.query;

    fitnessList = fitnessList.map((item) => {
      const total = Number(item.totalAmount) || 0;
      const paid = Number(item.paidAmount) || 0;
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
      fitnessList = fitnessList.filter(
        (f) =>
          (f.fitnessNumber && f.fitnessNumber.toLowerCase().includes(q)) ||
          (f.vehicleReg && f.vehicleReg.toLowerCase().includes(q)) ||
          (f.customerName && f.customerName.toLowerCase().includes(q)) ||
          (f.customerPhone && f.customerPhone.toLowerCase().includes(q)) ||
          (f.rtoAffiliated && f.rtoAffiliated.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      fitnessList = fitnessList.filter((f) => (f.computedStatus || f.status) === status);
    }

    if (paymentStatus && paymentStatus !== "All") {
      if (paymentStatus === "Due") {
        fitnessList = fitnessList.filter((f) => (Number(f.dueAmount) || 0) > 0);
      } else {
        fitnessList = fitnessList.filter((f) => f.paymentStatus === paymentStatus);
      }
    }

    if (vehicleReg) {
      fitnessList = fitnessList.filter(
        (f) => (f.vehicleReg || "").toLowerCase() === vehicleReg.toLowerCase()
      );
    }

    if (customerPhone) {
      fitnessList = fitnessList.filter(
        (f) => (f.customerPhone || "").trim() === customerPhone.trim()
      );
    }

    res.json({
      success: true,
      count: fitnessList.length,
      data: fitnessList
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFitnessById = (req, res) => {
  try {
    const data = loadData();
    const fitness = (data.fitness || []).find((f) => f.id === req.params.id);

    if (!fitness) {
      return res.status(404).json({ success: false, error: "Fitness record not found" });
    }

    const total = Number(fitness.totalAmount) || 0;
    const paid = Number(fitness.paidAmount) || 0;
    const payment = computePayment(total, paid);

    res.json({
      success: true,
      data: {
        ...fitness,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        dueAmount: payment.dueAmount,
        paymentStatus: fitness.paymentStatus || payment.paymentStatus,
        computedStatus: computeStatus(fitness.expiryDate)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFitness = (req, res) => {
  try {
    const {
      fitnessNumber,
      vehicleReg,
      customerName,
      customerPhone,
      rtoAffiliated,
      issueDate,
      expiryDate,
      documentUrl,
      documentName,
      documentSize,
      totalAmount,
      paidAmount,
      notes
    } = req.body;

    const normalizedExpiry = normalizeDateToISO(expiryDate);
    const normalizedIssue = issueDate ? normalizeDateToISO(issueDate) : new Date().toISOString().split("T")[0];

    if (!vehicleReg || !normalizedExpiry) {
      return res.status(400).json({
        success: false,
        error: "Vehicle number and Expiry Date are required."
      });
    }

    const data = loadData();
    if (!data.fitness) data.fitness = [];

    const cleanPhone = (customerPhone || "").trim();
    const cleanName = (customerName || "").trim();
    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const newId = `FIT-${Date.now().toString().slice(-4)}`;
    const status = computeStatus(normalizedExpiry);
    const payment = computePayment(totalAmount, paidAmount);

    const newFitness = {
      id: newId,
      fitnessNumber: (fitnessNumber || "").trim().toUpperCase(),
      vehicleReg: vehicleReg.trim().toUpperCase(),
      customerId: customer ? customer.id : (req.body.customerId || ""),
      customerName: cleanName || (customer ? customer.name : "Customer"),
      customerPhone: cleanPhone,
      rtoAffiliated: (rtoAffiliated || "RTO Indore (MP-09)").trim(),
      issueDate: normalizedIssue,
      expiryDate: normalizedExpiry,
      documentUrl: documentUrl || "",
      documentName: documentName || "",
      documentSize: Number(documentSize) || 0,
      uploadedAt: documentUrl ? new Date().toISOString() : "",
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      status,
      notes: (notes || "").trim(),
      renewalHistory: [],
      createdAt: new Date().toISOString()
    };

    data.fitness.unshift(newFitness);
    saveData(data);

    res.status(201).json({
      success: true,
      message: "Fitness certificate created successfully",
      data: newFitness
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateFitness = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    if (!data.fitness) data.fitness = [];
    const idx = data.fitness.findIndex((f) => f.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Fitness record not found" });
    }

    const current = data.fitness[idx];
    const cleanPhone = req.body.customerPhone !== undefined ? (req.body.customerPhone || "").trim() : current.customerPhone;
    const cleanName = req.body.customerName !== undefined ? (req.body.customerName || "").trim() : current.customerName;
    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const total = req.body.totalAmount !== undefined ? req.body.totalAmount : current.totalAmount;
    const paid = req.body.paidAmount !== undefined ? req.body.paidAmount : current.paidAmount;
    const payment = computePayment(total, paid);

    const rawExpiry = req.body.expiryDate || current.expiryDate;
    const expiry = normalizeDateToISO(rawExpiry);
    const updatedStatus = computeStatus(expiry);

    if (req.body.issueDate) {
      req.body.issueDate = normalizeDateToISO(req.body.issueDate);
    }

    const updated = {
      ...current,
      ...req.body,
      expiryDate: expiry,
      customerId: customer ? customer.id : current.customerId,
      customerName: cleanName || (customer ? customer.name : current.customerName),
      customerPhone: cleanPhone,
      vehicleReg: req.body.vehicleReg ? req.body.vehicleReg.trim().toUpperCase() : current.vehicleReg,
      rtoAffiliated: req.body.rtoAffiliated ? req.body.rtoAffiliated.trim() : current.rtoAffiliated,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      status: updatedStatus,
      id
    };

    data.fitness[idx] = updated;
    saveData(data);

    res.json({
      success: true,
      message: "Fitness certificate updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteFitness = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    if (!data.fitness) data.fitness = [];
    const idx = data.fitness.findIndex((f) => f.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Fitness record not found" });
    }

    const removed = data.fitness.splice(idx, 1)[0];
    saveData(data);

    res.json({
      success: true,
      message: `Fitness record deleted successfully`,
      data: removed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const renewFitness = (req, res) => {
  try {
    const { id } = req.params;
    const { newExpiryDate, newTotalAmount, newPaidAmount, documentUrl, documentName, documentSize } = req.body;
    const data = loadData();
    if (!data.fitness) data.fitness = [];
    const idx = data.fitness.findIndex((f) => f.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Fitness record not found" });
    }

    const current = data.fitness[idx];

    let newExpiry = newExpiryDate ? normalizeDateToISO(newExpiryDate) : "";
    if (!newExpiry) {
      const baseDate = new Date(current.expiryDate) > new Date() ? new Date(current.expiryDate) : new Date();
      const nextYear = new Date(baseDate);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      newExpiry = nextYear.toISOString().split("T")[0];
    }

    const oldSnapshot = {
      id: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fitnessNumber: current.fitnessNumber,
      expiryDate: current.expiryDate,
      totalAmount: current.totalAmount || 0,
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

    const total = newTotalAmount !== undefined ? Number(newTotalAmount) : current.totalAmount;
    const paid = newPaidAmount !== undefined ? Number(newPaidAmount) : total;
    const payment = computePayment(total, paid);

    const renewed = {
      ...current,
      expiryDate: newExpiry,
      issueDate: new Date().toISOString().split("T")[0],
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      documentUrl: documentUrl !== undefined ? documentUrl : current.documentUrl,
      documentName: documentName !== undefined ? documentName : current.documentName,
      documentSize: documentSize !== undefined ? Number(documentSize) : current.documentSize,
      status: "Active",
      renewalHistory: history,
      notes: `Renewed on ${new Date().toISOString().split("T")[0]}. Previous expiry: ${current.expiryDate}`
    };

    data.fitness[idx] = renewed;
    saveData(data);

    res.json({
      success: true,
      message: `Fitness certificate renewed until ${newExpiry}`,
      data: renewed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
