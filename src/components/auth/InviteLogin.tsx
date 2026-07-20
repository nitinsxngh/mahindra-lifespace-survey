"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert } from "@/components/ui/Alert";

interface InviteLoginProps {
  token: string;
}

interface InviteData {
  phone: string;
  name: string;
  unitNumber: string;
  tower: string;
}

export function InviteLogin({ token }: InviteLoginProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState<InviteData | null>(null);

  useEffect(() => {
    async function validate() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/invite/${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!data.success) {
          setError(
            data.message ||
              "This survey link is invalid. Please use the link shared with you."
          );
          return;
        }

        setInvite(data.data);
      } catch {
        setError("Unable to open this survey link. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <p className="text-sm font-medium text-charcoal-500">
          Opening your secure survey link...
        </p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <Header
          title="Survey Link Unavailable"
          subtitle="Please use the unique link shared with you"
        />
        <Alert type="error" message={error || "Invalid survey link."} />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Header
          title="Amenity Survey"
          subtitle={
            invite.unitNumber
              ? `Unit ${invite.unitNumber}${invite.tower ? ` · ${invite.tower}` : ""}`
              : "Sign in with OTP to begin the survey"
          }
        />
      </div>
      <LoginForm
        inviteToken={token}
        lockedPhone={invite.phone}
        applicantName={invite.name}
      />
    </>
  );
}
