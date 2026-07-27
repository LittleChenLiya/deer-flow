/** Shared workspace surface classes (see globals.css). */
import { cn } from "@/lib/utils";

export const panelClass = "workspace-panel border-0 bg-transparent shadow-none";

export const panelInteractiveClass =
  "workspace-panel workspace-item-card bg-transparent shadow-none";

export const headerButtonClass =
  "h-8 shrink-0 gap-1 rounded-md border-border/70 bg-transparent px-4 text-xs shadow-none hover:bg-muted/40 sm:h-9 sm:px-5 sm:text-sm";

/** Lucide stroke shared by kit action icons (header, list rows, dialogs). */
export const actionIconProps = {
  strokeWidth: 3,
  absoluteStrokeWidth: true,
} as const;

export const actionIconSmClass = "size-3.5 shrink-0 sm:size-4";

/** Icon inside flush list `CardAction` buttons. */
export const rowActionIconProps = {
  ...actionIconProps,
  className: actionIconSmClass,
} as const;

/** Lucide icon in dialog footer actions (delete / outline-delete confirm). */
export const dialogActionIconProps = {
  ...actionIconProps,
  className: "!size-4 shrink-0",
} as const;

/** Outline toggle groups in workspace dialogs (single or multi). */
export const toggleGroupControlClass = "w-fit max-w-full";
export const toggleGroupControlItemClass =
  "h-8 shrink-0 px-3 text-xs sm:px-4 sm:text-sm";

/** Shared metrics for dialog footer actions (revoke / cancel / save). */
export const dialogFooterButtonClass =
  "box-border inline-flex h-9 min-h-9 w-[6.75rem] shrink-0 justify-center gap-1.5 rounded-md px-3 text-sm font-medium shadow-xs has-[>svg]:px-3 [&_svg]:size-4";

/** Cancel (×) / save (✓) glyphs in dialog footers — bolder than thin Lucide strokes at small sizes. */
const formActionGlyphClass =
  "inline-flex shrink-0 items-center justify-center font-extrabold leading-none";

export const dialogFormActionGlyphClass = cn(formActionGlyphClass, "size-4");

export const dialogFormActionCancelGlyphClass = cn(
  dialogFormActionGlyphClass,
  "text-[1.0625rem] tracking-tight",
);

export const dialogFormActionConfirmGlyphClass = cn(
  dialogFormActionGlyphClass,
  "text-sm",
);

/** Page-header create (+) — same glyph weight as dialog close (×); spacing from `headerButtonClass` gap. */
export const headerActionPlusGlyphClass = cn(
  formActionGlyphClass,
  "text-[1.0625rem] tracking-tight",
);

/** Lucide icons beside header labels (import, export, …). */
export const headerActionIconProps = {
  ...actionIconProps,
  className: actionIconSmClass,
} as const;

/** Dialog cancel / secondary — aligned with dialog inputs (rounded-md, h-9) */
export const dialogSecondaryButtonClass = cn(
  dialogFooterButtonClass,
  "border-border/70 bg-transparent hover:bg-muted/50",
);

/** Dialog confirm — primary, same control height/radius as inputs */
export const dialogPrimaryButtonClass = dialogFooterButtonClass;

/** Dialog destructive (delete / revoke) — same size as cancel / save */
export const dialogDestructiveButtonClass = dialogFooterButtonClass;

/** Footer separated from form body; actions centered */
export const dialogFooterClass =
  "shrink-0 justify-center flex-col-reverse gap-3 sm:flex-row sm:justify-center";

/** Text/select controls inside workspace dialogs — transparent on tinted section cards */
export const dialogFieldControlClass =
  "h-9 text-sm shadow-xs bg-transparent dark:bg-transparent";

/** Theme-aligned focus for fields that override default `Input` / `Textarea` classes. */
export const workspaceFieldFocusClass =
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

/** Multi-select chip in dialog forms (policy tags, etc.). */
export const dialogChoiceChipClass =
  "border-input bg-background flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-xs has-[:checked]:border-primary has-[:checked]:bg-primary/5";

/** Create/edit dialogs with scrollable form body */
export const workspaceDialogContentClass =
  "flex max-h-[min(92vh,46rem)] flex-col gap-4 sm:max-w-3xl";

/** Title + description + footer only (delete confirm, etc.) */
export const workspaceConfirmDialogContentClass =
  "flex flex-col gap-4 sm:max-w-md";

/** Scroll body; top padding clears `DialogFormSection` legend (`-translate-y-1/2`). */
export const workspaceDialogBodyScrollClass =
  "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto scroll-pt-3 pt-3 pb-1";

/** Read-only value cell in dialogs — wraps long text inside bordered box */
export const readOnlyFieldClass =
  "border-input/60 bg-muted/15 text-foreground min-h-10 min-w-0 rounded-md border px-3 py-2.5 text-sm leading-snug break-words whitespace-normal";

/** Select trigger that wraps long labels inside dialog grids */
export const selectTriggerWrapClass =
  "h-auto min-h-9 w-full bg-transparent py-2 shadow-xs whitespace-normal dark:bg-transparent [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:whitespace-normal [&_[data-slot=select-value]]:break-words";

/** Lucide icon on workspace list item cards */
export const itemCardIconClass = "size-4";

export const itemCardBadgeClass = "h-4 px-1.5 text-[10px] font-normal";
