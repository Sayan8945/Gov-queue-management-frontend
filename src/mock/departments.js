// Mock department + service seed data
// TODO(backend): Replace with GET /api/departments from Express/MongoDB service

export const departments = [
  {
    id: 'dept-1',
    name: 'Passport & Immigration',
    code: 'PSP',
    description: 'Passport issuance, renewal, and immigration services',
    icon: 'BookUser',
    isActive: true,
    services: [
      { id: 'svc-1', name: 'New Passport Application', durationMins: 20, departmentId: 'dept-1' },
      { id: 'svc-2', name: 'Passport Renewal', durationMins: 15, departmentId: 'dept-1' },
      { id: 'svc-3', name: 'Visa Consultation', durationMins: 25, departmentId: 'dept-1' },
    ],
  },
  {
    id: 'dept-2',
    name: 'Motor Vehicle & Licensing',
    code: 'MVL',
    description: 'Driving licenses, vehicle registration and permits',
    icon: 'Car',
    isActive: true,
    services: [
      { id: 'svc-4', name: 'Driving License Renewal', durationMins: 15, departmentId: 'dept-2' },
      { id: 'svc-5', name: 'New Vehicle Registration', durationMins: 30, departmentId: 'dept-2' },
      { id: 'svc-6', name: 'Learner Permit', durationMins: 20, departmentId: 'dept-2' },
    ],
  },
  {
    id: 'dept-3',
    name: 'Civil Registry',
    code: 'CVR',
    description: 'Birth, death, and marriage certificates',
    icon: 'FileText',
    isActive: true,
    services: [
      { id: 'svc-7', name: 'Birth Certificate', durationMins: 10, departmentId: 'dept-3' },
      { id: 'svc-8', name: 'Marriage Certificate', durationMins: 20, departmentId: 'dept-3' },
      { id: 'svc-9', name: 'Death Certificate', durationMins: 10, departmentId: 'dept-3' },
    ],
  },
  {
    id: 'dept-4',
    name: 'Taxation & Revenue',
    code: 'TAX',
    description: 'Tax filing, payments, and property assessments',
    icon: 'Landmark',
    isActive: true,
    services: [
      { id: 'svc-10', name: 'Property Tax Payment', durationMins: 15, departmentId: 'dept-4' },
      { id: 'svc-11', name: 'Income Tax Filing Help', durationMins: 25, departmentId: 'dept-4' },
      { id: 'svc-12', name: 'Tax Clearance Certificate', durationMins: 20, departmentId: 'dept-4' },
    ],
  },
  {
    id: 'dept-5',
    name: 'Social Welfare',
    code: 'SWD',
    description: 'Pension, benefits, and welfare scheme enrollment',
    icon: 'HeartHandshake',
    isActive: true,
    services: [
      { id: 'svc-13', name: 'Pension Enrollment', durationMins: 20, departmentId: 'dept-5' },
      { id: 'svc-14', name: 'Disability Benefits', durationMins: 25, departmentId: 'dept-5' },
      { id: 'svc-15', name: 'Welfare Scheme Application', durationMins: 20, departmentId: 'dept-5' },
    ],
  },
];

export const allServices = departments.flatMap((d) => d.services);

export const getDepartmentById = (id) => departments.find((d) => d.id === id);
export const getServiceById = (id) => allServices.find((s) => s.id === id);
export const getServicesByDepartment = (deptId) =>
  allServices.filter((s) => s.departmentId === deptId);
