"use client";

import { PauseIcon, PlayIcon, SettingsIcon, ZapIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  CardAction,
  HeaderCreateButton,
  ErrorAlert,
  ItemList,
  ItemListPanel,
  ItemRow,
  ItemRowStatusBadge,
  ListFilterField,
  ListPanelToolbar,
  ListSearchField,
  PanelEmpty,
  Page,
  PageHeader,
  dotSeparatedMeta,
} from "@/components/component";
import {
  ScheduledTaskDetailSheet,
  ScheduledTaskFormDialog,
} from "@/components/workspace/scheduled-tasks";
import { useI18n } from "@/core/i18n/hooks";
import {
  usePauseScheduledTask,
  useResumeScheduledTask,
  useScheduledTaskRuns,
  useScheduledTasks,
  useTriggerScheduledTask,
  useThreadScheduledTasks,
} from "@/core/scheduled-tasks/hooks";
import type { ScheduledTaskRun } from "@/core/scheduled-tasks/types";

const NONE = "—";

function formatTimestamp(value: string | null, locale: string): string {
  if (!value) {
    return NONE;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const intlLocale = locale === "zh-CN" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ScheduledTasksPage() {
  const { t, locale } = useI18n();
  const st = t.scheduledTasks;
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread_id");
  const allTasksQuery = useScheduledTasks();
  const threadTasksQuery = useThreadScheduledTasks(threadId);
  const tasksQuery = threadId ? threadTasksQuery : allTasksQuery;
  const data = threadId ? threadTasksQuery.data : allTasksQuery.data;
  const queryError = threadId ? threadTasksQuery.error : allTasksQuery.error;
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "enabled" | "paused" | "running" | "completed" | "failed"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "once" | "cron">("all");
  const [query, setQuery] = useState("");

  const allTasks = useMemo(() => data ?? [], [data]);
  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTasks.filter((task) => {
      const statusPass = statusFilter === "all" || task.status === statusFilter;
      const typePass =
        typeFilter === "all" || task.schedule_type === typeFilter;
      const searchPass =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.prompt.toLowerCase().includes(q);
      return statusPass && typePass && searchPass;
    });
  }, [allTasks, statusFilter, typeFilter, query]);
  const selectedTask = useMemo(() => {
    return (
      filteredData.find((task) => task.id === selectedTaskId) ??
      allTasks.find((task) => task.id === selectedTaskId) ??
      null
    );
  }, [allTasks, filteredData, selectedTaskId]);
  const taskRunsQuery = useScheduledTaskRuns(selectedTask?.id);
  const pauseTask = usePauseScheduledTask();
  const resumeTask = useResumeScheduledTask();
  const triggerTask = useTriggerScheduledTask();

  const scheduleTypeLabel = (v: string) =>
    v === "cron"
      ? st.scheduleType.cron
      : v === "once"
        ? st.scheduleType.once
        : v;
  const statusLabel = (v: string) =>
    (st.status as Record<string, string>)[v] ?? v;
  const contextModeLabel = (v: string) =>
    v === "fresh_thread_per_run"
      ? st.context.fresh
      : v === "reuse_thread"
        ? st.context.reuse
        : v;
  const runTriggerLabel = (v: string) =>
    (st.runTrigger as Record<string, string>)[v] ?? v;
  const runStatusLabel = (v: string) =>
    (st.runStatus as Record<string, string>)[v] ?? v;
  const runSummary = (run: ScheduledTaskRun) =>
    `${runTriggerLabel(run.trigger)} · ${runStatusLabel(run.status)}`;

  const openDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailOpen(true);
  };

  const openEditForTask = (taskId: string) => {
    setCreateOpen(false);
    setDetailOpen(false);
    setSelectedTaskId(taskId);
    setEditOpen(true);
  };

  const formDialogOpen = createOpen || editOpen;
  const formDialogMode = editOpen ? ("edit" as const) : ("create" as const);

  const closeFormDialog = () => {
    setCreateOpen(false);
    setEditOpen(false);
  };

  const mutatingTaskId =
    (pauseTask.isPending && pauseTask.variables) ||
    (resumeTask.isPending && resumeTask.variables) ||
    (triggerTask.isPending && triggerTask.variables) ||
    null;

  useEffect(() => {
    document.title = `${t.sidebar.scheduledTasks} - ${t.pages.appName}`;
  }, [t.pages.appName, t.sidebar.scheduledTasks]);

  useEffect(() => {
    if (searchParams.get("create") !== "1") {
      return;
    }
    setCreateOpen(true);
    const nextUrl = threadId
      ? `/workspace/scheduled-tasks?thread_id=${encodeURIComponent(threadId)}`
      : "/workspace/scheduled-tasks";
    router.replace(nextUrl);
  }, [searchParams, threadId, router]);

  useEffect(() => {
    if (!selectedTaskId) {
      return;
    }
    const inAllTasks = allTasks.some((task) => task.id === selectedTaskId);
    if (!inAllTasks) {
      if (tasksQuery.isFetching || tasksQuery.isPending) {
        return;
      }
      const nextId = filteredData[0]?.id ?? null;
      setSelectedTaskId(nextId);
      if (!nextId) {
        setDetailOpen(false);
      }
      setEditOpen(false);
      return;
    }

    const stillVisible = filteredData.some(
      (task) => task.id === selectedTaskId,
    );
    if (!stillVisible) {
      const nextId = filteredData[0]?.id ?? null;
      setSelectedTaskId(nextId);
      if (!nextId) {
        setDetailOpen(false);
      }
      setEditOpen(false);
    }
  }, [
    allTasks,
    filteredData,
    selectedTaskId,
    tasksQuery.isFetching,
    tasksQuery.isPending,
  ]);

  const countLabel = useMemo(() => {
    const filtering =
      statusFilter !== "all" || typeFilter !== "all" || query.trim().length > 0;
    return filtering
      ? `${filteredData.length}/${allTasks.length}`
      : String(allTasks.length);
  }, [allTasks.length, filteredData.length, query, statusFilter, typeFilter]);

  const listEmptyMessage = useMemo(() => {
    if (query.trim()) {
      return st.searchEmpty;
    }
    return st.filterEmpty;
  }, [query, st.filterEmpty, st.searchEmpty]);

  return (
    <>
      <Page
        bodyClassName="flex min-h-0 flex-1 flex-col"
        header={
          <PageHeader
            title={t.sidebar.scheduledTasks}
            description={st.pageDescription}
            actions={
              <HeaderCreateButton
                variant="default"
                data-testid="scheduled-task-create-trigger"
                onClick={() => {
                  setEditOpen(false);
                  setDetailOpen(false);
                  setCreateOpen(true);
                }}
              >
                {st.create.headerAction}
              </HeaderCreateButton>
            }
          />
        }
      >
        {threadId ? (
          <p className="text-muted-foreground mb-3 text-sm">
            {st.detail.filteredByThread.replace("{id}", threadId)}
          </p>
        ) : null}
        {queryError ? (
          <ErrorAlert data-testid="scheduled-task-load-error">
            {st.detail.loadFailed}: {queryError.message}
          </ErrorAlert>
        ) : null}

        <ItemListPanel
          title={st.listTitle}
          countLabel={countLabel}
          toolbar={
            <ListPanelToolbar>
              <ListSearchField
                value={query}
                onChange={setQuery}
                placeholder={st.searchPlaceholder}
              />
              <ListFilterField
                data-testid="scheduled-task-status-filter"
                value={statusFilter}
                onValueChange={(value) => {
                  if (
                    value === "all" ||
                    value === "enabled" ||
                    value === "paused" ||
                    value === "running" ||
                    value === "completed" ||
                    value === "failed"
                  ) {
                    setStatusFilter(value);
                  }
                }}
                options={[
                  { value: "all", label: st.filters.allStatuses },
                  { value: "enabled", label: st.filters.enabled },
                  { value: "paused", label: st.filters.paused },
                  { value: "completed", label: st.filters.completed },
                  { value: "failed", label: st.filters.failed },
                ]}
              />
              <ListFilterField
                className="sm:w-36"
                value={typeFilter}
                onValueChange={(value) => {
                  if (value === "all" || value === "once" || value === "cron") {
                    setTypeFilter(value);
                  }
                }}
                options={[
                  { value: "all", label: st.filters.allTypes },
                  { value: "cron", label: st.filters.cron },
                  { value: "once", label: st.filters.once },
                ]}
              />
            </ListPanelToolbar>
          }
        >
          {tasksQuery.isPending && data === undefined ? (
            <p className="text-muted-foreground px-4 py-6 text-sm">
              {t.common.loading}
            </p>
          ) : allTasks.length === 0 ? (
            <PanelEmpty align="center" className="py-16">
              <div className="flex flex-col items-center gap-2">
                <p className="text-foreground font-medium">{st.emptyList}</p>
                <HeaderCreateButton
                  variant="default"
                  className="mt-2"
                  data-testid="scheduled-task-empty-create"
                  onClick={() => {
                    setEditOpen(false);
                    setDetailOpen(false);
                    setCreateOpen(true);
                  }}
                >
                  {st.create.headerAction}
                </HeaderCreateButton>
              </div>
            </PanelEmpty>
          ) : filteredData.length === 0 ? (
            <PanelEmpty align="center">{listEmptyMessage}</PanelEmpty>
          ) : (
            <ItemList
              className="gap-3 divide-y-0 p-3 sm:p-4"
              data-testid="scheduled-task-list"
            >
              {filteredData.map((task) => {
                const pauseResumeLabel =
                  task.status === "paused"
                    ? st.actions.resume
                    : st.actions.pause;
                const rowBusy = mutatingTaskId === task.id;

                return (
                  <ItemRow
                    key={task.id}
                    selected={selectedTaskId === task.id && detailOpen}
                    data-testid={`scheduled-task-item-${task.id}`}
                    className="border-border/70 border"
                    title={
                      <button
                        type="button"
                        className="max-w-full truncate text-left hover:underline"
                        onClick={() => openDetail(task.id)}
                      >
                        {task.title}
                      </button>
                    }
                    description={task.prompt}
                    badges={
                      <ItemRowStatusBadge variant="outline">
                        {statusLabel(task.status)}
                      </ItemRowStatusBadge>
                    }
                    meta={dotSeparatedMeta([
                      <span key="type" className="font-sans">
                        {scheduleTypeLabel(task.schedule_type)}
                      </span>,
                      task.next_run_at ? (
                        <span key="next" className="font-sans tabular-nums">
                          {formatTimestamp(task.next_run_at, locale)}
                        </span>
                      ) : null,
                    ])}
                    actions={
                      <>
                        <CardAction
                          icon={SettingsIcon}
                          label={st.actions.edit}
                          disabled={rowBusy}
                          onClick={() => openEditForTask(task.id)}
                        />
                        <CardAction
                          icon={task.status === "paused" ? PlayIcon : PauseIcon}
                          label={pauseResumeLabel}
                          disabled={rowBusy}
                          onClick={() => {
                            if (task.status === "paused") {
                              resumeTask.mutate(task.id);
                            } else {
                              pauseTask.mutate(task.id);
                            }
                          }}
                        />
                        <CardAction
                          icon={ZapIcon}
                          label={st.actions.trigger}
                          disabled={rowBusy}
                          onClick={() => triggerTask.mutate(task.id)}
                        />
                      </>
                    }
                  />
                );
              })}
            </ItemList>
          )}
        </ItemListPanel>
      </Page>

      <ScheduledTaskDetailSheet
        open={detailOpen && selectedTask != null}
        onOpenChange={setDetailOpen}
        task={selectedTask}
        locale={locale}
        labels={st}
        formatTimestamp={formatTimestamp}
        statusLabel={statusLabel}
        scheduleTypeLabel={scheduleTypeLabel}
        contextModeLabel={contextModeLabel}
        runSummary={runSummary}
        runs={taskRunsQuery.data}
        onEdit={() => {
          setCreateOpen(false);
          setDetailOpen(false);
          setEditOpen(true);
        }}
        onPauseResume={() => {
          if (!selectedTask) return;
          if (selectedTask.status === "paused") {
            resumeTask.mutate(selectedTask.id);
          } else {
            pauseTask.mutate(selectedTask.id);
          }
        }}
        onTrigger={() => {
          if (selectedTask) {
            triggerTask.mutate(selectedTask.id);
          }
        }}
        pauseResumeLabel={
          selectedTask?.status === "paused"
            ? st.actions.resume
            : st.actions.pause
        }
      />

      <ScheduledTaskFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeFormDialog();
          }
        }}
        mode={formDialogMode}
        task={formDialogMode === "edit" ? (selectedTask ?? null) : null}
        presetThreadId={threadId}
        onCreated={(task) => {
          openDetail(task.id);
        }}
      />
    </>
  );
}
