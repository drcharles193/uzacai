
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart3, 
  Inbox, 
  FileText, 
  Plus,
  List,
  User
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
      { name: 'Manage Posts', icon: List, path: '#', comingSoon: true }
    ]
  },
  { 
    name: 'Users', 
    icon: User, 
    path: '#',
    comingSoon: true
  },
  { 
    name: 'Analytics', 
    icon: BarChart3, 
    path: '/analytics' 
  },
  { 
    name: 'Content', 
    icon: FileText, 
    path: '/content' 
  },
  { 
    name: 'Inbox', 
    icon: Inbox, 
    path: '/inbox' 
  },
];
