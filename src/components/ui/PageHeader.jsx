import Breadcrumb from './Breadcrumb';

export default function PageHeader({ title, description, breadcrumbItems, actions }) {
  return (
    <div className="mb-6">
      {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        {actions && <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
