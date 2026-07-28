"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Shell({
  children,
  className,
  maxWidth = "page",
}: {
  children: ReactNode;
  className?: string;
  /** ``page`` matches workspace list pages (`max-w-[88rem]`). */
  maxWidth?: "4xl" | "5xl" | "page";
}) {
  const widthClass =
    maxWidth === "4xl"
      ? "max-w-4xl"
      : maxWidth === "5xl"
        ? "max-w-5xl"
        : "max-w-[88rem]";

  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <div
        className={cn(
          "mx-auto flex w-full min-w-0 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-5",
          widthClass,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
