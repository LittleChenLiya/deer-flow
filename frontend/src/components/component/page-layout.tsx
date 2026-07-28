"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  workspacePageBodyGapClass,
  workspacePageBodyPaddingClass,
  workspacePageScrollBodyClass,
} from "./styles";

export function Page({
  header,
  children,
  className,
  bodyClassName,
  density = "compact",
  fillBody = false,
  contentClassName,
  contentGapClassName,
}: {
  header: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  density?: "compact" | "comfortable";
  /** Stretch body so empty states can vertically center in the viewport. */
  fillBody?: boolean;
  /** Override default inner padding (workspace index pages use {@link workspacePageBodyPaddingClass}). */
  contentClassName?: string;
  contentGapClassName?: string;
}) {
  const bodyPad =
    density === "compact"
      ? workspacePageBodyPaddingClass
      : "px-5 py-8 sm:px-8 sm:py-10";
  const bodyGap =
    density === "compact" ? workspacePageBodyGapClass : "gap-8 sm:gap-10";
  /** Workspace index routes fill the viewport; `fillBody` keeps empty-state centering explicit. */
  const stretchBody = density === "compact" || fillBody;

  return (
    <div className={cn("flex size-full min-w-0 flex-col", className)}>
      {header}
      <div
        className={cn(
          "min-w-0 flex-1 overflow-y-auto",
          stretchBody && "flex min-h-0 flex-col",
          density === "compact" && workspacePageScrollBodyClass,
          bodyClassName,
        )}
      >
        <div
          className={cn(
            "w-full min-w-0",
            density === "compact" ? "max-w-none" : "mx-auto max-w-[88rem]",
            bodyPad,
            density === "compact" && "workspace-page-body",
            stretchBody && "flex min-h-full flex-1 flex-col",
            contentClassName,
          )}
        >
          <div
            className={cn(
              "flex w-full min-w-0 flex-col",
              contentGapClassName ?? bodyGap,
              stretchBody && "min-h-full flex-1",
            )}
          >
            {children}
          </div>
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
