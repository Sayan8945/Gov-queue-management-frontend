// Mock department/service API. Mirrors the shape of a real REST resource so the
// swap to Express is a drop-in replacement. Reads from catalogStore so admin
// changes (add/edit/deactivate departments & services) are reflected immediately.
// TODO(backend): Replace body of each function with httpClient.get/post calls, e.g.
//   export const fetchDepartments = () => httpClient.get('/departments').then(r => r.data)

import { useCatalogStore } from '@/store/catalogStore';
import { simulateRequest } from './mockApiClient';

export const fetchDepartments = () =>
  simulateRequest(useCatalogStore.getState().getAllDepartmentsWithServices().filter((d) => d.isActive));

export const fetchAllDepartments = () =>
  simulateRequest(useCatalogStore.getState().getAllDepartmentsWithServices());

export const fetchDepartmentById = (id) =>
  simulateRequest(useCatalogStore.getState().getDepartmentWithServices(id));

export const fetchServicesByDepartment = (departmentId) =>
  simulateRequest(useCatalogStore.getState().getServicesByDepartment(departmentId));
