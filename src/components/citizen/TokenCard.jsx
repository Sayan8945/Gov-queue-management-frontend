import { Link } from 'react-router-dom';
import { Calendar, Clock, Building2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import Button from '@/components/ui/Button';
import { getDepartmentById, getServiceById } from '@/store/catalogStore';
import { formatDate, formatTime } from '@/utils/dateHelpers';
import { TOKEN_STATUS } from '@/constants/tokenStatus';

export default function TokenCard({ token, onCancel }) {
  const department = getDepartmentById(token.departmentId);
  const service = getServiceById(token.serviceId);
  const canManage = token.status === TOKEN_STATUS.WAITING;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{token.tokenNumber}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{service?.name}</p>
        </div>
        <StatusBadge status={token.status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-gray-400" /> {department?.name}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gray-400" /> {formatDate(token.slot)}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-gray-400" /> {formatTime(token.slot)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link to={`/citizen/tokens/${token.id}`}>
          <Button variant="secondary" size="sm">
            View details
          </Button>
        </Link>
        {canManage && (
          <>
            <Link to={`/citizen/tokens/${token.id}/reschedule`}>
              <Button variant="outline" size="sm">
                Reschedule
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => onCancel(token.id)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
