import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useCatalogStore } from '@/store/catalogStore';

// Configures daily token limits and service timings (operating hours) per
// department. Both are enforced live: queueStore.createToken() rejects new
// tokens once tokenLimit is reached, and SlotPicker reads operatingHours.
// TODO(backend): persist via PUT /api/departments/:id/settings
export default function TokenLimitsPage() {
  const departments = useCatalogStore((s) => s.departments);
  const setTokenLimit = useCatalogStore((s) => s.setTokenLimit);
  const setOperatingHours = useCatalogStore((s) => s.setOperatingHours);

  const handleSave = () => {
    toast.success('Token limits and service timings saved');
  };

  return (
    <div>
      <PageHeader
        title="Token Limits & Service Timings"
        description="Set the maximum number of tokens issued per day and operating hours for each department."
        breadcrumbItems={[{ label: 'Token Limits' }]}
        actions={
          <Button icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Department Settings</CardTitle>
        </CardHeader>
        <CardBody className="space-y-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="grid gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0 sm:grid-cols-4 dark:border-gray-700"
            >
              <div className="sm:col-span-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dept.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{dept.code}</p>
              </div>
              <Input
                label="Daily Token Limit"
                type="number"
                min={1}
                value={dept.tokenLimit}
                onChange={(e) => setTokenLimit(dept.id, Number(e.target.value))}
              />
              <Input
                label="Opening Hour"
                type="number"
                min={0}
                max={23}
                value={dept.operatingHours.openHour}
                onChange={(e) =>
                  setOperatingHours(dept.id, { openHour: Number(e.target.value) })
                }
              />
              <Input
                label="Closing Hour"
                type="number"
                min={0}
                max={23}
                value={dept.operatingHours.closeHour}
                onChange={(e) =>
                  setOperatingHours(dept.id, { closeHour: Number(e.target.value) })
                }
              />
              <Input
                label="Slot Length (min)"
                type="number"
                min={5}
                step={5}
                value={dept.operatingHours.slotMins}
                onChange={(e) =>
                  setOperatingHours(dept.id, { slotMins: Number(e.target.value) })
                }
              />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
