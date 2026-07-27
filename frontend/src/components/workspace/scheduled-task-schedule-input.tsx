"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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
  type Weekday,
} from "@/core/scheduled-tasks/cron";

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

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Keep callback identity out of the dependency list so inline callbacks do
  // not create a render loop. The initial emit also syncs detected timezone.
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
    setParts((previous) => ({ ...previous, ...patch }));
  }

  function changePreset(next: CronPreset) {
    setParts((previous) => {
      const merged = { ...previous };
      if (next === "weekly" && (merged.weekdays ?? []).length === 0) {
        merged.weekdays = ["mon"];
      }
      if (next === "monthly" && merged.dayOfMonth == null) {
        merged.dayOfMonth = 1;
      }
      if (next === "custom" && !merged.raw) {
        merged.raw = serializeCron("daily", previous);
      }
      return merged;
    });
    setPreset(next);
  }

  function toggleWeekday(weekday: Weekday) {
    setParts((previous) => {
      const active = new Set(previous.weekdays ?? []);
      if (active.has(weekday)) {
        active.delete(weekday);
      } else {
        active.add(weekday);
      }
      return {
        ...previous,
        weekdays: WEEKDAYS.filter((candidate) => active.has(candidate)),
      };
    });
  }

  const preview = describeSchedule(
    { scheduleType, preset, parts, runAtLocal, timezone },
    schedLocale,
  );

  return (
    <div className="flex flex-col gap-3" data-testid="schedule-input">
      {!scheduleTypeLocked ? (
        <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
          {(["cron", "once"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              className={
                scheduleType === value ? "bg-background shadow-sm" : ""
              }
              aria-pressed={scheduleType === value}
              onClick={() => setScheduleType(value)}
            >
              {value === "cron"
                ? labels.scheduleType.cron
                : labels.scheduleType.once}
            </Button>
          ))}
        </div>
      ) : null}

      {scheduleType === "cron" ? (
        <>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">{labels.preset.label}</span>
            <Select
              value={preset}
              onValueChange={(value) => changePreset(value as CronPreset)}
            >
              <SelectTrigger className="w-full" data-testid="schedule-preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {labels.preset[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {preset === "hourly" ? (
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">{labels.fields.minute}</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={parts.minute ?? 0}
                onChange={(event) =>
                  updateParts({ minute: Number(event.target.value) })
                }
              />
            </label>
          ) : null}

          {preset === "daily" || preset === "weekly" || preset === "monthly" ? (
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">{labels.fields.time}</span>
              <Input
                type="time"
                value={`${pad2(parts.hour ?? 9)}:${pad2(parts.minute ?? 0)}`}
                onChange={(event) => {
                  const [hour, minute] = event.target.value
                    .split(":")
                    .map(Number);
                  updateParts({ hour, minute });
                }}
              />
            </label>
          ) : null}

          {preset === "weekly" ? (
            <div className="space-y-1.5">
              <span className="text-sm font-medium">
                {labels.fields.weekday}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((weekday) => {
                  const active = (parts.weekdays ?? []).includes(weekday);
                  return (
                    <Button
                      key={weekday}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      aria-pressed={active}
                      onClick={() => toggleWeekday(weekday)}
                    >
                      {labels.weekdays[weekday]}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {preset === "monthly" ? (
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">{labels.fields.dayOfMonth}</span>
              <Input
                type="number"
                min={1}
                max={31}
                value={parts.dayOfMonth ?? 1}
                onChange={(event) =>
                  updateParts({ dayOfMonth: Number(event.target.value) })
                }
              />
            </label>
          ) : null}

          {preset === "custom" ? (
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">{labels.fields.cron}</span>
              <Input
                value={parts.raw ?? ""}
                onChange={(event) => updateParts({ raw: event.target.value })}
                placeholder={labels.fields.cronPlaceholder}
              />
              <a
                href="https://crontab.guru/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground inline-block text-xs hover:underline"
              >
                {labels.cronHelp} ↗
              </a>
            </label>
          ) : null}
        </>
      ) : (
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">{labels.fields.runAt}</span>
          <Input
            type="datetime-local"
            value={runAtLocal}
            onChange={(event) => setRunAtLocal(event.target.value)}
          />
        </label>
      )}

      <label className="space-y-1.5 text-sm">
        <span className="font-medium">{labels.fields.timezone}</span>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full" data-testid="schedule-timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <p
        className="text-muted-foreground text-sm"
        data-testid="schedule-preview"
      >
        <span className="text-foreground font-medium">{labels.preview}:</span>{" "}
        {preview}
      </p>
    </div>
  );
}
