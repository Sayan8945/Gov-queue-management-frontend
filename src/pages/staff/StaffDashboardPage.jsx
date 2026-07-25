import { Pause, Play } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import CurrentTokenPanel from '@/components/staff/CurrentTokenPanel';
import QueueList from '@/components/staff/QueueList';
import {
  useStaffQueue,
  useCallNext,
  useStartService,
  useCompleteService,
  useSkipToken,
  usePauseCounter,
  useResumeCounter,
} from '@/hooks/useStaffQueue';
import { COUNTER_STATUS, TOKEN_STATUS } from '@/constants/tokenStatus';
import { Users, Clock3, CheckCircle2, SkipForward } from 'lucide-react';

// Every field here (counter, department, currentToken, waitingQueue, stats)
// comes straight from MongoDB via GET /api/staff/current-queue — the
// counter assignment is the Staff document's real `assignedCounter`, never
// a frontend-guessed value.
export default function StaffDashboardPage() {
  const { data, isLoading } = useStaffQueue();

  const callNextMutation = useCallNext();
  const startServiceMutation = useStartService();
  const completeServiceMutation = useCompleteService();
  const skipTokenMutation = useSkipToken();
  const pauseCounterMutation = usePauseCounter();
  const resumeCounterMutation = useResumeCounter();

  if (isLoading) {
    return <SkeletonCard />;
  }

  const { counter, department, currentToken, waitingQueue, stats } = data || {};

  if (!counter || !department) {
    return (
      <div>
        <PageHeader title="Counter Dashboard" />
        <EmptyState
          title="No counter assigned"
          description="No counter is assigned to your account yet. Contact an administrator to get assigned to a counter."
        />
      </div>
    );
  }

  const isPaused = counter.status === COUNTER_STATUS.BREAK;
  const isActionPending =
    callNextMutation.isPending ||
    startServiceMutation.isPending ||
    completeServiceMutation.isPending ||
    skipTokenMutation.isPending;

  const handleTogglePause = () => {
    if (isPaused) {
      resumeCounterMutation.mutate(counter._id);
    } else {
      pauseCounterMutation.mutate(counter._id);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Counter ${counter.counterNumber}`}
        description={department.departmentName}
        breadcrumbItems={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={isPaused ? 'warning' : 'success'}>{isPaused ? 'Paused' : 'Active'}</Badge>
            <Button
              variant={isPaused ? 'success' : 'outline'}
              icon={isPaused ? Play : Pause}
              onClick={handleTogglePause}
              isLoading={pauseCounterMutation.isPending || resumeCounterMutation.isPending}
            >
              {isPaused ? 'Resume Counter' : 'Pause Counter'}
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Waiting" value={stats?.waiting ?? 0} icon={Users} tone="warning" />
        <StatCard label="In Progress" value={stats?.inProgress ?? 0} icon={Clock3} tone="primary" />
        <StatCard label="Completed Today" value={stats?.completed ?? 0} icon={CheckCircle2} tone="success" />
        <StatCard label="Skipped" value={stats?.skipped ?? 0} icon={SkipForward} tone="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CurrentTokenPanel
          token={currentToken}
          counterPaused={isPaused}
          isActionPending={isActionPending}
          onCallNext={() => callNextMutation.mutate(counter._id)}
          onStart={(id) => startServiceMutation.mutate(id)}
          onComplete={(id) => completeServiceMutation.mutate(id)}
          onSkip={(id) => skipTokenMutation.mutate({ tokenId: id })}
        />
        <QueueList tokens={(waitingQueue || []).filter((t) => t.status === TOKEN_STATUS.WAITING)} />
      </div>
    </div>
  );
}
