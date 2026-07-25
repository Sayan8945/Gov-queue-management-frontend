import { useState } from 'react';
import { Plus, Trash2, ClipboardList, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useAdminDepartments } from '@/hooks/useAdmin';
import { useAdminServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useAdmin';

const EMPTY_FORM = { serviceName: '', serviceCode: '', departmentId: '', averageServiceDuration: 15, dailyTokenLimit: 100 };

export default function ServicesPage() {
  const { data: departments } = useAdminDepartments();
  const { data: services, isLoading } = useAdminServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, departmentId: departments?.[0]?._id || '' });
    setIsModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditing(svc);
    setForm({
      serviceName: svc.serviceName,
      serviceCode: svc.serviceCode,
      departmentId: svc.departmentId,
      averageServiceDuration: svc.averageServiceDuration,
      dailyTokenLimit: svc.dailyTokenLimit,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.serviceName || !form.serviceCode || !form.departmentId) {
      toast.error('Service name, code, and department are required');
      return;
    }
    const payload = {
      ...form,
      averageServiceDuration: Number(form.averageServiceDuration),
      dailyTokenLimit: Number(form.dailyTokenLimit),
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing._id,
          payload: {
            serviceName: payload.serviceName,
            serviceCode: payload.serviceCode,
            averageServiceDuration: payload.averageServiceDuration,
            dailyTokenLimit: payload.dailyTokenLimit,
          },
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch {
      // handled by mutation's onError
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      // handled by mutation's onError
    }
  };

  const getDepartmentName = (id) => departments?.find((d) => d._id === id)?.departmentName;

  return (
    <div>
      <PageHeader
        title="Service Management"
        breadcrumbItems={[{ label: 'Services' }]}
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add Service
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="p-5">
            <SkeletonTable />
          </div>
        ) : services?.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={ClipboardList} title="No services" description="Add a service to get started." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Avg. Duration</th>
                  <th className="px-5 py-3">Daily Limit</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {services?.map((svc) => (
                  <tr key={svc._id}>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{svc.serviceName}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {getDepartmentName(svc.departmentId)}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{svc.averageServiceDuration} min</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{svc.dailyTokenLimit}/day</td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(svc)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteTarget(svc)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Service' : 'Add Service'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Service Name"
            required
            value={form.serviceName}
            onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
          />
          <Input
            label="Service Code"
            required
            placeholder="e.g. PSP01"
            value={form.serviceCode}
            onChange={(e) => setForm((f) => ({ ...f, serviceCode: e.target.value.toUpperCase() }))}
            disabled={Boolean(editing)}
          />
          <Select
            label="Department"
            value={form.departmentId}
            onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
            disabled={Boolean(editing)}
          >
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.departmentName}
              </option>
            ))}
          </Select>
          <Input
            label="Average Duration (minutes)"
            type="number"
            min={1}
            value={form.averageServiceDuration}
            onChange={(e) => setForm((f) => ({ ...f, averageServiceDuration: e.target.value }))}
          />
          <Input
            label="Daily Token Limit"
            type="number"
            min={1}
            value={form.dailyTokenLimit}
            onChange={(e) => setForm((f) => ({ ...f, dailyTokenLimit: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete service"
        description={`Are you sure you want to permanently delete "${deleteTarget?.serviceName || 'this service'}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
