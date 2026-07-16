import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-primary-600" aria-label="Home">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            {item.to && idx !== items.length - 1 ? (
              <Link to={item.to} className="hover:text-primary-600">
                {item.label}
              </Link>
            ) : (
              <span
                className="font-medium text-gray-800 dark:text-gray-200"
                aria-current={idx === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
