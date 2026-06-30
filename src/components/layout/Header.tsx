import Image from "next/image";
import type { ReactNode } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: ReactNode;
  showLogo?: boolean;
}

export function Header({
  title,
  subtitle = "Tell us which amenities matter most to you",
  showLogo = true,
}: HeaderProps) {
  return (
    <header className="text-center">
      {showLogo && (
        <div className="mx-auto mb-3 flex justify-center sm:mb-4">
          <Image
            src="/images/happinest-palghar-logo.png"
            alt="Mahindra Happinest Palghar - 2"
            width={3820}
            height={348}
            className="h-[40px] w-auto sm:h-[48px]"
            priority
          />
        </div>
      )}

      {title && (
        <h1 className="text-xl font-bold tracking-tight text-charcoal-800 sm:text-2xl">
          {title}
        </h1>
      )}

      {subtitle && (
        <div
          className={`text-sm text-charcoal-500 sm:text-base ${
            title ? "mt-2" : "mt-1"
          }`}
        >
          {subtitle}
        </div>
      )}
    </header>
  );
}
