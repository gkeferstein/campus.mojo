'use client';

/**
 * Dashboard Sidebar Component
 * Uses MOJO Design System UnifiedSidebar for consistent navigation
 */

import { usePathname } from 'next/navigation';
import { UnifiedSidebar } from '@gkeferstein/design';
import type { UnifiedSidebarSectionConfig } from '@gkeferstein/design';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Award,
  Settings,
  User,
  BarChart3,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  // Build navigation sections for Campus LMS
  const sections: UnifiedSidebarSectionConfig[] = [
    {
      id: 'main',
      title: 'Navigation',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/dashboard',
        },
        {
          id: 'courses',
          label: 'Meine Kurse',
          icon: <GraduationCap className="h-5 w-5" />,
          href: '/dashboard',
        },
      ],
    },
    {
      id: 'learning',
      title: 'Lernen',
      items: [
        {
          id: 'library',
          label: 'Kurskatalog',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/catalog',
        },
        {
          id: 'certificates',
          label: 'Zertifikate',
          icon: <Award className="h-5 w-5" />,
          href: '/certificates',
        },
        {
          id: 'progress',
          label: 'Fortschritt',
          icon: <BarChart3 className="h-5 w-5" />,
          href: '/progress',
        },
      ],
    },
    {
      id: 'account',
      title: 'Konto',
      items: [
        {
          id: 'profile',
          label: 'Profil',
          icon: <User className="h-5 w-5" />,
          href: '/profile',
        },
        {
          id: 'settings',
          label: 'Einstellungen',
          icon: <Settings className="h-5 w-5" />,
          href: '/settings',
        },
      ],
    },
  ];

  return (
    <UnifiedSidebar
      sections={sections}
      pathname={pathname}
      storageKey="campus-sidebar-collapsed"
    />
  );
}

