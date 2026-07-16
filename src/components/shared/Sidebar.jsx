import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUiStore } from '@/store/uiStore';

export default function Sidebar({ navItems, title }) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 lg:block',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
      aria-label={`${title} navigation`}
    >
      <nav className="flex h-full flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = Icons[item.icon] || Icons.Circle;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
