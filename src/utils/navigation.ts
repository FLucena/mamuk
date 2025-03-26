import React from 'react';
import { LayoutDashboard, Dumbbell, Library, Award, User, Users } from 'lucide-react';

export interface NavigationItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  current: boolean;
}

interface User {
  role?: string;
  // Add other known properties here if needed
  // For example:
  // id?: string;
  // name?: string;
  // email?: string;
}

export const getNavigationItems = (user: User | null | undefined): NavigationItem[] => {
  const navigation = [
    { 
      nameKey: 'nav_dashboard', 
      href: '/', 
      icon: LayoutDashboard,
      current: window.location.pathname === '/' 
    },
    { 
      nameKey: 'nav_workouts', 
      href: '/workouts', 
      icon: Dumbbell,
      current: window.location.pathname.startsWith('/workouts') 
    },
    { 
      nameKey: 'nav_exercises', 
      href: '/exercises', 
      icon: Library,
      current: window.location.pathname.startsWith('/exercises') 
    },
    { 
      nameKey: 'nav_achievements', 
      href: '/achievements', 
      icon: Award,
      current: window.location.pathname === '/achievements' 
    },
  ];

  // Add admin-only navigation items
  if (user?.role === 'admin') {
    navigation.push({ 
      nameKey: 'nav_users', 
      href: '/admin/users', 
      icon: Users,
      current: window.location.pathname === '/admin/users' 
    });
  }

  return navigation;
}; 