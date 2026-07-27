"use client";

import { useEffect, useState } from "react";

import {
  ConfirmDialog,
  DialogFieldGrid,
  DialogFormSection,
  DialogInputField,
  DialogToggleGroupField,
  DialogSlotField,
  DialogTextareaField,
  ErrorAlert,
  FormDialog,
  dialogSaveFooterProps,
  readOnlyFieldClass,
} from "@/components/component";
import { Button } from "@/components/ui/button";
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

const createDialogSectionContentClass = "gap-3 pt-4 pb-4";

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
  const [createNonce, setCreateNonce] = useState(0);

  const [contextMode, setContextMode] = useState<
    "fresh_thread_per_run" | "reuse_thread"
  >("fresh_thread_per_run");
  const [targetThreadId, setTargetThreadId] = useState("");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schedule, setSchedule] = useState<ScheduleValue>({
    schedule_type: "cron",
    schedule_spec: { cron: "0 9 * * *" },
    timezone: "",
  });

  const contextModeLabel = (v: string) =>
    v === "fresh_thread_per_run"
      ? st.context.fresh
      : v === "reuse_thread"
        ? st.context.reuse
        : v;

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    if (isCreate) {
      const thread = presetThreadId ?? "";
      setContextMode(thread ? "reuse_thread" : "fresh_thread_per_run");
      setTargetThreadId(thread);
      setTitle("");
      setPrompt("");
      setSchedule({
        schedule_type: "cron",
        schedule_spec: { cron: "0 9 * * *" },
        timezone: "",
      });
      setCreateNonce((n) => n + 1);
      return;
    }
    if (!task) return;
    setTitle(task.title);
    setPrompt(task.prompt);
    setSchedule(scheduleFromTask(task));
    // Depend on id only so a background refetch (same task, new object reference)
    // does not wipe edits in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isCreate, task?.id, presetThreadId]);

  const applyRecipe = (recipe: Recipe) => {
    const labels = st.recipes[recipe.titleKey];
    setTitle(labels.title);
    setPrompt(recipe.prompt);
    setSchedule(recipe.schedule);
    setContextMode("fresh_thread_per_run");
    setTargetThreadId("");
    setCreateNonce((n) => n + 1);
  };

  const hasSchedule =
    Boolean(schedule.schedule_spec.cron) ||
    Boolean(schedule.schedule_spec.run_at);

  const saveDisabled = isCreate
    ? !title.trim() ||
      !prompt.trim() ||
      !hasSchedule ||
      (contextMode === "reuse_thread" && !targetThreadId.trim())
    : !title.trim() || !prompt.trim() || !hasSchedule;

  const dialogTitle = isCreate ? st.create.title : st.edit.title;

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
          thread_id: contextMode === "reuse_thread" ? targetThreadId : null,
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
      {
        onSuccess: () => onOpenChange(false),
      },
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

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={dialogTitle}
        {...dialogSaveFooterProps(t.common, {
          busy: isPending,
          disabled: saveDisabled,
          saveLabel: isCreate ? st.create.submit : undefined,
        })}
        onConfirm={handleSave}
        leadingDestructive={
          isCreate || !task
            ? undefined
            : {
                label: st.actions.delete,
                onClick: () => setDeleteOpen(true),
                disabled: isPending,
              }
        }
      >
        <div
          className="flex flex-col gap-4"
          data-testid={
            isCreate ? "scheduled-task-create-form" : "scheduled-task-edit-form"
          }
        >
          {isCreate ? (
            <DialogFormSection
              title={st.recipes.label}
              contentClassName={createDialogSectionContentClass}
            >
              <div className="overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div
                  className="flex w-max min-w-0 flex-nowrap items-center gap-1.5"
                  data-testid="schedule-recipes"
                >
                  {RECIPES.map((recipe) => (
                    <Button
                      key={recipe.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-border/70 h-7 shrink-0 gap-1 px-2.5 text-xs font-normal shadow-xs"
                      disabled={isPending}
                      onClick={() => applyRecipe(recipe)}
                    >
                      <span aria-hidden>{recipe.icon}</span>
                      {st.recipes[recipe.titleKey].title}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogFormSection>
          ) : null}

          {isCreate ? (
            <DialogFormSection
              contentClassName={createDialogSectionContentClass}
            >
              <DialogToggleGroupField
                label={st.detail.contextMode}
                colSpan="full"
                value={contextMode}
                disabled={isPending}
                onValueChange={(value) => {
                  if (
                    value === "fresh_thread_per_run" ||
                    value === "reuse_thread"
                  ) {
                    setContextMode(value);
                  }
                }}
                items={[
                  { value: "fresh_thread_per_run", label: st.context.fresh },
                  { value: "reuse_thread", label: st.context.reuse },
                ]}
              />
              {contextMode === "reuse_thread" ? (
                <DialogInputField
                  label={st.detail.thread}
                  value={targetThreadId}
                  onChange={setTargetThreadId}
                  placeholder={st.context.threadIdPlaceholder}
                  disabled={isPending}
                  colSpan="full"
                  inputClassName="font-mono text-xs"
                />
              ) : null}
            </DialogFormSection>
          ) : task ? (
            <DialogFormSection title={st.detail.contextMode}>
              <DialogFieldGrid>
                <DialogSlotField label={st.detail.contextMode}>
                  <div className={readOnlyFieldClass}>
                    {contextModeLabel(task.context_mode)}
                  </div>
                </DialogSlotField>
                <DialogSlotField
                  label={
                    task.context_mode === "reuse_thread"
                      ? st.detail.thread
                      : st.detail.lastThread
                  }
                >
                  <div className={cn(readOnlyFieldClass, "font-mono text-xs")}>
                    {(task.context_mode === "reuse_thread"
                      ? task.thread_id
                      : task.last_thread_id) ?? ""}
                  </div>
                </DialogSlotField>
              </DialogFieldGrid>
            </DialogFormSection>
          ) : null}

          <DialogFormSection title={st.sections.content}>
            <DialogFieldGrid>
              <DialogInputField
                label={st.create.taskTitle}
                value={title}
                onChange={setTitle}
                placeholder={st.create.taskTitle}
                disabled={isPending}
                colSpan="full"
                autoFocus={open && isCreate}
              />
              <DialogTextareaField
                label={st.create.prompt}
                value={prompt}
                onChange={setPrompt}
                placeholder={st.create.prompt}
                autoGrow
                disabled={isPending}
                colSpan="full"
              />
            </DialogFieldGrid>
          </DialogFormSection>

          <DialogFormSection title={st.sections.schedule}>
            <ScheduledTaskScheduleInput
              key={isCreate ? createNonce : task?.id}
              initial={schedule}
              onChange={setSchedule}
              scheduleTypeLocked={!isCreate}
            />
          </DialogFormSection>

          {formError ? <ErrorAlert>{formError}</ErrorAlert> : null}
        </div>
      </FormDialog>

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
