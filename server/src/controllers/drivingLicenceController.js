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
      notes: "Auto-registered via Driving Licence entry",
      createdAt: new Date().toISOString()
    };
    if (!data.customers) data.customers = [];
    data.customers.unshift(customer);
  }
  return customer;
};

export const getDrivingLicences = (req, res) => {
  try {
    const data = loadData();
    let dlList = data.drivingLicences || [];
    const { search, status, paymentStatus, customerPhone } = req.query;

    dlList = dlList.map((item) => {
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
      dlList = dlList.filter(
        (dl) =>
          (dl.dlNumber && dl.dlNumber.toLowerCase().includes(q)) ||
          (dl.customerName && dl.customerName.toLowerCase().includes(q)) ||
          (dl.customerPhone && dl.customerPhone.toLowerCase().includes(q)) ||
          (dl.rtoAffiliated && dl.rtoAffiliated.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      dlList = dlList.filter((dl) => (dl.computedStatus || dl.status) === status);
    }

    if (paymentStatus && paymentStatus !== "All") {
      if (paymentStatus === "Due") {
        dlList = dlList.filter((dl) => (Number(dl.dueAmount) || 0) > 0);
      } else {
        dlList = dlList.filter((dl) => dl.paymentStatus === paymentStatus);
      }
    }

    if (customerPhone) {
      dlList = dlList.filter(
        (dl) => (dl.customerPhone || "").trim() === customerPhone.trim()
      );
    }

    res.json({
      success: true,
      count: dlList.length,
      data: dlList
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDrivingLicenceById = (req, res) => {
  try {
    const data = loadData();
    const dl = (data.drivingLicences || []).find((d) => d.id === req.params.id);

    if (!dl) {
      return res.status(404).json({ success: false, error: "Driving licence record not found" });
    }

    const total = Number(dl.totalAmount) || 0;
    const paid = Number(dl.paidAmount) || 0;
    const payment = computePayment(total, paid);

    res.json({
      success: true,
      data: {
        ...dl,
        totalAmount: payment.totalAmount,
        paidAmount: payment.paidAmount,
        dueAmount: payment.dueAmount,
        paymentStatus: dl.paymentStatus || payment.paymentStatus,
        computedStatus: computeStatus(dl.expiryDate)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDrivingLicence = (req, res) => {
  try {
    const {
      dlNumber,
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

    if (!customerName || !expiryDate) {
      return res.status(400).json({
        success: false,
        error: "Customer Name and Expiry Date are required."
      });
    }

    const data = loadData();
    if (!data.drivingLicences) data.drivingLicences = [];

    const cleanPhone = (customerPhone || "").trim();
    const cleanName = (customerName || "").trim();
    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const newId = `DL-${Date.now().toString().slice(-4)}`;
    const status = computeStatus(expiryDate);
    const payment = computePayment(totalAmount, paidAmount);

    const newDL = {
      id: newId,
      dlNumber: (dlNumber || "").trim().toUpperCase(),
      customerId: customer ? customer.id : (req.body.customerId || ""),
      customerName: cleanName,
      customerPhone: cleanPhone,
      rtoAffiliated: (rtoAffiliated || "RTO Indore (MP-09)").trim(),
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate,
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

    data.drivingLicences.unshift(newDL);
    saveData(data);

    res.status(201).json({
      success: true,
      message: "Driving licence created successfully",
      data: newDL
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDrivingLicence = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    if (!data.drivingLicences) data.drivingLicences = [];
    const idx = data.drivingLicences.findIndex((d) => d.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Driving licence record not found" });
    }

    const current = data.drivingLicences[idx];
    const cleanPhone = req.body.customerPhone !== undefined ? (req.body.customerPhone || "").trim() : current.customerPhone;
    const cleanName = req.body.customerName !== undefined ? (req.body.customerName || "").trim() : current.customerName;
    const customer = linkOrCreateCustomer(data, cleanPhone, cleanName);

    const total = req.body.totalAmount !== undefined ? req.body.totalAmount : current.totalAmount;
    const paid = req.body.paidAmount !== undefined ? req.body.paidAmount : current.paidAmount;
    const payment = computePayment(total, paid);

    const expiry = req.body.expiryDate || current.expiryDate;
    const updatedStatus = computeStatus(expiry);

    const updated = {
      ...current,
      ...req.body,
      customerId: customer ? customer.id : current.customerId,
      customerName: cleanName || current.customerName,
      customerPhone: cleanPhone,
      rtoAffiliated: req.body.rtoAffiliated ? req.body.rtoAffiliated.trim() : current.rtoAffiliated,
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
      paymentStatus: payment.paymentStatus,
      status: updatedStatus,
      id
    };

    data.drivingLicences[idx] = updated;
    saveData(data);

    res.json({
      success: true,
      message: "Driving licence updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDrivingLicence = (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    if (!data.drivingLicences) data.drivingLicences = [];
    const idx = data.drivingLicences.findIndex((d) => d.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Driving licence record not found" });
    }

    const removed = data.drivingLicences.splice(idx, 1)[0];
    saveData(data);

    res.json({
      success: true,
      message: `Driving licence deleted successfully`,
      data: removed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const renewDrivingLicence = (req, res) => {
  try {
    const { id } = req.params;
    const { newExpiryDate, newTotalAmount, newPaidAmount, documentUrl, documentName, documentSize } = req.body;
    const data = loadData();
    if (!data.drivingLicences) data.drivingLicences = [];
    const idx = data.drivingLicences.findIndex((d) => d.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Driving licence record not found" });
    }

    const current = data.drivingLicences[idx];

    let newExpiry = newExpiryDate;
    if (!newExpiry) {
      const baseDate = new Date(current.expiryDate) > new Date() ? new Date(current.expiryDate) : new Date();
      const nextYears = new Date(baseDate);
      nextYears.setFullYear(nextYears.getFullYear() + 5); // DL renewal default is 5 years
      newExpiry = nextYears.toISOString().split("T")[0];
    }

    const oldSnapshot = {
      id: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      dlNumber: current.dlNumber,
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

    data.drivingLicences[idx] = renewed;
    saveData(data);

    res.json({
      success: true,
      message: `Driving licence renewed until ${newExpiry}`,
      data: renewed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
