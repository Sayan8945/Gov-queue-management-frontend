import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useQueueStore } from '@/store/queueStore';
import { getDepartmentById, getServiceById } from '@/store/catalogStore';
import { PRIORITY_LABELS, PRIORITY_LEVELS, TOKEN_STATUS } from '@/constants/tokenStatus';
import { ArrowUpNarrowWide, Zap } from 'lucide-react';

// TODO(backend): priority weighting rules currently live in queueStore.js
// (PRIORITY_WEIGHT). Move this to a server-managed config once available.
export default function PriorityQueuePage() {
  const tokens = useQueueStore((s) => s.tokens);
  const expediteToken = useQueueStore((s) => s.expediteToken);

  const priorityTokens = tokens
    .filter((t) => t.status === TOKEN_STATUS.WAITING && t.priority !== PRIORITY_LEVELS.NORMAL)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const waitingTokens = tokens
    .filter((t) => t.status === TOKEN_STATUS.WAITING && t.priority === PRIORITY_LEVELS.NORMAL)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleExpedite = (token) => {
    expediteToken(token.id);
    toast.success(`Token ${token.tokenNumber} expedited to front of queue`);
  };

  return (
    <div>
      <PageHeader
        title="Priority Queue Management"
        description="Citizens flagged with special priority, plus tools to handle exceptional cases across all departments."
        breadcrumbItems={[{ label: 'Priority Queue' }]}
      />

      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpNarrowWide className="h-5 w-5 text-primary-600" /> Priority Requests
          </CardTitle>
          <Badge variant="warning">{priorityTokens.length} active</Badge>
        </CardHeader>
        <CardBody>
          {priorityTokens.length === 0 ? (
            <EmptyState title="No priority requests" description="All waiting tokens are standard priority." />
          ) : (
            <TokenTable tokens={priorityTokens} showPriority />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary-600" /> Handle Exceptional Cases
          </CardTitle>
          <Badge>{waitingTokens.length} standard waiting</Badge>
        </CardHeader>
        <CardBody>
          {waitingTokens.length === 0 ? (
            <EmptyState title="No standard tokens waiting" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
                  <tr>
                    <th className="py-2 pr-4">Token</th>
                    <th className="py-2 pr-4">Citizen</th>
                    <th className="py-2 pr-4">Department</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {waitingTokens.slice(0, 15).map((t) => {
                    const dept = getDepartmentById(t.departmentId);
                    const service = getServiceById(t.serviceId);
                    return (
                      <tr key={t.id}>
                        <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                          {t.tokenNumber}
                        </td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{t.citizenName}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{dept?.name}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{service?.name}</td>
                        <td className="py-2 pr-4 text-right">
                          <Button size="sm" variant="outline" onClick={() => handleExpedite(t)}>
                            Expedite
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function TokenTable({ tokens, showPriority }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
          <tr>
            <th className="py-2 pr-4">Token</th>
            <th className="py-2 pr-4">Citizen</th>
            <th className="py-2 pr-4">Department</th>
            <th className="py-2 pr-4">Service</th>
            {showPriority && <th className="py-2 pr-4">Priority</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {tokens.map((t) => {
            const dept = getDepartmentById(t.departmentId);
            const service = getServiceById(t.serviceId);
            return (
              <tr key={t.id}>
                <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{t.tokenNumber}</td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{t.citizenName}</td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{dept?.name}</td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{service?.name}</td>
                {showPriority && (
                  <td className="py-2 pr-4">
                    <Badge variant="warning">{PRIORITY_LABELS[t.priority]}</Badge>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
