import ReminderLog from "../models/ReminderLog.js";
import {
  scanUpcomingReminders,
  runAutomatedScanAndDispatch,
  sendWhatsAppMessage,
  getMessageTemplates
} from "../services/whatsappService.js";
import { isDbConnected } from "../config/db.js";

/**
 * Get pending reminder candidates (expiring soon + dues)
 */
export const getUpcomingReminders = async (req, res) => {
  try {
    const days = parseInt(req.query.days || "7", 10);
    const candidates = scanUpcomingReminders(days);
    res.json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get audit log of past sent / simulated WhatsApp messages
 */
export const getReminderLogs = async (req, res) => {
  try {
    if (isDbConnected()) {
      const logs = await ReminderLog.find().sort({ createdAt: -1 }).limit(100).lean();
      return res.json({ success: true, data: logs });
    }
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Trigger automated reminder scan and dispatch (Manual or Cron trigger)
 */
export const triggerAutoScan = async (req, res) => {
  try {
    const days = parseInt(req.body.days || "7", 10);
    const result = await runAutomatedScanAndDispatch(days);
    res.json({
      success: true,
      message: `Automated scan completed. Processed ${result.processed} candidates.`,
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Send an individual WhatsApp reminder
 */
export const sendSingleReminder = async (req, res) => {
  try {
    const { to, customerName, message, type, referenceId, vehicleReg } = req.body;
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: "Phone number and message content are required"
      });
    }

    const log = await sendWhatsAppMessage({
      to,
      customerName,
      message,
      type,
      referenceId,
      vehicleReg
    });

    res.json({
      success: true,
      message: log.status === "sent" ? "Message delivered via WhatsApp Cloud API" : "Simulated message dispatched successfully",
      data: log
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Check current WhatsApp integration status
 */
export const getWhatsAppConfigStatus = (req, res) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const isConfigured = Boolean(token && phoneId && token !== "YOUR_WHATSAPP_ACCESS_TOKEN");

  res.json({
    success: true,
    mode: isConfigured ? "live" : "simulation",
    isConfigured,
    phoneId: phoneId || null,
    info: isConfigured
      ? "Meta WhatsApp Cloud API is connected and active"
      : "Running in Simulation / 1-Click WhatsApp mode (Add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_ID in .env when ready)"
  });
};
