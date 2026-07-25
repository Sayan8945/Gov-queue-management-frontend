import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAdminDepartments } from '@/hooks/useAdmin';
import { fetchDepartmentPerformance, fetchDailyTokensServed, fetchPeakHoursAnalytics } from '@/services/adminService';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const STATUS_COLORS = { completed: '#22c55e', cancelled: '#ef4444', noShow: '#9ca3af' };

// Every chart here is fed by real MongoDB aggregation
// (Server/src/services/analyticsService.js) via /api/admin/analytics/*.
export default function AnalyticsPage() {
  const { data: departments } = useAdminDepartments();
  const { data: deptPerformance, isLoading: isLoadingPerf } = useQuery({
    queryKey: ['admin', 'analytics', 'department-performance'],
    queryFn: () => fetchDepartmentPerformance(),
  });
  const { data: dailyServed, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['admin', 'analytics', 'daily-tokens-served'],
    queryFn: () => fetchDailyTokensServed(),
  });
  const { data: peakHours, isLoading: isLoadingPeak } = useQuery({
    queryKey: ['admin', 'analytics', 'peak-hours'],
    queryFn: () => fetchPeakHoursAnalytics(),
  });

  if (isLoadingPerf || isLoadingDaily || isLoadingPeak) {
    return <SkeletonCard />;
  }

  const totals = (deptPerformance || []).reduce(
    (acc, d) => ({
      completed: acc.completed + d.completed,
      cancelled: acc.cancelled + d.cancelled,
      noShow: acc.noShow + d.noShow,
    }),
    { completed: 0, cancelled: 0, noShow: 0 }
  );

  const statusBreakdown = Object.entries(totals)
    .map(([key, value]) => ({ name: key, value, color: STATUS_COLORS[key] }))
    .filter((d) => d.value > 0);

  const trendData = (dailyServed || []).map((d) => ({ day: d.day, served: d.count }));
  const peakChartData = (peakHours || []).map((h) => ({ label: `${h.hour}:00`, count: h.count }));

  const deptLoad = (deptPerformance || []).map((d) => ({
    name: departments?.find((dep) => String(dep._id) === String(d.departmentId))?.departmentCode || '—',
    tokens: d.totalTokens,
  }));

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        description="Queue performance trends across departments (last 30 days)."
        breadcrumbItems={[{ label: 'Analytics' }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Token Outcome Breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Tokens Served</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="served" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Peak Hours (Tokens Issued)</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={peakChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total Tokens by Department</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-5">
              {deptLoad.map((d) => (
                <div key={d.name} className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{d.tokens}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.name}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
