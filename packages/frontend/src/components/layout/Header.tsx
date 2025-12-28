'use client';

/**
 * Header Component
 * Uses MOJO Design System navigation components for the topbar
 */

import {
  MojoAppSwitcher,
  MojoUserMenu,
  TenantSwitcher,
  MojoLogo,
} from '@mojo/design';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import type { Tenant, MojoUser, MojoApp } from '@mojo/design';
import { useMemo } from 'react';
import {
  GraduationCap,
  User,
  CreditCard,
  QrCode,
  Wallet,
  Users,
  Workflow,
  Mail,
  Palette,
} from 'lucide-react';

// MOJO Platform Apps (matching design.mojo/packages/design/src/navigation/apps.ts)
const MOJO_APPS: MojoApp[] = [
  { id: 'campus', name: 'campus.mojo', shortName: 'Campus', url: 'https://campus.mojo-institut.de', icon: GraduationCap, category: 'user', description: 'Kurse, Lerninhalte und Zertifikate' },
  { id: 'account', name: 'account.mojo', shortName: 'Konto', url: 'https://account.mojo-institut.de', icon: User, category: 'user', description: 'Profil und Kontoeinstellungen' },
  { id: 'pos', name: 'pos.mojo', shortName: 'POS', url: 'https://pos.mojo-institut.de', icon: CreditCard, category: 'team', entitlement: 'pos:access', description: 'Kassensystem und Verkauf' },
  { id: 'checkin', name: 'checkin.mojo', shortName: 'Check-in', url: 'https://checkin.mojo-institut.de', icon: QrCode, category: 'team', entitlement: 'checkin:access', description: 'Teilnehmer-Check-in' },
  { id: 'payments', name: 'payments.mojo', shortName: 'Payments', url: 'https://payments.mojo-institut.de', icon: Wallet, category: 'admin', entitlement: 'payments:admin', description: 'Zahlungen und Abonnements' },
  { id: 'kontakte', name: 'kontakte.mojo', shortName: 'Kontakte', url: 'https://kontakte.mojo-institut.de', icon: Users, category: 'admin', entitlement: 'kontakte:admin', description: 'Kundenverwaltung (CRM)' },
  { id: 'connect', name: 'connect.mojo', shortName: 'Connect', url: 'https://connect.mojo-institut.de', icon: Workflow, category: 'admin', entitlement: 'connect:admin', external: true, externalLabel: 'n8n', description: 'Automationen und Workflows' },
  { id: 'mailer', name: 'mailer.mojo', shortName: 'Mailer', url: 'https://mailer.mojo-institut.de', icon: Mail, category: 'admin', entitlement: 'mailer:admin', external: true, externalLabel: 'Mautic', description: 'E-Mail Marketing' },
  { id: 'design', name: 'design.mojo', shortName: 'Design', url: 'https://dev.design.mojo-institut.de', icon: Palette, category: 'admin', entitlement: 'platform:developer', description: 'Design System Dokumentation' },
];

function filterAppsByEntitlements(apps: MojoApp[], entitlements: string[]): MojoApp[] {
  return apps.filter((app) => {
    if (!app.entitlement) return true;
    return entitlements.includes(app.entitlement);
  });
}

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

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

  // User entitlements - campus users typically only have access to user-level apps
  const entitlements: string[] = [];

  // Filter apps based on entitlements
  const visibleApps = useMemo(
    () => filterAppsByEntitlements(MOJO_APPS, entitlements),
    [entitlements]
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

