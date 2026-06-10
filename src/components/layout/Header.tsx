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
        <div className="mx-auto mb-5 flex justify-center">
          <Image
            src="/images/mahendra-lifespace-logo.png"
            alt="Mahindra Lifespaces"
            width={220}
            height={72}
            className="h-auto w-44 sm:w-52"
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
