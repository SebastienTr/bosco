"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SHARE_PENDING_KEY = "bosco-share-pending";

export function SharePendingRedirect() {
  const router = useRouter();

  useEffect(() => {
    const pending = localStorage.getItem(SHARE_PENDING_KEY);
    if (pending) {
      localStorage.removeItem(SHARE_PENDING_KEY);
      router.replace("/share-target?shared=1");
    }
  }, [router]);

  return null;
}
