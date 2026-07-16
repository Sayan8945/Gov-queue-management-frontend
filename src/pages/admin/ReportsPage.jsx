import { Download, Clock3, Users2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { useQueueStore } from '@/store/queueStore';
import { getDepartmentById, getServiceById } from '@/store/catalogStore';
import { formatDateTime } from '@/utils/dateHelpers';
import { FileBarChart } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// TODO(backend): replace with GET /api/reports/queue-performance and a real
// export endpoint (CSV/PDF generation) once available.
export default function ReportsPage() {
  const tokens = useQueueStore((s) => s.tokens);
  const avgWaitMins = useQueueStore((s) => s.getAverageWaitMinutes());
  const servedPerCounter = useQueueStore((s) => s.getTokensServedPerCounter());
  const peakHours = useQueueStore((s) => s.getPeakHoursHistogram());

  const sorted = [...tokens].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const busiestHour = peakHours.reduce((max, h) => (h.count > max.count ? h : max), peakHours[0]);
  const peakChartData = peakHours
    .filter((h) => h.count > 0 || (h.hour >= 8 && h.hour <= 18))
    .map((h) => ({ label: `${h.hour}:00`, count: h.count }));

  const handleExport = () => {
    toast.success('Report export simulated — CSV generation pending backend integration');
  };

  return (
    <div>
      <PageHeader
        title="Queue Performance Reports"
        breadcrumbItems={[{ label: 'Reports' }]}
        actions={
          <Button icon={Download} variant="secondary" onClick={handleExport}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Average Wait Time" value={`${avgWaitMins} min`} icon={Clock3} tone="primary" />
        <StatCard
          label="Peak Hour"
          value={busiestHour?.count ? `${busiestHour.hour}:00` : '-'}
          icon={TrendingUp}
          tone="warning"
          trend={busiestHour?.count ? `${busiestHour.count} tokens issued` : 'No data yet'}
        />
        <StatCard
          label="Total Tokens Served"
          value={servedPerCounter.reduce((sum, c) => sum + c.served, 0)}
          icon={Users2}
          tone="success"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tokens Served per Counter</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={servedPerCounter.map((c) => ({ name: c.counterNumber, served: c.served }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="served" fill="#2563eb" radius={[4, 4, 0, 0]} name="Tokens Served" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours (Tokens Issued)</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={peakChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tokens Issued" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Token Activity</CardTitle>
        </CardHeader>
        {sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={FileBarChart} title="No data yet" description="Token activity will appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3">Token</th>
                  <th className="px-5 py-3">Citizen</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sorted.slice(0, 30).map((token) => {
                  const dept = getDepartmentById(token.departmentId);
                  const service = getServiceById(token.serviceId);
                  return (
                    <tr key={token.id}>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {token.tokenNumber}
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{token.citizenName}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{dept?.name}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{service?.name}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {formatDateTime(token.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={token.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
