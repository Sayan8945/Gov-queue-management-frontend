import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Hash, MonitorCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import TokenQrCode from '@/components/citizen/TokenQrCode';
import { useLiveQueue } from '@/hooks/useLiveQueue';
import { useQueueStore } from '@/store/queueStore';
import { getDepartmentById, getServiceById } from '@/store/catalogStore';
import { TOKEN_STATUS } from '@/constants/tokenStatus';
import { formatDateTime } from '@/utils/dateHelpers';

export default function TokenDetailsPage() {
  const { tokenId } = useParams();
  const navigate = useNavigate();

  // useLiveQueue subscribes this page to store changes so position/wait time
  // update automatically as the queue moves (simulated real-time).
  const token = useQueueStore((s) => s.getTokenById(tokenId));
  useLiveQueue(token?.departmentId);

  const cancelToken = useQueueStore((s) => s.cancelToken);

  if (!token) {
    return <EmptyState title="Token not found" description="This booking could not be located." />;
  }

  const department = getDepartmentById(token.departmentId);
  const service = getServiceById(token.serviceId);
  const position = useQueueStore.getState().getPositionInQueue(token.id);
  const waitMins = useQueueStore.getState().getEstimatedWaitMins(token.id);
  const counter = token.counterId ? useQueueStore.getState().getCounterById(token.counterId) : null;
  const isWaiting = token.status === TOKEN_STATUS.WAITING;

  const handleCancel = () => {
    cancelToken(token.id);
    toast.success('Token cancelled');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={`Token ${token.tokenNumber}`}
        breadcrumbItems={[{ label: 'My Tokens', to: '/citizen/tokens' }, { label: token.tokenNumber }]}
      />

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{department?.name}</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{service?.name}</p>
            </div>
            <StatusBadge status={token.status} />
          </div>

          {isWaiting && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatBlock icon={Hash} label="Queue Position" value={position ?? '-'} />
              <StatBlock icon={Clock} label="Est. Wait" value={`${waitMins} min`} />
              <StatBlock icon={Users} label="Ahead of you" value={position ? position - 1 : 0} />
            </div>
          )}

          {(token.status === TOKEN_STATUS.CALLED || token.status === TOKEN_STATUS.IN_PROGRESS) && counter && (
            <div className="mt-6 rounded-lg bg-primary-50 p-4 text-center dark:bg-primary-950/40">
              <MonitorCheck className="mx-auto mb-2 h-6 w-6 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Please proceed to</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{counter.number}</p>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Info label="Scheduled slot" value={formatDateTime(token.slot)} />
            <Info label="Booked on" value={formatDateTime(token.createdAt)} />
          </dl>

          <div className="mt-6">
            <TokenQrCode token={token} size={140} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {isWaiting && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/citizen/tokens/${token.id}/reschedule`)}
                >
                  Reschedule
                </Button>
                <Button variant="danger" onClick={handleCancel}>
                  Cancel Token
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700">
      <Icon className="mx-auto mb-1 h-5 w-5 text-primary-600" />
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}
