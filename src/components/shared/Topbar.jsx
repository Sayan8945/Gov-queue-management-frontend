import { Menu, LogOut, Landmark } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:block"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary-600" aria-hidden="true" />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-50 sm:text-base">
            Smart Queue System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        <div className="ml-2 hidden items-center gap-2 border-l border-gray-200 pl-3 dark:border-gray-700 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="rounded-lg p-2 text-gray-500 hover:bg-danger-50 hover:text-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 dark:text-gray-400 dark:hover:bg-danger-950"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
