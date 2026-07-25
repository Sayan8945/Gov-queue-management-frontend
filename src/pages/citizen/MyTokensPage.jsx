import { Ticket } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import TokenCard from '@/components/citizen/TokenCard';
import { useMyTokens, useCancelToken } from '@/hooks/useTokens';
import { TOKEN_STATUS } from '@/constants/tokenStatus';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

const ACTIVE_STATUSES = [TOKEN_STATUS.WAITING, TOKEN_STATUS.APPROACHING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_PROGRESS];

export default function MyTokensPage() {
  const { data: tokens, isLoading } = useMyTokens();
  const cancelMutation = useCancelToken();

  const activeTokens = (tokens || []).filter((t) => ACTIVE_STATUSES.includes(t.status));

  return (
    <div>
      <PageHeader
        title="My Tokens"
        breadcrumbItems={[{ label: 'My Tokens' }]}
        description="Active tokens currently in the queue."
        actions={
          <Link to="/citizen/book">
            <Button icon={Ticket}>Book New Token</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : activeTokens.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No active tokens"
          description="Book a token to see it appear here."
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
