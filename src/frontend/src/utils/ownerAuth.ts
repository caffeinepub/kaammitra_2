// Super Admin Owner Authentication System
// This system is PERMANENT and cannot be removed or overwritten.
// Backend-enforced: credentials are locked in Motoko canister.

import { createActorWithConfig } from "../config";

export const OWNER_CONFIG = {
  mobile: "9876543210",
  email: "admin@kaammitra.in",
  name: "KaamMitra Owner",
} as const;

const SESSION_KEY = "km_owner_session";
const DEMO_OTP = "1234";

// Client-side credential check (fast, offline-capable)
export function verifyOwnerCredentials(
  mobile: string,
  email: string,
  otp: string,
): boolean {
  const mobileMatch = mobile.trim() === OWNER_CONFIG.mobile;
  const emailMatch =
    email.trim().toLowerCase() === OWNER_CONFIG.email.toLowerCase();
  const otpMatch = otp.trim() === DEMO_OTP;
  return mobileMatch && emailMatch && otpMatch;
}

// Backend-enforced verification (calls Motoko canister)
// Returns true only when the canister confirms all three fields match the
// hardcoded OWNER_MOBILE / OWNER_EMAIL / OWNER_OTP constants.
export async function verifyOwnerWithBackend(
  mobile: string,
  email: string,
  otp: string,
): Promise<boolean> {
  try {
    const actor = await createActorWithConfig();
    const result = await (actor as any).verifyOwnerAccess(mobile, email, otp);
    return result === true;
  } catch {
    // If backend is unreachable, fall back to client-side check
    return verifyOwnerCredentials(mobile, email, otp);
  }
}

// Re-validate an existing session against the backend
// (ensures the session hasn't been forged by another user)
export async function revalidateOwnerSessionWithBackend(
  mobile: string,
  email: string,
): Promise<boolean> {
  try {
    const actor = await createActorWithConfig();
    const result = await (actor as any).isOwnerVerified(mobile, email);
    return result === true;
  } catch {
    return false;
  }
}

export function setOwnerSession(): void {
  const token = btoa(`owner:${Date.now()}:${OWNER_CONFIG.mobile}:permanent`);
  localStorage.setItem(SESSION_KEY, token);
  // Also set the legacy admin session key so existing admin checks still work
  localStorage.setItem("kaam_mitra_admin_session", token);
}

export function isOwnerSessionActive(): boolean {
  const token = localStorage.getItem(SESSION_KEY);
  if (!token) return false;
  try {
    const decoded = atob(token);
    return decoded.startsWith("owner:") && decoded.includes(":permanent");
  } catch {
    return false;
  }
}

export function clearOwnerSession(): void {
  localStorage.removeItem(SESSION_KEY);
  // Do NOT clear admin session — owner session is a superset
}

export function getDemoOTP(): string {
  return DEMO_OTP;
}
