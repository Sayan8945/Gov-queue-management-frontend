import { Link } from 'react-router-dom';
import { Landmark, Ticket, MonitorPlay, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME_ROUTE } from '@/constants/roles';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-gray-900 dark:text-gray-50">Smart Queue System</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/display">
              <Button variant="ghost" size="sm" icon={MonitorPlay}>
                Public Display
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to={ROLE_HOME_ROUTE[user.role]}>
                <Button size="sm">Go to dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-5xl">
            Skip the physical line.
            <br />
            Book your token online.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500 dark:text-gray-400">
            The Government Smart Queue &amp; Token Management System lets citizens book service
            appointments, track queue position in real time, and get notified when it&apos;s their turn.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" icon={Ticket}>
                Book a Token
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Staff / Admin Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={Ticket}
            title="Online Token Booking"
            description="Choose a department, service, and time slot without visiting in person."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Priority & Fair Queuing"
            description="Senior citizens, persons with disabilities, and emergencies are served fairly."
          />
          <FeatureCard
            icon={MonitorPlay}
            title="Live Public Display"
            description="Large-screen display shows the current token, counter, and next in line."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
