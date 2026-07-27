"use client";

/** Agent workspace UI — cards + create/edit dialog. Composed in `app/workspace/agents/page.tsx`. */

import {
  BotIcon,
  BotOffIcon,
  Loader2Icon,
  MessageSquareIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  CardAction,
  ConfirmDialog,
  DialogFieldGrid,
  DialogFormSection,
  DialogInputField,
  DialogSelectField,
  DialogTextareaField,
  FormDialog,
  ItemCard,
  dialogSaveFooterProps,
  dialogSecondaryButtonClass,
  itemMetaTags,
} from "@/components/component";
import { Button } from "@/components/ui/button";
import type {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
} from "@/core/agents";
import {
  AgentNameCheckError,
  AgentsApiDisabledError,
  checkAgentName,
  generateSoul,
  useCreateAgent,
  useDeleteAgent,
  useUpdateAgent,
} from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";
import { loadModels } from "@/core/models/api";
import { cn } from "@/lib/utils";

const NAME_RE = /^[A-Za-z0-9-]+$/;
const INHERIT_VALUE = "__inherit__";

function newChatHref(agentName: string) {
  return `/workspace/agents/${encodeURIComponent(agentName)}/chats/new`;
}

/** Create / edit agent — same `FormDialog` pattern as ui branch (without knowledge). */
export function AgentFormDialog({
  open,
  onOpenChange,
  mode,
  agent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  agent?: Agent | null;
}) {
  const { t, locale } = useI18n();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();

  const isCreate = mode === "create";
  const isPending =
    createAgent.isPending || updateAgent.isPending || deleteAgent.isPending;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [nameError, setNameError] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<string | null>(null);
  const [soul, setSoul] = useState("");
  const [soulGenerating, setSoulGenerating] = useState(false);
  const [models, setModels] = useState<
    Awaited<ReturnType<typeof loadModels>>["models"]
  >([]);

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      setAgentName("");
      setNameError("");
      setDescription("");
      setModel(null);
      setSoul("");
      return;
    }
    if (!agent) return;
    setAgentName(agent.name);
    setNameError("");
    setDescription(agent.description ?? "");
    setModel(agent.model ?? null);
    setSoul(agent.soul ?? "");
  }, [open, isCreate, agent]);

  useEffect(() => {
    if (!open) return;
    void loadModels()
      .then((res) => setModels(res.models))
      .catch(() => setModels([]));
  }, [open]);

  async function handleGenerateSoul() {
    const trimmedName = (agentName.trim() || agent?.name) ?? "";
    setSoulGenerating(true);
    try {
      const result = await generateSoul({
        name: trimmedName,
        description: description.trim(),
        soul: soul.trim(),
        locale,
        model_name: model ?? undefined,
      });
      setSoul(result.soul);
      toast.success(t.agents.soulGenerated);
    } catch (err) {
      if (err instanceof AgentsApiDisabledError) {
        toast.error(t.agents.nameStepApiDisabledError);
      } else {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : t.agents.soulGenerateError,
        );
      }
    } finally {
      setSoulGenerating(false);
    }
  }

  async function handleSave() {
    const trimmedName = agentName.trim();
    if (!trimmedName || !NAME_RE.test(trimmedName)) {
      setNameError(t.agents.nameStepInvalidError);
      return;
    }

    if (isCreate) {
      try {
        const result = await checkAgentName(trimmedName);
        if (!result.available) {
          setNameError(t.agents.nameStepAlreadyExistsError);
          return;
        }
      } catch (err) {
        if (err instanceof AgentsApiDisabledError) {
          toast.error(t.agents.nameStepApiDisabledError);
        } else if (
          err instanceof AgentNameCheckError &&
          err.reason === "backend_unreachable"
        ) {
          toast.error(t.agents.nameStepNetworkError);
        } else {
          toast.error(t.agents.nameStepCheckError);
        }
        return;
      }
    }

    setNameError("");
    const payload = {
      description: description.trim(),
      model,
      soul,
    };

    try {
      if (isCreate) {
        const request: CreateAgentRequest = { name: trimmedName, ...payload };
        await createAgent.mutateAsync(request);
        toast.success(t.agents.createSuccess);
        onOpenChange(false);
        return;
      }

      if (!agent) return;
      const request: UpdateAgentRequest = payload;
      await updateAgent.mutateAsync({ name: agent.name, request });
      toast.success(t.agents.settingsSaved);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDelete() {
    if (!agent) return;
    try {
      await deleteAgent.mutateAsync(agent.name);
      toast.success(t.agents.deleteSuccess);
      setDeleteOpen(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  const title = isCreate ? t.agents.createPageTitle : t.agents.editPageTitle;

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        {...dialogSaveFooterProps(t.common, {
          busy: isPending,
          disabled: !agentName.trim(),
        })}
        onConfirm={() => void handleSave()}
        leadingDestructive={
          isCreate || !agent
            ? undefined
            : {
                label: t.agents.delete,
                onClick: () => setDeleteOpen(true),
                disabled: isPending,
              }
        }
      >
        <DialogFormSection title={t.agents.sectionBasic}>
          <DialogFieldGrid>
            <DialogInputField
              label={t.agents.fieldName}
              value={agentName}
              onChange={(value) => {
                setAgentName(value);
                setNameError("");
              }}
              placeholder={t.agents.settingsNamePlaceholder}
              inputClassName="font-mono"
              error={nameError || undefined}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              autoFocus={open && isCreate}
              disabled={isPending || !isCreate}
            />
            <DialogInputField
              label={t.agents.fieldDescription}
              value={description}
              onChange={setDescription}
              placeholder={t.agents.descriptionPlaceholder}
              disabled={isPending}
            />
          </DialogFieldGrid>
        </DialogFormSection>

        <DialogFormSection title={t.agents.soulTitle}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm leading-snug">
              {t.agents.soulGenerateHint}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(dialogSecondaryButtonClass, "h-8")}
              disabled={soulGenerating || isPending}
              onClick={() => void handleGenerateSoul()}
            >
              {soulGenerating ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <SparklesIcon className="size-3.5" />
              )}
              {soulGenerating ? t.agents.soulGenerating : t.agents.soulGenerate}
            </Button>
          </div>
          <DialogTextareaField
            value={soul}
            onChange={setSoul}
            rows={5}
            placeholder={t.agents.soulHint}
            textareaClassName="font-mono"
            disabled={soulGenerating || isPending}
          />
        </DialogFormSection>

        <DialogFormSection title={t.agents.sectionCapability}>
          <DialogFieldGrid>
            <DialogSelectField
              label={t.agents.fieldModel}
              value={model ?? INHERIT_VALUE}
              onValueChange={(value) =>
                setModel(value === INHERIT_VALUE ? null : value)
              }
              placeholder={t.agents.modelInherit}
              disabled={isPending}
              options={[
                { value: INHERIT_VALUE, label: t.agents.modelInherit },
                ...models.map((item) => ({
                  value: item.name,
                  label: item.display_name ?? item.name,
                })),
              ]}
            />
          </DialogFieldGrid>
        </DialogFormSection>
      </FormDialog>

      {!isCreate && agent ? (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          description={t.common.deleteConfirm}
          confirmLabel={
            deleteAgent.isPending ? t.common.loading : t.common.delete
          }
          confirmPending={deleteAgent.isPending}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteOpen(false)}
        />
      ) : null}
    </>
  );
}

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit }: AgentCardProps) {
  const { t } = useI18n();
  const chatHref = newChatHref(agent.name);

  const metaTags = useMemo(() => {
    const items: Array<{ key: string; label: string }> = [];
    if (agent.model) {
      items.push({ key: "model", label: agent.model });
    }
    for (const group of agent.tool_groups ?? []) {
      items.push({ key: `tg:${group}`, label: group });
    }
    for (const skill of agent.skills ?? []) {
      items.push({ key: `sk:${skill}`, label: skill });
    }
    return items.length > 0 ? itemMetaTags(items) : undefined;
  }, [agent.model, agent.skills, agent.tool_groups]);

  return (
    <ItemCard
      icon={BotIcon}
      iconTone="agent"
      title={
        <span className="font-mono text-[13px] tracking-tight">
          {agent.name}
        </span>
      }
      description={agent.description ?? undefined}
      metaTags={metaTags}
      href={chatHref}
      actions={
        <>
          <CardAction
            href={chatHref}
            icon={MessageSquareIcon}
            label={t.agents.chat}
          />
          <CardAction
            icon={SettingsIcon}
            label={t.common.edit}
            onClick={() => onEdit?.(agent)}
          />
        </>
      }
    />
  );
}

export function AgentsFeatureDisabled() {
  const { t } = useI18n();
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
        <BotOffIcon className="text-muted-foreground h-7 w-7" />
      </div>
      <div>
        <p className="font-medium">{t.agents.featureDisabledTitle}</p>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">
          {t.agents.featureDisabledDescription}
        </p>
      </div>
    </div>
  );
}
