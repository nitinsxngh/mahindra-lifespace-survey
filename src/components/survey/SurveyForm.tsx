"use client";

import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/types";
import { ServiceCard } from "./ServiceCard";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SuccessMessage } from "./SuccessMessage";
import { PriorityReview } from "./PriorityReview";

const TOTAL_PRIORITIES = 4;

type SurveyPhase = "selecting" | "review";

export function SurveyForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [rankings, setRankings] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<SurveyPhase>("selecting");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [servicesRes, statusRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/survey/status"),
        ]);

        const servicesData = await servicesRes.json();
        const statusData = await statusRes.json();

        if (statusData.success && statusData.data?.completed) {
          setSubmitted(true);
          return;
        }

        if (!servicesData.success) {
          setError(servicesData.message || "Failed to load services");
          return;
        }

        setServices(servicesData.data);
      } catch {
        setError("Failed to load survey. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const assignedCount = Object.keys(rankings).length;
  const currentPriority = assignedCount + 1;
  const allRanked = assignedCount === TOTAL_PRIORITIES;

  const reservedServiceIds = useMemo(
    () => new Set(Object.keys(rankings)),
    [rankings]
  );

  function handleSelect(serviceId: string) {
    if (phase !== "selecting") return;
    if (reservedServiceIds.has(serviceId) || currentPriority > TOTAL_PRIORITIES) {
      return;
    }

    setRankings((prev) => ({
      ...prev,
      [serviceId]: currentPriority,
    }));
  }

  function handleUndo(serviceId: string) {
    if (phase !== "selecting") return;

    const removedPriority = rankings[serviceId];
    if (!removedPriority) return;

    setRankings((prev) => {
      const next = { ...prev };
      for (const [id, priority] of Object.entries(next)) {
        if (priority >= removedPriority) {
          delete next[id];
        }
      }
      return next;
    });
  }

  function handleResetAll() {
    setRankings({});
    setPhase("selecting");
    setError("");
  }

  function handleContinue() {
    if (!allRanked) return;
    setError("");
    setPhase("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditChoices() {
    setPhase("selecting");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!allRanked || phase !== "review") return;

    setError("");
    setSubmitting(true);

    const payload = {
      rankings: services.map((s) => ({
        serviceId: s._id,
        priority: rankings[s._id],
      })),
    };

    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Submission failed");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-charcoal-500">
          <svg
            className="h-8 w-8 animate-spin text-brand-500"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm font-medium">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SuccessMessage />;
  }

  if (phase === "review") {
    return (
      <div className="space-y-6">
        {error && (
          <div className="mx-auto max-w-3xl">
            <Alert type="error" message={error} />
          </div>
        )}

        <PriorityReview services={services} rankings={rankings} />

        <div className="sticky bottom-0 border-t border-charcoal-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="secondary"
              onClick={handleEditChoices}
              className="w-full sm:max-w-[200px]"
            >
              Edit choices
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              className="w-full sm:max-w-md"
            >
              Submit survey
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card mx-auto max-w-3xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-charcoal-800">
          How would you like to rank these amenities?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-600">
          Tap one amenity at a time. Start with the one you like{" "}
          <strong className="text-brand-600">most</strong> (this will be number{" "}
          <strong className="text-brand-600">1</strong>), then the next one you
          prefer, and continue until all four are selected. Number{" "}
          <strong className="text-brand-600">4</strong> will be the one you like{" "}
          <strong className="text-charcoal-700">least</strong>.
        </p>

        <div className="mt-5 rounded-xl border border-charcoal-100 bg-charcoal-50/60 p-4">
          {allRanked ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-emerald-700">
                You have selected all 4 amenities. Tap Continue to review your
                choices.
              </p>
              <button
                type="button"
                onClick={handleResetAll}
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                Start over
              </button>
            </div>
          ) : (
            <p className="text-sm text-charcoal-600">
              Step {currentPriority} of {TOTAL_PRIORITIES}:{" "}
              <span className="font-semibold text-brand-600">
                Tap the amenity you
                {currentPriority === 1
                  ? " like the most"
                  : currentPriority === 2
                    ? " like next"
                    : currentPriority === TOTAL_PRIORITIES
                      ? " like the least"
                      : " prefer next"}
              </span>
            </p>
          )}

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((p) => {
              const isDone = p < currentPriority || allRanked;
              const isCurrent = p === currentPriority && !allRanked;

              return (
                <div
                  key={p}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition ${
                    isDone
                      ? "bg-brand-500 text-white"
                      : isCurrent
                        ? "bg-brand-100 ring-2 ring-brand-500"
                        : "bg-white text-charcoal-400"
                  }`}
                >
                  <span className="text-lg font-bold">{p}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    {isDone ? "Selected" : isCurrent ? "Select now" : "Up next"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-3xl">
          <Alert type="error" message={error} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {services.map((service) => {
          const priority = rankings[service._id] ?? null;
          const isReserved = priority !== null;
          const isSelectable = !isReserved && !allRanked;

          return (
            <ServiceCard
              key={service._id}
              service={service}
              priority={priority}
              isSelectable={isSelectable}
              isActiveStep={isSelectable}
              onSelect={handleSelect}
              onUndo={handleUndo}
            />
          );
        })}
      </div>

      <div className="sticky bottom-0 border-t border-charcoal-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-3xl justify-center">
          <Button
            onClick={handleContinue}
            disabled={!allRanked}
            className="w-full max-w-md"
          >
            {allRanked
              ? "Continue"
              : `Select ${TOTAL_PRIORITIES - assignedCount} more`}
          </Button>
        </div>
      </div>
    </div>
  );
}
