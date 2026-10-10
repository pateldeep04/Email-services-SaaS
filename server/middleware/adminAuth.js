import mongoose from "mongoose";
import { verifyJwtToken } from "../services/authService.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { memoryStore } from "../services/memoryStore.js";

const hasMongo = () => mongoose.connection.readyState === 1;

export async function requireAdmin(req, res, next) {
  let token = "";

  // 1. Check if token exists in session
  if (req.session && req.session.token) {
    token = req.session.token;
  } else {
    // 2. Fallback to Authorization header
    const authHeader = req.header("Authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in as an administrator." });
  }

  try {
    const decoded = verifyJwtToken(token);
    const userId = decoded.id || decoded._id;

    // Fast-reject standard client tokens
    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res.status(403).json({ 
        error: "Access denied. Administrator privileges required to access this resource." 
      });
    }

    // Check dedicated 'Admin' collection first, then 'User' collection, then memoryStore
    let user = null;
    if (hasMongo()) {
      user = await Admin.findById(userId).select("-passwordHash");
      if (!user) {
        user = await User.findById(userId).select("-passwordHash");
      }
    } else {
      user = await memoryStore.findUserById(userId);
    }

    const adminEmail = (process.env.ADMIN_EMAIL || (process.env.NODE_ENV === "test" ? "admin@mailbridge.com" : "")).toLowerCase().trim();
    const ownerEmail = (process.env.GMAIL_USER || "").toLowerCase().trim();
    const decodedEmail = (decoded.email || "").toLowerCase().trim();

    // If account not found by ObjectId but token belongs to master admin email
    if (!user && (decodedEmail === adminEmail || decodedEmail === ownerEmail)) {
      user = {
        _id: userId,
        id: userId,
        email: decodedEmail,
        name: "Super Administrator",
        role: "superadmin"
      };
    }

    if (!user) {
      return res.status(401).json({ error: "Administrator account not found." });
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ 
        error: "Access denied. Administrator privileges required to access this resource." 
      });
    }

    req.user = user;
    req.admin = user;
    next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}
