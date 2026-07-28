"use client";

import { useEffect, useRef, useState } from "react";

import {
  DialogFieldGrid,
  FormField,
  ToggleGroupControl,
  dialogFieldControlClass,
  readOnlyFieldClass,
  selectTriggerWrapClass,
  workspaceFieldFocusClass,
} from "@/components/component";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/core/i18n/hooks";
import {
  describeSchedule,
  pad2,
  parseCron,
  serializeCron,
  utcToZonedLocalInput,
  WEEKDAYS,
  zonedLocalToUtcIso,
  type CronParts,
  type CronPreset,
  type ScheduleLocale,
} from "@/core/scheduled-tasks/cron";
import { cn } from "@/lib/utils";

export type ScheduleValue = {
  schedule_type: "once" | "cron";
  schedule_spec: { cron?: string; run_at?: string };
  timezone: string;
};

const PRESETS: CronPreset[] = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "custom",
];

const FALLBACK_TIMEZONES = [
  "UTC",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
];

function detectBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof tz === "string" && tz.length > 0) {
      return tz;
    }
  } catch {
    // resolvedOptions unavailable
  }
  return "UTC";
}

function timezoneOptions(): string[] {
  const supported = (
    Intl as unknown as {
      supportedValuesOf?: (key: string) => string[] | undefined;
    }
  ).supportedValuesOf?.("timeZone");
  if (Array.isArray(supported) && supported.length > 0) {
    return supported;
  }
  return FALLBACK_TIMEZONES;
}

const TIMEZONE_OPTIONS = timezoneOptions();

/** Same control width across hourly / daily / weekly / monthly / custom detail fields. */
const scheduleDetailInputWidthClass = "w-full max-w-[20rem]";

const fieldInputClass = cn(
  dialogFieldControlClass,
  workspaceFieldFocusClass,
  "min-w-0",
  scheduleDetailInputWidthClass,
);

const selectTriggerClass = cn(
  "w-full min-w-0",
  selectTriggerWrapClass,
  dialogFieldControlClass,
);

