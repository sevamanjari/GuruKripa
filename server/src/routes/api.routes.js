import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/customerController.js";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from "../controllers/vehicleController.js";
import {
  getInsurances,
  getInsuranceById,
  createInsurance,
  updateInsurance,
  deleteInsurance,
  renewInsurance
} from "../controllers/insuranceController.js";
import {
  getPermits,
  getPermitById,
  createPermit,
  updatePermit,
  deletePermit,
  renewPermit
} from "../controllers/permitController.js";
import {
  getDashboardStats,
  getRtoServices,
  resetApplicationData
} from "../controllers/dashboardController.js";
import {
  getUnderwriters,
  createUnderwriter,
  updateUnderwriter,
  deleteUnderwriter
} from "../controllers/underwriterController.js";
import { login, getCurrentUser } from "../controllers/authController.js";
import { authenticateToken, sanitizeRequestBody } from "../middleware/authMiddleware.js";
import { isDbConnected } from "../config/db.js";

const router = express.Router();

// Apply sanitization to all incoming body requests
router.use(sanitizeRequestBody);

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "GuruKripa Yatayat RTO Portal",
    database: isDbConnected() ? "MongoDB Atlas (Online)" : "Fallback JSON Datastore (Local)",
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoint
router.post("/auth/login", login);

// ==========================================
// 2. PROTECTED ROUTES (Requires valid Bearer token)
// ==========================================
router.get("/auth/me", authenticateToken, getCurrentUser);

// Dashboard Overview
router.get("/dashboard/stats", authenticateToken, getDashboardStats);
router.get("/rto-services", authenticateToken, getRtoServices);
router.post("/reset-data", authenticateToken, resetApplicationData);

// Customers CRUD
router.get("/customers", authenticateToken, getCustomers);
router.get("/customers/:id", authenticateToken, getCustomerById);
router.post("/customers", authenticateToken, createCustomer);
router.put("/customers/:id", authenticateToken, updateCustomer);
router.delete("/customers/:id", authenticateToken, deleteCustomer);

// Vehicles CRUD
router.get("/vehicles", authenticateToken, getVehicles);
router.get("/vehicles/:id", authenticateToken, getVehicleById);
router.post("/vehicles", authenticateToken, createVehicle);
router.put("/vehicles/:id", authenticateToken, updateVehicle);
router.delete("/vehicles/:id", authenticateToken, deleteVehicle);

// Vehicle Insurances CRUD + Renew
router.get("/insurances", authenticateToken, getInsurances);
router.get("/insurances/:id", authenticateToken, getInsuranceById);
router.post("/insurances", authenticateToken, createInsurance);
router.put("/insurances/:id", authenticateToken, updateInsurance);
router.delete("/insurances/:id", authenticateToken, deleteInsurance);
router.post("/insurances/:id/renew", authenticateToken, renewInsurance);

// Insurance Underwriters (Custom company profiles based on user dealings)
router.get("/underwriters", authenticateToken, getUnderwriters);
router.post("/underwriters", authenticateToken, createUnderwriter);
router.put("/underwriters/:id", authenticateToken, updateUnderwriter);
router.delete("/underwriters/:id", authenticateToken, deleteUnderwriter);

// Vehicle Permits CRUD + Renew
router.get("/permits", authenticateToken, getPermits);
router.get("/permits/:id", authenticateToken, getPermitById);
router.post("/permits", authenticateToken, createPermit);
router.put("/permits/:id", authenticateToken, updatePermit);
router.delete("/permits/:id", authenticateToken, deletePermit);
router.post("/permits/:id/renew", authenticateToken, renewPermit);

export default router;
