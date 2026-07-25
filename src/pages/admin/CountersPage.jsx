import { useState } from 'react';
import { Plus, Trash2, MonitorCog } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  useAdminDepartments,
  useAdminCounters,
  useAdminStaff,
  useCreateCounter,
  useDeleteCounter,
  useUpdateCounter,
  useAssignStaffToCounter,
} from '@/hooks/useAdmin';
import { COUNTER_STATUS } from '@/constants/tokenStatus';

export default function CountersPage() {
  const { data: departments } = useAdminDepartments();
  const { data: counters, isLoading } = useAdminCounters();
  const { data: staff } = useAdminStaff();
  const createMutation = useCreateCounter();
  const deleteMutation = useDeleteCounter();
  const updateMutation = useUpdateCounter();
  const assignStaffMutation = useAssignStaffToCounter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ counterNumber: '', departmentId: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = async () => {
    if (!form.counterNumber || !form.departmentId) {
      toast.error('Counter number and department are required');
      return;
    }
    try {
      await createMutation.mutateAsync(form);
      setIsModalOpen(false);
      setForm({ counterNumber: '', departmentId: departments?.[0]?._id || '' });
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

  const handleToggleStatus = (counter) => {
    const nextStatus = counter.status === COUNTER_STATUS.BREAK ? COUNTER_STATUS.ACTIVE : COUNTER_STATUS.BREAK;
    updateMutation.mutate({ id: counter._id, payload: { status: nextStatus } });
  };

  const getDepartmentName = (id) => departments?.find((d) => d._id === id)?.departmentName;

  // Only staff already assigned to the counter's department can be linked
  // to it — mirrors the real-world constraint that a counter operator works
  // within one office/department.
  const getStaffForDepartment = (departmentId) => staff?.filter((s) => (s.departmentId?._id || s.departmentId) === departmentId) || [];

  const handleAssignStaff = (counter, staffId) => {
    if (!staffId) return; // backend requires a staffId; unassigning isn't supported here
    assignStaffMutation.mutate({ counterId: counter._id, staffId });
  };

  return (
    <div>
      <PageHeader
        title="Counter Management"
        breadcrumbItems={[{ label: 'Counters' }]}
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setForm({ counterNumber: '', departmentId: departments?.[0]?._id || '' });
              setIsModalOpen(true);
            }}
          >
            Add Counter
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonCard />
      ) : counters?.length === 0 ? (
        <EmptyState icon={MonitorCog} title="No counters" description="Add a counter to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counters?.map((counter) => (
            <Card key={counter._id} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {counter.counterNumber}
                </p>
                <Badge
                  variant={
                    counter.status === COUNTER_STATUS.ACTIVE
                      ? 'success'
                      : counter.status === COUNTER_STATUS.BREAK
                      ? 'warning'
                      : 'default'
                  }
                >
                  {counter.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getDepartmentName(counter.departmentId)}
              </p>
              <div className="mt-3">
                <Select
                  label="Assigned Staff"
                  value={counter.assignedStaff?._id || counter.assignedStaff || ''}
                  onChange={(e) => handleAssignStaff(counter, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {getStaffForDepartment(counter.departmentId).map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="mt-4 flex gap-2">
                {counter.status === COUNTER_STATUS.BREAK ? (
                  <Button size="sm" variant="success" onClick={() => handleToggleStatus(counter)}>
                    Resume
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleToggleStatus(counter)}>
                    Pause
                  </Button>
                )}
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteTarget(counter)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Counter"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Counter Number"
            placeholder="e.g. C-07"
            required
            value={form.counterNumber}
            onChange={(e) => setForm((f) => ({ ...f, counterNumber: e.target.value }))}
          />
          <Select
            label="Department"
            value={form.departmentId}
            onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
          >
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.departmentName}
              </option>
            ))}
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete counter"
        description={`Are you sure you want to permanently delete counter "${deleteTarget?.counterNumber || ''}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
