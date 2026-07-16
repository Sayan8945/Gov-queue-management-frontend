import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { departments as seedDepartments } from '@/mock/departments';

// Single source of truth for departments + services. Admin CRUD (Departments,
// Services, Token Limits, Service Timings pages) mutates this store, and every
// other part of the app (booking flow, queue engine, reports, public display)
// reads from it — so admin changes actually take effect app-wide.
// TODO(backend): replace with real CRUD against /api/departments and /api/services.

const DEFAULT_OPERATING_HOURS = { openHour: 9, closeHour: 17, slotMins: 30 };
const DEFAULT_TOKEN_LIMIT = 50;
const DEFAULT_SLOT_CAPACITY = 3;

function seedState() {
  const departments = seedDepartments.map((dept, idx) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    icon: dept.icon,
    isActive: dept.isActive,
    officeId: idx % 2 === 0 ? 'office-1' : 'office-2',
    tokenLimit: DEFAULT_TOKEN_LIMIT,
    slotCapacity: DEFAULT_SLOT_CAPACITY,
    operatingHours: { ...DEFAULT_OPERATING_HOURS },
  }));

  const services = seedDepartments.flatMap((dept) =>
    dept.services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      durationMins: svc.durationMins,
      departmentId: dept.id,
    }))
  );

  return { departments, services };
}

export const useCatalogStore = create(
  persist(
    (set, get) => ({
      ...seedState(),

      // ---------- Selectors ----------
      getDepartmentById: (id) => get().departments.find((d) => d.id === id),
      getServiceById: (id) => get().services.find((s) => s.id === id),
      getServicesByDepartment: (deptId) => get().services.filter((s) => s.departmentId === deptId),
      getDepartmentsByOffice: (officeId) =>
        officeId ? get().departments.filter((d) => d.officeId === officeId) : get().departments,
      getActiveDepartments: () => get().departments.filter((d) => d.isActive),

      // Composed shape (department + its services) for consumers that expect
      // the old nested mock/departments.js shape.
      getDepartmentWithServices: (id) => {
        const dept = get().getDepartmentById(id);
        if (!dept) return null;
        return { ...dept, services: get().getServicesByDepartment(id) };
      },
      getAllDepartmentsWithServices: () =>
        get().departments.map((d) => ({ ...d, services: get().getServicesByDepartment(d.id) })),

      // ---------- Department CRUD ----------
      addDepartment: (payload) => {
        const dept = {
          id: `dept-${Date.now()}`,
          isActive: true,
          icon: 'Building2',
          officeId: 'office-1',
          tokenLimit: DEFAULT_TOKEN_LIMIT,
          slotCapacity: DEFAULT_SLOT_CAPACITY,
          operatingHours: { ...DEFAULT_OPERATING_HOURS },
          ...payload,
        };
        set((state) => ({ departments: [...state.departments, dept] }));
        return dept;
      },

      updateDepartment: (id, patch) => {
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
      },

      toggleDepartmentActive: (id) => {
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)),
        }));
      },

      setTokenLimit: (id, tokenLimit) => {
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, tokenLimit } : d)),
        }));
      },

      setOperatingHours: (id, operatingHours) => {
        set((state) => ({
          departments: state.departments.map((d) =>
            d.id === id ? { ...d, operatingHours: { ...d.operatingHours, ...operatingHours } } : d
          ),
        }));
      },

      // ---------- Service CRUD ----------
      addService: (payload) => {
        const service = { id: `svc-${Date.now()}`, ...payload };
        set((state) => ({ services: [...state.services, service] }));
        return service;
      },

      updateService: (id, patch) => {
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }));
      },

      removeService: (id) => {
        set((state) => ({ services: state.services.filter((s) => s.id !== id) }));
      },
    }),
    { name: 'gq_catalog_storage' }
  )
);

// Non-reactive helpers for use outside React components / inside other stores
// (mirrors the pattern used by queueStore for cross-store lookups).
export const getDepartmentById = (id) => useCatalogStore.getState().getDepartmentById(id);
export const getServiceById = (id) => useCatalogStore.getState().getServiceById(id);
export const getServicesByDepartment = (deptId) => useCatalogStore.getState().getServicesByDepartment(deptId);
