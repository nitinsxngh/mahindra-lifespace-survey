"use client";

import type { KeyboardEvent } from "react";
import Image from "next/image";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  priority: number | null;
  isSelectable: boolean;
  isActiveStep: boolean;
  onSelect: (serviceId: string) => void;
  onUndo: (serviceId: string) => void;
}

export function ServiceCard({
  service,
  priority,
  isSelectable,
  isActiveStep,
  onSelect,
  onUndo,
}: ServiceCardProps) {
  const isReserved = priority !== null;

  function handleClick() {
    if (isReserved) {
      onUndo(service._id);
      return;
    }
    if (isSelectable) {
      onSelect(service._id);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    handleClick();
  }

  return (
    <article
      role="button"
      tabIndex={isReserved || isSelectable ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={
        isReserved
          ? `${service.name}, priority ${priority}. Press to change selection.`
          : isSelectable
            ? `Select ${service.name} for your next priority`
            : `${service.name}, waiting for selection`
      }
      aria-disabled={!isReserved && !isSelectable}
      className={`card relative overflow-hidden transition-all duration-300 ${
        isReserved
          ? "cursor-pointer ring-2 ring-brand-500 ring-offset-1 sm:ring-offset-2"
          : isSelectable
            ? "cursor-pointer hover:shadow-elevated hover:ring-2 hover:ring-brand-300 hover:ring-offset-1"
            : "pointer-events-none opacity-60"
      } ${isActiveStep && isSelectable ? "animate-pulse-subtle shadow-elevated ring-2 ring-brand-400 ring-offset-1 sm:ring-offset-2" : ""}`}
    >
      {isReserved && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-brand-500/10" />
      )}

      <div className="relative aspect-[4/3] w-full bg-charcoal-100 sm:aspect-[16/10]">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className={`object-cover transition duration-300 ${
            isReserved ? "scale-[1.02] brightness-95" : ""
          }`}
          sizes="(max-width: 1280px) 50vw, 25vw"
        />

        {isReserved ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-charcoal-900/40 backdrop-blur-[1px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white shadow-elevated ring-2 ring-white/30 sm:h-16 sm:w-16 sm:text-3xl sm:ring-4">
              {priority}
            </div>
            <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600 sm:mt-2 sm:px-3 sm:py-1 sm:text-xs">
              Reserved
            </span>
          </div>
        ) : isSelectable ? (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-charcoal-900/70 to-transparent px-2 pb-2 pt-6 sm:px-3 sm:pb-3 sm:pt-8">
            <span className="block text-center text-[10px] font-semibold uppercase tracking-wide text-white sm:text-xs">
              Tap to assign
            </span>
          </div>
        ) : null}
      </div>

      <div className={`p-2.5 sm:p-5 ${isReserved ? "bg-brand-50/50" : ""}`}>
        <div className="mb-2 sm:mb-3">
          <h3 className="text-sm font-semibold leading-tight text-charcoal-800 sm:text-lg">
            {service.name}
          </h3>
          <p className="mt-0.5 hidden text-sm text-charcoal-500 line-clamp-2 sm:mt-1 sm:block">
            {service.description}
          </p>
        </div>

        <div className="flex flex-col gap-0.5 rounded-lg bg-brand-50 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:rounded-xl sm:px-3 sm:py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-brand-700 sm:text-xs">
            Cost
          </span>
          <span className="text-sm font-bold text-brand-800 sm:text-lg">
            ₹{service.rate.toLocaleString("en-IN")}
            <span className="ml-0.5 text-[10px] font-normal text-brand-600 sm:ml-1 sm:text-xs">
              {service.remark}
            </span>
          </span>
        </div>

        {isReserved && (
          <p className="mt-2 hidden text-center text-xs text-charcoal-500 sm:block">
            Tap card to remove &amp; re-select from here
          </p>
        )}
      </div>
    </article>
  );
}
