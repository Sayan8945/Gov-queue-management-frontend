import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import TokenQrCode from '@/components/citizen/TokenQrCode';
import { useToken } from '@/hooks/useTokens';
import { formatDateTime } from '@/utils/dateHelpers';

export default function TokenConfirmationPage() {
  const { tokenId } = useParams();
  const { data: token, isLoading } = useToken(tokenId);

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (!token) {
    return <EmptyState title="Token not found" description="This booking could not be located." />;
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Booking Confirmed" breadcrumbItems={[{ label: 'Book Token', to: '/citizen/book' }, { label: 'Confirmation' }]} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardBody className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
              <CheckCircle2 className="h-7 w-7 text-success-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your token number is</p>
            <p className="mt-1 text-4xl font-extrabold tracking-wide text-primary-700 dark:text-primary-400">
              {token.tokenNumber}
            </p>

            <div className="mt-6">
              <TokenQrCode token={token} />
            </div>

            <dl className="mt-6 grid w-full grid-cols-2 gap-4 text-left">
              <Info label="Department" value={token.departmentId?.departmentName} />
              <Info label="Service" value={token.serviceId?.serviceName} />
              <Info label="Queue Position" value={token.queuePosition ?? '-'} />
              <Info label="Est. Wait" value={`${token.estimatedWaitTime ?? 0} min`} />
              <Info label="Booked on" value={formatDateTime(token.createdAt)} />
            </dl>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <Link to={`/citizen/tokens/${token._id}`} className="flex-1">
                <Button fullWidth variant="secondary">
                  Track Queue Position
                </Button>
              </Link>
              <Link to="/citizen/home" className="flex-1">
                <Button fullWidth>Go to Dashboard</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value || '-'}</dd>
    </div>
  );
}
