"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  ScheduledTask,
  ScheduledTaskRun,
} from "@/core/scheduled-tasks/types";

import { ScheduledTaskStatusBadge } from "./status-badge";

const NONE = "—";

export function ScheduledTaskDetailSheet({
  open,
  onOpenChange,
  task,
  locale,
  labels,
  formatTimestamp,
  statusLabel,
  scheduleTypeLabel,
  contextModeLabel,
  runSummary,
  runs,
  onEdit,
  onPauseResume,
  onTrigger,
  pauseResumeLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ScheduledTask | null;
  locale: string;
  labels: {
    detail: {
      contextMode: string;
      thread: string;
      lastThread: string;
      schedule: string;
      nextRun: string;
      lastRun: string;
      lastRunId: string;
      lastError: string;
      runsCount: string;
      runsCountOne: string;
      noRuns: string;
    };
    actions: { edit: string; trigger: string };
  };
  formatTimestamp: (value: string | null, locale: string) => string;
  statusLabel: (v: string) => string;
  scheduleTypeLabel: (v: string) => string;
  contextModeLabel: (v: string) => string;
  runSummary: (run: ScheduledTaskRun) => string;
  runs: ScheduledTaskRun[] | undefined;
  onEdit: () => void;
  onPauseResume: () => void;
  onTrigger: () => void;
  pauseResumeLabel: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        {task ? (
          <>
            <SheetHeader>
              <SheetTitle className="pr-8">{task.title}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <ScheduledTaskStatusBadge status={task.status}>
                    {statusLabel(task.status)}
                  </ScheduledTaskStatusBadge>
                  <span className="text-muted-foreground text-xs">
                    {scheduleTypeLabel(task.schedule_type)}
                  </span>
                </div>
              </SheetDescription>
            </SheetHeader>
            <div
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4"
              data-testid="scheduled-task-detail"
            >
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  {labels.actions.edit}
                </Button>
              </div>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {labels.detail.contextMode}
                  </dt>
                  <dd>{contextModeLabel(task.context_mode)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {labels.detail.schedule}
                  </dt>
                  <dd>{scheduleTypeLabel(task.schedule_type)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground text-xs">
                    {task.context_mode === "reuse_thread"
                      ? labels.detail.thread
                      : labels.detail.lastThread}
                  </dt>
                  <dd className="font-mono text-xs break-all">
                    {task.context_mode === "reuse_thread"
                      ? (task.thread_id ?? NONE)
                      : (task.last_thread_id ?? NONE)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {labels.detail.nextRun}
                  </dt>
                  <dd className="tabular-nums">
                    {formatTimestamp(task.next_run_at, locale)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {labels.detail.lastRun}
                  </dt>
                  <dd className="tabular-nums">
                    {formatTimestamp(task.last_run_at, locale)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground text-xs">
                    {labels.detail.lastRunId}
                  </dt>
                  <dd className="font-mono text-xs break-all">
                    {task.last_run_id ?? NONE}
                  </dd>
                </div>
                {task.last_error ? (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground text-xs">
                      {labels.detail.lastError}
                    </dt>
                    <dd className="text-destructive text-xs">
                      {task.last_error}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <Separator />
              <p className="text-muted-foreground text-sm">{task.prompt}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onPauseResume}>
                  {pauseResumeLabel}
                </Button>
                <Button variant="outline" size="sm" onClick={onTrigger}>
                  {labels.actions.trigger}
                </Button>
              </div>
              <div data-testid="scheduled-task-runs" className="text-sm">
                {(runs ?? []).length === 1
                  ? labels.detail.runsCountOne.replace(
                      "{count}",
                      String((runs ?? []).length),
                    )
                  : labels.detail.runsCount.replace(
                      "{count}",
                      String((runs ?? []).length),
                    )}
              </div>
              <ScrollArea className="max-h-48">
                <div
                  className="flex flex-col gap-2 pr-3"
                  data-testid="scheduled-task-run-list"
                >
                  {(runs ?? []).length > 0 ? (
                    (runs ?? []).map((run) => (
                      <div
                        key={run.id}
                        className="bg-muted/40 rounded-md border p-2.5 text-sm"
                      >
                        <div className="font-medium">{runSummary(run)}</div>
                        <div className="text-muted-foreground text-xs">
                          {run.run_id ?? NONE}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {formatTimestamp(run.scheduled_for, locale)}
                        </div>
                        {run.error ? (
                          <div className="text-destructive text-xs">
                            {run.error}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      {labels.detail.noRuns}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
