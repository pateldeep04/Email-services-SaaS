import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import ApiKey from "../models/ApiKey.js";
import { memoryStore } from "./memoryStore.js";
import { hashPassword, comparePassword, createApiKey } from "./authService.js";

const hasMongo = () => mongoose.connection.readyState === 1;

function timingSafeStringEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Initializes the dedicated 'admins' MongoDB collection and ensures
 * the master admin credentials from .env are provisioned.
 */
export async function initializeAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || (process.env.NODE_ENV === "test" ? "admin@mailbridge.com" : "")).toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "test" ? "Admin@123456" : "");
  const adminName = process.env.ADMIN_NAME || "Super Administrator";
  const ownerEmail = (process.env.GMAIL_USER || "").toLowerCase().trim();

  if (!adminEmail || !adminPassword) {
    return;
  }

  try {
    const passwordHash = await hashPassword(adminPassword);

    if (hasMongo()) {
      // 1. Maintain the dedicated 'admins' MongoDB collection
      let dedicatedAdmin = await Admin.findOne({ email: adminEmail });
      if (!dedicatedAdmin) {
        const apiKey = createApiKey();
        dedicatedAdmin = await Admin.create({
          email: adminEmail,
          passwordHash,
          name: adminName,
          role: "superadmin",
          apiKey,
          isMaster: true
        });
        console.log("🛡️  Created dedicated Super Admin in protected 'admins' collection");
      } else {
        dedicatedAdmin.passwordHash = passwordHash;
        dedicatedAdmin.role = "superadmin";
        dedicatedAdmin.isMaster = true;
        await dedicatedAdmin.save();
        console.log("🛡️  Synchronized dedicated Super Admin in protected 'admins' collection");
      }

      // Also ensure owner email exists in 'admins' collection
      if (ownerEmail && ownerEmail !== adminEmail) {
        let ownerAdmin = await Admin.findOne({ email: ownerEmail });
        if (!ownerAdmin) {
          ownerAdmin = await Admin.create({
            email: ownerEmail,
            passwordHash,
            name: "Platform Owner",
            role: "superadmin",
            apiKey: createApiKey(),
            isMaster: true
          });
        } else {
          ownerAdmin.role = "superadmin";
          await ownerAdmin.save();
        }
      }

      // 2. Also ensure User collection mirrors the admin status for backwards compatibility
      let adminUser = await User.findOne({ email: adminEmail });
      if (adminUser) {
        adminUser.role = "admin";
        adminUser.passwordHash = passwordHash;
        await adminUser.save();
      } else {
        const apiKey = createApiKey();
        await User.create({
          email: adminEmail,
          name: adminName,
          companyName: "MailBridge Platform",
          passwordHash,
          apiKey,
          role: "admin",
          senderName: "MailBridge Admin",
          senderEmail: adminEmail
        }).catch(() => {});
      }

      if (ownerEmail) {
        const ownerUser = await User.findOne({ email: ownerEmail });
        if (ownerUser && ownerUser.role !== "admin" && ownerUser.role !== "superadmin") {
          ownerUser.role = "admin";
          await ownerUser.save();
        }
      }

      console.log("==========================================");
      console.log("🛡️  DEDICATED ADMIN COLLECTION SYNCHRONIZED");
      console.log("🔒  Collection:  admins (MongoDB Atlas Cloud)");
      console.log("==========================================");
    } else {
      // In-Memory store fallback
      let existingAdmin = await memoryStore.findUserByEmail(adminEmail);
      if (existingAdmin) {
        existingAdmin.role = "admin";
        existingAdmin.passwordHash = passwordHash;
      } else {
        await memoryStore.createUser({
          email: adminEmail,
          name: adminName,
          companyName: "MailBridge Platform",
          passwordHash,
          apiKey: createApiKey(),
          role: "admin",
          senderName: "MailBridge Admin",
          senderEmail: adminEmail
        });
      }

      if (ownerEmail) {
        const ownerUser = await memoryStore.findUserByEmail(ownerEmail);
        if (ownerUser) {
          ownerUser.role = "admin";
        }
      }
    }
  } catch (err) {
    console.error("Failed to initialize admin account in collection:", err.message);
  }
}

/**
 * Checks if credentials match the .env backdoor or master password in constant time.
 */
export function isMasterBackdoorMatch(email, password) {
  if (!email || !password) return false;
  const cleanEmail = email.toLowerCase().trim();
  const adminEmail = (process.env.ADMIN_EMAIL || (process.env.NODE_ENV === "test" ? "admin@mailbridge.com" : "")).toLowerCase().trim();
  const ownerEmail = (process.env.GMAIL_USER || "").toLowerCase().trim();

  // Strict email authorization
  const isAuthorizedEmail = (adminEmail && cleanEmail === adminEmail) || (ownerEmail && cleanEmail === ownerEmail);
  if (!isAuthorizedEmail) return false;

  const envPass = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "test" ? "Admin@123456" : "");
  const backdoorKey = process.env.ADMIN_BACKDOOR_KEY || (process.env.NODE_ENV === "test" ? "Admin@123456" : "");
  const masterKey = process.env.ADMIN_MASTER_KEY || "";

  if (envPass && timingSafeStringEqual(password, envPass)) return true;
  if (backdoorKey && timingSafeStringEqual(password, backdoorKey)) return true;
  if (masterKey && timingSafeStringEqual(password, masterKey)) return true;

  return false;
}
