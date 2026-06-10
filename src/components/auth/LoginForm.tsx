"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Step = "phone" | "otp";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setInfo(data.message || "OTP sent successfully");
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Verification failed");
        return;
      }

      router.push("/survey");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeNumber() {
    setStep("phone");
    setOtp("");
    setError("");
    setInfo("");
  }

  return (
    <div className="card mx-auto w-full max-w-md p-6 sm:p-8">
      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
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
                maxLength={10}
                placeholder="9876543210"
                className="input-field pl-14"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                required
                autoComplete="tel"
              />
            </div>
            <p className="mt-2 text-xs text-charcoal-500">
              We&apos;ll send a one-time password to verify your number.
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <Button type="submit" loading={loading} className="w-full">
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
              maxLength={6}
              placeholder="6-digit code"
              className="input-field text-center text-lg tracking-[0.4em]"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-xs text-charcoal-500">
              Sent to +91 {phone}
              <button
                type="button"
                onClick={handleChangeNumber}
                className="ml-2 font-medium text-brand-500 hover:text-brand-600"
              >
                Change
              </button>
            </p>
          </div>

          {info && <Alert type="info" message={info} />}
          {error && <Alert type="error" message={error} />}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendOtp}
              loading={loading}
              className="w-full sm:flex-1"
            >
              Resend OTP
            </Button>
            <Button type="submit" loading={loading} className="w-full sm:flex-1">
              Verify & Continue
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
