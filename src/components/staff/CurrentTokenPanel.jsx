import { CheckCircle2, SkipForward, PlayCircle, PhoneCall, UserX } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { getServiceById } from '@/store/catalogStore';
import { TOKEN_STATUS } from '@/constants/tokenStatus';

export default function CurrentTokenPanel({
  token,
  counterPaused,
  onCallNext,
  onStart,
  onComplete,
  onSkip,
  onNoShow,
}) {
  if (counterPaused) {
    return (
      <Card>
        <CardBody>
          <EmptyState title="Counter paused" description="Resume the counter to start calling tokens." />
        </CardBody>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center py-10 text-center">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">No token currently being served.</p>
          <Button icon={PhoneCall} onClick={onCallNext}>
            Call Next Token
          </Button>
        </CardBody>
      </Card>
    );
  }

  const service = getServiceById(token.serviceId);

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Now serving</p>
            <p className="text-3xl font-extrabold text-primary-700 dark:text-primary-300">{token.tokenNumber}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{token.citizenName} · {service?.name}</p>
          </div>
          <StatusBadge status={token.status} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {token.status === TOKEN_STATUS.CALLED && (
            <Button icon={PlayCircle} onClick={() => onStart(token.id)}>
              Start Service
            </Button>
          )}
          {token.status === TOKEN_STATUS.IN_PROGRESS && (
            <Button icon={CheckCircle2} variant="success" onClick={() => onComplete(token.id)}>
              Mark Completed
            </Button>
          )}
          <Button icon={SkipForward} variant="outline" onClick={() => onSkip(token.id)}>
            Skip
          </Button>
          {token.status === TOKEN_STATUS.CALLED && (
            <Button icon={UserX} variant="ghost" onClick={() => onNoShow(token.id)}>
              No Show
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
