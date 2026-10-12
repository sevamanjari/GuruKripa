import ReminderLog from "../models/ReminderLog.js";
import { loadData } from "../data/dataStore.js";
import { isDbConnected } from "../config/db.js";

/**
 * Standardize Indian and international phone numbers
 * e.g., "9399140893" -> "919399140893"
 */
export const formatPhoneNumber = (rawPhone) => {
  if (!rawPhone) return "";
  const cleaned = rawPhone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
};

/**
 * Generate formatted WhatsApp deep link (wa.me)
 */
export const generateWaLink = (phone, text) => {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) return "";
  return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
};

/**
 * Pre-configured professional WhatsApp reminder templates
 */
export const getMessageTemplates = () => ({
  insurance_renewal: (data) =>
    `नमस्ते ${data.customerName || "ग्राहक"},\n\n` +
    `गुरूकृपा यातायात (RTO एवं बीमा परामर्श) से सादर प्रणाम। 🙏\n\n` +
    `आपके वाहन *${data.vehicleReg || "वाहन"}* की बीमा पॉलिसी (*${data.policyNumber || "पॉलिसी"}*) की वैधता *${data.expiryDate || "निकट"}* को समाप्त हो रही है (${data.daysLeft !== undefined ? (data.daysLeft <= 0 ? "आज समाप्त / समाप्त हो चुकी है" : `${data.daysLeft} दिन शेष`) : ""})।\n\n` +
    `बिना विलंब नवीनीकरण (Renew) करवाएं ताकि सड़क पर भारी चालान व दुर्घटना कवरेज का नुकसान न हो।\n` +
    (data.dueAmount > 0 ? `बकाया राशि: ₹${data.dueAmount}\n\n` : `\n`) +
    `सहायता एवं तुरंत पॉलिसी हेतु संपर्क करें:\n` +
    `📞 गुरूकृपा यातायात सेवा केन्द्र`,

  permit_renewal: (data) =>
    `नमस्ते ${data.customerName || "ग्राहक"},\n\n` +
    `गुरूकृपा यातायात की ओर से सूचना। 🙏\n\n` +
    `आपके वाहन *${data.vehicleReg || "वाहन"}* के *${data.permitType || "परमिट"}* की वैधता दिनांक *${data.expiryDate || "निकट"}* को समाप्त हो रही है।\n\n` +
    `समय से पूर्व नवीनीकरण करवाकर RTO पेनाल्टी से बचें।\n` +
    (data.dueAmount > 0 ? `बकाया शुल्क: ₹${data.dueAmount}\n\n` : `\n`) +
    `संपर्क करें: गुरूकृपा यातायात कार्यालय`,

  payment_due: (data) =>
    `नमस्ते ${data.customerName || "ग्राहक"},\n\n` +
    `गुरूकृपा यातायात से भुगतान सूचना। 🙏\n\n` +
    `आपके खाते में सेवा/पॉलिसी शुल्क के रूप में *₹${data.dueAmount}* का बकाया शेष है।\n` +
    `कृपया असुविधा से बचने हेतु बकाया राशि का शीघ्र भुगतान करें।\n\n` +
    `धन्यवाद,\nगुरूकृपा यातायात`
});

/**
 * Send WhatsApp message via Meta Cloud API or Simulation Mode
 */
