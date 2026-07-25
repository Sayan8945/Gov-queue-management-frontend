import { History } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/Card';
import { useMyTokens } from '@/hooks/useTokens';
import { formatDateTime } from '@/utils/dateHelpers';
import { TOKEN_STATUS } from '@/constants/tokenStatus';

export default function HistoryPage() {
  const { data: tokens, isLoading } = useMyTokens();

  const pastTokens = (tokens || []).filter((t) =>
    [TOKEN_STATUS.COMPLETED, TOKEN_STATUS.CANCELLED, TOKEN_STATUS.SKIPPED, TOKEN_STATUS.NO_SHOW].includes(
      t.status
    )
  );

  return (
    <div>
      <PageHeader title="Booking History" breadcrumbItems={[{ label: 'Booking History' }]} />

      <Card>
        {isLoading ? (
          <div className="p-5">
            <SkeletonTable />
          </div>
        ) : pastTokens.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={History} title="No history yet" description="Completed or cancelled tokens will show up here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3">Token</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {pastTokens.map((token) => (
                  <tr key={token._id}>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {token.tokenNumber}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {token.departmentId?.departmentName}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{token.serviceId?.serviceName}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {formatDateTime(token.completedAt || token.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={token.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
