"use client";

import { AlertCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function ErrorAlert({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.ComponentProps<typeof Alert>) {
  if (!children) {
    return null;
  }
  return (
    <Alert variant="destructive" className={className} {...props}>
      <AlertCircleIcon />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

/** Centered empty copy for full workspace pages (agents, …). */
export function PageEmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-4 py-16 text-center",
        "min-h-[min(28rem,calc(100dvh-14rem))]",
        className,
      )}
    >
      <div className="max-w-md space-y-2">
        <p className="text-foreground text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Compact dashed placeholder for list/table empty states inside cards. */
export function InlineEmpty({
  children,
  className,
  align = "left",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "text-muted-foreground border-border/50 bg-muted/30 rounded-2xl border border-dashed px-4 py-10 text-sm backdrop-blur-sm",
        align === "center" && "text-center",
        onClick &&
          "hover:bg-muted/50 focus-visible:ring-ring cursor-pointer transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
