import { Users, Clock3, CheckCircle2, Building2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAdminDepartments, useAdminCounters } from '@/hooks/useAdmin';
import { useQuery } from '@tanstack/react-query';
import { fetchDepartmentPerformance } from '@/services/adminService';
import { COUNTER_STATUS } from '@/constants/tokenStatus';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Every number on this dashboard comes from real MongoDB aggregation
// (Server/src/services/analyticsService.js) or the live departments/
// counters collections — no queueStore/catalogStore.
export default function AdminDashboardPage() {
  const { data: departments, isLoading: isLoadingDepartments } = useAdminDepartments();
  const { data: counters, isLoading: isLoadingCounters } = useAdminCounters();
  const { data: deptPerformance, isLoading: isLoadingPerf } = useQuery({
    queryKey: ['admin', 'analytics', 'department-performance'],
    queryFn: () => fetchDepartmentPerformance(),
  });

  if (isLoadingDepartments || isLoadingCounters || isLoadingPerf) {
    return <SkeletonCard />;
  }

  const totalWaiting = deptPerformance?.reduce((sum, d) => sum + (d.totalTokens - d.completed - d.cancelled - d.noShow), 0) || 0;
  const totalCompleted = deptPerformance?.reduce((sum, d) => sum + d.completed, 0) || 0;
  const activeCounters = counters?.filter((c) => c.status === COUNTER_STATUS.ACTIVE).length || 0;

  const chartData = (deptPerformance || []).map((d) => ({
    name: departments?.find((dep) => String(dep._id) === String(d.departmentId))?.departmentCode || '—',
    waiting: Math.max(d.totalTokens - d.completed - d.cancelled - d.noShow, 0),
    completed: d.completed,
  }));

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Real-time overview of all departments and queues." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citizens Waiting" value={totalWaiting} icon={Users} tone="warning" />
        <StatCard label="Completed (30d)" value={totalCompleted} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Active Counters"
          value={`${activeCounters}/${counters?.length || 0}`}
          icon={Clock3}
          tone="primary"
        />
        <StatCard label="Departments" value={departments?.length || 0} icon={Building2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Queue Load by Department (last 30 days)</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="waiting" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Not Completed" />
                  <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Status</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {departments?.map((dept) => {
              const perf = deptPerformance?.find((d) => String(d.departmentId) === String(dept._id));
              const notCompleted = perf ? Math.max(perf.totalTokens - perf.completed - perf.cancelled - perf.noShow, 0) : 0;
              return (
                <div key={dept._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{dept.departmentName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dept.departmentCode}</p>
                  </div>
                  <Badge variant={notCompleted > 5 ? 'danger' : notCompleted > 0 ? 'warning' : 'success'}>
                    {notCompleted} pending
                  </Badge>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
