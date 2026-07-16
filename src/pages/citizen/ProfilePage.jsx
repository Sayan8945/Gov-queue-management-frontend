import { UserCircle, Mail, Phone } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="My Profile" breadcrumbItems={[{ label: 'Profile' }]} />

      <Card>
        <CardBody className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
            <UserCircle className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h2>
          <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{user?.role}</p>

          <div className="mt-6 w-full space-y-3 border-t border-gray-100 pt-6 text-left dark:border-gray-700">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <Mail className="h-4 w-4 text-gray-400" /> {user?.email}
            </div>
            {user?.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <Phone className="h-4 w-4 text-gray-400" /> {user.phone}
              </div>
            )}
          </div>

          {/* TODO(backend): wire up profile edit + password change against real API */}
        </CardBody>
      </Card>
    </div>
  );
}