function ScheduleTimezoneSelect({
  timezone,
  onTimezoneChange,
  fieldClassName,
}: {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  fieldClassName?: string;
}) {
  const labels = useI18n().t.scheduledTasks;

  return (
    <FormField
      label={labels.fields.timezone}
      className={cn("min-w-0", fieldClassName)}
    >
      <Select value={timezone} onValueChange={onTimezoneChange}>
        <SelectTrigger
          className={cn(selectTriggerClass, scheduleDetailInputWidthClass)}
          data-testid="schedule-timezone"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIMEZONE_OPTIONS.map((tzOption) => (
            <SelectItem key={tzOption} value={tzOption}>
              {tzOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

function CronExpressionFieldLegend({
  labels,
  className,
}: {
  labels: string[];
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-nowrap justify-end gap-1.5", className)}
      role="note"
      aria-label={labels.join(", ")}
    >
      {labels.map((label, index) => (
        <span
          key={index}
          className="border-border/45 bg-muted/30 text-muted-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] leading-none"
        >
          <span className="text-foreground/55 font-medium tabular-nums">
            {index + 1}:
          </span>
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}

function fieldsFromSchedule(initial: ScheduleValue) {
  const cron = initial.schedule_spec.cron ?? "0 9 * * *";
  const parsed = parseCron(cron);
  return {
    scheduleType: initial.schedule_type,
    preset: parsed.preset,
    parts: parsed.parts,
    runAtLocal:
      initial.schedule_type === "once" && initial.schedule_spec.run_at
        ? utcToZonedLocalInput(
            initial.schedule_spec.run_at,
            initial.timezone || "UTC",
          )
        : "",
    timezone: initial.timezone || detectBrowserTimezone(),
  };
}

export function ScheduledTaskScheduleInput({
  initial,
  seedKey,
  onChange,
  scheduleTypeLocked = false,
}: {
  initial: ScheduleValue;
  /** When this changes, internal fields re-sync from `initial` (after parent seeds). */
  seedKey: string | number;
  onChange: (value: ScheduleValue) => void;
  scheduleTypeLocked?: boolean;
}) {
  const { t, locale } = useI18n();
  const schedLocale: ScheduleLocale = locale.startsWith("zh") ? "zh" : "en";
  const labels = t.scheduledTasks;

  const seeded = fieldsFromSchedule(initial);
  const [scheduleType, setScheduleType] = useState<"once" | "cron">(
    seeded.scheduleType,
  );
  const [preset, setPreset] = useState<CronPreset>(seeded.preset);
  const [parts, setParts] = useState<CronParts>(seeded.parts);
  const [runAtLocal, setRunAtLocal] = useState<string>(seeded.runAtLocal);
  const [timezone, setTimezone] = useState<string>(seeded.timezone);

  useEffect(() => {
    const next = fieldsFromSchedule(initial);
    setScheduleType(next.scheduleType);
    setPreset(next.preset);
    setParts(next.parts);
    setRunAtLocal(next.runAtLocal);
    setTimezone(next.timezone);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when parent re-seeds
  }, [seedKey]);

  // Hold the latest onChange in a ref so the effect below does not depend on
  // it. This avoids a re-render loop: if the parent passes an inline
  // onChange (new reference each render), depending on it directly would
  // re-fire the effect every render and call onChange again, looping.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Emit on every change including mount. On mount this syncs the parent with
  // the browser-detected timezone and the canonicalized cron, so the submitted
  // value always matches what the user sees in the preview.
  useEffect(() => {
    if (scheduleType === "once") {
      const runAt = runAtLocal ? zonedLocalToUtcIso(runAtLocal, timezone) : "";
      onChangeRef.current({
        schedule_type: "once",
        schedule_spec: runAt ? { run_at: runAt } : {},
        timezone,
      });
      return;
    }
    const cron =
      preset === "custom" ? (parts.raw ?? "") : serializeCron(preset, parts);
    onChangeRef.current({
      schedule_type: "cron",
      schedule_spec: cron ? { cron } : {},
      timezone,
    });
  }, [scheduleType, preset, parts, runAtLocal, timezone]);

  function updateParts(patch: Partial<CronParts>) {
    setParts((prev) => ({ ...prev, ...patch }));
  }

  function changePreset(next: CronPreset) {
    setParts((prev) => {
      const merged = { ...prev };
      if (next === "weekly" && (merged.weekdays ?? []).length === 0) {
        merged.weekdays = ["mon"];
      }
      if (next === "monthly" && merged.dayOfMonth == null) {
        merged.dayOfMonth = 1;
      }
      if (next === "custom" && !merged.raw) {
        merged.raw = serializeCron("daily", prev);
      }
      return merged;
    });
    setPreset(next);
  }

  const preview = describeSchedule(
    { scheduleType, preset, parts, runAtLocal, timezone },
    schedLocale,
  );

  const cronPresetDetails = (() => {
    switch (preset) {
      case "hourly":
        return (
          <FormField label={labels.fields.minute} className="min-w-0">
            <Input
              type="number"
              min={0}
              max={59}
              className={fieldInputClass}
              value={parts.minute ?? 0}
              onChange={(e) => updateParts({ minute: Number(e.target.value) })}
            />
          </FormField>
        );
      case "daily":
        return (
          <FormField label={labels.fields.time} className="min-w-0">
            <Input
              type="time"
              className={fieldInputClass}
              value={`${pad2(parts.hour ?? 9)}:${pad2(parts.minute ?? 0)}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                updateParts({ hour: h, minute: m });
              }}
            />
          </FormField>
        );
      case "weekly":
        return (
          <DialogFieldGrid className="items-end">
            <FormField label={labels.fields.time} className="min-w-0">
              <Input
                type="time"
                className={fieldInputClass}
                value={`${pad2(parts.hour ?? 9)}:${pad2(parts.minute ?? 0)}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  updateParts({ hour: h, minute: m });
                }}
              />
            </FormField>
            <FormField label={labels.fields.weekday} className="min-w-0">
              <ToggleGroupControl
                type="multiple"
                scrollable
                className="flex-nowrap"
                value={parts.weekdays ?? ["mon"]}
                onValueChange={(values) => {
                  setParts((prev) => ({
                    ...prev,
                    weekdays: WEEKDAYS.filter((d) => values.includes(d)),
                  }));
                }}
                items={WEEKDAYS.map((w) => ({
                  value: w,
                  label: labels.weekdays[w],
                  ariaLabel: labels.weekdays[w],
                }))}
              />
            </FormField>
          </DialogFieldGrid>
        );
      case "monthly":
        return (
          <DialogFieldGrid>
            <FormField label={labels.fields.dayOfMonth} className="min-w-0">
              <Input
                type="number"
                min={1}
                max={31}
                className={fieldInputClass}
                value={parts.dayOfMonth ?? 1}
                onChange={(e) =>
                  updateParts({ dayOfMonth: Number(e.target.value) })
                }
              />
            </FormField>
            <FormField label={labels.fields.time} className="min-w-0">
              <Input
                type="time"
                className={fieldInputClass}
                value={`${pad2(parts.hour ?? 9)}:${pad2(parts.minute ?? 0)}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  updateParts({ hour: h, minute: m });
                }}
              />
            </FormField>
          </DialogFieldGrid>
        );
      case "custom":
        return (
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              {labels.fields.cron}
            </span>
            <div className="flex min-w-0 items-center gap-3">
              <Input
                value={parts.raw ?? ""}
                className={cn(fieldInputClass, "font-mono shrink-0 text-xs")}
                onChange={(e) => updateParts({ raw: e.target.value })}
                placeholder={labels.fields.cronPlaceholder}
              />
              <CronExpressionFieldLegend
                labels={[...labels.cronFieldLegend]}
                className="min-w-0 flex-1 justify-start"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="flex min-w-0 flex-col gap-3" data-testid="schedule-input">
      {!scheduleTypeLocked ? (
        <ToggleGroupControl
          value={scheduleType}
          onValueChange={(value) => {
            if (value === "cron" || value === "once") {
              setScheduleType(value);
            }
          }}
          items={[
            { value: "cron", label: labels.scheduleType.cron },
            { value: "once", label: labels.scheduleType.once },
          ]}
        />
      ) : null}

      {scheduleType === "cron" ? (
        <div className="flex flex-col gap-3">
          <DialogFieldGrid className="items-start">
            <FormField label={labels.preset.label} className="min-w-0">
              <ToggleGroupControl
                scrollable
                data-testid="schedule-preset"
                value={preset}
                onValueChange={(value) => {
                  if (PRESETS.includes(value as CronPreset)) {
                    changePreset(value as CronPreset);
                  }
                }}
                items={PRESETS.map((p) => ({
                  value: p,
                  label: labels.preset[p],
                }))}
              />
            </FormField>
            <ScheduleTimezoneSelect
              timezone={timezone}
              onTimezoneChange={setTimezone}
              fieldClassName="min-w-0"
            />
          </DialogFieldGrid>
          {cronPresetDetails}
        </div>
      ) : (
        <DialogFieldGrid className="items-start">
          <FormField
            label={labels.fields.runAt}
            htmlFor="schedule-run-at"
            className="min-w-0"
          >
            <Input
              id="schedule-run-at"
              type="datetime-local"
              className={fieldInputClass}
              value={runAtLocal}
              onChange={(e) => setRunAtLocal(e.target.value)}
            />
          </FormField>
          <ScheduleTimezoneSelect
            timezone={timezone}
            onTimezoneChange={setTimezone}
            fieldClassName="min-w-0"
          />
        </DialogFieldGrid>
      )}

      <div
        className={cn(
          readOnlyFieldClass,
          "text-muted-foreground flex min-h-7 items-center gap-2 py-1 text-xs",
        )}
        data-testid="schedule-preview"
      >
        <span className="text-foreground/70 shrink-0 text-xs font-medium">
          {labels.preview}
        </span>
        <span className="min-w-0 flex-1 tabular-nums">{preview}</span>
      </div>
    </div>
  );
}
