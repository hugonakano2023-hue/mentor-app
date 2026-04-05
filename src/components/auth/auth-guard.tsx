'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isOnboardingDone } from '@/lib/storage/user-storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain } from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse">
          <Brain className="size-8 text-white" />
        </div>
        <div className="space-y-2 w-48">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    // Check onboarding status
    const onboarded = isOnboardingDone();
    if (!onboarded && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }

    // If user already completed onboarding but is visiting /onboarding,
    // allow it (they might want to redo it)
    setIsReady(true);
  }, [router, pathname]);

  if (!isReady) return <LoadingSkeleton />;
  return <>{children}</>;
}
