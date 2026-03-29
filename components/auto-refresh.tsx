'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AutoRefresh({ intervalMs = 10000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const handle = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(handle);
  }, [router, intervalMs]);

  return null;
}
