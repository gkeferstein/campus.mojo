'use client';

/**
 * Dashboard Layout Component
 * Uses MOJO Design System MojoShell for consistent layout across all pages
 */

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MojoShell, MojoBackground } from '@gkeferstein/design';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/providers/AuthProvider';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <MojoBackground noise orbs>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-muted-foreground">Laden...</p>
          </div>
        </div>
      </MojoBackground>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MojoShell
      sidebar={<Sidebar />}
      topbar={<Header />}
      showBackground
      noise
      orbs
      sidebarCollapsed={sidebarCollapsed}
      className="p-6"
    >
      {children}
    </MojoShell>
  );
}



