// Token lifecycle status constants

// Mirrors Server/src/constants/tokenStatus.js exactly — the frontend must
// never define its own status/priority vocabulary since MongoDB is the
// single source of truth.

export const TOKEN_STATUS = {
  WAITING: 'waiting',
  APPROACHING: 'approaching',
  CALLED: 'called',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SKIPPED: 'skipped',
  NO_SHOW: 'no_show',
};

export const TOKEN_STATUS_LABELS = {
  [TOKEN_STATUS.WAITING]: 'Waiting',
  [TOKEN_STATUS.APPROACHING]: 'Approaching',
  [TOKEN_STATUS.CALLED]: 'Called',
  [TOKEN_STATUS.IN_PROGRESS]: 'In Progress',
  [TOKEN_STATUS.COMPLETED]: 'Completed',
  [TOKEN_STATUS.SKIPPED]: 'Skipped',
  [TOKEN_STATUS.CANCELLED]: 'Cancelled',
  [TOKEN_STATUS.NO_SHOW]: 'No Show',
};

export const TOKEN_STATUS_COLORS = {
  [TOKEN_STATUS.WAITING]: 'bg-amber-100 text-amber-800 border-amber-200',
  [TOKEN_STATUS.APPROACHING]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TOKEN_STATUS.CALLED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TOKEN_STATUS.IN_PROGRESS]: 'bg-primary-100 text-primary-800 border-primary-200',
  [TOKEN_STATUS.COMPLETED]: 'bg-success-100 text-success-700 border-success-200',
  [TOKEN_STATUS.SKIPPED]: 'bg-gray-100 text-gray-700 border-gray-200',
  [TOKEN_STATUS.CANCELLED]: 'bg-danger-100 text-danger-700 border-danger-200',
  [TOKEN_STATUS.NO_SHOW]: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const PRIORITY_LEVELS = {
  NORMAL: 'normal',
  SENIOR_CITIZEN: 'senior_citizen',
  DISABLED: 'disabled',
  PREGNANT: 'pregnant',
  EMERGENCY: 'emergency',
  VIP: 'vip',
};

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.NORMAL]: 'General',
  [PRIORITY_LEVELS.SENIOR_CITIZEN]: 'Senior Citizen',
  [PRIORITY_LEVELS.DISABLED]: 'Person with Disability',
  [PRIORITY_LEVELS.PREGNANT]: 'Pregnant / Nursing',
  [PRIORITY_LEVELS.EMERGENCY]: 'Emergency',
  [PRIORITY_LEVELS.VIP]: 'VIP',
};

export const PRIORITY_WEIGHT = {
  [PRIORITY_LEVELS.VIP]: 5,
  [PRIORITY_LEVELS.EMERGENCY]: 4,
  [PRIORITY_LEVELS.DISABLED]: 3,
  [PRIORITY_LEVELS.PREGNANT]: 3,
  [PRIORITY_LEVELS.SENIOR_CITIZEN]: 2,
  [PRIORITY_LEVELS.NORMAL]: 1,
};

export const COUNTER_STATUS = {
  ACTIVE: 'active',
  BREAK: 'break',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
};
