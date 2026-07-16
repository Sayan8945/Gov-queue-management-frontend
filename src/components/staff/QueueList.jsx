import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { PRIORITY_LABELS, PRIORITY_LEVELS } from '@/constants/tokenStatus';
import { getServiceById } from '@/store/catalogStore';

export default function QueueList({ tokens, title = 'Waiting Queue' }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="primary">{tokens.length} waiting</Badge>
      </CardHeader>
      {tokens.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={Users} title="Queue is empty" description="No citizens waiting right now." />
        </div>
      ) : (
        <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
          {tokens.map((token, idx) => {
            const service = getServiceById(token.serviceId);
            return (
              <li key={token.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {token.tokenNumber} · {token.citizenName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{service?.name}</p>
                  </div>
                </div>
                {token.priority !== PRIORITY_LEVELS.NORMAL && (
                  <Badge variant="warning">{PRIORITY_LABELS[token.priority]}</Badge>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
