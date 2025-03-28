
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart3, 
  Inbox, 
  FileText, 
  Plus,
  List,
  User,
  Calendar
} from 'lucide-react';
import { SidebarItemProps } from './SidebarItem';

// Define sidebar items type without the props that are passed at render time
type SidebarItemData = Omit<
  SidebarItemProps, 
  'isActive' | 'expanded' | 'postMenuOpen' | 'togglePostMenu' | 'handleCreatePost'
>;

export const getSidebarItems = (): SidebarItemData[] => [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashin',
  },
  { 
    name: 'Posts', 
    icon: MessageSquare, 
    path: '#',
    hasSubmenu: true,
    submenuItems: [
      { name: 'Create Post', icon: Plus, path: '#create-post' },
      { name: 'Calendar', icon: Calendar, path: '/schedule' },
      { name: 'Manage Posts', icon: List, path: '#', comingSoon: true }
    ]
  },
  { 
    name: 'Users', 
    icon: User, 
    path: '/users',
    comingSoon: true
  },
  { 
    name: 'Analytics', 
    icon: BarChart3, 
    path: '/analytics',
    comingSoon: true
  },
  { 
    name: 'Content', 
    icon: FileText, 
    path: '/content',
    comingSoon: true
  },
  { 
    name: 'Inbox', 
    icon: Inbox, 
    path: '/inbox',
    comingSoon: true
  },
];
