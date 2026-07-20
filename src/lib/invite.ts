import { createHash, randomBytes, timingSafeEqual } from "crypto";

const TOKEN_BYTES = 32;

export function generateInviteToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function buildInviteUrl(token: string, baseUrl?: string): string {
  const origin = (baseUrl || process.env.SURVEY_BASE_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");
  return `${origin}/invite/${token}`;
}

export function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    if (Number.isInteger(value) || Number.isFinite(value)) {
      return String(Math.trunc(value));
    }
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value).trim();
}

export function cellToPhone(value: unknown): string {
  const digits = cellToString(value).replace(/\D/g, "");
  return digits.slice(-10);
}
