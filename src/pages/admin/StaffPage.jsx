import { useState } from 'react';
import { Plus, Pencil, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import PasswordInput from '@/components/ui/PasswordInput';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminDepartments,
  useAdminStaff,
  useCreateStaff,
  useUpdateStaff,
  useDeactivateStaff,
  useActivateStaff,
  useDeleteStaffAccount,
} from '@/hooks/useAdmin';

const STAFF_SUB_ROLES = {
  COUNTER_OPERATOR: 'counter_operator',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
};

const SUB_ROLE_LABELS = {
  [STAFF_SUB_ROLES.COUNTER_OPERATOR]: 'Counter Operator',
  [STAFF_SUB_ROLES.SUPERVISOR]: 'Supervisor',
  [STAFF_SUB_ROLES.ADMIN]: 'Admin',
};

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  staffSubRole: STAFF_SUB_ROLES.COUNTER_OPERATOR,
  departmentId: '',
  officeLocation: '',
};

export default function StaffPage() {
  const { user } = useAuth();
  const { data: departments } = useAdminDepartments();
  const { data: staff, isLoading } = useAdminStaff();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deactivateMutation = useDeactivateStaff();
  const activateMutation = useActivateStaff();
  const deleteMutation = useDeleteStaffAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, departmentId: departments?.[0]?._id || '' });
    setIsModalOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      fullName: member.fullName,
      email: member.email,
      password: '',
      staffSubRole: member.staffSubRole || STAFF_SUB_ROLES.COUNTER_OPERATOR,
      departmentId: member.departmentId?._id || member.departmentId || '',
      officeLocation: member.officeLocation || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.email || (!editing && !form.password)) {
      toast.error('Name, email, and password are required');
      return;
    }
    try {
      if (editing) {
        const { password, ...updatePayload } = form;
        await updateMutation.mutateAsync({ id: editing._id, payload: updatePayload });
      } else {
        await createMutation.mutateAsync(form);
      }
      setIsModalOpen(false);
    } catch {
      // Error toast already shown by the mutation's onError handler.
    }
  };

  const handleDeactivate = (member) => {
    deactivateMutation.mutate(member._id);
  };

  const handleActivate = (member) => {
    activateMutation.mutate(member._id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      // Error toast already shown by the mutation's onError handler.
    }
  };

  const getDepartmentName = (dept) => {
    if (!dept) return 'Unassigned';
    if (typeof dept === 'object') return dept.departmentName;
    return departments?.find((d) => d._id === dept)?.departmentName || 'Unassigned';
  };

  return (
    <div>
      <PageHeader
        title="Staff Management"
        breadcrumbItems={[{ label: 'Staff' }]}
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add Staff
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonCard />
      ) : staff?.length === 0 ? (
        <EmptyState icon={UserCog} title="No staff accounts" description="Create your first staff account." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff?.map((member) => (
            <Card key={member._id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{member.fullName}</p>
                      {user?.id === member._id && <Badge variant="primary">You</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                  </div>
                  <Badge variant={member.isActive ? 'success' : 'default'}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {getDepartmentName(member.departmentId)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {SUB_ROLE_LABELS[member.staffSubRole] || member.staffSubRole}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(member)}>
                    Edit
                  </Button>
                  {member.isActive ? (
                    <Button variant="outline" size="sm" onClick={() => handleDeactivate(member)}>
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleActivate(member)}
                      isLoading={activateMutation.isPending}
                    >
                      Reactivate
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(member)}>
                    Delete
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
        title={editing ? 'Edit Staff' : 'Add Staff'}
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
            label="Full Name"
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          {!editing && (
            <PasswordInput
              label="Password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          )}
          <Select
            label="Department"
            required
            value={form.departmentId}
            onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
          >
            <option value="">Unassigned</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.departmentName}
              </option>
            ))}
          </Select>
          <Select
            label="Sub Role"
            value={form.staffSubRole}
            onChange={(e) => setForm((f) => ({ ...f, staffSubRole: e.target.value }))}
          >
            {Object.entries(SUB_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Office Location"
            value={form.officeLocation}
            onChange={(e) => setForm((f) => ({ ...f, officeLocation: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete staff account"
        description={`Are you sure you want to permanently delete ${deleteTarget?.fullName || 'this staff member'}'s account? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
