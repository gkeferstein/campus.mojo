'use client';

/**
 * Header Component
 * Uses MOJO Design System navigation components for the topbar
 * 
 * App entitlements are loaded dynamically from the payments.mojo API
 */

import {
  MojoAppSwitcher,
  MojoUserMenu,
  TenantSwitcher,
  MojoLogo,
  MOJO_APPS,
  filterAppsByEntitlements,
} from '@mojo/design';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import type { Tenant, MojoUser } from '@mojo/design';
import { useMemo, useEffect, useState } from 'react';

// Payments.mojo API URL for fetching app entitlements
const PAYMENTS_API_URL = process.env.NEXT_PUBLIC_PAYMENTS_API_URL || 'https://payments.mojo-institut.de/api/v1';

interface AppEntitlementsResponse {
  entitlements: string[];
  isPlatformAdmin: boolean;
}

async function fetchAppEntitlements(userId: string, tenantId: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${PAYMENTS_API_URL}/me/app-entitlements?userId=${encodeURIComponent(userId)}&tenantId=${encodeURIComponent(tenantId)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data: AppEntitlementsResponse = await response.json();
    return data.entitlements || [];
  } catch (error) {
    console.error('Failed to fetch app entitlements from payments.mojo:', error);
    return [];
  }
}

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [appEntitlements, setAppEntitlements] = useState<string[]>([]);
  const [isLoadingEntitlements, setIsLoadingEntitlements] = useState(true);

  // Fetch app entitlements from payments.mojo API
  useEffect(() => {
    async function loadAppEntitlements() {
      if (!user?.id || !user?.tenantId) {
        setIsLoadingEntitlements(false);
        return;
      }

      try {
        const entitlements = await fetchAppEntitlements(user.id, user.tenantId);
        setAppEntitlements(entitlements);
      } catch (error) {
        console.error('Failed to load app entitlements:', error);
        // Fallback: campus users typically only have access to user-level apps (no entitlements needed)
        setAppEntitlements([]);
      } finally {
        setIsLoadingEntitlements(false);
      }
    }

    loadAppEntitlements();
  }, [user?.id, user?.tenantId]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // If no user, show minimal header with just the logo
  if (!user) {
    return (
      <div className="flex w-full items-center justify-center px-4">
        <MojoLogo size="sm" mode="dark" />
      </div>
    );
  }

  // Show loading state while fetching entitlements
  if (isLoadingEntitlements) {
    return (
      <div className="flex w-full items-center justify-center px-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Map auth user to MojoUser format
  const mojoUser: MojoUser = {
    id: user.id,
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email.split('@')[0],
    email: user.email,
    imageUrl: user.avatarUrl,
  };

  // Current tenant from user context
  const currentTenant: Tenant = {
    id: user.tenantId || 'personal',
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Persönlich',
    slug: user.tenantId || 'personal',
    type: 'personal',
    role: 'Mitglied',
  };

  // For now, only show current tenant (can be extended later)
  const tenants: Tenant[] = [currentTenant];

  // Filter apps based on dynamically loaded entitlements
  const visibleApps = useMemo(
    () => filterAppsByEntitlements(MOJO_APPS, appEntitlements),
    [appEntitlements]
  );

  const handleTenantChange = (tenant: Tenant) => {
    console.log('Switching to tenant:', tenant.id);
  };

  return (
    <div className="flex w-full items-center gap-2 px-4">
      {/* Left: App Switcher */}
      <MojoAppSwitcher
        apps={visibleApps}
        currentApp="campus"
      />

      {/* Center: Spacer */}
      <div className="flex-1" />

      {/* Right: Tenant Switcher + User Menu */}
      <div className="flex items-center gap-1">
        <TenantSwitcher
          currentTenant={currentTenant}
          tenants={tenants}
          onTenantChange={handleTenantChange}
          variant="compact"
        />
        <MojoUserMenu
          user={mojoUser}
          tenant={currentTenant}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
