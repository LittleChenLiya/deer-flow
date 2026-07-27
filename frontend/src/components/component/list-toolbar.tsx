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
        "flex w-full min-w-0 flex-wrap items-center justify-end gap-2",
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
      className={cn("min-w-0 flex-1 sm:w-56 sm:flex-none", className)}
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
    <FormSelect size="sm" className={cn("h-8 w-full", className)} {...props} />
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
    <div className={cn("w-full sm:w-44", className)} data-testid={dataTestId}>
      <ListFilterSelect {...selectProps} />
    </div>
  );
}
