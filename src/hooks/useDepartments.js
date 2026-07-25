import { useQuery } from '@tanstack/react-query';
import {
  fetchDepartments,
  fetchServicesByDepartment,
  fetchServiceAvailability,
  fetchCountersByDepartment,
} from '@/services/departmentService';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 60 * 1000,
  });
}

export function useServicesByDepartment(departmentId) {
  return useQuery({
    queryKey: ['departments', departmentId, 'services'],
    queryFn: () => fetchServicesByDepartment(departmentId),
    enabled: Boolean(departmentId),
  });
}

export function useServiceAvailability(serviceId) {
  return useQuery({
    queryKey: ['services', serviceId, 'availability'],
    queryFn: () => fetchServiceAvailability(serviceId),
    enabled: Boolean(serviceId),
    refetchInterval: 15000,
  });
}

export function useCountersByDepartment(departmentId) {
  return useQuery({
    queryKey: ['departments', departmentId, 'counters'],
    queryFn: () => fetchCountersByDepartment(departmentId),
    enabled: Boolean(departmentId),
    refetchInterval: 10000,
  });
}
