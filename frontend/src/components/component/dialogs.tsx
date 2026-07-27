"use client";

import { CheckIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

import { FormField } from "./form-field";
import { FormSelect, type FormSelectOption } from "./select";
import {
  dialogDestructiveButtonClass,
  dialogFieldControlClass,
  dialogFooterClass,
  dialogFormActionCancelGlyphClass,
  dialogFormActionGlyphClass,
  dialogActionIconProps,
  dialogPrimaryButtonClass,
  dialogSecondaryButtonClass,
  readOnlyFieldClass,
  selectTriggerWrapClass,
  workspaceConfirmDialogContentClass,
  workspaceDialogBodyScrollClass,
  workspaceDialogContentClass,
} from "./styles";
import {
  ToggleGroupControl,
  type ToggleGroupControlProps,
} from "./toggle-group-control";

const dialogFormSectionLegendClass =
  "text-foreground/85 bg-background absolute top-0 left-3.5 z-[1] max-w-[calc(100%-1.75rem)] -translate-y-1/2 px-1.5 text-xs font-semibold tracking-wide whitespace-nowrap";

/** Layout shell for workspace dialogs: title, optional description, scroll body, footer. */
export function DialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  bodyClassName,
  footerClassName,
  contentClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  bodyClassName?: string;
  footerClassName?: string;
  contentClassName?: string;
}) {
  const { t } = useI18n();
  const isConfirm = children == null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          isConfirm
            ? workspaceConfirmDialogContentClass
            : workspaceDialogContentClass,
          contentClassName,
        )}
        showCloseButton={false}
      >
        {!isConfirm ? (
          <DialogClose className="text-muted-foreground hover:text-foreground focus-visible:ring-ring hover:bg-muted/50 absolute top-4 right-4 flex size-9 items-center justify-center rounded-md transition-colors focus-visible:ring-[3px] focus-visible:outline-none">
            <span aria-hidden className={dialogFormActionCancelGlyphClass}>
              ×
            </span>
            <span className="sr-only">{t.common.close}</span>
          </DialogClose>
        ) : null}
        <DialogHeader
          className={cn(
            "shrink-0 text-left sm:text-left",
            isConfirm && "gap-3",
          )}
        >
          <DialogTitle
            className={cn(
              isConfirm ? "text-base" : undefined,
              !isConfirm && "pr-10",
            )}
          >
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription
              className={
                isConfirm
                  ? "text-foreground py-2 text-center text-base leading-snug sm:text-center"
                  : undefined
              }
            >
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {children != null ? (
          <div className={cn(workspaceDialogBodyScrollClass, bodyClassName)}>
            {children}
          </div>
        ) : null}
        {footer != null ? (
          <div className={cn("shrink-0", footerClassName)}>{footer}</div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** Grouped fields — title sits on the card border (top-left), like a fieldset legend. */
export function DialogFormSection({
  title,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "border-border/50 bg-muted/10 relative gap-0 overflow-visible rounded-xl border py-0 shadow-none",
        className,
      )}
    >
      {title ? (
        <span className={dialogFormSectionLegendClass}>{title}</span>
      ) : null}
      <CardContent
        className={cn(
          "flex min-w-0 flex-col gap-4 px-4 pt-5 pb-5",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

/** Label + slot for domain selects (e.g. `@/components/workspace/knowledge`) — same grid/legend spacing as `DialogSelectField`. */
export function DialogSlotField({
  label,
  hint,
  children,
  colSpan,
  fieldClassName,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  colSpan?: "full";
  fieldClassName?: string;
}) {
  return (
    <FormField
      label={label}
      className={cn(
        "min-w-0",
        colSpan === "full" && "sm:col-span-2",
        fieldClassName,
      )}
    >
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </FormField>
  );
}

/** Read-only creator / created-at block for resource edit dialogs (matches list card footer). */
export function DialogResourceMetaSection({
  title,
  creatorLabel,
  createdAtLabel,
  creator,
  createdAt,
}: {
  title: string;
  creatorLabel: string;
  createdAtLabel: string;
  creator?: string | null;
  createdAt?: string | null;
}) {
  const showCreator = Boolean(creator?.trim());
  const showCreatedAt = Boolean(createdAt?.trim());
  if (!showCreator && !showCreatedAt) {
    return null;
  }

  return (
    <DialogFormSection title={title}>
      <DialogFieldGrid>
        {showCreator ? (
          <FormField label={creatorLabel} className="min-w-0">
            <div className={readOnlyFieldClass}>{creator}</div>
          </FormField>
        ) : null}
        {showCreatedAt ? (
          <FormField label={createdAtLabel} className="min-w-0">
            <div className={cn(readOnlyFieldClass, "tabular-nums")}>
              {createdAt}
            </div>
          </FormField>
        ) : null}
      </DialogFieldGrid>
    </DialogFormSection>
  );
}

/** Two-column grid used inside `DialogFormSection` on resource forms. */
export function DialogFieldGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid min-w-0 gap-x-4 gap-y-4 sm:grid-cols-2", className)}
    >
      {children}
    </div>
  );
}

export function DialogInputField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  autoFocus,
  maxLength,
  fieldClassName,
  inputClassName,
  colSpan,
  hint,
  error,
  spellCheck,
  autoCapitalize,
  autoCorrect,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  fieldClassName?: string;
  inputClassName?: string;
  colSpan?: "full";
  hint?: ReactNode;
  error?: string;
  spellCheck?: boolean;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoComplete?: string;
}) {
  return (
    <FormField
      label={label}
      className={cn(
        "min-w-0",
        colSpan === "full" && "sm:col-span-2",
        fieldClassName,
      )}
    >
      <Input
        className={cn(
          dialogFieldControlClass,
          error && "border-destructive",
          inputClassName,
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={maxLength}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
      />
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </FormField>
  );
}

export function DialogTextareaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 4,
  autoGrow,
  fieldClassName,
  textareaClassName,
  colSpan,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  /** Grow with content (CSS `field-sizing: content`); scrolls after `max-h-48`. */
  autoGrow?: boolean;
  fieldClassName?: string;
  textareaClassName?: string;
  colSpan?: "full";
  hint?: ReactNode;
}) {
  const control = (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={autoGrow ? 1 : rows}
      className={cn(
        autoGrow
          ? "field-sizing-content max-h-48 min-h-9 overflow-y-auto bg-transparent py-1.5 text-sm leading-normal shadow-xs dark:bg-transparent"
          : "field-sizing-fixed min-h-0 bg-transparent text-sm leading-relaxed shadow-xs dark:bg-transparent",
        textareaClassName,
      )}
      spellCheck={false}
    />
  );

  if (!label) {
    return control;
  }

  return (
    <FormField
      label={label}
      className={cn(
        "min-w-0",
        colSpan === "full" && "sm:col-span-2",
        fieldClassName,
      )}
    >
      {control}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </FormField>
  );
}

