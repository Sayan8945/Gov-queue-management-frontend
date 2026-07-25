import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAdminDepartments, useAdminServices, useUpdateDepartment, useUpdateService } from '@/hooks/useAdmin';

// Real per-department operating hours (Department.openingTime/closingTime)
// and per-service daily token limits (Service.dailyTokenLimit) — both
// persisted via PUT /api/admin/departments/:id and /api/admin/services/:id.
export default function TokenLimitsPage() {
  const { data: departments, isLoading: isLoadingDepartments } = useAdminDepartments();
  const { data: services, isLoading: isLoadingServices } = useAdminServices();
  const updateDepartment = useUpdateDepartment();
  const updateService = useUpdateService();

  const [deptForms, setDeptForms] = useState({});
  const [serviceForms, setServiceForms] = useState({});

  useEffect(() => {
    if (departments) {
      setDeptForms(
        Object.fromEntries(
          departments.map((d) => [d._id, { openingTime: d.openingTime, closingTime: d.closingTime }])
        )
      );
    }
  }, [departments]);

  useEffect(() => {
    if (services) {
      setServiceForms(Object.fromEntries(services.map((s) => [s._id, { dailyTokenLimit: s.dailyTokenLimit }])));
    }
  }, [services]);

  const handleSaveAll = async () => {
    try {
      await Promise.all([
        ...Object.entries(deptForms).map(([id, payload]) => updateDepartment.mutateAsync({ id, payload })),
        ...Object.entries(serviceForms).map(([id, payload]) =>
          updateService.mutateAsync({ id, payload: { dailyTokenLimit: Number(payload.dailyTokenLimit) } })
        ),
      ]);
      toast.success('Token limits and service timings saved');
    } catch {
      // individual mutation onError handlers already toast
    }
  };

  if (isLoadingDepartments || isLoadingServices) {
    return <SkeletonCard />;
  }

  return (
    <div>
      <PageHeader
        title="Token Limits & Service Timings"
        description="Set operating hours per department and daily token limits per service."
        breadcrumbItems={[{ label: 'Token Limits' }]}
        actions={
          <Button icon={Save} onClick={handleSaveAll} isLoading={updateDepartment.isPending || updateService.isPending}>
            Save Changes
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Department Operating Hours</CardTitle>
        </CardHeader>
        <CardBody className="space-y-6">
          {departments?.map((dept) => (
            <div
              key={dept._id}
              className="grid gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0 sm:grid-cols-3 dark:border-gray-700"
            >
              <div className="sm:col-span-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dept.departmentName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{dept.departmentCode}</p>
              </div>
              <Input
                label="Opening Time"
                type="time"
                value={deptForms[dept._id]?.openingTime || ''}
                onChange={(e) =>
                  setDeptForms((f) => ({ ...f, [dept._id]: { ...f[dept._id], openingTime: e.target.value } }))
                }
              />
              <Input
                label="Closing Time"
                type="time"
                value={deptForms[dept._id]?.closingTime || ''}
                onChange={(e) =>
                  setDeptForms((f) => ({ ...f, [dept._id]: { ...f[dept._id], closingTime: e.target.value } }))
                }
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Daily Token Limits</CardTitle>
        </CardHeader>
        <CardBody className="space-y-6">
          {services?.map((svc) => (
            <div
              key={svc._id}
              className="grid gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0 sm:grid-cols-2 dark:border-gray-700"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{svc.serviceName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{svc.serviceCode}</p>
              </div>
              <Input
                label="Daily Token Limit"
                type="number"
                min={1}
                value={serviceForms[svc._id]?.dailyTokenLimit ?? ''}
                onChange={(e) =>
                  setServiceForms((f) => ({ ...f, [svc._id]: { dailyTokenLimit: e.target.value } }))
                }
              />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
