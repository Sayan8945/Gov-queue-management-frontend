import { Outlet } from 'react-router-dom';
import Topbar from '@/components/shared/Topbar';
import Sidebar from '@/components/shared/Sidebar';
import { ADMIN_NAV } from '@/constants/navigation';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar navItems={ADMIN_NAV} title="Admin" />
        <main className="flex-1 overflow-x-hidden px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
