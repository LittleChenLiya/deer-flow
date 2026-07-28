"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { forwardRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { InlineEmpty } from "./feedback";
import {
  headerButtonClass,
  itemCardBadgeClass,
  itemCardIconClass,
  panelInteractiveClass,
  rowActionIconProps,
} from "./styles";
import { Tooltip } from "./tooltip";

const metaPillVariantClass = {
  tag: "rounded-md border border-border/50 bg-muted/20 dark:border-white/12 dark:bg-muted/30 dark:text-foreground/80",
  plain: "bg-transparent px-0 py-0 dark:ring-0",
} as const;

const metaPillSizeClass = {
  default: "px-2 py-0.5 text-xs leading-snug",
  /** Optional compact chip (prefer matching default tag height in flush rows). */
  sm: "h-5 shrink-0 px-1.5 py-0 text-[10px] leading-none whitespace-nowrap",
  /** Flush list rows — same metrics as `ItemRowStatusBadge`. */
  row: "h-6 shrink-0 items-center px-2 py-0 text-xs font-normal leading-none whitespace-nowrap",
} as const;

/** Shared type size & height for status badges and kind tags in flush `ItemRow`s. */
export const itemRowMetaChipClass =
  "inline-flex h-6 shrink-0 items-center px-2 text-xs font-normal leading-none";

/** Shared height/padding for elliptical status `Badge` in flush `ItemRow` rows. */
export const itemRowStatusBadgeClass = cn(itemRowMetaChipClass, "rounded-full");

export type ItemRowStatusTone =
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral"
  | "muted";

/** Filled status chips for list rows (outline variant + semantic fill). */
export const itemRowStatusToneClass: Record<ItemRowStatusTone, string> = {
  success:
    "border-emerald-500/35 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  warning:
    "border-amber-500/35 bg-amber-500/12 text-amber-900 dark:text-amber-200",
  info: "border-sky-500/35 bg-sky-500/12 text-sky-900 dark:text-sky-200",
  danger:
    "border-destructive/45 bg-destructive/12 text-destructive dark:text-red-300",
  neutral: "border-border/60 bg-muted/45 text-foreground",
  muted:
    "border-border/50 bg-muted/25 text-muted-foreground dark:text-muted-foreground",
};

/** Elliptical status chip (flush rows — e.g. run status, ingest status). */
export function ItemRowStatusBadge({
  className,
  variant = "outline",
  tone,
  ...props
}: ComponentProps<typeof Badge> & { tone?: ItemRowStatusTone }) {
  return (
    <Badge
      variant={variant}
      className={cn(
        itemRowStatusBadgeClass,
        tone && itemRowStatusToneClass[tone],
        className,
      )}
      {...props}
    />
  );
}

export const MetaPill = forwardRef<
  HTMLSpanElement,
  {
    children: ReactNode;
    className?: string;
    variant?: keyof typeof metaPillVariantClass;
    size?: keyof typeof metaPillSizeClass;
    /** Native browser tooltip (hover to explain the tag). */
    hint?: string;
    /** Use monospace for technical ids; default sans for list row tags. */
    mono?: boolean;
  }
>(function MetaPill(
  {
    children,
    className,
    variant = "tag",
    size = "default",
    hint,
    mono = false,
  },
  ref,
) {
  return (
    <span
      ref={ref}
      title={hint}
      className={cn(
        "text-muted-foreground inline-flex max-w-full items-center gap-1 tracking-tight",
        mono && "font-mono",
        size === "default" && "text-xs leading-snug",
        variant === "tag" && size === "default"
          ? "break-words whitespace-normal"
          : "truncate whitespace-nowrap",
        variant === "tag"
          ? metaPillVariantClass.tag
          : metaPillVariantClass.plain,
        metaPillSizeClass[size],
        hint && "cursor-help",
        className,
      )}
    >
      {children}
    </span>
  );
});
MetaPill.displayName = "MetaPill";

/** Rounded-rect tag chip (flush rows — kind, policy group, duration, …). */
export function ItemRowTag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <MetaPill size="row" className={className}>
      {children}
    </MetaPill>
  );
}

/** Dashed empty / search-miss placeholder for workspace list pages. */
export function ListEmpty({
  children,
  className,
  size = "default",
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "compact";
  align?: "left" | "center";
}) {
  return (
    <InlineEmpty
      align={align}
      className={cn(
        "border-border/60 rounded-xl border border-dashed",
        size === "compact" ? "py-10" : "py-12",
        className,
      )}
    >
      {children}
    </InlineEmpty>
  );
}

const iconToneClass = {
  neutral: "workspace-item-icon",
  knowledge: "workspace-item-icon workspace-item-icon--knowledge",
  api: "workspace-item-icon workspace-item-icon--api",
  agent: "workspace-item-icon workspace-item-icon--agent",
} as const;

