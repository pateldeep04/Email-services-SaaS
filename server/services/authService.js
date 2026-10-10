import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "test" ? "test_fallback_entropy_key_64_bytes_0123456789abcdef0123456789abcdef" : null);

if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not configured. Please define a cryptographically secure key in .env.");
}

export function createApiKey() {
  return `mb_${crypto.randomBytes(16).toString("hex")}`;
}

export function createJwtToken(user, customExpiresIn = null) {
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const expiresIn = customExpiresIn || (isAdmin ? "8h" : "7d");

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "client"
    },
    JWT_SECRET,
    { expiresIn }
  );
}

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function verifyJwtToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
