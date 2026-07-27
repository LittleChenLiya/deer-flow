import {
  AlertCircleIcon,
  InboxIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type SettingsPageStateKind =
  | "loading"
  | "error"
  | "restricted"
  | "empty"
  | "disabled";

export function SettingsPageState({
  kind,
  title,
  description,
  action,
  compact = false,
}: {
  kind: SettingsPageStateKind;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  const Icon =
    kind === "loading"
      ? LoaderCircleIcon
      : kind === "error"
        ? AlertCircleIcon
        : kind === "restricted"
          ? LockKeyholeIcon
          : InboxIcon;

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "bg-muted/20 flex min-w-0 flex-col items-center justify-center rounded-lg border border-dashed px-5 text-center",
        compact ? "min-h-28 py-5" : "min-h-44 py-8",
      )}
    >
      <span
        className={cn(
          "bg-background mb-3 flex size-9 items-center justify-center rounded-lg border",
          kind === "error" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <Icon className={cn("size-4", kind === "loading" && "animate-spin")} />
      </span>
      <p className="max-w-full text-sm font-medium break-words">{title}</p>
      {description ? (
        <p className="text-muted-foreground mt-1 max-w-lg text-sm leading-6 break-words">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