export function DialogSelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  hint,
  className,
  contentClassName,
  triggerLabel,
  colSpan,
  fieldClassName,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  hint?: ReactNode;
  className?: string;
  contentClassName?: string;
  triggerLabel?: ReactNode;
  colSpan?: "full";
  fieldClassName?: string;
}) {
  return (
    <FormField
      label={label}
      className={cn(
        "min-w-0",
        colSpan === "full" && "sm:col-span-2",
        fieldClassName,
      )}
    >
      <FormSelect
        value={value}
        onValueChange={onValueChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("w-full", selectTriggerWrapClass, className)}
        contentClassName={contentClassName}
        triggerLabel={triggerLabel}
      />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </FormField>
  );
}

/** Label + outline toggle row in dialog forms (repeat/once, presets, …). */
export function DialogToggleGroupField({
  label,
  hint,
  colSpan,
  fieldClassName,
  ...toggleProps
}: {
  label: string;
  hint?: ReactNode;
  colSpan?: "full";
  fieldClassName?: string;
} & ToggleGroupControlProps) {
  return (
    <FormField
      label={label}
      className={cn(
        "min-w-0",
        colSpan === "full" && "sm:col-span-2",
        fieldClassName,
      )}
    >
      <ToggleGroupControl {...toggleProps} />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </FormField>
  );
}

/** Shared cancel / save labels for create & edit `FormDialog`s. */
export function dialogSaveFooterProps(
  common: {
    cancel: string;
    save: string;
    saving: string;
    loading: string;
  },
  options: {
    busy: boolean;
    disabled?: boolean;
    busyLabel?: string;
    saveLabel?: string;
  },
) {
  const { busy, disabled, busyLabel, saveLabel } = options;
  return {
    cancelLabel: common.cancel,
    confirmLabel: busy
      ? (busyLabel ?? common.saving)
      : (saveLabel ?? common.save),
    confirmPending: busy,
    confirmDisabled: (disabled ?? false) || busy,
  };
}

export type FormDialogLeadingDestructive = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

/** Delete / revoke in edit dialogs — same look as cancel; confirm in a follow-up dialog. */
export function FormDialogDeleteButton({
  label,
  onClick,
  disabled,
  className,
}: FormDialogLeadingDestructive & { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="default"
      className={cn(dialogSecondaryButtonClass, className)}
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden className={dialogFormActionGlyphClass}>
        <Trash2Icon {...dialogActionIconProps} className="!size-3.5" />
      </span>
      {label}
    </Button>
  );
}

