const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

export function isFast2SmsConfigured(): boolean {
  return Boolean(process.env.FAST2SMS_API_KEY?.trim());
}

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY?.trim();
  const message = `Your OTP for Mahindra Happinest Palghar survey is ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || "10"} minutes. Do not share this code.`;

  if (!apiKey) {
    console.log(`[SMS] Fast2SMS not configured. OTP for ${phone}: ${otp}`);
    return;
  }

  const response = await fetch(FAST2SMS_URL, {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      route: "q",
      message,
      language: "english",
      flash: 0,
      numbers: phone,
    }),
  });

  const result = (await response.json().catch(() => null)) as {
    return?: boolean;
    status_code?: number;
    message?: string | string[];
  } | null;

  if (!response.ok || result?.return === false) {
    const detail = Array.isArray(result?.message)
      ? result.message.join(", ")
      : result?.message || `HTTP ${response.status}`;
    throw new Error(`Fast2SMS failed: ${detail}`);
  }
}
