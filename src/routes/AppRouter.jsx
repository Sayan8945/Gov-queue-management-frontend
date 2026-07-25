import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage';
import NotFoundPage from '@/pages/NotFoundPage';

import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import VerifyResetOtpPage from '@/pages/auth/VerifyResetOtpPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

import CitizenLayout from '@/layouts/CitizenLayout';
import CitizenHomePage from '@/pages/citizen/CitizenHomePage';
import BookTokenPage from '@/pages/citizen/BookTokenPage';
import TokenConfirmationPage from '@/pages/citizen/TokenConfirmationPage';
import MyTokensPage from '@/pages/citizen/MyTokensPage';
import TokenDetailsPage from '@/pages/citizen/TokenDetailsPage';
import ReschedulePage from '@/pages/citizen/ReschedulePage';
import HistoryPage from '@/pages/citizen/HistoryPage';
import NotificationsPage from '@/pages/shared/NotificationsPage';
import ProfilePage from '@/pages/citizen/ProfilePage';

import StaffLayout from '@/layouts/StaffLayout';
import StaffDashboardPage from '@/pages/staff/StaffDashboardPage';
import StaffQueueMonitorPage from '@/pages/staff/StaffQueueMonitorPage';
import StaffDepartmentsPage from '@/pages/staff/StaffDepartmentsPage';

import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import DepartmentsPage from '@/pages/admin/DepartmentsPage';
import ServicesPage from '@/pages/admin/ServicesPage';
import CountersPage from '@/pages/admin/CountersPage';
import StaffPage from '@/pages/admin/StaffPage';
import TokenLimitsPage from '@/pages/admin/TokenLimitsPage';
import PriorityQueuePage from '@/pages/admin/PriorityQueuePage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import ReportsPage from '@/pages/admin/ReportsPage';

import PublicDisplayPage from '@/pages/display/PublicDisplayPage';

import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '@/constants/roles';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/display', element: <PublicDisplayPage /> },

  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/verify-reset-otp', element: <VerifyResetOtpPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={[ROLES.CITIZEN]} />,
    children: [
      {
        element: <CitizenLayout />,
        children: [
          { path: '/citizen/home', element: <CitizenHomePage /> },
          { path: '/citizen/book', element: <BookTokenPage /> },
          { path: '/citizen/tokens', element: <MyTokensPage /> },
          { path: '/citizen/tokens/:tokenId', element: <TokenDetailsPage /> },
          { path: '/citizen/tokens/:tokenId/confirmation', element: <TokenConfirmationPage /> },
          { path: '/citizen/tokens/:tokenId/reschedule', element: <ReschedulePage /> },
          { path: '/citizen/history', element: <HistoryPage /> },
          { path: '/citizen/notifications', element: <NotificationsPage /> },
          { path: '/citizen/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={[ROLES.STAFF]} />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { path: '/staff/dashboard', element: <StaffDashboardPage /> },
          { path: '/staff/queue', element: <StaffQueueMonitorPage /> },
          { path: '/staff/departments', element: <StaffDepartmentsPage /> },
          { path: '/staff/notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboardPage /> },
          { path: '/admin/departments', element: <DepartmentsPage /> },
          { path: '/admin/services', element: <ServicesPage /> },
          { path: '/admin/counters', element: <CountersPage /> },
          { path: '/admin/staff', element: <StaffPage /> },
          { path: '/admin/token-limits', element: <TokenLimitsPage /> },
          { path: '/admin/priority-queue', element: <PriorityQueuePage /> },
          { path: '/admin/analytics', element: <AnalyticsPage /> },
          { path: '/admin/reports', element: <ReportsPage /> },
          { path: '/admin/notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
