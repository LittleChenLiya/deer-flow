import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useI18n } from "@/core/i18n/hooks";

import {
  createScheduledTask,
  deleteScheduledTask,
  fetchScheduledTaskRuns,
  fetchScheduledTasks,
  fetchThreadScheduledTasks,
  pauseScheduledTask,
  resumeScheduledTask,
  triggerScheduledTask,
  updateScheduledTask,
  type ScheduledTaskPayload,
} from "./api";
import type { ScheduledTask } from "./types";

function upsertScheduledTaskInList(
  prev: ScheduledTask[] | undefined,
  task: ScheduledTask,
): ScheduledTask[] {
  if (!prev) {
    return [task];
  }
  return [task, ...prev.filter((entry) => entry.id !== task.id)];
}

function prependScheduledTaskCaches(
  queryClient: QueryClient,
  task: ScheduledTask,
) {
  queryClient.setQueryData<ScheduledTask[]>(["scheduled-tasks"], (prev) =>
    upsertScheduledTaskInList(prev, task),
  );
  if (task.thread_id) {
    queryClient.setQueryData<ScheduledTask[]>(
      ["scheduled-tasks", "thread", task.thread_id],
      (prev) => upsertScheduledTaskInList(prev, task),
    );
  }
}

export function useScheduledTasks() {
  return useQuery({
    queryKey: ["scheduled-tasks"],
    queryFn: fetchScheduledTasks,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });
}

export function useThreadScheduledTasks(threadId: string | null | undefined) {
  return useQuery({
    queryKey: ["scheduled-tasks", "thread", threadId],
    queryFn: () => fetchThreadScheduledTasks(threadId ?? ""),
    enabled: Boolean(threadId),
  });
}

export function useScheduledTaskRuns(taskId: string | null | undefined) {
  return useQuery({
    queryKey: ["scheduled-tasks", "runs", taskId],
    queryFn: () => fetchScheduledTaskRuns(taskId ?? ""),
    enabled: Boolean(taskId),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });
}

export function useCreateScheduledTask() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (payload: ScheduledTaskPayload) => createScheduledTask(payload),
    onSuccess: (created) => {
      prependScheduledTaskCaches(queryClient, created);
      void queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
    },
    onError: (error: Error) => {
      toast.error(`${t.scheduledTasks.errors.create}: ${error.message}`);
    },
  });
}

export function useUpdateScheduledTask(taskId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (
      payload: Partial<
        Omit<ScheduledTaskPayload, "thread_id" | "schedule_type">
      >,
    ) => updateScheduledTask(taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      void queryClient.invalidateQueries({
        queryKey: ["scheduled-tasks", "thread"],
      });
    },
    onError: (error: Error) => {
      toast.error(`${t.scheduledTasks.errors.update}: ${error.message}`);
    },
  });
}

export function usePauseScheduledTask() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (taskId: string) => pauseScheduledTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      void queryClient.invalidateQueries({
        queryKey: ["scheduled-tasks", "thread"],
      });
    },
    onError: (error: Error) => {
      toast.error(`${t.scheduledTasks.errors.pause}: ${error.message}`);
    },
  });
}

export function useResumeScheduledTask() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (taskId: string) => resumeScheduledTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      void queryClient.invalidateQueries({
        queryKey: ["scheduled-tasks", "thread"],
      });
    },
    onError: (error: Error) => {
      toast.error(`${t.scheduledTasks.errors.resume}: ${error.message}`);
    },
  });
}

export function useTriggerScheduledTask() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (taskId: string) => triggerScheduledTask(taskId),
    onSuccess: (_result, taskId) => {
      void queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      void queryClient.invalidateQueries({
        queryKey: ["scheduled-tasks", "thread"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["scheduled-tasks", "runs", taskId],
      });
    },
    onError: (error: Error) => {
      toast.error(`${t.scheduledTasks.errors.trigger}: ${error.message}`);
    },
  });
}

export function useDeleteScheduledTask() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (taskId: string) => deleteScheduledTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scheduled-tasks"] });
      void queryClient.invalidateQueries({
        queryKey: ["scheduled-tasks", "thread"],
      });
    },
    onError: (error: Error) => {
      toast.error(`${t.scheduledTasks.errors.delete}: ${error.message}`);
    },
  });
}
