"use client";

import Image from "next/image";
import type { Service } from "@/types";

interface PriorityReviewProps {
  services: Service[];
  rankings: Record<string, number>;
}

export function PriorityReview({ services, rankings }: PriorityReviewProps) {
  const ranked = services
    .filter((s) => rankings[s._id])
    .map((s) => ({ ...s, priority: rankings[s._id] }))
    .sort((a, b) => a.priority - b.priority);

  if (ranked.length === 0) return null;

  return (
    <div className="card mx-auto max-w-3xl p-4 sm:p-6">
      <h3 className="text-base font-semibold text-charcoal-800">
        Your priority list
      </h3>
      <p className="mt-1 text-sm text-charcoal-500">
        Review your selections before submitting. Priority 1 is your top choice.
      </p>

      <ol className="mt-4 space-y-3">
        {ranked.map((item) => (
          <li
            key={item._id}
            className="flex items-center gap-3 rounded-xl border border-charcoal-100 bg-charcoal-50/80 p-3 sm:gap-4 sm:p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base">
              {item.priority}
            </div>

            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-charcoal-200 sm:h-16 sm:w-24">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-charcoal-800">
                {item.name}
              </p>
              <p className="text-sm text-charcoal-600">
                ₹{item.rate.toLocaleString("en-IN")}{" "}
                <span className="text-charcoal-500">{item.remark}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>

      {ranked.length < 4 && (
        <p className="mt-3 text-sm text-amber-700">
          {4 - ranked.length} more card{4 - ranked.length !== 1 ? "s" : ""} to
          assign — tap unselected cards in order.
        </p>
      )}
    </div>
  );
}
