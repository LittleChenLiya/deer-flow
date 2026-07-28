"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy route — create uses the same form dialog as edit on the agents index. */
export default function NewAgentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspace/agents?create=1");
  }, [router]);

  return null;
}
