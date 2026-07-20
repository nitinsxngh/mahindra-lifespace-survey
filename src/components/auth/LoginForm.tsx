"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Disclaimer } from "@/components/layout/Disclaimer";
import { isValidPhone } from "@/lib/otp";

type Step = "phone" | "otp" | "disclaimer";

const OTP_LENGTH = 6;

interface LoginFormProps {
  inviteToken: string;
  lockedPhone: string;
  applicantName?: string;
}

export function LoginForm({
  inviteToken,
  lockedPhone,
  applicantName,
}: LoginFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone] = useState(lockedPhone);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const isOtpComplete = otp.length === OTP_LENGTH;
  const canSendOtp = isValidPhone(phone) && !!inviteToken;
  const isBusy = isSendingOtp || isVerifyingOtp || isContinuing;

  async function handleSendOtp(e?: FormEvent) {
    e?.preventDefault();
    if (!canSendOtp || isBusy) return;

    setError("");
    if (step === "phone") setInfo("");
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, inviteToken }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setInfo("OTP sent to your mobile number.");
      setStep("otp");
      setOtp("");
    } catch (err) {
      console.error("Send OTP failed:", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (!isOtpComplete || isBusy) return;

    setError("");
    setIsVerifyingOtp(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, inviteToken }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Verification failed");
        return;
      }

      setStep("disclaimer");
    } catch (err) {
      console.error("Verify OTP failed:", err);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleAgreeAndContinue() {
    setIsContinuing(true);
    router.push("/survey");
    router.refresh();
  }

  if (step === "disclaimer") {
    return (
      <Disclaimer
        showAgreeButton
        onAgree={handleAgreeAndContinue}
        loading={isContinuing}
      />
    );
  }

  return (
    <div className="card mx-auto w-full max-w-md p-6 sm:p-8">
      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          {applicantName ? (
            <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Welcome, <strong>{applicantName}</strong>
            </p>
          ) : null}

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-charcoal-700"
            >
              Mobile Number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-charcoal-500">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                className="input-field cursor-not-allowed bg-charcoal-50 pl-14 text-charcoal-700"
                value={phone}
                readOnly
                aria-readonly="true"
              />
            </div>
            <p className="mt-2 text-xs text-charcoal-500">
              Your mobile number is linked to this secure survey link. We will
              send a one-time password via SMS to verify.
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <Button
            type="submit"
            loading={isSendingOtp}
            disabled={!canSendOtp}
            className="w-full"
          >
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-charcoal-700"
            >
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              placeholder="6-digit code"
              className="input-field text-center text-lg tracking-[0.4em]"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
              }
              required
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-xs text-charcoal-500">
              Sent to +91 {phone}
            </p>
          </div>

          {info && <Alert type="info" message={info} />}
          {error && <Alert type="error" message={error} />}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSendOtp()}
              loading={isSendingOtp}
              disabled={isVerifyingOtp}
              className="w-full sm:flex-1"
            >
              Resend OTP
            </Button>
            <Button
              type="submit"
              loading={isVerifyingOtp}
              disabled={!isOtpComplete || isSendingOtp}
              className="w-full sm:flex-1"
            >
              Verify & Continue
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
