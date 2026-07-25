// Sidebar navigation config per role

export const CITIZEN_NAV = [
  { label: 'Home', to: '/citizen/home', icon: 'Home' },
  { label: 'Book Token', to: '/citizen/book', icon: 'Ticket' },
  { label: 'My Tokens', to: '/citizen/tokens', icon: 'ListChecks' },
  { label: 'Booking History', to: '/citizen/history', icon: 'History' },
  { label: 'Notifications', to: '/citizen/notifications', icon: 'Bell' },
  { label: 'Profile', to: '/citizen/profile', icon: 'UserCircle' },
];

export const STAFF_NAV = [
  { label: 'Dashboard', to: '/staff/dashboard', icon: 'LayoutDashboard' },
  { label: 'Queue Monitor', to: '/staff/queue', icon: 'Users' },
  { label: 'Departments', to: '/staff/departments', icon: 'Building2' },
  { label: 'Notifications', to: '/staff/notifications', icon: 'Bell' },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Departments', to: '/admin/departments', icon: 'Building2' },
  { label: 'Services', to: '/admin/services', icon: 'ClipboardList' },
  { label: 'Counters', to: '/admin/counters', icon: 'MonitorCog' },
  { label: 'Staff', to: '/admin/staff', icon: 'UserCog' },
  { label: 'Token Limits', to: '/admin/token-limits', icon: 'SlidersHorizontal' },
  { label: 'Priority Queue', to: '/admin/priority-queue', icon: 'ArrowUpNarrowWide' },
  { label: 'Analytics', to: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Reports', to: '/admin/reports', icon: 'FileBarChart' },
  { label: 'Notifications', to: '/admin/notifications', icon: 'Bell' },
];
