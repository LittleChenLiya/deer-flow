"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Page({
  header,
  children,
  className,
  bodyClassName,
  density = "compact",
}: {
  header: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  density?: "compact" | "comfortable";
}) {
  const bodyPad =
    density === "compact"
      ? "px-4 py-4 sm:px-6 sm:py-5"
      : "px-5 py-8 sm:px-8 sm:py-10";
  const bodyGap = density === "compact" ? "gap-4 sm:gap-5" : "gap-8 sm:gap-10";

  return (
    <div className={cn("flex size-full min-w-0 flex-col", className)}>
      {header}
      <div className={cn("min-w-0 flex-1 overflow-y-auto", bodyClassName)}>
        <div
          className={cn(
            "mx-auto w-full max-w-[88rem]",
            bodyPad,
            density === "compact" && "workspace-page-body",
          )}
        >
          <div className={cn("flex flex-col", bodyGap)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SplitView({
  primary,
  secondary,
  className,
  primaryClassName,
  secondaryClassName,
}: {
  primary: ReactNode;
  secondary: ReactNode;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]",
        className,
      )}
    >
      <div className={cn("min-w-0 lg:sticky lg:top-6", primaryClassName)}>
        {primary}
      </div>
      <div className={cn("min-w-0", secondaryClassName)}>{secondary}</div>
    </div>
  );
}
