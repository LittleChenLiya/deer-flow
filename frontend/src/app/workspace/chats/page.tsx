"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ItemList,
  ItemListInfiniteTail,
  ItemListLoadMoreFooter,
  ItemListPanel,
  ItemRow,
  ItemRowMeta,
  ItemRowTitle,
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
          <PanelEmpty>{emptyMessage}</PanelEmpty>
        ) : (
          <>
            <ItemList variant="flush">
              {filteredThreads.map((thread) => {
                const channelSource = channelSourceOfThread(thread);
                return (
                  <ItemRow
                    key={thread.thread_id}
                    variant="flush"
                    href={pathOfThread(thread)}
                    topStart={
                      <div className="flex min-w-0 items-center gap-2">
                        <ThreadChannelIcon source={channelSource} />
                        <ItemRowTitle>{titleOfThread(thread)}</ItemRowTitle>
                      </div>
                    }
                    topEnd={
                      <ThreadChannelBadge
                        source={channelSource}
                        className="hidden sm:inline-flex"
                      />
                    }
                    bottomStart={
                      thread.updated_at ? (
                        <ItemRowMeta>
                          {formatTimeAgo(thread.updated_at)}
                        </ItemRowMeta>
                      ) : undefined
                    }
                  />
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
