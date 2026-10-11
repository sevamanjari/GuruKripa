import { verifyToken, sanitizeInput } from "../utils/security.js";

/**
 * Authentication Middleware: enforces valid Bearer token for protected resources
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please log in to access this resource."
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({
      success: false,
      error: "Session token invalid or expired. Please log in again."
    });
  }

  req.user = payload;
  next();
}

/**
 * Enterprise Security Headers (Clickjacking, MIME Sniffing, XSS protection)
 */
export function securityHeaders(req, res, next) {
  // Prevent clickjacking by forbidding embedding in iframes
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Legacy XSS filter activation
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' http://localhost:5000 http://127.0.0.1:5000;"
  );

  next();
}

/**
 * Recursive Sanitization Middleware to strip script injection from request payloads
 */
export function sanitizeRequestBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    const sanitizeObj = (obj) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "string") {
          obj[key] = sanitizeInput(obj[key]);
        } else if (obj[key] && typeof obj[key] === "object") {
          sanitizeObj(obj[key]);
        }
      }
    };
    sanitizeObj(req.body);
  }
  next();
}
