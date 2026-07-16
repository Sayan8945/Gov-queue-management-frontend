// Mock office/branch seed data. Supports the "multiple offices" scalability
// requirement — departments are scoped to an office so the same catalog and
// queue engine can serve several physical locations.
// TODO(backend): Replace with GET /api/offices from Express/MongoDB service

export const offices = [
  {
    id: 'office-1',
    name: 'Central City Civic Center',
    city: 'Central City',
    address: '1 Government Plaza, Central City',
  },
  {
    id: 'office-2',
    name: 'Eastside Service Hub',
    city: 'Eastside',
    address: '45 Riverside Road, Eastside',
  },
];

export const getOfficeById = (id) => offices.find((o) => o.id === id);
