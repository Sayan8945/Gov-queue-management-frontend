import { Users, Clock3, CheckCircle2, Building2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useCatalogStore } from '@/store/catalogStore';
import { useQueueStore } from '@/store/queueStore';
import { COUNTER_STATUS, TOKEN_STATUS } from '@/constants/tokenStatus';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboardPage() {
  const tokens = useQueueStore((s) => s.tokens);
  const counters = useQueueStore((s) => s.counters);
  const departments = useCatalogStore((s) => s.departments);

  const totalWaiting = tokens.filter((t) => t.status === TOKEN_STATUS.WAITING).length;
  const totalInProgress = tokens.filter((t) => t.status === TOKEN_STATUS.IN_PROGRESS).length;
  const totalCompleted = tokens.filter((t) => t.status === TOKEN_STATUS.COMPLETED).length;
  const activeCounters = counters.filter((c) => c.status === COUNTER_STATUS.ACTIVE).length;

  const chartData = departments.map((dept) => ({
    name: dept.code,
    waiting: tokens.filter((t) => t.departmentId === dept.id && t.status === TOKEN_STATUS.WAITING).length,
    completed: tokens.filter((t) => t.departmentId === dept.id && t.status === TOKEN_STATUS.COMPLETED)
      .length,
  }));

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Real-time overview of all departments and queues." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citizens Waiting" value={totalWaiting} icon={Users} tone="warning" />
        <StatCard label="In Progress" value={totalInProgress} icon={Clock3} tone="primary" />
        <StatCard label="Completed Today" value={totalCompleted} icon={CheckCircle2} tone="success" />
        <StatCard label="Active Counters" value={`${activeCounters}/${counters.length}`} icon={Building2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Queue Load by Department</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="waiting" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Waiting" />
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
            {departments.map((dept) => {
              const waiting = tokens.filter(
                (t) => t.departmentId === dept.id && t.status === TOKEN_STATUS.WAITING
              ).length;
              return (
                <div key={dept.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{dept.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dept.code}</p>
                  </div>
                  <Badge variant={waiting > 5 ? 'danger' : waiting > 0 ? 'warning' : 'success'}>
                    {waiting} waiting
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
