'use client';

/**
 * Header Component
 * Verwendet die einheitliche MojoTopbar-Komponente aus @gkeferstein/design
 * 
 * App entitlements are loaded dynamically from the payments.mojo API
 */

import { MojoTopbar, MojoTopbarSkeleton } from '@gkeferstein/design';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import type { Tenant, MojoUser } from '@gkeferstein/design';
import { useMemo, useEffect, useState, useCallback } from 'react';

// Payments.mojo API URL for fetching app entitlements
// Platform-Konvention: APIs liegen unter /api (nicht /api/v1)
const PAYMENTS_API_URL = process.env.NEXT_PUBLIC_PAYMENTS_API_URL || 'https://payments.mojo-institut.de/api';

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

  // Handle logout with useCallback (must be before any early returns)
  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  // Handle tenant change with useCallback (must be before any early returns)
  const handleTenantChange = useCallback((tenant: Tenant) => {
    console.log('Switching to tenant:', tenant.id);
  }, []);

  // Map auth user to MojoUser format (memoized, must be before early returns)
  const mojoUser: MojoUser | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id || user.clerkUserId,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email.split('@')[0],
      email: user.email,
      imageUrl: user.avatarUrl,
    };
  }, [user]);

  // Current tenant from user context (memoized, must be before early returns)
  const currentTenant: Tenant | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.tenantId || 'personal',
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Persönlich',
      slug: user.tenantId || 'personal',
      type: 'personal',
      role: 'Mitglied',
    };
  }, [user]);

  // For now, only show current tenant
  const tenants: Tenant[] = useMemo(() => {
    if (!currentTenant) return [];
    return [currentTenant];
  }, [currentTenant]);

  return (
    <MojoTopbar
      currentApp="campus"
      user={mojoUser}
      tenant={currentTenant}
      tenants={tenants}
      entitlements={appEntitlements}
      onTenantChange={handleTenantChange}
      onLogout={handleLogout}
      isLoading={isLoadingEntitlements}
    />
  );
}
