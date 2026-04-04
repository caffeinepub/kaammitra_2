// localStorage-backed lock state management for KaamMitra security features

export const LOCK_KEYS = {
  LOGO_LOCKED: "km_logo_locked",
  FEATURE_LOCKED: "km_feature_locked",
  PAYMENT_REQUIRED: "km_payment_required",
  OTP_ENABLED: "km_otp_enabled",
  RAZORPAY_KEY: "km_razorpay_key",
  LOGO_URL: "km_logo_url",
  MSG91_KEY: "km_msg91_key",
  SENDGRID_KEY: "km_sendgrid_key",
} as const;

export function getLockState(key: string, defaultValue = false): boolean {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    return val === "true";
  } catch {
    return defaultValue;
  }
}

export function setLockState(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? "true" : "false");
  } catch {
    // ignore storage errors
  }
}

export function getStringState(key: string, defaultValue = ""): string {
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStringState(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
}
