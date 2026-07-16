import { Outlet } from 'react-router-dom';
import Topbar from '@/components/shared/Topbar';
import Sidebar from '@/components/shared/Sidebar';
import MobileNav from '@/components/shared/MobileNav';
import { CITIZEN_NAV } from '@/constants/navigation';

export default function CitizenLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar navItems={CITIZEN_NAV} title="Citizen" />
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav navItems={CITIZEN_NAV} />
    </div>
  );
}
