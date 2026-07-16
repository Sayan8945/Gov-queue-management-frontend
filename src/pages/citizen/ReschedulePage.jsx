import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SlotPicker from '@/components/citizen/SlotPicker';
import { useQueueStore } from '@/store/queueStore';
import { useRescheduleToken } from '@/hooks/useTokens';

export default function ReschedulePage() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const token = useQueueStore((s) => s.getTokenById(tokenId));
  const rescheduleMutation = useRescheduleToken();
  const [slot, setSlot] = useState(token?.slot || null);

  if (!token) {
    return <EmptyState title="Token not found" description="This booking could not be located." />;
  }

  const handleSubmit = async () => {
    await rescheduleMutation.mutateAsync({ tokenId: token.id, newSlot: slot });
    navigate(`/citizen/tokens/${token.id}`);
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Reschedule Token"
        breadcrumbItems={[
          { label: 'My Tokens', to: '/citizen/tokens' },
          { label: token.tokenNumber, to: `/citizen/tokens/${token.id}` },
          { label: 'Reschedule' },
        ]}
      />

      <Card>
        <CardBody>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Choose a new time slot for token <strong>{token.tokenNumber}</strong>.
          </p>
          <SlotPicker date={new Date()} selectedSlot={slot} onSelect={setSlot} />

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={rescheduleMutation.isPending} disabled={!slot}>
              Confirm New Slot
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
