"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  HeaderCreateButton,
  ItemList,
  ItemListInfiniteTail,
  ItemListLoadMoreFooter,
  ItemListPanel,
  ListPanelToolbar,
  ListSearchField,
  Page,
  PageHeader,
  PanelEmpty,
  formatItemListCountLabel,
  useItemListInfiniteScroll,
} from "@/components/component";
import {
  ThreadChannelBadge,
  ThreadChannelIcon,
} from "@/components/workspace/thread-channel-source";
import { useI18n } from "@/core/i18n/hooks";
import { useInfiniteThreads } from "@/core/threads/hooks";
import {
  channelSourceOfThread,
  pathOfThread,
  titleOfThread,
} from "@/core/threads/utils";
import { formatTimeAgo } from "@/core/utils/datetime";

export default function ChatsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const {
    data: infiniteThreads,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteThreads();
  const threads = useMemo(
    () => infiniteThreads?.pages.flat() ?? [],
    [infiniteThreads],
  );
  const [search, setSearch] = useState("");
  const isSearching = search.trim().length > 0;

  useEffect(() => {
    document.title = `${t.chats.pageTitle} - ${t.pages.appName}`;
  }, [t.chats.pageTitle, t.pages.appName]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) =>
      titleOfThread(thread).toLowerCase().includes(q),
    );
  }, [threads, search]);

  const sentinelRef = useItemListInfiniteScroll({
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
    autoLoad: !isSearching,
    listLength: threads.length,
  });

  const countLabel = formatItemListCountLabel({
    shownCount: filteredThreads.length,
    loadedCount: threads.length,
    hasNextPage: Boolean(hasNextPage),
    isFiltering: isSearching,
  });

  const emptyMessage = isSearching ? t.chats.searchEmpty : t.chats.emptyList;

  return (
    <Page
      header={
        <PageHeader
          title={t.chats.pageTitle}
          description={t.chats.pageDescription}
          actions={
            <HeaderCreateButton
              variant="default"
              onClick={() => router.push("/workspace/chats/new")}
            >
              {t.sidebar.newChat}
            </HeaderCreateButton>
          }
        />
      }
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <ItemListPanel
        title={t.chats.listTitle}
        countLabel={countLabel}
        toolbar={
          <ListPanelToolbar className="justify-stretch sm:justify-end">
            <ListSearchField
              value={search}
              onChange={setSearch}
              placeholder={t.chats.searchChats}
              className="w-full sm:w-56 sm:flex-none"
            />
          </ListPanelToolbar>
        }
        footer={
          isSearching ? (
            <ItemListLoadMoreFooter
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              loadMoreLabel={t.chats.loadOlderChats}
              loadMoreSearchLabel={t.chats.loadMoreToSearch}
              loadingLabel={t.chats.loadingMore}
              isSearching
              loadMoreTestId="chats-page-load-more"
            />
          ) : null
        }
      >
        {filteredThreads.length === 0 ? (
          <PanelEmpty
            align="center"
            className="flex min-h-72 items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-foreground font-medium">
                {isSearching ? t.chats.searchEmpty : t.sidebar.newChat}
              </p>
              {!isSearching ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    {emptyMessage}
                  </p>
                  <HeaderCreateButton
                    variant="default"
                    className="mt-2"
                    onClick={() => router.push("/workspace/chats/new")}
                  >
                    {t.sidebar.newChat}
                  </HeaderCreateButton>
                </>
              ) : null}
            </div>
          </PanelEmpty>
        ) : (
          <>
            <ItemList variant="flush">
              {filteredThreads.map((thread) => {
                const channelSource = channelSourceOfThread(thread);
                return (
                  <Link key={thread.thread_id} href={pathOfThread(thread)}>
                    <div className="hover:bg-muted/40 flex flex-col gap-2 p-4 transition-colors">
                      <div className="flex min-w-0 items-center gap-2">
                        <ThreadChannelIcon source={channelSource} />
                        <div className="min-w-0 flex-1 truncate text-sm font-medium">
                          {titleOfThread(thread)}
                        </div>
                        <ThreadChannelBadge
                          source={channelSource}
                          className="hidden sm:inline-flex"
                        />
                      </div>
                      {thread.updated_at ? (
                        <div className="text-muted-foreground text-sm">
                          {formatTimeAgo(thread.updated_at)}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </ItemList>
            {!isSearching ? (
              <ItemListInfiniteTail
                sentinelRef={sentinelRef}
                isFetchingNextPage={isFetchingNextPage}
                loadingLabel={t.chats.loadingMore}
                sentinelTestId="chats-page-sentinel"
              />
            ) : null}
          </>
        )}
      </ItemListPanel>
    </Page>
  );
}
