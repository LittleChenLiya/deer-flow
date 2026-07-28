"use client";

import { useEffect, useRef } from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { useSidebarWidth } from "@/components/workspace/resizable-sidebar-shell";
import {
  clampSidebarWidthPx,
  isSidebarIconCollapseWidth,
  SIDEBAR_WIDTH_ICON_PX,
  SIDEBAR_WIDTH_MIN_PX,
} from "@/core/workspace/sidebar-width";
import { cn } from "@/lib/utils";

const DRAG_THRESHOLD_PX = 4;
/** Drag past icon rail by this much while collapsed → expand to full sidebar. */
const EXPAND_FROM_ICON_DRAG_PX = 8;

function widthFromPointer(clientX: number, fallback: number): number {
  const container = document.querySelector('[data-slot="sidebar-container"]');
  if (!container) {
    return fallback;
  }
  const rect = container.getBoundingClientRect();
  const side =
    container.closest('[data-slot="sidebar"]')?.getAttribute("data-side") ??
    "left";
  if (side === "right") {
    return rect.right - clientX;
  }
  return clientX - rect.left;
}

type DragSession = {
  active: boolean;
  moved: boolean;
  startedCollapsed: boolean;
  startX: number;
  startWidth: number;
  lastWidth: number;
  pointerId: number;
};

/** Sidebar edge: drag to resize width; drag past min → icon mode; drag out from icon → expand. */
export function ResizableSidebarRail({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar, setOpen, open, isMobile, state } = useSidebar();
  const { widthPx, setWidthPx, persistWidthPx } = useSidebarWidth();
  const railRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  const widthPxRef = useRef(widthPx);

  openRef.current = open;
  widthPxRef.current = widthPx;

  const dragRef = useRef<DragSession>({
    active: false,
    moved: false,
    startedCollapsed: false,
    startX: 0,
    startWidth: widthPx,
    lastWidth: widthPx,
    pointerId: -1,
  });

  const setDraggingAttr = (on: boolean) => {
    document.documentElement.toggleAttribute("data-sidebar-dragging", on);
  };

  const collapseToIcon = () => {
    dragRef.current.active = false;
    setDraggingAttr(false);
    persistWidthPx(dragRef.current.startWidth);
    setOpen(false);
  };

  const applyWidth = (next: number) => {
    dragRef.current.lastWidth = next;
    setWidthPx(next);
  };

  const applyMoveRef = useRef<(clientX: number) => void>(() => undefined);
  const finishDragRef = useRef<(moved: boolean) => void>(() => undefined);

  applyMoveRef.current = (clientX: number) => {
    if (!dragRef.current.active) {
      return;
    }
    const delta = clientX - dragRef.current.startX;
    if (Math.abs(delta) >= DRAG_THRESHOLD_PX) {
      dragRef.current.moved = true;
    }

    const fallback =
      dragRef.current.startWidth + (clientX - dragRef.current.startX);
    const rawNext = widthFromPointer(clientX, fallback);

    if (dragRef.current.startedCollapsed) {
      if (delta <= 0) {
        return;
      }
      if (rawNext < SIDEBAR_WIDTH_ICON_PX + EXPAND_FROM_ICON_DRAG_PX) {
        return;
      }
      const next = clampSidebarWidthPx(rawNext);
      if (!openRef.current) {
        setOpen(true);
        openRef.current = true;
      }
      dragRef.current.startedCollapsed = false;
      dragRef.current.startWidth = next;
      dragRef.current.startX = clientX;
      applyWidth(next);
      return;
    }

    if (isSidebarIconCollapseWidth(rawNext)) {
      collapseToIcon();
      return;
    }
    applyWidth(clampSidebarWidthPx(rawNext));
  };

  finishDragRef.current = (moved: boolean) => {
    if (!dragRef.current.active) {
      return;
    }
    setDraggingAttr(false);
    const { lastWidth, startWidth, startedCollapsed } = dragRef.current;
    dragRef.current.active = false;

    if (moved) {
      if (isSidebarIconCollapseWidth(lastWidth) && !startedCollapsed) {
        persistWidthPx(startWidth);
        setOpen(false);
        openRef.current = false;
      } else if (lastWidth >= SIDEBAR_WIDTH_MIN_PX) {
        persistWidthPx(lastWidth);
        if (!openRef.current) {
          setOpen(true);
          openRef.current = true;
        }
      }
      return;
    }
    toggleSidebar();
    openRef.current = !openRef.current;
  };

  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      if (
        !dragRef.current.active ||
        event.pointerId !== dragRef.current.pointerId
      ) {
        return;
      }
      applyMoveRef.current(event.clientX);
    };

    const onWindowPointerUp = (event: PointerEvent) => {
      if (
        !dragRef.current.active ||
        event.pointerId !== dragRef.current.pointerId
      ) {
        return;
      }
      const moved = dragRef.current.moved;
      if (railRef.current?.hasPointerCapture(event.pointerId)) {
        railRef.current.releasePointerCapture(event.pointerId);
      }
      finishDragRef.current(moved);
    };

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (isMobile) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const collapsed = state === "collapsed";
    dragRef.current = {
      active: true,
      moved: false,
      startedCollapsed: collapsed,
      startX: event.clientX,
      startWidth: collapsed ? SIDEBAR_WIDTH_ICON_PX : widthPxRef.current,
      lastWidth: collapsed ? SIDEBAR_WIDTH_ICON_PX : widthPxRef.current,
      pointerId: event.pointerId,
    };
    setDraggingAttr(true);
  };

  return (
    <button
      ref={railRef}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      title="拖动调整宽度；可停在任意宽度；拖到仅容 logo 时收成图标；向右拖图标可展开"
      type="button"
      onPointerDown={onPointerDown}
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 touch-none ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-col-resize in-data-[side=right]:cursor-col-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}
