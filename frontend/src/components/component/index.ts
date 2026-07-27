/**
 * Workspace composed UI kit for resource list pages (agents, runs, etc.).
 *
 * **Import rule:** workspace resource pages use this kit plus unmodified `@/components/ui/*`.
 * Domain-specific UI lives under `@/components/workspace/<feature>/`.
 *
 * **Do not edit** other paths under `@/components/` (except this directory).
 *
 * ---
 * **Kit map** (extend via `className`, slots, or `DialogSlotField` — do not fork styles per page)
 *
 * | Layer | Components |
 * |-------|------------|
 * | **Page shell** | `Page`, `PageHeader`, `Header` (sub-pages), `Shell`, `Section` |
 * | **Header actions** | `HeaderCreateButton`, `HeaderOutlineButton`, `HeaderActionPlusGlyph`, `headerActionIconProps` |
 * | **List index** | `ItemListPanel`, `WorkspaceIndexList`, `ItemList`, flush `ItemRow` + `ItemRowTitle` / `Meta` / `CardAction` |
 * | **List toolbar** | `ListPanelToolbar`, `ListSearchField`, `ListFilterField` |
 * | **Card index** | `ItemGrid`, `ItemCard`, `itemMetaTags`, `CardAction` |
 * | **Create / edit dialog** | `FormDialog`, `DialogShell`, `FormActions`, `dialogSaveFooterProps`, `DialogFormSection`, `DialogFieldGrid` |
 * | **Dialog fields** | `DialogInputField`, `DialogTextareaField`, `DialogSelectField`, `DialogToggleGroupField`, `DialogSlotField` |
 * | **Controls** | `FormSelect`, `ToggleGroupControl`, `SearchInput`, `FormField` |
 * | **Feedback** | `ErrorAlert`, `ListEmpty`, `PanelEmpty`, `ConfirmDialog` |
 *
 * **Action icons:** create `+` → `HeaderCreateButton`; dialog ×/✓ glyphs; list/delete Lucide → `rowActionIconProps` / `dialogActionIconProps`; stroke root → `actionIconProps`.
 */

export { CardAction, cardActionClass } from "./item";
export {
  dotSeparatedMeta,
  ItemList,
  ItemListPanel,
  ItemRow,
  ItemRowMeta,
  ItemRowSubtitle,
  ItemRowTitle,
  PanelEmpty,
  WorkspaceIndexList,
  type ItemRowFlushProps,
  type ItemRowProps,
} from "./list";
export {
  ListFilterField,
  ListPanelToolbar,
  ListSearchField,
} from "./list-toolbar";
export {
  formatItemListCountLabel,
  ItemListInfiniteTail,
  ItemListLoadMoreFooter,
  useItemListInfiniteScroll,
} from "./page-more";
export {
  ConfirmDialog,
  DialogFieldGrid,
  DialogFormSection,
  DialogInputField,
  DialogSelectField,
  DialogToggleGroupField,
  DialogSlotField,
  DialogTextareaField,
  DialogResourceMetaSection,
  DialogShell,
  FormActions,
  FormDialog,
  FormDialogDeleteButton,
  dialogSaveFooterProps,
} from "./dialogs";
export type { FormDialogLeadingDestructive } from "./dialogs";
export { FormSelect, type FormSelectOption } from "./select";
export {
  Header,
  HeaderActionPlusGlyph,
  HeaderCreateButton,
  HeaderOutlineButton,
} from "./header";
export {
  DEFAULT_ITEM_GRID_COLS,
  ItemCard,
  ItemCardBadge,
  ItemCardIcon,
  ItemGrid,
  itemGridClass,
  itemMetaTags,
  formatWorkspaceItemTimestamp,
  ListEmpty,
  MetaPill,
  ItemRowStatusBadge,
  ItemRowTag,
  itemRowStatusBadgeClass,
  type ItemCardIconTone,
  type ItemGridCols,
} from "./item";
export { Shell } from "./shell";
export { Tooltip } from "./tooltip";

export { ErrorAlert, InlineEmpty } from "./feedback";
export { FormField } from "./form-field";
export { PageHeader } from "./page-header";
export { Page, SplitView } from "./page-layout";
export { SearchInput } from "./search-input";
export { Section } from "./section";
export {
  ToggleGroupControl,
  type ToggleGroupControlProps,
  type ToggleGroupOption,
} from "./toggle-group-control";
export {
  readOnlyFieldClass,
  selectTriggerWrapClass,
  dialogFooterButtonClass,
  dialogChoiceChipClass,
  dialogFieldControlClass,
  workspaceDialogBodyScrollClass,
  workspaceDialogContentClass,
  workspaceConfirmDialogContentClass,
  dialogFooterClass,
  dialogPrimaryButtonClass,
  dialogSecondaryButtonClass,
  dialogDestructiveButtonClass,
  itemCardIconClass,
  itemCardBadgeClass,
  headerButtonClass,
  headerActionIconProps,
  headerActionPlusGlyphClass,
  actionIconProps,
  actionIconSmClass,
  rowActionIconProps,
  dialogActionIconProps,
  toggleGroupControlClass,
  toggleGroupControlItemClass,
  panelClass,
  panelInteractiveClass,
  workspaceFieldFocusClass,
} from "./styles";
