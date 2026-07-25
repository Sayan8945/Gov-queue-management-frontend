import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as adminService from '@/services/adminService';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';

function useAdminQuery(key, queryFn, options) {
  return useQuery({ queryKey: key, queryFn, ...options });
}

// Every admin mutation that succeeds also drops an entry into the admin's
// own in-app notification center (bell + /admin/notifications), so the
// admin has a running log of every action they've taken — not just a
// toast that disappears in a few seconds.
function useAdminMutation(mutationFn, invalidateKeys, successMessage) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      if (successMessage) {
        toast.success(successMessage);
        addNotification({
          recipientId: user?.id,
          title: 'Action completed',
          message: successMessage,
          type: 'success',
          channel: 'push',
        });
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Action failed');
    },
  });
}

// ---------- Departments ----------
export const useAdminDepartments = () => useAdminQuery(['admin', 'departments'], adminService.fetchAllDepartments);
export const useCreateDepartment = () =>
  useAdminMutation(adminService.createDepartment, [['admin', 'departments'], ['departments']], 'Department created');
export const useUpdateDepartment = () =>
  useAdminMutation(
    ({ id, payload }) => adminService.updateDepartment(id, payload),
    [['admin', 'departments'], ['departments']],
    'Department updated'
  );
export const useDeleteDepartment = () =>
  useAdminMutation(adminService.deleteDepartment, [['admin', 'departments'], ['departments']], 'Department deleted');

// ---------- Services ----------
export const useAdminServices = () => useAdminQuery(['admin', 'services'], adminService.fetchAllServices);
export const useCreateService = () =>
  useAdminMutation(adminService.createService, [['admin', 'services'], ['departments']], 'Service created');
export const useUpdateService = () =>
  useAdminMutation(
    ({ id, payload }) => adminService.updateService(id, payload),
    [['admin', 'services'], ['departments']],
    'Service updated'
  );
export const useDeleteService = () =>
  useAdminMutation(adminService.deleteService, [['admin', 'services'], ['departments']], 'Service removed');

// ---------- Counters ----------
export const useAdminCounters = () => useAdminQuery(['admin', 'counters'], adminService.fetchAllCounters);
export const useCreateCounter = () =>
  useAdminMutation(adminService.createCounter, [['admin', 'counters']], 'Counter added');
export const useUpdateCounter = () =>
  useAdminMutation(
    ({ id, payload }) => adminService.updateCounter(id, payload),
    [['admin', 'counters']],
    'Counter updated'
  );
export const useDeleteCounter = () =>
  useAdminMutation(adminService.deleteCounter, [['admin', 'counters']], 'Counter removed');
export const useAssignStaffToCounter = () =>
  useAdminMutation(
    ({ counterId, staffId }) => adminService.assignStaffToCounter(counterId, staffId),
    [['admin', 'counters'], ['admin', 'staff']],
    'Staff assigned to counter'
  );

// ---------- Staff ----------
export const useAdminStaff = () => useAdminQuery(['admin', 'staff'], adminService.fetchAllStaff);
export const useCreateStaff = () =>
  useAdminMutation(adminService.createStaff, [['admin', 'staff']], 'Staff account created');
export const useUpdateStaff = () =>
  useAdminMutation(
    ({ id, payload }) => adminService.updateStaff(id, payload),
    [['admin', 'staff']],
    'Staff account updated'
  );
export const useDeactivateStaff = () =>
  useAdminMutation(adminService.deactivateStaff, [['admin', 'staff']], 'Staff deactivated');
export const useActivateStaff = () =>
  useAdminMutation(adminService.activateStaff, [['admin', 'staff']], 'Staff reactivated');
export const useDeleteStaffAccount = () =>
  useAdminMutation(adminService.deleteStaff, [['admin', 'staff']], 'Staff deleted');

// ---------- Priority Queue ----------
export const useAllWaitingTokens = () =>
  useAdminQuery(['admin', 'priority-queue'], adminService.fetchAllWaitingTokens, { refetchInterval: 10000 });
export const useExpediteToken = () =>
  useAdminMutation(adminService.expediteToken, [['admin', 'priority-queue']], 'Token expedited to front of queue');
