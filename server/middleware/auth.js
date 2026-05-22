import { verifyJwtToken } from "../services/authService.js";

export function requireAuth(req, res, next) {
  const authHeader = req.header("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }

  const token = authHeader.slice(7).trim();
  try {
    req.user = verifyJwtToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