export type ItemCardIconTone = keyof typeof iconToneClass;

export function ItemCardIcon({
  icon: Icon,
  tone = "neutral",
}: {
  icon: LucideIcon;
  tone?: ItemCardIconTone;
}) {
  return (
    <div className={cn(iconToneClass[tone])} aria-hidden>
      <Icon className={itemCardIconClass} strokeWidth={2} />
    </div>
  );
}

export function ItemCardBadge({
  children,
  variant = "secondary",
}: {
  children: ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <Badge variant={variant} className={itemCardBadgeClass}>
      {children}
    </Badge>
  );
}

/** Standard meta row for workspace list item cards. */
export function itemMetaTags(
  items: Array<{ key: string; label: ReactNode }>,
): ReactNode[] {
  return items.map(({ key, label }) => (
    <MetaPill key={key} mono>
      {label}
    </MetaPill>
  ));
}

/** Locale-aware timestamp for read-only fields in resource edit dialogs. */
export function formatWorkspaceItemTimestamp(
  value: string,
  locale: string,
): string {
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

export function ItemCard({
  href,
  icon,
  iconTone = "neutral",
  title,
  description,
  badges,
  metaTags,
  actions,
  className,
}: {
  href?: string;
  icon: LucideIcon;
  iconTone?: ItemCardIconTone;
  title: ReactNode;
  description?: ReactNode;
  badges?: ReactNode;
  metaTags?: ReactNode[];
  actions?: ReactNode;
  className?: string;
}) {
  const hasMetaTags = Boolean(metaTags?.length);

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2.5">
        <ItemCardIcon icon={icon} tone={iconTone} />
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">
              {title}
            </h3>
            {badges}
          </div>
          {description ? (
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {hasMetaTags ? (
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <ul className="flex min-h-[1.625rem] flex-wrap gap-1.5">
            {metaTags!.map((item, i) => (
              <li key={i} className="max-w-full">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );

  return (
    <article
      className={cn(
        panelInteractiveClass,
        "group/card flex min-h-[8.5rem] flex-col",
        className,
      )}
    >
      {href ? (
        <Link
          href={href}
          className="focus-visible:ring-ring hover:bg-muted/25 flex min-h-0 flex-1 flex-col rounded-[inherit] px-3.5 py-3.5 transition-colors outline-none focus-visible:ring-[3px]"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-3.5 py-3.5">{body}</div>
      )}
      {actions ? (
        <div
          className="border-border/40 bg-muted/10 dark:bg-muted/20 flex flex-wrap items-stretch gap-1.5 border-t px-2 py-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      ) : null}
    </article>
  );
}

export type ItemGridCols = 1 | 2 | 3 | 4;

export const DEFAULT_ITEM_GRID_COLS = 4 satisfies ItemGridCols;

const colsClass: Record<ItemGridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const denseGridClass =
  "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

export const itemGridClass = colsClass[DEFAULT_ITEM_GRID_COLS];

export function ItemGrid({
  children,
  cols = DEFAULT_ITEM_GRID_COLS,
  density = "default",
  className,
}: {
  children: ReactNode;
  cols?: ItemGridCols;
  density?: "default" | "dense";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid",
        density === "dense"
          ? cn("gap-2", denseGridClass)
          : cn("gap-3", colsClass[cols]),
        className,
      )}
    >
      {children}
    </div>
  );
}

export const cardActionClass = cn(
  headerButtonClass,
  "border border-border/70 bg-background/70 hover:bg-muted/50 dark:border-white/10 dark:bg-background/40 dark:hover:bg-muted/35 [&_svg]:size-3",
);

type CardActionBase = {
  icon: LucideIcon;
  label: string;
  tooltip?: string;
  className?: string;
  disabled?: boolean;
};

type CardActionLinkProps = CardActionBase & {
  href: string;
  onClick?: never;
  type?: never;
};

type CardActionButtonProps = CardActionBase &
  Pick<ComponentProps<typeof Button>, "onClick" | "type"> & {
    href?: never;
  };

export function CardAction(props: CardActionLinkProps | CardActionButtonProps) {
  const { icon: Icon, label, tooltip, className, disabled } = props;
  const tip = tooltip ?? label;
  const btnClass = cn(cardActionClass, className);

  if ("href" in props && props.href) {
    return (
      <Tooltip content={tip}>
        <Button
          asChild
          size="sm"
          variant="outline"
          className={btnClass}
          disabled={disabled}
        >
          <Link href={props.href}>
            <Icon {...rowActionIconProps} />
            {label}
          </Link>
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tip}>
      <Button
        type={props.type ?? "button"}
        size="sm"
        variant="outline"
        className={btnClass}
        disabled={disabled}
        onClick={props.onClick}
      >
        <Icon {...rowActionIconProps} />
        {label}
      </Button>
    </Tooltip>
  );
}
