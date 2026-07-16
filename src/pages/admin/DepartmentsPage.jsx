import { useState } from 'react';
import { Plus, Pencil, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { useCatalogStore } from '@/store/catalogStore';
import { offices } from '@/mock/offices';

export default function DepartmentsPage() {
  const departments = useCatalogStore((s) => s.departments);
  const addDepartment = useCatalogStore((s) => s.addDepartment);
  const updateDepartment = useCatalogStore((s) => s.updateDepartment);
  const toggleDepartmentActive = useCatalogStore((s) => s.toggleDepartmentActive);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', officeId: offices[0]?.id });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '', officeId: offices[0]?.id });
    setIsModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description, officeId: dept.officeId });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) {
      toast.error('Name and code are required');
      return;
    }
    if (editing) {
      updateDepartment(editing.id, form);
      toast.success('Department updated');
    } else {
      addDepartment(form);
      toast.success('Department created');
    }
    setIsModalOpen(false);
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

      {departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments" description="Create your first department." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const office = offices.find((o) => o.id === dept.officeId);
            return (
              <Card key={dept.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{dept.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dept.code}</p>
                    </div>
                    <Badge variant={dept.isActive ? 'success' : 'default'}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{dept.description}</p>
                  <p className="mt-2 text-xs text-gray-400">{office?.name}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Token limit: {dept.tokenLimit}/day · {dept.operatingHours.openHour}:00–
                    {dept.operatingHours.closeHour}:00
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(dept)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleDepartmentActive(dept.id)}>
                      {dept.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
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
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Code"
            required
            placeholder="e.g. PSP"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Office / Branch"
            value={form.officeId}
            onChange={(e) => setForm((f) => ({ ...f, officeId: e.target.value }))}
          >
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
