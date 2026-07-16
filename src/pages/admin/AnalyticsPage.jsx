import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { useCatalogStore } from '@/store/catalogStore';
import { useQueueStore } from '@/store/queueStore';
import { TOKEN_STATUS } from '@/constants/tokenStatus';
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

const STATUS_COLORS = {
  [TOKEN_STATUS.WAITING]: '#f59e0b',
  [TOKEN_STATUS.IN_PROGRESS]: '#3b82f6',
  [TOKEN_STATUS.COMPLETED]: '#22c55e',
  [TOKEN_STATUS.SKIPPED]: '#9ca3af',
  [TOKEN_STATUS.CANCELLED]: '#ef4444',
};

// Simulated 7-day trend since there's no historical backend yet.
// TODO(backend): replace with GET /api/analytics/trend
function buildTrendData(tokens) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const completedToday = tokens.filter((t) => t.status === TOKEN_STATUS.COMPLETED).length;
  return days.map((day, idx) => ({
    day,
    served: idx === days.length - 1 ? completedToday : Math.round(20 + Math.sin(idx) * 8 + idx * 2),
  }));
}

export default function AnalyticsPage() {
  const tokens = useQueueStore((s) => s.tokens);
  const departments = useCatalogStore((s) => s.departments);

  const statusBreakdown = Object.values(TOKEN_STATUS)
    .filter((s) => STATUS_COLORS[s])
    .map((status) => ({
      name: status.replace('_', ' '),
      value: tokens.filter((t) => t.status === status).length,
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  const trendData = buildTrendData(tokens);

  const deptLoad = departments.map((d) => ({
    name: d.code,
    tokens: tokens.filter((t) => t.departmentId === d.id).length,
  }));

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        description="Queue performance trends across departments."
        breadcrumbItems={[{ label: 'Analytics' }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Token Status Breakdown</CardTitle>
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
            <CardTitle>Weekly Tokens Served</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
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
