"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  workspacePageHeaderStripClass,
  workspacePageInsetXClass,
} from "./styles";

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
    <div
      className={cn(
        "workspace-glass-header",
        workspacePageInsetXClass,
        className,
      )}
    >
      <div className={cn("flex flex-col gap-1", workspacePageHeaderStripClass)}>
        <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="workspace-header-accent shrink-0" aria-hidden />
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h1 className="shrink-0 text-base font-semibold tracking-tight sm:text-lg">
                {title}
              </h1>
              {stat ? (
                <span className="text-muted-foreground shrink-0 text-xs font-normal">
                  {stat}
                </span>
              ) : null}
              {description ? (
                <p className="text-muted-foreground hidden max-w-xl min-w-0 truncate text-xs leading-snug sm:inline">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {showTools ? (
            <div className="flex shrink-0 items-center gap-2">
              {toolbar ? (
                <div
                  className={cn(
                    "hidden min-w-0 sm:block sm:w-40 md:w-48 lg:w-52",
                    toolbarClassName,
                  )}
                >
                  {toolbar}
                </div>
              ) : null}
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
