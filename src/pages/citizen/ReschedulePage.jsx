import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToken, useRescheduleToken } from '@/hooks/useTokens';
import { formatDate } from '@/utils/dateHelpers';

// Real backend has no per-slot scheduling — rescheduling moves a token to a
// different day's queue (bookingDate), re-issuing a fresh token number for
// that day. There's no time-of-day slot to pick.
function getUpcomingDateOptions(days = 7) {
  const options = [];
  for (let i = 1; i <= days; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    options.push(date);
  }
  return options;
}

export default function ReschedulePage() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { data: token, isLoading } = useToken(tokenId);
  const rescheduleMutation = useRescheduleToken();
  const [selectedDate, setSelectedDate] = useState(null);

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (!token) {
    return <EmptyState title="Token not found" description="This booking could not be located." />;
  }

  const dateOptions = getUpcomingDateOptions();

  const handleSubmit = async () => {
    await rescheduleMutation.mutateAsync({ tokenId: token._id, bookingDate: selectedDate });
    navigate(`/citizen/tokens/${token._id}`);
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Reschedule Token"
        breadcrumbItems={[
          { label: 'My Tokens', to: '/citizen/tokens' },
          { label: token.tokenNumber, to: `/citizen/tokens/${token._id}` },
          { label: 'Reschedule' },
        ]}
      />

      <Card>
        <CardBody>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Choose a new day for token <strong>{token.tokenNumber}</strong>. A new token number will
            be issued for that day&apos;s queue.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {dateOptions.map((date) => {
              const iso = date.toISOString();
              const isSelected = selectedDate === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  aria-pressed={isSelected}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isSelected
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  {formatDate(date, 'EEE, dd MMM')}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={rescheduleMutation.isPending} disabled={!selectedDate}>
              Confirm New Date
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
