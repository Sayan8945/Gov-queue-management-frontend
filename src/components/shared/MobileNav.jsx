import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';

export default function MobileNav({ navItems }) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:hidden"
    >
      {navItems.slice(0, 5).map((item) => {
        const Icon = Icons[item.icon] || Icons.Circle;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
                isActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
              )
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
