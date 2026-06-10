export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return normalized.length === 10 && /^[6-9]\d{9}$/.test(normalized);
}

export function getOTPExpiryDate(): Date {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}
