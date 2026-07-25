import { Link } from 'react-router-dom';
import { Ticket, ListChecks, History, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import TokenCard from '@/components/citizen/TokenCard';
import { useAuth } from '@/hooks/useAuth';
import { useMyTokens, useCancelToken } from '@/hooks/useTokens';
import { TOKEN_STATUS } from '@/constants/tokenStatus';

const ACTIVE_STATUSES = [TOKEN_STATUS.WAITING, TOKEN_STATUS.APPROACHING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_PROGRESS];

export default function CitizenHomePage() {
  const { user } = useAuth();
  const { data: tokens, isLoading } = useMyTokens();
  const cancelMutation = useCancelToken();

  const activeTokens = (tokens || []).filter((t) => ACTIVE_STATUSES.includes(t.status));

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Citizen'}`}
        description="Book a new token or track your active appointments below."
        actions={
          <Link to="/citizen/book">
            <Button icon={Ticket}>Book New Token</Button>
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <QuickLink to="/citizen/book" icon={Ticket} title="Book Token" description="Choose service & slot" />
        <QuickLink to="/citizen/tokens" icon={ListChecks} title="My Tokens" description="Track active tokens" />
        <QuickLink to="/citizen/history" icon={History} title="History" description="View past visits" />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-50">Active tokens</h2>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : activeTokens.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No active tokens"
          description="You don't have any active bookings right now."
          action={
            <Link to="/citizen/book">
              <Button size="sm">Book a token</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeTokens.map((token) => (
            <TokenCard key={token._id} token={token} onCancel={(id) => cancelMutation.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, description }) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950">
            <Icon className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </CardBody>
      </Card>
    </Link>
  );
}
