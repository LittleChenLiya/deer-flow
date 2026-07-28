"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  ErrorAlert,
  HeaderCreateButton,
  ItemGrid,
  ItemListPanel,
  ListEmpty,
  ListPanelToolbar,
  ListSearchField,
  Page,
  PageHeader,
  PanelEmpty,
  workspacePageInsetXClass,
} from "@/components/component";
import { AgentCard, AgentFormDialog } from "@/components/workspace/agents";
import type { Agent } from "@/core/agents";
import { useAgents } from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

const EDIT_DIALOG_CLOSE_MS = 220;

export default function AgentsPage() {
  const { t } = useI18n();
  const { agents, isLoading, error } = useAgents();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const openEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setEditOpen(true);
  };

  const closeEdit = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      window.setTimeout(() => setEditingAgent(null), EDIT_DIALOG_CLOSE_MS);
    }
  };

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
      router.replace("/workspace/agents");
      return;
    }
    const editName = searchParams.get("edit");
    if (!editName || isLoading) return;
    const decoded = decodeURIComponent(editName);
    const found = agents.find((a) => a.name === decoded);
    if (found) {
      openEdit(found);
    }
    router.replace("/workspace/agents");
  }, [searchParams, agents, isLoading, router]);

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? agents
    : agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description?.toLowerCase().includes(q) ?? false),
      );

  const listError =
    error instanceof Error ? error.message : error ? String(error) : null;

  const isListEmpty = !isLoading && agents.length === 0;

  const countLabel = useMemo(() => {
    if (isLoading) return undefined;
    if (q) return t.agents.countFiltered(filtered.length, agents.length);
    return t.agents.countTotal(agents.length);
  }, [agents.length, filtered.length, isLoading, q, t.agents]);

  return (
    <>
      <Page
        fillBody={isListEmpty}
        header={
          <PageHeader
            title={t.agents.title}
            description={t.agents.description}
            actions={
              <HeaderCreateButton onClick={() => setCreateOpen(true)}>
                {t.agents.newAgent}
              </HeaderCreateButton>
            }
          />
        }
      >
        <ErrorAlert>{listError}</ErrorAlert>

        <ItemListPanel
          title={t.agents.listTitle}
          countLabel={countLabel}
          toolbar={
            !isListEmpty ? (
              <ListPanelToolbar>
                <ListSearchField
                  value={query}
                  onChange={setQuery}
                  placeholder={t.agents.searchPlaceholder}
                />
              </ListPanelToolbar>
            ) : undefined
          }
        >
          {isListEmpty ? (
            <PanelEmpty className="py-16">
              <p className="text-foreground font-medium">
                {t.agents.emptyTitle}
              </p>
              <p className="mt-2">{t.agents.emptyDescription}</p>
            </PanelEmpty>
          ) : filtered.length === 0 ? (
            <ListEmpty size="compact" align="center">
              {t.agents.searchEmpty}
            </ListEmpty>
          ) : (
            <div className={cn(workspacePageInsetXClass, "pt-2 pb-3")}>
              <ItemGrid density="dense">
                {filtered.map((agent) => (
                  <AgentCard key={agent.name} agent={agent} onEdit={openEdit} />
                ))}
              </ItemGrid>
            </div>
          )}
        </ItemListPanel>
      </Page>

      <AgentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
      <AgentFormDialog
        open={editOpen}
        onOpenChange={closeEdit}
        mode="edit"
        agent={editingAgent}
      />
    </>
  );
}