export const sendWhatsAppMessage = async ({
  to,
  customerName = "",
  message,
  type = "insurance_renewal",
  referenceId = "",
  vehicleReg = ""
}) => {
  const formattedPhone = formatPhoneNumber(to);
  if (!formattedPhone) {
    throw new Error("Invalid or missing recipient phone number");
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  let result = {
    id: `REM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    recipientPhone: formattedPhone,
    recipientName: customerName,
    referenceId,
    vehicleReg,
    message,
    channel: "whatsapp_cloud_api",
    status: "simulated",
    sentAt: new Date().toISOString()
  };

  // If Meta WhatsApp Cloud API credentials are provided in .env
  if (token && phoneId && token !== "YOUR_WHATSAPP_ACCESS_TOKEN") {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: { preview_url: false, body: message }
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || "Meta API error");
      }

      result.status = "sent";
      result.channel = "whatsapp_cloud_api";
    } catch (err) {
      console.error(`WhatsApp Cloud API error:`, err.message);
      result.status = "failed";
      result.error = err.message;
    }
  } else {
    // Simulation / Queue mode active
    result.status = "simulated";
    result.channel = "simulated";
    console.log(`[WhatsApp Simulation] To: ${formattedPhone} | Type: ${type}`);
    console.log(`[Message Preview]:\n${message}`);
  }

  // Save audit log to MongoDB if connected
  if (isDbConnected()) {
    try {
      await ReminderLog.create(result);
    } catch (dbErr) {
      console.warn("Could not save ReminderLog to MongoDB:", dbErr.message);
    }
  }

  return result;
};

/**
 * Scan database for expiring insurances, permits, and payment dues
 */
export const scanUpcomingReminders = (daysThreshold = 7) => {
  const data = loadData();
  const templates = getMessageTemplates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const candidates = [];

  // 1. Insurance expiries
  (data.insurances || []).forEach((ins) => {
    if (!ins.expiryDate) return;
    const exp = new Date(ins.expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Expiries within threshold days (or expired within last 15 days)
    if (diffDays <= daysThreshold && diffDays >= -15) {
      const msg = templates.insurance_renewal({
        customerName: ins.customerName,
        vehicleReg: ins.vehicleReg,
        policyNumber: ins.policyNumber,
        expiryDate: ins.expiryDate,
        daysLeft: diffDays,
        dueAmount: ins.dueAmount || 0
      });

      candidates.push({
        id: `CAND-INS-${ins.id}`,
        referenceId: ins.id,
        type: "insurance_renewal",
        category: "Insurance",
        customerName: ins.customerName,
        customerPhone: ins.customerPhone,
        vehicleReg: ins.vehicleReg,
        expiryDate: ins.expiryDate,
        daysLeft: diffDays,
        dueAmount: ins.dueAmount || 0,
        policyNumber: ins.policyNumber,
        insuranceCompany: ins.insuranceCompany,
        message: msg,
        waLink: generateWaLink(ins.customerPhone, msg),
        urgency: diffDays <= 0 ? "expired" : diffDays <= 3 ? "critical" : "upcoming"
      });
    }
  });

  // 2. Permit expiries
  (data.permits || []).forEach((pmt) => {
    if (!pmt.expiryDate) return;
    const exp = new Date(pmt.expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= daysThreshold && diffDays >= -15) {
      const msg = templates.permit_renewal({
        customerName: pmt.customerName,
        vehicleReg: pmt.vehicleReg,
        permitType: pmt.permitType,
        expiryDate: pmt.expiryDate,
        daysLeft: diffDays,
        dueAmount: pmt.dueAmount || 0
      });

      candidates.push({
        id: `CAND-PMT-${pmt.id}`,
        referenceId: pmt.id,
        type: "permit_renewal",
        category: "Permit",
        customerName: pmt.customerName,
        customerPhone: pmt.customerPhone,
        vehicleReg: pmt.vehicleReg,
        expiryDate: pmt.expiryDate,
        daysLeft: diffDays,
        dueAmount: pmt.dueAmount || 0,
        permitType: pmt.permitType,
        message: msg,
        waLink: generateWaLink(pmt.customerPhone, msg),
        urgency: diffDays <= 0 ? "expired" : diffDays <= 3 ? "critical" : "upcoming"
      });
    }
  });

  // 3. Payment dues
  (data.customers || []).forEach((cust) => {
    if ((cust.dueAmount || 0) > 0) {
      const msg = templates.payment_due({
        customerName: cust.name,
        dueAmount: cust.dueAmount
      });

      candidates.push({
        id: `CAND-DUE-${cust.id}`,
        referenceId: cust.id,
        type: "payment_due",
        category: "Payment Due",
        customerName: cust.name,
        customerPhone: cust.phone,
        vehicleReg: "-",
        expiryDate: "-",
        daysLeft: null,
        dueAmount: cust.dueAmount,
        message: msg,
        waLink: generateWaLink(cust.phone, msg),
        urgency: "due"
      });
    }
  });

  return candidates;
};

/**
 * Execute automated scan and dispatch reminders
 */
export const runAutomatedScanAndDispatch = async (daysThreshold = 7) => {
  const candidates = scanUpcomingReminders(daysThreshold);
  const results = [];

  for (const cand of candidates) {
    if (!cand.customerPhone) {
      results.push({
        referenceId: cand.referenceId,
        status: "skipped",
        reason: "No phone number"
      });
      continue;
    }

    try {
      const res = await sendWhatsAppMessage({
        to: cand.customerPhone,
        customerName: cand.customerName,
        message: cand.message,
        type: cand.type,
        referenceId: cand.referenceId,
        vehicleReg: cand.vehicleReg
      });
      results.push(res);
    } catch (err) {
      results.push({
        referenceId: cand.referenceId,
        status: "failed",
        error: err.message
      });
    }
  }

  return {
    totalScanned: candidates.length,
    processed: results.length,
    results
  };
};