/** Cancel / confirm row shared by `FormDialog` and full-page forms (`Shell` + sections). */
export function FormActions({
  cancelLabel,
  onCancel,
  confirmLabel,
  onConfirm,
  confirmDisabled,
  confirmPending,
  confirmVariant = "default",
  leadingDestructive,
  footerStart,
  className,
  asDialogFooter = true,
  confirmButtonTestId,
}: {
  cancelLabel?: string;
  onCancel?: () => void;
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  confirmPending?: boolean;
  confirmVariant?: "default" | "destructive" | "outline-delete";
  leadingDestructive?: FormDialogLeadingDestructive;
  footerStart?: ReactNode;
  className?: string;
  asDialogFooter?: boolean;
  confirmButtonTestId?: string;
}) {
  const leading =
    leadingDestructive != null ? (
      <FormDialogDeleteButton {...leadingDestructive} />
    ) : (
      footerStart
    );

  const body = (
    <div className="flex w-full flex-wrap items-center justify-center gap-3">
      {leading}
      {cancelLabel ? (
        <Button
          type="button"
          variant="outline"
          size="default"
          className={dialogSecondaryButtonClass}
          disabled={confirmPending}
          onClick={onCancel}
        >
          <span aria-hidden className={dialogFormActionCancelGlyphClass}>
            ×
          </span>
          {cancelLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        size="default"
        variant={
          confirmVariant === "destructive"
            ? "destructive"
            : confirmVariant === "outline-delete"
              ? "outline"
              : "default"
        }
        className={cn(
          confirmVariant === "destructive"
            ? dialogDestructiveButtonClass
            : confirmVariant === "outline-delete"
              ? dialogSecondaryButtonClass
              : dialogPrimaryButtonClass,
        )}
        disabled={(confirmDisabled ?? false) || (confirmPending ?? false)}
        onClick={onConfirm}
        data-testid={confirmButtonTestId}
      >
        {confirmVariant === "default" ? (
          <CheckIcon aria-hidden {...dialogActionIconProps} />
        ) : confirmVariant === "outline-delete" ? (
          <Trash2Icon {...dialogActionIconProps} />
        ) : null}
        {confirmLabel}
      </Button>
    </div>
  );

  const footerClassName = cn(dialogFooterClass, className);

  if (asDialogFooter) {
    return <DialogFooter className={footerClassName}>{body}</DialogFooter>;
  }

  return <div className={cn("flex", footerClassName)}>{body}</div>;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  cancelLabel,
  confirmLabel,
  confirmDisabled,
  confirmPending,
  confirmVariant = "default",
  onConfirm,
  onCancel,
  leadingDestructive,
  footerStart,
  footer,
  footerClassName,
  confirmButtonTestId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  confirmPending?: boolean;
  confirmVariant?: "default" | "destructive" | "outline-delete";
  onConfirm: () => void;
  onCancel?: () => void;
  leadingDestructive?: FormDialogLeadingDestructive;
  footerStart?: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  confirmButtonTestId?: string;
}) {
  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        footer ?? (
          <FormActions
            cancelLabel={cancelLabel}
            onCancel={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            confirmLabel={confirmLabel}
            onConfirm={onConfirm}
            confirmDisabled={confirmDisabled}
            confirmPending={confirmPending}
            confirmVariant={confirmVariant}
            leadingDestructive={leadingDestructive}
            footerStart={footerStart}
            className={footerClassName}
            confirmButtonTestId={confirmButtonTestId}
          />
        )
      }
    >
      {children}
    </DialogShell>
  );
}

/** Delete / revoke confirm — same `FormDialog` + `FormActions` as edit; confirm uses outline delete (not red). */
export function ConfirmDialog({
  open,
  onOpenChange,
  description,
  title,
  cancelLabel,
  confirmLabel,
  confirmDisabled,
  confirmPending,
  confirmVariant = "outline-delete",
  onConfirm,
  onCancel,
  confirmButtonTestId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: ReactNode;
  title?: string;
  cancelLabel?: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  confirmPending?: boolean;
  confirmVariant?: "default" | "destructive" | "outline-delete";
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonTestId?: string;
}) {
  const { t } = useI18n();

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? t.common.confirmTitle}
      description={description}
      cancelLabel={cancelLabel ?? t.common.cancel}
      confirmLabel={confirmLabel}
      confirmDisabled={confirmDisabled}
      confirmPending={confirmPending}
      confirmVariant={confirmVariant}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmButtonTestId={confirmButtonTestId}
    />
  );
}
