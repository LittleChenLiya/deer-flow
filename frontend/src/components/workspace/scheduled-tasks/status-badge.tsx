import type { ReactNode } from "react";

import {
  ItemRowStatusBadge,
  type ItemRowStatusTone,
} from "@/components/component/item";
import type { ScheduledTask } from "@/core/scheduled-tasks/types";

export function scheduledTaskStatusTone(
  status: ScheduledTask["status"] | string,
): ItemRowStatusTone {
  switch (status) {
    case "enabled":
    case "completed":
      return "success";
    case "paused":
      return "warning";
    case "running":
      return "info";
    case "failed":
      return "danger";
    case "cancelled":
      return "muted";
    default:
      return "neutral";
  }
}

export function ScheduledTaskStatusBadge({
  status,
  children,
  className,
}: {
  status: ScheduledTask["status"] | string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <ItemRowStatusBadge
      tone={scheduledTaskStatusTone(status)}
      className={className}
    >
      {children}
    </ItemRowStatusBadge>
  );
}
