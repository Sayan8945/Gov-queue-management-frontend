import { useState } from 'react';
import { Plus, Trash2, MonitorCog } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { useCatalogStore } from '@/store/catalogStore';
import { useQueueStore } from '@/store/queueStore';
import { COUNTER_STATUS } from '@/constants/tokenStatus';

export default function CountersPage() {
  const departments = useCatalogStore((s) => s.departments);
  const counters = useQueueStore((s) => s.counters);
  const addCounter = useQueueStore((s) => s.addCounter);
  const removeCounter = useQueueStore((s) => s.removeCounter);
  const pauseCounter = useQueueStore((s) => s.pauseCounter);
  const resumeCounter = useQueueStore((s) => s.resumeCounter);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ number: '', departmentId: departments[0]?.id });

  const handleCreate = () => {
    if (!form.number) {
      toast.error('Counter number is required');
      return;
    }
    addCounter({ number: form.number, departmentId: form.departmentId, staffId: null });
    toast.success('Counter added');
    setIsModalOpen(false);
    setForm({ number: '', departmentId: departments[0]?.id });
  };

  const handleDelete = (id) => {
    removeCounter(id);
    toast.success('Counter removed');
  };

  return (
    <div>
      <PageHeader
        title="Counter Management"
        breadcrumbItems={[{ label: 'Counters' }]}
        actions={
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Counter
          </Button>
        }
      />

      {counters.length === 0 ? (
        <EmptyState icon={MonitorCog} title="No counters" description="Add a counter to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counters.map((counter) => {
            const dept = departments.find((d) => d.id === counter.departmentId);
            return (
              <Card key={counter.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{counter.number}</p>
                  <Badge
                    variant={
                      counter.status === COUNTER_STATUS.ACTIVE
                        ? 'success'
                        : counter.status === COUNTER_STATUS.PAUSED
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {counter.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{dept?.name}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {counter.staffId ? `Staff: ${counter.staffId}` : 'Unassigned'}
                </p>
                <div className="mt-4 flex gap-2">
                  {counter.status === COUNTER_STATUS.PAUSED ? (
                    <Button size="sm" variant="success" onClick={() => resumeCounter(counter.id)}>
                      Resume
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => pauseCounter(counter.id)}>
                      Pause
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => handleDelete(counter.id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
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
            <Button onClick={handleCreate}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Counter Number"
            placeholder="e.g. C-07"
            required
            value={form.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
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
        </div>
      </Modal>
    </div>
  );
}
