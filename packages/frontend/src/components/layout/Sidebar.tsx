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
  Heart,
  Dumbbell,
  Wallet,
  Zap,
  Users,
  Video,
  Bell,
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
          id: 'checkin',
          label: 'LEBENSENERGIE Check-in',
          icon: <Zap className="h-5 w-5" />,
          href: '/onboarding/checkin',
        },
      ],
    },
    {
      id: 'learning',
      title: 'Lernen',
      items: [
        {
          id: 'modules',
          label: 'LEBENSENERGIE Toolbox',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/modules',
        },
        {
          id: 'library',
          label: 'Alle Kurse',
          icon: <GraduationCap className="h-5 w-5" />,
          href: '/catalog',
        },
        {
          id: 'progress',
          label: 'Meine Journey',
          icon: <BarChart3 className="h-5 w-5" />,
          href: '/progress',
        },
      ],
    },
    {
      id: 'community',
      title: 'Community',
      items: [
        {
          id: 'feed',
          label: 'Community Feed',
          icon: <Users className="h-5 w-5" />,
          href: '/community',
        },
        {
          id: 'workshops',
          label: 'Live Workshops',
          icon: <Video className="h-5 w-5" />,
          href: '/workshops',
        },
        {
          id: 'notifications',
          label: 'Benachrichtigungen',
          icon: <Bell className="h-5 w-5" />,
          href: '/notifications',
        },
      ],
    },
    {
      id: 'tools',
      title: 'Werkzeuge',
      items: [
        {
          id: 'health-analysis',
          label: 'Gesundheitsanalysen',
          icon: <Heart className="h-5 w-5" />,
          href: '/tools/health',
        },
        {
          id: 'training-planner',
          label: 'Trainingsplaner',
          icon: <Dumbbell className="h-5 w-5" />,
          href: '/tools/training',
        },
        {
          id: 'finance',
          label: 'Finanzen',
          icon: <Wallet className="h-5 w-5" />,
          href: '/tools/finance',
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

