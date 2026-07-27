"use client";

import { useEffect, useState } from "react";

import { ConfirmDialog, ErrorAlert } from "@/components/component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  ScheduledTaskScheduleInput,
  type ScheduleValue,
} from "@/components/workspace/scheduled-task-schedule-input";
import { useI18n } from "@/core/i18n/hooks";
import {
  useCreateScheduledTask,
  useDeleteScheduledTask,
  useUpdateScheduledTask,
} from "@/core/scheduled-tasks/hooks";
import { RECIPES, type Recipe } from "@/core/scheduled-tasks/recipes";
import type { ScheduledTask } from "@/core/scheduled-tasks/types";
import { cn } from "@/lib/utils";

const DEFAULT_SCHEDULE: ScheduleValue = {
  schedule_type: "cron",
  schedule_spec: { cron: "0 9 * * *" },
  timezone: "",
};

function scheduleFromTask(task: ScheduledTask): ScheduleValue {
  const spec = task.schedule_spec as { cron?: string; run_at?: string };
  return {
    schedule_type: task.schedule_type,
    schedule_spec: {
      cron: typeof spec.cron === "string" ? spec.cron : undefined,
      run_at: typeof spec.run_at === "string" ? spec.run_at : undefined,
    },
    timezone: task.timezone || "UTC",
  };
}

