"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SearchInput } from "./search-input";
import { FormSelect } from "./select";

/** Right-aligned search + filters row inside `ItemListPanel` / `WorkspaceIndexList`. */
export function ListPanelToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-nowrap items-center justify-stretch gap-2 sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Search field sized for list panel toolbars. */
export function ListSearchField({
  className,
  ...props
}: ComponentProps<typeof SearchInput>) {
  return (
    <SearchInput
      className={cn(
        "max-w-44 min-w-[7.5rem] shrink-0 sm:w-44 sm:max-w-none",
        className,
      )}
      {...props}
    />
  );
}

/** Filter dropdown (`FormSelect`) with list-toolbar sizing; pass `className` on wrapper via `ListFilterField`. */
export function ListFilterSelect({
  className,
  ...props
}: ComponentProps<typeof FormSelect>) {
  return (
    <FormSelect
      appearance="toolbar"
      size="sm"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

/** Width wrapper + filter select (e.g. for `data-testid`). */
export function ListFilterField({
  className,
  "data-testid": dataTestId,
  ...selectProps
}: ComponentProps<typeof ListFilterSelect> & {
  "data-testid"?: string;
}) {
  return (
    <div
      className={cn("w-[7.25rem] shrink-0 sm:w-32", className)}
      data-testid={dataTestId}
    >
      <ListFilterSelect {...selectProps} />
    </div>
  );
}
