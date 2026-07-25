import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useDepartments } from '@/hooks/useDepartments';
import { Building2 } from 'lucide-react';

// Read-only directory of every department, for staff to look up office
// hours/location when directing citizens or covering a colleague's queue.
// Backed by GET /api/departments — the same catalog endpoint citizens use
// to browse before booking. Staff has no route to create/edit/delete
// departments; all admin mutation endpoints are role-gated to admin/
// super_admin (see Server/src/routes/adminRoutes.js), so this view is
// inherently look-only.
export default function StaffDepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();

  return (
    <div>
      <PageHeader title="Departments" description="Browse all departments" breadcrumbItems={[{ label: 'Departments' }]} />

      {isLoading ? (
        <SkeletonCard />
      ) : departments?.length === 0 ? (
        <EmptyState icon={Building2} title="No departments" description="No departments are available yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments?.map((dept) => (
            <Card key={dept._id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{dept.departmentName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dept.departmentCode}</p>
                    </div>
                  </div>
                  <Badge variant={dept.isActive ? 'success' : 'default'}>{dept.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{dept.description}</p>
                <p className="mt-2 text-xs text-gray-400">{dept.officeLocation}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Hours: {dept.openingTime}–{dept.closingTime}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
