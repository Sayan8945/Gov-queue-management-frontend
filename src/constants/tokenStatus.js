// Token lifecycle status constants

export const TOKEN_STATUS = {
  WAITING: 'waiting',
  CALLED: 'called',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const TOKEN_STATUS_LABELS = {
  [TOKEN_STATUS.WAITING]: 'Waiting',
  [TOKEN_STATUS.CALLED]: 'Called',
  [TOKEN_STATUS.IN_PROGRESS]: 'In Progress',
  [TOKEN_STATUS.COMPLETED]: 'Completed',
  [TOKEN_STATUS.SKIPPED]: 'Skipped',
  [TOKEN_STATUS.CANCELLED]: 'Cancelled',
  [TOKEN_STATUS.NO_SHOW]: 'No Show',
};

export const TOKEN_STATUS_COLORS = {
  [TOKEN_STATUS.WAITING]: 'bg-amber-100 text-amber-800 border-amber-200',
  [TOKEN_STATUS.CALLED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TOKEN_STATUS.IN_PROGRESS]: 'bg-primary-100 text-primary-800 border-primary-200',
  [TOKEN_STATUS.COMPLETED]: 'bg-success-100 text-success-700 border-success-200',
  [TOKEN_STATUS.SKIPPED]: 'bg-gray-100 text-gray-700 border-gray-200',
  [TOKEN_STATUS.CANCELLED]: 'bg-danger-100 text-danger-700 border-danger-200',
  [TOKEN_STATUS.NO_SHOW]: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const PRIORITY_LEVELS = {
  NORMAL: 'normal',
  SENIOR: 'senior',
  DISABLED: 'disabled',
  PREGNANT: 'pregnant',
  EMERGENCY: 'emergency',
};

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.NORMAL]: 'General',
  [PRIORITY_LEVELS.SENIOR]: 'Senior Citizen',
  [PRIORITY_LEVELS.DISABLED]: 'Person with Disability',
  [PRIORITY_LEVELS.PREGNANT]: 'Pregnant / Nursing',
  [PRIORITY_LEVELS.EMERGENCY]: 'Emergency',
};

export const PRIORITY_WEIGHT = {
  [PRIORITY_LEVELS.EMERGENCY]: 4,
  [PRIORITY_LEVELS.DISABLED]: 3,
  [PRIORITY_LEVELS.PREGNANT]: 3,
  [PRIORITY_LEVELS.SENIOR]: 2,
  [PRIORITY_LEVELS.NORMAL]: 1,
};

export const COUNTER_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  OFFLINE: 'offline',
};