export function ScheduledTaskFormDialog({
  open,
  onOpenChange,
  mode,
  task,
  presetThreadId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  task?: ScheduledTask | null;
  presetThreadId?: string | null;
  onCreated?: (task: ScheduledTask) => void;
}) {
  const { t } = useI18n();
  const st = t.scheduledTasks;
  const isCreate = mode === "create";

  const createTask = useCreateScheduledTask();
  const updateTask = useUpdateScheduledTask(task?.id ?? "");
  const deleteTask = useDeleteScheduledTask();
  const isPending =
    createTask.isPending || updateTask.isPending || deleteTask.isPending;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [inputNonce, setInputNonce] = useState(0);
  const [contextMode, setContextMode] = useState<
    "fresh_thread_per_run" | "reuse_thread"
  >("fresh_thread_per_run");
  const [targetThreadId, setTargetThreadId] = useState("");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schedule, setSchedule] = useState<ScheduleValue>(DEFAULT_SCHEDULE);

  const contextModeLabel = (value: string) =>
    value === "fresh_thread_per_run"
      ? st.context.fresh
      : value === "reuse_thread"
        ? st.context.reuse
        : value;

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setDeleteOpen(false);

    if (isCreate) {
      const thread = presetThreadId ?? "";
      setContextMode(thread ? "reuse_thread" : "fresh_thread_per_run");
      setTargetThreadId(thread);
      setTitle("");
      setPrompt("");
      setSchedule(DEFAULT_SCHEDULE);
      setInputNonce((value) => value + 1);
      return;
    }

    if (!task) return;
    setContextMode(task.context_mode);
    setTargetThreadId(task.thread_id ?? "");
    setTitle(task.title);
    setPrompt(task.prompt);
    setSchedule(scheduleFromTask(task));
    setInputNonce((value) => value + 1);
    // Depend on id only so background polling does not wipe edits in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isCreate, task?.id, presetThreadId]);

  const applyRecipe = (recipe: Recipe) => {
    const labels = st.recipes[recipe.titleKey];
    setTitle(labels.title);
    setPrompt(recipe.prompt);
    setContextMode("fresh_thread_per_run");
    setTargetThreadId("");
    setSchedule(recipe.schedule);
    setInputNonce((value) => value + 1);
  };

  const hasSchedule =
    Boolean(schedule.schedule_spec.cron) ||
    Boolean(schedule.schedule_spec.run_at);
  const saveDisabled =
    !title.trim() ||
    !prompt.trim() ||
    !hasSchedule ||
    (isCreate && contextMode === "reuse_thread" && !targetThreadId.trim());

  const handleSave = () => {
    if (saveDisabled) {
      setFormError(st.create.fillRequired);
      return;
    }
    setFormError(null);

    if (isCreate) {
      createTask.mutate(
        {
          context_mode: contextMode,
          thread_id:
            contextMode === "reuse_thread" ? targetThreadId.trim() : null,
          title: title.trim(),
          prompt: prompt.trim(),
          schedule_type: schedule.schedule_type,
          schedule_spec: schedule.schedule_spec,
          timezone: schedule.timezone || "UTC",
        },
        {
          onSuccess: (created) => {
            onOpenChange(false);
            onCreated?.(created);
          },
        },
      );
      return;
    }

    if (!task) return;
    updateTask.mutate(
      {
        title: title.trim(),
        prompt: prompt.trim(),
        schedule_spec: schedule.schedule_spec,
        timezone: schedule.timezone || "UTC",
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onOpenChange(false);
      },
    });
  };

  const dialogDescription = isCreate
    ? st.pageDescription
    : st.edit.titlePlaceholder;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="w-full gap-0 sm:max-w-lg"
          data-testid={
            isCreate ? "scheduled-task-create-form" : "scheduled-task-edit-form"
          }
        >
          <SheetHeader className="border-b pr-12">
            <SheetTitle>
              {isCreate ? st.create.title : st.edit.title}
            </SheetTitle>
            <SheetDescription>{dialogDescription}</SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto p-4">
            {isCreate ? (
              <section className="space-y-2" data-testid="schedule-recipes">
                <h3 className="text-sm font-medium">{st.recipes.label}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {RECIPES.map((recipe) => (
                    <Button
                      key={recipe.id}
                      type="button"
                      variant="outline"
                      className="h-auto min-w-0 justify-start px-3 py-2 text-left whitespace-normal"
                      disabled={isPending}
                      onClick={() => applyRecipe(recipe)}
                    >
                      <span aria-hidden>{recipe.icon}</span>
                      <span className="min-w-0 truncate">
                        {st.recipes[recipe.titleKey].title}
                      </span>
                    </Button>
                  ))}
                </div>
              </section>
            ) : null}

            {isCreate ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">{st.detail.contextMode}</h3>
                <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
                  {(["fresh_thread_per_run", "reuse_thread"] as const).map(
                    (value) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "min-w-0",
                          contextMode === value && "bg-background shadow-sm",
                        )}
                        aria-pressed={contextMode === value}
                        disabled={isPending}
                        onClick={() => setContextMode(value)}
                      >
                        {contextModeLabel(value)}
                      </Button>
                    ),
                  )}
                </div>
                {contextMode === "reuse_thread" ? (
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">{st.detail.thread}</span>
                    <Input
                      value={targetThreadId}
                      onChange={(event) =>
                        setTargetThreadId(event.target.value)
                      }
                      placeholder={st.context.threadIdPlaceholder}
                      disabled={isPending}
                    />
                  </label>
                ) : null}
              </section>
            ) : task ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">{st.detail.contextMode}</h3>
                <dl className="text-muted-foreground grid gap-1 text-sm">
                  <div className="flex gap-2">
                    <dt>{st.detail.contextMode}:</dt>
                    <dd className="text-foreground">
                      {contextModeLabel(task.context_mode)}
                    </dd>
                  </div>
                  <div className="flex min-w-0 gap-2">
                    <dt className="shrink-0">
                      {task.context_mode === "reuse_thread"
                        ? st.detail.thread
                        : st.detail.lastThread}
                      :
                    </dt>
                    <dd className="text-foreground truncate text-xs">
                      {(task.context_mode === "reuse_thread"
                        ? task.thread_id
                        : task.last_thread_id) ?? "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : null}

            <section className="space-y-3">
              <h3 className="text-sm font-medium">{st.sections.content}</h3>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{st.create.taskTitle}</span>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={
                    isCreate ? st.create.taskTitle : st.edit.titlePlaceholder
                  }
                  disabled={isPending}
                  autoFocus={open && isCreate}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">{st.create.prompt}</span>
                <Textarea
                  rows={5}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={
                    isCreate ? st.create.prompt : st.edit.promptPlaceholder
                  }
                  disabled={isPending}
                />
              </label>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">{st.sections.schedule}</h3>
              <ScheduledTaskScheduleInput
                key={`${mode}-${task?.id ?? "new"}-${inputNonce}`}
                initial={schedule}
                onChange={setSchedule}
                scheduleTypeLocked={!isCreate}
              />
            </section>

            {formError ? <ErrorAlert>{formError}</ErrorAlert> : null}
          </div>

          <SheetFooter className="border-t sm:flex-row sm:items-center">
            {!isCreate && task ? (
              <Button
                type="button"
                variant="destructive"
                className="sm:mr-auto"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              >
                {st.actions.delete}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              disabled={isPending || saveDisabled}
              onClick={handleSave}
            >
              {isCreate ? st.create.submit : st.edit.submit}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {!isCreate && task ? (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          description={st.deleteConfirm}
          confirmLabel={
            deleteTask.isPending ? t.common.loading : st.actions.delete
          }
          confirmPending={deleteTask.isPending}
          confirmDisabled={deleteTask.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      ) : null}
    </>
  );
}
