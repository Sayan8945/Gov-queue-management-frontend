// Role and permission constants used across auth, routing, and UI

export const ROLES = {
  CITIZEN: 'citizen',
  STAFF: 'staff',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.CITIZEN]: 'Citizen',
  [ROLES.STAFF]: 'Staff / Counter Operator',
  [ROLES.ADMIN]: 'Administrator',
};

export const ROLE_HOME_ROUTE = {
  [ROLES.CITIZEN]: '/citizen/home',
  [ROLES.STAFF]: '/staff/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};
