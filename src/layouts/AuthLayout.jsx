import { Outlet, useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md dark:text-gray-400 dark:hover:text-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600">
            <Landmark className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Smart Queue System</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Government Services Token & Queue Management
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
