"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Toaster } from "sonner";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CommandPalette } from "@/components/workspace/command-palette";
import { GatewayOfflineBanner } from "@/components/workspace/gateway-offline-banner";
import { SettingsDialogHost } from "@/components/workspace/settings";
import { WorkspaceSettingsDeepLink } from "@/components/workspace/workspace-settings-deep-link";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import {
  clampSidebarWidthPx,
  readSidebarWidthPx,
  SIDEBAR_WIDTH_DEFAULT_PX,
  writeSidebarWidthPx,
} from "@/core/workspace/sidebar-width";

type SidebarWidthContextValue = {
  widthPx: number;
  setWidthPx: (width: number) => void;
  persistWidthPx: (width: number) => void;
};

const SidebarWidthContext = createContext<SidebarWidthContextValue | null>(
  null,
);

export function useSidebarWidth() {
  const ctx = useContext(SidebarWidthContext);
  if (!ctx) {
    throw new Error(
      "useSidebarWidth must be used within ResizableSidebarShell.",
    );
  }
  return ctx;
}

export function ResizableSidebarShell({
  children,
  defaultOpen,
  gatewayUnavailable = false,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  gatewayUnavailable?: boolean;
}) {
  const [widthPx, setWidthPxState] = useState(SIDEBAR_WIDTH_DEFAULT_PX);

  useEffect(() => {
    setWidthPxState(readSidebarWidthPx());
  }, []);

  const setWidthPx = useCallback((width: number) => {
    setWidthPxState(clampSidebarWidthPx(width));
  }, []);

  const persistWidthPx = useCallback((width: number) => {
    const next = clampSidebarWidthPx(width);
    setWidthPxState(next);
    writeSidebarWidthPx(next);
  }, []);

  const widthContext = useMemo(
    () => ({ widthPx, setWidthPx, persistWidthPx }),
    [persistWidthPx, setWidthPx, widthPx],
  );

  const sidebarStyle = {
    "--sidebar-width": `${widthPx}px`,
  } as CSSProperties;

  return (
    <SidebarWidthContext.Provider value={widthContext}>
      <SidebarProvider
        className="h-screen"
        defaultOpen={defaultOpen}
        style={sidebarStyle}
      >
        <WorkspaceSidebar />
        <SidebarInset className="workspace-shell flex min-w-0 flex-col">
          <GatewayOfflineBanner gatewayUnavailable={gatewayUnavailable} />
          {children}
        </SidebarInset>
      </SidebarProvider>
      <CommandPalette />
      <SettingsDialogHost />
      <WorkspaceSettingsDeepLink />
      <Toaster position="top-center" />
    </SidebarWidthContext.Provider>
  );
}
