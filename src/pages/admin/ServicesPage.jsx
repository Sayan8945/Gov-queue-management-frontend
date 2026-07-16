import { useState } from 'react';
import { Plus, Trash2, ClipboardList, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { useCatalogStore } from '@/store/catalogStore';

// Services are stored in catalogStore so booking, staff, and reporting screens
// immediately reflect admin changes.
export default function ServicesPage() {
  const departments = useCatalogStore((s) => s.departments);
  const services = useCatalogStore((s) => s.services);
  const addService = useCatalogStore((s) => s.addService);
  const updateService = useCatalogStore((s) => s.updateService);
  const removeService = useCatalogStore((s) => s.removeService);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', departmentId: departments[0]?.id, durationMins: 15 });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', departmentId: departments[0]?.id, durationMins: 15 });
    setIsModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditing(svc);
    setForm({ name: svc.name, departmentId: svc.departmentId, durationMins: svc.durationMins });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name) {
      toast.error('Service name is required');
      return;
    }
    const payload = { ...form, durationMins: Number(form.durationMins) };
    if (editing) {
      updateService(editing.id, payload);
      toast.success('Service updated');
    } else {
      addService(payload);
      toast.success('Service added');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    removeService(id);
    toast.success('Service removed');
  };

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
        {services.length === 0 ? (
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
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {services.map((svc) => {
                  const dept = departments.find((d) => d.id === svc.departmentId);
                  return (
                    <tr key={svc.id}>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{svc.name}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{dept?.name}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{svc.durationMins} min</td>
                      <td className="px-5 py-3 text-right">
                        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(svc)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(svc.id)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Service Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Department"
            value={form.departmentId}
            onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Input
            label="Average Duration (minutes)"
            type="number"
            min={5}
            value={form.durationMins}
            onChange={(e) => setForm((f) => ({ ...f, durationMins: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
