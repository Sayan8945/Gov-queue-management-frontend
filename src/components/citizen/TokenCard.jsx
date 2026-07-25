import { Link } from 'react-router-dom';
import { Calendar, Users, Building2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/dateHelpers';
import { TOKEN_STATUS } from '@/constants/tokenStatus';

// departmentId/serviceId arrive populated (objects, not raw ids) from the
// backend's getTokensByCitizen/getTokenById — see Server/src/services/queueService.js
export default function TokenCard({ token, onCancel }) {
  const canManage = [TOKEN_STATUS.WAITING, TOKEN_STATUS.APPROACHING].includes(token.status);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{token.tokenNumber}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{token.serviceId?.serviceName}</p>
        </div>
        <StatusBadge status={token.status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-gray-400" /> {token.departmentId?.departmentName}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gray-400" /> {formatDate(token.bookingDate)}
        </div>
        {token.queuePosition != null && (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-400" /> #{token.queuePosition} in queue
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link to={`/citizen/tokens/${token._id}`}>
          <Button variant="secondary" size="sm">
            View details
          </Button>
        </Link>
        {canManage && (
          <>
            <Link to={`/citizen/tokens/${token._id}/reschedule`}>
              <Button variant="outline" size="sm">
                Reschedule
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => onCancel(token._id)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
