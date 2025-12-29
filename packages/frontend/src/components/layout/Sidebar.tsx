'use client';

/**
 * Dashboard Sidebar Component
 * Uses MOJO Design System MojoSidebar for consistent navigation
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MojoSidebar, MojoLogo, MojoIcon } from '@mojo/design';
import type { SidebarItem } from '@mojo/design';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Award,
  Settings,
  User,
  BarChart3,
} from 'lucide-react';

// Define SidebarSection type
interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Build navigation sections for Campus LMS
  const sections: SidebarSection[] = [
    {
      id: 'main',
      title: 'Navigation',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/dashboard',
          active: pathname === '/dashboard',
        },
        {
          id: 'courses',
          label: 'Meine Kurse',
          icon: <GraduationCap className="h-5 w-5" />,
          href: '/dashboard',
          active: pathname?.startsWith('/courses'),
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
          active: pathname === '/catalog',
        },
        {
          id: 'certificates',
          label: 'Zertifikate',
          icon: <Award className="h-5 w-5" />,
          href: '/certificates',
          active: pathname === '/certificates',
        },
        {
          id: 'progress',
          label: 'Fortschritt',
          icon: <BarChart3 className="h-5 w-5" />,
          href: '/progress',
          active: pathname === '/progress',
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
          active: pathname === '/profile',
        },
        {
          id: 'settings',
          label: 'Einstellungen',
          icon: <Settings className="h-5 w-5" />,
          href: '/settings',
          active: pathname === '/settings',
        },
      ],
    },
  ];

  return (
    <MojoSidebar
      logo={<MojoLogo size="sm" mode="dark" />}
      collapsedLogo={<MojoIcon size={28} mode="dark" />}
      sections={sections}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      collapsible
    />
  );
}

