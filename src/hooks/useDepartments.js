import { useQuery } from '@tanstack/react-query';
import {
  fetchDepartments,
  fetchAllDepartments,
  fetchDepartmentById,
  fetchServicesByDepartment,
} from '@/services/departmentService';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllDepartments() {
  return useQuery({
    queryKey: ['departments', 'all'],
    queryFn: fetchAllDepartments,
    staleTime: 60 * 1000,
  });
}

export function useDepartment(departmentId) {
  return useQuery({
    queryKey: ['departments', departmentId],
    queryFn: () => fetchDepartmentById(departmentId),
    enabled: Boolean(departmentId),
  });
}

export function useServicesByDepartment(departmentId) {
  return useQuery({
    queryKey: ['departments', departmentId, 'services'],
    queryFn: () => fetchServicesByDepartment(departmentId),
    enabled: Boolean(departmentId),
  });
}
