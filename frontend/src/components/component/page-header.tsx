"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  stat,
  actions,
  toolbar,
  toolbarClassName,
  className,
}: {
  title: string;
  description?: string;
  stat?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  toolbarClassName?: string;
  className?: string;
}) {
  const showTools = Boolean(toolbar ?? actions);

  return (
    <div className={cn("workspace-glass-header px-4 sm:px-6", className)}>
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4 lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <div className="workspace-header-accent shrink-0" aria-hidden />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex shrink-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                {title}
              </h1>
              {stat ? (
                <span className="text-muted-foreground text-xs font-normal tabular-nums sm:text-sm">
                  {stat}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="text-muted-foreground line-clamp-2 text-xs leading-snug sm:line-clamp-1 sm:max-w-[min(36rem,50vw)] sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {showTools ? (
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0">
            {toolbar ? (
              <div
                className={cn(
                  "min-w-0 flex-1 sm:w-40 sm:flex-none md:w-48 lg:w-52",
                  toolbarClassName,
                )}
              >
                {toolbar}
              </div>
            ) : null}
            {actions ? (
              <div className="flex shrink-0 items-center">{actions}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
