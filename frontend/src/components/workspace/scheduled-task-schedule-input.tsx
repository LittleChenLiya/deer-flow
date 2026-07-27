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

const fieldInputClass = cn(
  dialogFieldControlClass,
  workspaceFieldFocusClass,
  "w-full min-w-0",
);

const selectTriggerClass = cn(
  "w-full min-w-0",
  selectTriggerWrapClass,
  dialogFieldControlClass,
);

const scheduleDetailPanelClass =
  "border-border/45 bg-background/70 flex flex-col gap-4 rounded-lg border p-3.5 sm:p-4";

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
          className={selectTriggerClass}
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

export function ScheduledTaskScheduleInput({
  initial,
  onChange,
  scheduleTypeLocked = false,
}: {
  initial: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
  scheduleTypeLocked?: boolean;
}) {
  const { t, locale } = useI18n();
  const schedLocale: ScheduleLocale = locale.startsWith("zh") ? "zh" : "en";
  const labels = t.scheduledTasks;

  const [scheduleType, setScheduleType] = useState<"once" | "cron">(
    initial.schedule_type,
  );
  const [preset, setPreset] = useState<CronPreset>(
    () => parseCron(initial.schedule_spec.cron ?? "0 9 * * *").preset,
  );
  const [parts, setParts] = useState<CronParts>(
    () => parseCron(initial.schedule_spec.cron ?? "0 9 * * *").parts,
  );
  const [runAtLocal, setRunAtLocal] = useState<string>(
    initial.schedule_type === "once" && initial.schedule_spec.run_at
      ? utcToZonedLocalInput(
          initial.schedule_spec.run_at,
          initial.timezone || "UTC",
        )
      : "",
  );
  const [timezone, setTimezone] = useState<string>(
    initial.timezone || detectBrowserTimezone(),
  );

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
          <DialogFieldGrid>
            <FormField label={labels.fields.minute} className="min-w-0">
              <Input
                type="number"
                min={0}
                max={59}
                className={fieldInputClass}
                value={parts.minute ?? 0}
                onChange={(e) =>
                  updateParts({ minute: Number(e.target.value) })
                }
              />
            </FormField>
            <ScheduleTimezoneSelect
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          </DialogFieldGrid>
        );
      case "daily":
        return (
          <DialogFieldGrid>
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
            <ScheduleTimezoneSelect
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          </DialogFieldGrid>
        );
      case "weekly":
        return (
          <div className="flex flex-col gap-4">
            <DialogFieldGrid>
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
              <ScheduleTimezoneSelect
                timezone={timezone}
                onTimezoneChange={setTimezone}
              />
            </DialogFieldGrid>
            <FormField label={labels.fields.weekday}>
              <ToggleGroupControl
                type="multiple"
                scrollable
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
          </div>
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
            <ScheduleTimezoneSelect
              timezone={timezone}
              onTimezoneChange={setTimezone}
              fieldClassName="sm:col-span-2"
            />
          </DialogFieldGrid>
        );
      case "custom":
        return (
          <div className="flex flex-col gap-4">
            <FormField label={labels.fields.cron} className="min-w-0">
              <Input
                value={parts.raw ?? ""}
                className={cn(fieldInputClass, "font-mono text-xs")}
                onChange={(e) => updateParts({ raw: e.target.value })}
                placeholder={labels.fields.cronPlaceholder}
              />
              <a
                href="https://crontab.guru/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground mt-1.5 inline-block text-xs hover:underline"
              >
                {labels.cronHelp} ↗
              </a>
            </FormField>
            <ScheduleTimezoneSelect
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
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
          <div className={scheduleDetailPanelClass}>{cronPresetDetails}</div>
        </div>
      ) : (
        <div className={scheduleDetailPanelClass}>
          <DialogFieldGrid>
            <FormField
              label={labels.fields.runAt}
              htmlFor="schedule-run-at"
              className="min-w-0 sm:col-span-2"
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
              fieldClassName="sm:col-span-2"
            />
          </DialogFieldGrid>
        </div>
      )}

      <div
        className={cn(
          readOnlyFieldClass,
          "text-muted-foreground flex min-h-9 items-center gap-2 py-2 text-sm",
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
