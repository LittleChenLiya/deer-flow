"use client";

import type { ReactNode } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { toggleGroupControlClass, toggleGroupControlItemClass } from "./styles";

const scrollWrapClass =
  "overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export type ToggleGroupOption = {
  value: string;
  label: ReactNode;
  ariaLabel?: string;
};

function toggleGroupAriaLabel(item: ToggleGroupOption): string {
  if (item.ariaLabel) {
    return item.ariaLabel;
  }
  if (typeof item.label === "string" || typeof item.label === "number") {
    return String(item.label);
  }
  return item.value;
}

type ToggleGroupControlBase = {
  items: ToggleGroupOption[];
  disabled?: boolean;
  /** Horizontal scroll when options overflow (presets, weekdays). */
  scrollable?: boolean;
  className?: string;
  "data-testid"?: string;
};

export type ToggleGroupControlProps = ToggleGroupControlBase &
  (
    | {
        type?: "single";
        value: string;
        onValueChange: (value: string) => void;
      }
    | {
        type: "multiple";
        value: string[];
        onValueChange: (value: string[]) => void;
      }
  );

/** Workspace outline toggle row — `spacing={0}` (repeat/once, presets, weekdays). */
export function ToggleGroupControl(props: ToggleGroupControlProps) {
  const {
    items,
    disabled,
    scrollable = false,
    className,
    "data-testid": testId,
  } = props;

  const groupClass = cn(
    toggleGroupControlClass,
    scrollable && "inline-flex w-max min-w-0",
    className,
  );

  const body =
    props.type === "multiple" ? (
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        spacing={0}
        value={props.value}
        disabled={disabled}
        data-testid={testId}
        className={groupClass}
        onValueChange={(next) => {
          if (next.length === 0) {
            return;
          }
          props.onValueChange(next);
        }}
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className={toggleGroupControlItemClass}
            aria-label={toggleGroupAriaLabel(item)}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ) : (
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={props.value}
        disabled={disabled}
        data-testid={testId}
        className={groupClass}
        onValueChange={(value) => {
          if (value) {
            props.onValueChange(value);
          }
        }}
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className={toggleGroupControlItemClass}
            aria-label={toggleGroupAriaLabel(item)}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );

  if (scrollable) {
    return <div className={scrollWrapClass}>{body}</div>;
  }

  return body;
}
