"use client";

import Link from "next/link";
import type {
  ComponentProps,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import { InlineEmpty } from "./feedback";
import {
  workspaceIndexListPanelClass,
  workspacePageInsetXClass,
} from "./styles";

/** Inline meta segments separated by middots (status · kind · …). */
export function dotSeparatedMeta(items: ReactNode[]): ReactNode[] {
  const nodes = items.filter(Boolean);
  return nodes.flatMap((node, i, arr) =>
    i < arr.length - 1
      ? [
          node,
          <span key={`dot-sep-${i}`} className="text-border">
            ·
          </span>,
        ]
      : [node],
  );
}

/** Bordered list section: title, count, toolbar, body, optional footer (e.g. load more). */
export function ItemListPanel({
  title,
  countLabel,
  toolbar,
  children,
  footer,
  className,
}: {
  title: ReactNode;
  countLabel?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "bg-card/80 flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border",
        workspaceIndexListPanelClass,
        className,
      )}
    >
      <div
        className={cn(
          "border-border/50 flex shrink-0 items-center justify-between gap-3 border-b py-2",
          workspacePageInsetXClass,
        )}
      >
        <div className="flex min-w-0 shrink items-baseline gap-2">
          <h2 className="text-xs font-semibold tracking-tight sm:text-sm sm:font-medium">
            {title}
          </h2>
          {countLabel != null ? (
            <span className="text-muted-foreground text-[11px] tabular-nums sm:text-xs">
              {countLabel}
            </span>
          ) : null}
        </div>
        {toolbar ? (
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto">
            {toolbar}
          </div>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {footer ? <div className="shrink-0">{footer}</div> : null}
    </section>
  );
}

/** Empty state inside `ItemListPanel` (no extra dashed frame — panel already bordered). */
export function PanelEmpty({
  className,
  align = "center",
  ...props
}: ComponentProps<typeof InlineEmpty>) {
  return (
    <InlineEmpty
      align={align}
      className={cn(
        "border-0 bg-transparent shadow-none backdrop-blur-none",
        "flex flex-1 flex-col justify-center",
        className,
      )}
      {...props}
    />
  );
}

const itemRowActionStopPropagation = {
  onClick: (e: MouseEvent) => e.stopPropagation(),
  onKeyDown: (e: KeyboardEvent) => e.stopPropagation(),
} as const;

function ItemRowActionsWrap({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex shrink-0 items-center gap-1.5"
      {...itemRowActionStopPropagation}
    >
      {children}
    </div>
  );
}

/** Primary title line in a flush row (`topStart`). Pass `href` when the row has a detail page. */
export function ItemRowTitle({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  return (
    <div className={cn("min-w-0 truncate text-sm font-medium", className)}>
      {href ? (
        <Link
          href={href}
          className="hover:text-foreground block min-w-0 truncate hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {children}
        </Link>
      ) : (
        children
      )}
    </div>
  );
}

/** Secondary line under the title in `topStart` (model name, doc tags, …). */
export function ItemRowSubtitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Meta / stats in `bottomStart`. */
export function ItemRowMeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ItemRowInteractive = {
  href?: string;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  "data-testid"?: string;
};

/** Flush panel row: two lines × start/end slots (runs-style lists). */
export type ItemRowFlushProps = ItemRowInteractive & {
  variant: "flush";
  topStart: ReactNode;
  topEnd?: ReactNode;
  bottomStart?: ReactNode;
  bottomEnd?: ReactNode;
};

/** Legacy flush props (mapped to the four slots). */
type ItemRowFlushLegacyProps = ItemRowInteractive & {
  variant: "flush";
  title: ReactNode;
  titleTrailing?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  topStart?: never;
};

type ItemRowCardProps = ItemRowInteractive & {
  variant?: "card";
  title: ReactNode;
  titleTrailing?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  topStart?: never;
};

export type ItemRowProps =
  | ItemRowFlushProps
  | ItemRowFlushLegacyProps
  | ItemRowCardProps;

function ItemRowFlushBody({
  topStart,
  topEnd,
  bottomStart,
  bottomEnd,
}: Pick<
  ItemRowFlushProps,
  "topStart" | "topEnd" | "bottomStart" | "bottomEnd"
>) {
  const hasBottom = Boolean(bottomStart ?? bottomEnd);

  return (
    <>
      <div className="flex w-full min-w-0 items-center gap-x-2 overflow-hidden">
        <div className="min-w-0 flex-1 space-y-0.5">{topStart}</div>
        {topEnd ? (
          <div className="text-muted-foreground flex min-w-0 shrink items-center gap-x-2">
            {topEnd}
          </div>
        ) : null}
      </div>
      {hasBottom ? (
        <div className="flex w-full min-w-0 items-center gap-x-2 gap-y-1">
          {bottomStart ? (
            <div className="min-w-0 flex-1">{bottomStart}</div>
          ) : (
            <div className="min-w-0 flex-1" aria-hidden />
          )}
          {bottomEnd ? (
            <div className="ml-auto shrink-0">
              <ItemRowActionsWrap>{bottomEnd}</ItemRowActionsWrap>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function flushSlotsFromLegacy(props: ItemRowFlushLegacyProps) {
  const topStart = (
    <>
      <ItemRowTitle>{props.title}</ItemRowTitle>
      {props.description ? (
        <ItemRowSubtitle>{props.description}</ItemRowSubtitle>
      ) : null}
    </>
  );
  const topEnd =
    props.titleTrailing || props.badges ? (
      <>
        {props.titleTrailing}
        {props.badges}
      </>
    ) : undefined;
  const bottomStart = props.meta ? (
    <ItemRowMeta>{props.meta}</ItemRowMeta>
  ) : undefined;
  const bottomEnd = props.actions;

  return { topStart, topEnd, bottomStart, bottomEnd };
}

/**
 * List row for `ItemList` / `ItemListPanel`.
 *
 * **`variant="flush"`** — two rows, four slots: `topStart` | `topEnd`, then
 * `bottomStart` | `bottomEnd`. Use `ItemRowTitle`, `ItemRowSubtitle`, `ItemRowMeta`
 * for consistent typography. Legacy `title` / `description` / `meta` props still map
 * into the same layout.
 */
export function ItemRow(props: ItemRowProps) {
  const {
    href,
    onClick,
    className,
    selected,
    "data-testid": dataTestId,
    variant = "card",
  } = props;

  const interactive = Boolean(onClick ?? href);
  const Wrapper = href ? "a" : onClick ? "button" : "div";
  const wrapperProps = href
    ? { href }
    : onClick
      ? { type: "button" as const, onClick }
      : {};

  const isFlush = variant === "flush";

  if (isFlush) {
    const slots =
      "topStart" in props && props.topStart != null
        ? {
            topStart: props.topStart,
            topEnd: props.topEnd,
            bottomStart: props.bottomStart,
            bottomEnd: props.bottomEnd,
          }
        : flushSlotsFromLegacy(props as ItemRowFlushLegacyProps);

    return (
      <Wrapper
        {...wrapperProps}
        data-testid={dataTestId}
        className={cn(
          "group/row flex w-full min-w-0 flex-col gap-1 text-left transition-colors",
          "hover:bg-muted/40 py-2",
          workspacePageInsetXClass,
          interactive && "cursor-pointer",
          selected && "bg-primary/5 ring-primary/20 ring-1",
          className,
        )}
      >
        <ItemRowFlushBody {...slots} />
      </Wrapper>
    );
  }

  const { title, titleTrailing, description, meta, badges, actions } =
    props as ItemRowCardProps;

  const actionSlot = actions ? (
    <ItemRowActionsWrap>{actions}</ItemRowActionsWrap>
  ) : null;

  const titleLine = (
    <div className="flex w-full min-w-0 items-center gap-x-2 overflow-hidden">
      <div className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight">
        {title}
      </div>
      {titleTrailing ? (
        <div className="text-muted-foreground min-w-0 shrink">
          {titleTrailing}
        </div>
      ) : null}
      {badges}
    </div>
  );

  const bodyBelowTitle = (
    <>
      {description ? (
        <div className="text-muted-foreground line-clamp-2 min-w-0 text-sm leading-snug">
          {description}
        </div>
      ) : null}
      {meta ? (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums">
          {meta}
        </div>
      ) : null}
    </>
  );

  return (
    <Wrapper
      {...wrapperProps}
      data-testid={dataTestId}
      className={cn(
        "group/row flex w-full min-w-0 flex-col gap-2 text-left transition-colors sm:flex-row sm:items-center sm:gap-4",
        "gap-3 rounded-xl px-4 py-3.5 sm:gap-4",
        interactive &&
          "hover:bg-muted/50 focus-visible:ring-ring cursor-pointer focus-visible:ring-[3px] focus-visible:outline-none",
        selected && "bg-primary/5 ring-primary/20 ring-1",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        {titleLine}
        {bodyBelowTitle}
      </div>
      {actionSlot ? (
        <div className="shrink-0 sm:ml-auto">{actionSlot}</div>
      ) : null}
    </Wrapper>
  );
}

/**
 * Workspace resource index (agents, knowledge spaces, API keys, runs, …):
 * bordered panel + flush rows — change layout once here.
 */
export function WorkspaceIndexList({
  title,
  countLabel,
  toolbar,
  footer,
  className,
  isLoading,
  loadingLabel,
  isEmpty,
  empty,
  isSearchEmpty,
  searchEmpty,
  listTestId,
  listProps,
  emptyAlign = "center",
  children,
}: {
  title: ReactNode;
  countLabel?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  isEmpty: boolean;
  empty: ReactNode;
  isSearchEmpty: boolean;
  searchEmpty: ReactNode;
  emptyAlign?: "left" | "center";
  listTestId?: string;
  listProps?: Omit<ComponentProps<"div">, "children">;
  children: ReactNode;
}) {
  return (
    <ItemListPanel
      title={title}
      countLabel={countLabel}
      toolbar={toolbar}
      footer={footer}
      className={cn("min-h-0", className)}
    >
      {isLoading ? (
        <p
          className={cn(
            "text-muted-foreground py-6 text-sm",
            workspacePageInsetXClass,
          )}
        >
          {loadingLabel}
        </p>
      ) : isEmpty ? (
        <PanelEmpty align={emptyAlign}>{empty}</PanelEmpty>
      ) : isSearchEmpty ? (
        <PanelEmpty align={emptyAlign}>{searchEmpty}</PanelEmpty>
      ) : (
        <ItemList variant="flush" data-testid={listTestId} {...listProps}>
          {children}
        </ItemList>
      )}
    </ItemListPanel>
  );
}

export function ItemList({
  children,
  className,
  variant = "card",
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: "card" | "flush";
} & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        variant === "flush"
          ? "flex flex-col [&>*]:border-border/50 [&>*]:border-b"
          : "divide-border/60 flex flex-col divide-y px-1 py-1 sm:px-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
