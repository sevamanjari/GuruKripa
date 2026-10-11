import { signToken, verifyToken } from "../utils/security.js";

// System credentials for office operators and administrators
const USERS = [
  {
    id: "usr_admin",
    username: "admin",
    password: process.env.ADMIN_PASSWORD || "gurukripa2026",
    name: "GuruKripa Admin",
    role: "Administrator",
    office: "Indore Transport Hub"
  },
  {
    id: "usr_operator",
    username: "operator",
    password: process.env.OPERATOR_PASSWORD || "rto123",
    name: "RTO Desk Operator",
    role: "Desk Officer",
    office: "Counter #1"
  }
];

export const login = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Please enter both username and password."
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = USERS.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password. Please verify credentials."
      });
    }

    // Generate secure session token valid for 24 hours
    const token = signToken({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        office: user.office
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCurrentUser = (req, res) => {
  // req.user is set by authMiddleware
  res.json({
    success: true,
    user: req.user
  });
};
