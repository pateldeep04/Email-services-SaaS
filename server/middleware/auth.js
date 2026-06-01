import { verifyJwtToken } from "../services/authService.js";

export function requireAuth(req, res, next) {
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
    return res.status(401).json({ error: "Missing or invalid authentication token." });
  }

  try {
    req.user = verifyJwtToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

