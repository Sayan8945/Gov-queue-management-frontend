import { useQuery } from '@tanstack/react-query';
import { Clock3, Users2, TrendingUp, FileBarChart } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAdminDepartments } from '@/hooks/useAdmin';
import { fetchWaitTimesAnalytics, fetchCounterPerformance, fetchPeakHoursAnalytics } from '@/services/adminService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// All figures come from real MongoDB aggregation
// (Server/src/services/analyticsService.js) — no queueStore.
export default function ReportsPage() {
  const { data: departments } = useAdminDepartments();
  const { data: waitTimes, isLoading: isLoadingWait } = useQuery({
    queryKey: ['admin', 'analytics', 'wait-times'],
    queryFn: () => fetchWaitTimesAnalytics(),
  });
  const { data: counterPerf, isLoading: isLoadingCounters } = useQuery({
    queryKey: ['admin', 'analytics', 'counter-performance'],
    queryFn: () => fetchCounterPerformance(),
  });
  const { data: peakHours, isLoading: isLoadingPeak } = useQuery({
    queryKey: ['admin', 'analytics', 'peak-hours'],
    queryFn: () => fetchPeakHoursAnalytics(),
  });

  if (isLoadingWait || isLoadingCounters || isLoadingPeak) {
    return <SkeletonCard />;
  }

  const avgWaitMins = waitTimes?.length
    ? Math.round(waitTimes.reduce((sum, w) => sum + w.averageWaitMinutes, 0) / waitTimes.length)
    : 0;
  const busiestHour = (peakHours || []).reduce((max, h) => (h.count > (max?.count || 0) ? h : max), null);
  const totalServed = (counterPerf || []).reduce((sum, c) => sum + c.completed, 0);

  return (
    <div>
      <PageHeader title="Queue Performance Reports" breadcrumbItems={[{ label: 'Reports' }]} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Average Wait Time" value={`${avgWaitMins} min`} icon={Clock3} tone="primary" />
        <StatCard
          label="Peak Hour"
          value={busiestHour?.count ? `${busiestHour.hour}:00` : '-'}
          icon={TrendingUp}
          tone="warning"
          trend={busiestHour?.count ? `${busiestHour.count} tokens issued` : 'No data yet'}
        />
        <StatCard label="Total Tokens Served" value={totalServed} icon={Users2} tone="success" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tokens Served per Counter</CardTitle>
          </CardHeader>
          <CardBody>
            {!counterPerf?.length ? (
              <EmptyState icon={FileBarChart} title="No data yet" />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={counterPerf.map((c) => ({ name: c.counterNumber || '—', served: c.completed }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="served" fill="#2563eb" radius={[4, 4, 0, 0]} name="Tokens Served" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours (Tokens Issued)</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={(peakHours || []).map((h) => ({ label: `${h.hour}:00`, count: h.count }))}>
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
          <CardTitle>Average Wait Time by Department</CardTitle>
        </CardHeader>
        {!waitTimes?.length ? (
          <div className="p-5">
            <EmptyState icon={FileBarChart} title="No data yet" description="Wait time data will appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Avg. Wait (min)</th>
                  <th className="px-5 py-3">Sample Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {waitTimes.map((w) => (
                  <tr key={w.departmentId}>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {w.departmentName || departments?.find((d) => d._id === w.departmentId)?.departmentName}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{w.averageWaitMinutes}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{w.sampleSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
