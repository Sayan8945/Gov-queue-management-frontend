import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useStaffQueue } from '@/hooks/useStaffQueue';
import { useCountersByDepartment } from '@/hooks/useDepartments';
import { COUNTER_STATUS } from '@/constants/tokenStatus';
import { Users } from 'lucide-react';

// Every value here is real backend data: counters via GET
// /api/departments/:id/counters, waiting queue via GET
// /api/staff/current-queue — no queueStore/catalogStore lookups.
export default function StaffQueueMonitorPage() {
  const { data, isLoading: isLoadingQueue } = useStaffQueue();
  const department = data?.department;
  const { data: counters, isLoading: isLoadingCounters } = useCountersByDepartment(department?._id);

  if (isLoadingQueue) {
    return <SkeletonCard />;
  }

  if (!department) {
    return <EmptyState title="No department assigned" />;
  }

  const waitingQueue = data?.waitingQueue || [];

  return (
    <div>
      <PageHeader
        title="Queue Monitor"
        description={`Live queue load for ${department.departmentName}`}
        breadcrumbItems={[{ label: 'Queue Monitor' }]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {isLoadingCounters ? (
          <SkeletonCard />
        ) : (
          counters?.map((c) => (
            <Card key={c._id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{c.counterNumber}</p>
                  <Badge
                    variant={
                      c.status === COUNTER_STATUS.ACTIVE
                        ? 'success'
                        : c.status === COUNTER_STATUS.BREAK
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                {c.currentToken ? (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {c.currentToken.tokenNumber || 'Active token'}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-400">No active token</p>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardBody>
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <Users className="h-5 w-5 text-primary-600" /> Waiting Queue ({waitingQueue.length})
          </h3>
          {waitingQueue.length === 0 ? (
            <EmptyState title="Queue is empty" description="No citizens currently waiting." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
                  <tr>
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Token</th>
                    <th className="py-2 pr-4">Citizen</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {waitingQueue.map((t, idx) => (
                    <tr key={t._id}>
                      <td className="py-2 pr-4 text-gray-500">{idx + 1}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{t.tokenNumber}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{t.citizenId?.fullName}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{t.serviceId?.serviceName}</td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
