"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ErrorAlert,
  HeaderCreateButton,
  ItemGrid,
  ListEmpty,
  Page,
  PageHeader,
  SearchInput,
} from "@/components/component";
import { AgentCard, AgentFormDialog } from "@/components/workspace/agents";
import type { Agent } from "@/core/agents";
import { useAgents } from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";

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

  return (
    <>
      <Page
        header={
          <PageHeader
            title={t.agents.title}
            description={t.agents.description}
            stat={
              !isLoading && agents.length > 0
                ? `${filtered.length}/${agents.length}`
                : undefined
            }
            actions={
              <HeaderCreateButton onClick={() => setCreateOpen(true)}>
                {t.agents.newAgent}
              </HeaderCreateButton>
            }
            toolbar={
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder={t.agents.searchPlaceholder}
                className="w-full"
              />
            }
          />
        }
      >
        <ErrorAlert>{listError}</ErrorAlert>

        {agents.length === 0 ? (
          <ListEmpty>{t.agents.emptyDescription}</ListEmpty>
        ) : filtered.length === 0 ? (
          <ListEmpty size="compact">{t.agents.searchEmpty}</ListEmpty>
        ) : (
          <ItemGrid>
            {filtered.map((agent) => (
              <AgentCard key={agent.name} agent={agent} onEdit={openEdit} />
            ))}
          </ItemGrid>
        )}
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
