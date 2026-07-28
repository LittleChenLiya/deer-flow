import { cookies } from "next/headers";

import { QueryClientProvider } from "@/components/query-client-provider";
import { ResizableSidebarShell } from "@/components/workspace/resizable-sidebar-shell";

function parseSidebarOpenCookie(
  value: string | undefined,
): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export async function WorkspaceContent({
  children,
  gatewayUnavailable = false,
}: Readonly<{
  children: React.ReactNode;
  gatewayUnavailable?: boolean;
}>) {
  const cookieStore = await cookies();
  const initialSidebarOpen = parseSidebarOpenCookie(
    cookieStore.get("sidebar_state")?.value,
  );

  return (
    <QueryClientProvider>
      <ResizableSidebarShell
        defaultOpen={initialSidebarOpen}
        gatewayUnavailable={gatewayUnavailable}
      >
        {children}
      </ResizableSidebarShell>
    </QueryClientProvider>
  );
}
