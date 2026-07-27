"use client";

/** Infinite scroll + load-more footer for `ItemList` / `ItemListPanel`. */
import { useEffect, useRef, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Scroll sentinel + optional loading row at the end of `ItemList`. */
export function useItemListInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  autoLoad = true,
  listLength = 0,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void | Promise<unknown>;
  /** When false, only the footer button loads more (e.g. client-side search). */
  autoLoad?: boolean;
  listLength?: number;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasNextPage || !autoLoad) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void onLoadMore();
        }
      },
      { rootMargin: "200px 0px 200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [autoLoad, hasNextPage, isFetchingNextPage, listLength, onLoadMore]);

  return sentinelRef;
}

export function ItemListInfiniteTail({
  sentinelRef,
  isFetchingNextPage,
  loadingLabel,
  sentinelTestId,
}: {
  sentinelRef: RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  loadingLabel?: string;
  sentinelTestId?: string;
}) {
  return (
    <>
      {isFetchingNextPage && loadingLabel ? (
        <p className="text-muted-foreground px-4 py-3 text-center text-xs">
          {loadingLabel}
        </p>
      ) : null}
      <div
        ref={sentinelRef}
        className="h-px shrink-0"
        aria-hidden
        data-testid={sentinelTestId}
      />
    </>
  );
}

export function ItemListLoadMoreFooter({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  loadMoreLabel,
  loadMoreSearchLabel,
  loadingLabel,
  isSearching = false,
  className,
  loadMoreTestId,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void | Promise<unknown>;
  loadMoreLabel: string;
  loadMoreSearchLabel?: string;
  loadingLabel: string;
  isSearching?: boolean;
  className?: string;
  loadMoreTestId?: string;
}) {
  if (!hasNextPage) {
    return null;
  }
  const label = isFetchingNextPage
    ? loadingLabel
    : isSearching && loadMoreSearchLabel
      ? loadMoreSearchLabel
      : loadMoreLabel;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("w-full rounded-none border-0 border-t", className)}
      disabled={isFetchingNextPage}
      onClick={() => void onLoadMore()}
      data-testid={loadMoreTestId}
    >
      {label}
    </Button>
  );
}

/** Count badge for `ItemListPanel` (supports filter + in-progress pagination). */
export function formatItemListCountLabel(options: {
  shownCount: number;
  loadedCount: number;
  hasNextPage: boolean;
  isFiltering: boolean;
}): string {
  const { shownCount, loadedCount, hasNextPage, isFiltering } = options;
  if (isFiltering && shownCount !== loadedCount) {
    return `${shownCount} / ${loadedCount}`;
  }
  if (hasNextPage && !isFiltering) {
    return `${shownCount}+`;
  }
  return String(shownCount);
}
