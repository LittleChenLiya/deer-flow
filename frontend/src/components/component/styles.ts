/** Shared workspace surface classes (see globals.css). */
import { cn } from "@/lib/utils";

export const panelClass = "workspace-panel border-0 bg-transparent shadow-none";

export const panelInteractiveClass =
  "workspace-panel workspace-item-card bg-transparent shadow-none";

export const headerButtonClass =
  "h-7 min-h-7 shrink-0 gap-1 rounded-md border-border/70 bg-transparent px-2.5 text-xs leading-none shadow-none hover:bg-muted/40 sm:px-3";

/** List panel toolbar — lock font size (overrides Input/Select defaults). */
export const workspaceToolbarTextClass = "text-xs leading-none md:text-xs";

/** Unified compact height — page toolbars only (search, header create). */
export const workspaceControlHeightClass = cn(
  "h-7 min-h-7",
  workspaceToolbarTextClass,
);

/** Create/edit dialogs — slightly taller for readability inside section cards. */
export const workspaceDialogControlHeightClass =
  "h-8 min-h-8 text-xs leading-none";

/** List panel search inputs + header toolbar fields (matched height). */
export const workspaceToolbarInputClass = workspaceControlHeightClass;

/** List panel search — same radius/height as toolbar selects. */
export const workspaceToolbarSearchInputClass = cn(
  workspaceToolbarInputClass,
  "rounded-md border-border/70 bg-transparent shadow-none md:text-xs",
);

/** List panel filter selects — matched to search field. */
export const workspaceToolbarSelectTriggerClass = cn(
  workspaceToolbarInputClass,
  "!h-7 min-h-7 rounded-md border-border/70 bg-transparent px-3 py-0 shadow-xs dark:bg-transparent",
  "!text-xs md:!text-xs",
  "[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:whitespace-nowrap [&_[data-slot=select-value]]:text-xs",
  "[&_svg:not([class*='size-'])]:size-3",
);

/** Primary create action in page headers (high contrast, especially in dark theme). */
export const headerCreateEmphasisButtonClass =
  "!border-primary !bg-primary !text-primary-foreground shadow-xs hover:!bg-primary/90 hover:!text-primary-foreground";

/** Matched toolbar height: `ItemListPanel` subheaders. */
export const workspaceToolbarStripClass = "min-h-7 py-0.5 sm:min-h-8 sm:py-1";

/** Slightly taller strip for `PageHeader` (title + actions row). */
export const workspacePageHeaderStripClass =
  "min-h-8 py-1 sm:min-h-9 sm:py-1.5";

/** Horizontal inset aligned with `PageHeader` / list rows (matches body vertical padding). */
export const workspacePageInsetXClass = "px-2 sm:px-2.5";

/** Default `Page` body — same inset on all sides for workspace index pages. */
export const workspacePageBodyPaddingClass = "px-2 py-2 sm:px-2.5 sm:py-2.5";
export const workspacePageBodyGapClass = "gap-3";
/** Default scroll body so list panels can `flex-1` + empty states center. */
export const workspacePageScrollBodyClass = "flex min-h-0 flex-1 flex-col";

/** Default `ItemListPanel` / `WorkspaceIndexList` on workspace index pages. */
export const workspaceIndexListPanelClass = "min-h-0 flex-1";

/** Lucide stroke shared by kit action icons (header, list rows, dialogs). */
export const actionIconProps = {
  strokeWidth: 2,
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
export const toggleGroupControlItemClass = cn(
  "h-8 min-h-8 shrink-0 px-3 text-xs leading-none",
);

/** Footer cancel / save / delete — fixed width; radius from `Button` (`rounded-md`). */
export const dialogFooterButtonClass =
  "box-border w-[5.75rem] shrink-0 justify-center px-2.5 text-xs font-medium";

/** Outline actions inside dialog bodies (e.g. AI 生成). */
export const dialogInlineButtonClass = cn(
  "inline-flex shrink-0 justify-center gap-1.5 rounded-md border border-border/70 bg-transparent px-3 font-medium shadow-xs hover:bg-muted/50",
  workspaceDialogControlHeightClass,
);

/** Cancel (×) / save (✓) glyphs in dialog footers — bolder than thin Lucide strokes at small sizes. */
const formActionGlyphClass =
  "inline-flex shrink-0 items-center justify-center font-extrabold leading-none";

export const dialogFormActionGlyphClass = cn(formActionGlyphClass, "size-4");

export const dialogFormActionCancelGlyphClass = cn(
  dialogFormActionGlyphClass,
  "text-base tracking-tight",
);

export const dialogFormActionConfirmGlyphClass = cn(
  dialogFormActionGlyphClass,
  "text-sm",
);

/** Page-header create (+) — same glyph weight as dialog close (×); spacing from `headerButtonClass` gap. */
export const headerActionPlusGlyphClass = cn(
  formActionGlyphClass,
  "text-xs leading-none tracking-tight",
);

/** Lucide icons beside header labels (import, export, …). */
export const headerActionIconProps = {
  ...actionIconProps,
  className: actionIconSmClass,
} as const;

/** Dialog cancel / secondary — same radius/height as default `Button` size sm. */
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
  "shrink-0 justify-center flex-col-reverse gap-2 border-t border-border/40 pt-3 sm:flex-row sm:justify-center";

/** Text/select controls inside workspace dialogs */
export const dialogFieldControlClass = cn(
  workspaceDialogControlHeightClass,
  "shadow-xs bg-transparent dark:bg-transparent",
);

/** Multi-line fields in dialogs */
export const dialogTextareaControlClass =
  "min-h-8 bg-transparent px-3 py-2 text-xs leading-relaxed shadow-xs dark:bg-transparent";

/** Theme-aligned focus for fields that override default `Input` / `Textarea` classes. */
export const workspaceFieldFocusClass =
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

/** Multi-select chip in dialog forms (policy tags, etc.). */
export const dialogChoiceChipClass = cn(
  "border-input bg-background flex cursor-pointer items-center gap-2 rounded-md border px-3 shadow-xs has-[:checked]:border-primary has-[:checked]:bg-primary/5",
  workspaceDialogControlHeightClass,
);

/** Create/edit dialogs with scrollable form body */
export const workspaceDialogContentClass =
  "flex max-h-[min(92vh,46rem)] flex-col gap-3 p-4 sm:max-w-[52rem] sm:p-5";

/** Title + description + footer only (delete confirm, etc.) */
export const workspaceConfirmDialogContentClass =
  "flex flex-col gap-3 p-4 sm:max-w-md sm:p-5";

/** Scroll body; top padding clears `DialogFormSection` legend (`-translate-y-1/2`). */
export const workspaceDialogBodyScrollClass =
  "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-pt-2 pt-2 pb-0";

export const readOnlyFieldClass = cn(
  "border-input/60 bg-muted/15 text-foreground flex min-w-0 items-center rounded-md border px-3 text-xs leading-none break-words whitespace-normal",
  workspaceDialogControlHeightClass,
);

export const selectTriggerWrapClass = cn(
  "h-8 min-h-8 !h-8 w-full bg-transparent px-3 py-0 shadow-xs whitespace-normal dark:bg-transparent",
  workspaceDialogControlHeightClass,
  "[&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:whitespace-normal [&_[data-slot=select-value]]:break-words",
);

/** Lucide icon on workspace list item cards */
export const itemCardIconClass = "size-4";

export const itemCardBadgeClass = "h-4 px-1.5 text-[10px] font-normal";
