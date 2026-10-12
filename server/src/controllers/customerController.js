import { loadData, saveData } from "../data/dataStore.js";

const computePayment = (total, paid) => {
  const t = Math.max(0, Number(total) || 0);
  const p = Math.max(0, Number(paid) || 0);
  const due = Math.max(0, t - p);
  let status = "No Charges";
  if (t > 0) {
    if (due === 0) status = "Paid";
    else if (p > 0) status = "Partial";
    else status = "Pending";
  }
  return { totalAmount: t, paidAmount: p, dueAmount: due, paymentStatus: status };
};

export const getCustomers = (req, res) => {
  try {
    const data = loadData();
    let customers = data.customers || [];
    const insurances = data.insurances || [];
    const permits = data.permits || [];
    const { search, paymentStatus } = req.query;

    customers = customers.map((c) => {
      const cleanPhone = (c.phone || "").trim().toLowerCase();
      const custIns = insurances.filter(
        (i) => (i.customerPhone && i.customerPhone.trim().toLowerCase() === cleanPhone) || i.customerId === c.id
      );
      const custPerm = permits.filter(
        (p) => (p.customerPhone && p.customerPhone.trim().toLowerCase() === cleanPhone) || p.customerId === c.id
      );

      const insTotal = custIns.reduce((sum, i) => sum + (Number(i.totalAmount) || Number(i.premiumAmount) || 0), 0);
      const insPaid = custIns.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
      const insDue = custIns.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);

      const permTotal = custPerm.reduce((sum, p) => sum + (Number(p.totalAmount) || Number(p.authFeePaid) || 0), 0);
      const permPaid = custPerm.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
      const permDue = custPerm.reduce((sum, p) => sum + (Number(p.dueAmount) || 0), 0);

      const combinedTotal = (Number(c.totalAmount) || 0) + insTotal + permTotal;
      const combinedPaid = (Number(c.paidAmount) || 0) + insPaid + permPaid;
      const combinedDue = (Number(c.dueAmount) || 0) + insDue + permDue;

      return {
        ...c,
        linkedServices: {
          insurances: custIns,
          permits: custPerm,
          totalCount: custIns.length + custPerm.length
        },
        financials: {
          directTotal: Number(c.totalAmount) || 0,
          directPaid: Number(c.paidAmount) || 0,
          directDue: Number(c.dueAmount) || 0,
          combinedTotal,
          combinedPaid,
          combinedDue
        }
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      customers = customers.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q)) ||
          c.linkedServices.insurances.some((i) => i.vehicleReg?.toLowerCase().includes(q) || i.policyNumber?.toLowerCase().includes(q)) ||
          c.linkedServices.permits.some((p) => p.vehicleReg?.toLowerCase().includes(q) || p.permitNumber?.toLowerCase().includes(q))
      );
    }

    if (paymentStatus && paymentStatus !== "All") {
      if (paymentStatus === "Due") {
        customers = customers.filter((c) => (Number(c.financials.combinedDue) || 0) > 0);
      } else {
        customers = customers.filter((c) => c.paymentStatus === paymentStatus);
      }
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

    const cleanPhone = (customer.phone || "").trim().toLowerCase();
    const custIns = (data.insurances || []).filter(
      (i) => (i.customerPhone && i.customerPhone.trim().toLowerCase() === cleanPhone) || i.customerId === customer.id
    );
    const custPerm = (data.permits || []).filter(
      (p) => (p.customerPhone && p.customerPhone.trim().toLowerCase() === cleanPhone) || p.customerId === customer.id
    );

    res.json({
      success: true,
      data: {
        ...customer,
        linkedServices: {
          insurances: custIns,
          permits: custPerm,
          totalCount: custIns.length + custPerm.length
        }
      }
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
      email,
      address,
      totalAmount,
      paidAmount,
      notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: "Name and Phone number are required." });
    }

    const data = loadData();
    const newId = `CUST-${Date.now().toString().slice(-4)}`;
    const payment = computePayment(totalAmount, paidAmount);

    const newCustomer = {
      id: newId,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      address: (address || "").trim(),
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      notes: (notes || "").trim(),
      createdAt: new Date().toISOString()
    };

    data.customers.unshift(newCustomer);
    saveData(data);

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
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

    const existing = data.customers[idx];
    const totalAmount = req.body.totalAmount !== undefined ? req.body.totalAmount : existing.totalAmount;
    const paidAmount = req.body.paidAmount !== undefined ? req.body.paidAmount : existing.paidAmount;
    const payment = computePayment(totalAmount, paidAmount);

    const updated = {
      ...existing,
      ...req.body,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      id
    };

    // Clean up any deprecated fields if present
    delete updated.serviceType;
    delete updated.vehicleNumber;
    delete updated.status;
    delete updated.docNumber;
    delete updated.dueDate;
    delete updated.amount;

    data.customers[idx] = updated;
    saveData(data);

    res.json({
      success: true,
      message: "Customer updated successfully",
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
