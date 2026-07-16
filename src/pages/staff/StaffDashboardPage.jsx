import toast from 'react-hot-toast';
import { Pause, Play } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import CurrentTokenPanel from '@/components/staff/CurrentTokenPanel';
import QueueList from '@/components/staff/QueueList';
import { useAuth } from '@/hooks/useAuth';
import { useLiveQueue } from '@/hooks/useLiveQueue';
import { useQueueStore } from '@/store/queueStore';
import { getDepartmentById } from '@/store/catalogStore';
import { COUNTER_STATUS, TOKEN_STATUS } from '@/constants/tokenStatus';
import { Users, Clock3, CheckCircle2, SkipForward } from 'lucide-react';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const counter = useQueueStore((s) => s.getCounterById(user?.counterId));
  const department = counter ? getDepartmentById(counter.departmentId) : null;

  const { waitingQueue, stats } = useLiveQueue(department?.id);
  const currentCounter = useQueueStore((s) => s.counters.find((c) => c.id === counter?.id));
  const currentToken = useQueueStore((s) => s.getCurrentTokenForCounter(counter?.id));

  const callNextToken = useQueueStore((s) => s.callNextToken);
  const markInProgress = useQueueStore((s) => s.markInProgress);
  const markCompleted = useQueueStore((s) => s.markCompleted);
  const markSkipped = useQueueStore((s) => s.markSkipped);
  const markNoShow = useQueueStore((s) => s.markNoShow);
  const pauseCounter = useQueueStore((s) => s.pauseCounter);
  const resumeCounter = useQueueStore((s) => s.resumeCounter);

  if (!counter || !department) {
    return (
      <div>
        <PageHeader title="Counter Dashboard" />
        <p className="text-sm text-gray-500">No counter is assigned to your account yet.</p>
      </div>
    );
  }

  const isPaused = currentCounter?.status === COUNTER_STATUS.PAUSED;

  const handleCallNext = () => {
    const next = callNextToken(counter.id);
    if (next) {
      toast.success(`Called ${next.tokenNumber}`);
    } else {
      toast.error('No tokens waiting in queue');
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeCounter(counter.id);
      toast.success('Counter resumed');
    } else {
      pauseCounter(counter.id);
      toast.success('Counter paused');
    }
  };

  return (
    <div>
      <PageHeader
        title={`Counter ${counter.number}`}
        description={department.name}
        breadcrumbItems={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={isPaused ? 'warning' : 'success'}>{isPaused ? 'Paused' : 'Active'}</Badge>
            <Button
              variant={isPaused ? 'success' : 'outline'}
              icon={isPaused ? Play : Pause}
              onClick={handleTogglePause}
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
          onCallNext={handleCallNext}
          onStart={(id) => {
            markInProgress(id);
            toast.success('Service started');
          }}
          onComplete={(id) => {
            markCompleted(id);
            toast.success('Token marked completed');
          }}
          onSkip={(id) => {
            markSkipped(id);
            toast('Token skipped', { icon: '⏭️' });
          }}
          onNoShow={(id) => {
            markNoShow(id);
            toast('Token marked as no-show', { icon: '🚫' });
          }}
        />
        <QueueList tokens={waitingQueue.filter((t) => t.status === TOKEN_STATUS.WAITING)} />
      </div>
    </div>
  );
}
