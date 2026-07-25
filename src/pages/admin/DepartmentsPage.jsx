import { useState } from 'react';
import { Plus, Pencil, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAdminDepartments, useCreateDepartment, useUpdateDepartment } from '@/hooks/useAdmin';

const EMPTY_FORM = {
  departmentName: '',
  departmentCode: '',
  officeLocation: '',
  openingTime: '09:00',
  closingTime: '17:00',
  description: '',
};

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useAdminDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode,
      officeLocation: dept.officeLocation,
      openingTime: dept.openingTime,
      closingTime: dept.closingTime,
      description: dept.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.departmentName || !form.departmentCode || !form.officeLocation) {
      toast.error('Name, code, and office location are required');
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, payload: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setIsModalOpen(false);
    } catch {
      // Error toast already shown by the mutation's onError handler.
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      await updateMutation.mutateAsync({ id: dept._id, payload: { isActive: !dept.isActive } });
    } catch {
      // handled
    }
  };

  return (
    <div>
      <PageHeader
        title="Department Management"
        breadcrumbItems={[{ label: 'Departments' }]}
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add Department
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonCard />
      ) : departments?.length === 0 ? (
        <EmptyState icon={Building2} title="No departments" description="Create your first department." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments?.map((dept) => (
            <Card key={dept._id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{dept.departmentName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dept.departmentCode}</p>
                  </div>
                  <Badge variant={dept.isActive ? 'success' : 'default'}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{dept.description}</p>
                <p className="mt-2 text-xs text-gray-400">{dept.officeLocation}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Hours: {dept.openingTime}–{dept.closingTime}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(dept)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleActive(dept)}>
                    {dept.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Department' : 'Add Department'}
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
            label="Department Name"
            required
            value={form.departmentName}
            onChange={(e) => setForm((f) => ({ ...f, departmentName: e.target.value }))}
          />
          <Input
            label="Code"
            required
            placeholder="e.g. PSP"
            value={form.departmentCode}
            onChange={(e) => setForm((f) => ({ ...f, departmentCode: e.target.value.toUpperCase() }))}
          />
          <Input
            label="Office Location"
            required
            value={form.officeLocation}
            onChange={(e) => setForm((f) => ({ ...f, officeLocation: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Opening Time"
              type="time"
              value={form.openingTime}
              onChange={(e) => setForm((f) => ({ ...f, openingTime: e.target.value }))}
            />
            <Input
              label="Closing Time"
              type="time"
              value={form.closingTime}
              onChange={(e) => setForm((f) => ({ ...f, closingTime: e.target.value }))}
            />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
