import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Hash, MonitorCheck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import TokenQrCode from '@/components/citizen/TokenQrCode';
import { useToken, useCancelToken } from '@/hooks/useTokens';
import { TOKEN_STATUS } from '@/constants/tokenStatus';
import { formatDateTime } from '@/utils/dateHelpers';

export default function TokenDetailsPage() {
  const { tokenId } = useParams();
  const navigate = useNavigate();

  // useToken polls the backend every 10s, so position/wait time/status stay
  // live as the real queue moves (see Server's recalculateDepartmentQueue).
  const { data: token, isLoading } = useToken(tokenId);
  const cancelMutation = useCancelToken();

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (!token) {
    return <EmptyState title="Token not found" description="This booking could not be located." />;
  }

  const isWaiting = [TOKEN_STATUS.WAITING, TOKEN_STATUS.APPROACHING].includes(token.status);
  const isCalledOrActive = [TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_PROGRESS].includes(token.status);

  const handleCancel = () => {
    cancelMutation.mutate(token._id);
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
              <p className="text-sm text-gray-500 dark:text-gray-400">{token.departmentId?.departmentName}</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {token.serviceId?.serviceName}
              </p>
            </div>
            <StatusBadge status={token.status} />
          </div>

          {isWaiting && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatBlock icon={Hash} label="Queue Position" value={token.queuePosition ?? '-'} />
              <StatBlock icon={Clock} label="Est. Wait" value={`${token.estimatedWaitTime ?? 0} min`} />
              <StatBlock
                icon={Users}
                label="Ahead of you"
                value={token.queuePosition ? token.queuePosition - 1 : 0}
              />
            </div>
          )}

          {isCalledOrActive && token.counterId && (
            <div className="mt-6 rounded-lg bg-primary-50 p-4 text-center dark:bg-primary-950/40">
              <MonitorCheck className="mx-auto mb-2 h-6 w-6 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Please proceed to</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {token.counterId.counterNumber}
              </p>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Info label="Booking date" value={formatDateTime(token.bookingDate)} />
            <Info label="Booked on" value={formatDateTime(token.createdAt)} />
          </dl>

          <div className="mt-6">
            <TokenQrCode token={token} size={140} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {isWaiting && (
              <>
                <Button variant="outline" onClick={() => navigate(`/citizen/tokens/${token._id}/reschedule`)}>
                  Reschedule
                </Button>
                <Button variant="danger" onClick={handleCancel} isLoading={cancelMutation.isPending}>
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
