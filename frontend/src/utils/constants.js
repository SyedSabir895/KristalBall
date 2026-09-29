export const ROLES = {
  ADMIN: 'ADMIN',
  BASE_COMMANDER: 'BASE_COMMANDER',
  LOGISTICS_OFFICER: 'LOGISTICS_OFFICER',
};

export const ROLE_LABELS = {
  ADMIN: 'Admin',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer',
};

// Must match the equipment_category enum in schema.sql
export const CATEGORIES = [
  { value: 'WEAPON', label: 'Weapons' },
  { value: 'VEHICLE', label: 'Vehicles' },
  { value: 'AMMUNITION', label: 'Ammunition' },
  { value: 'OTHER', label: 'Other' },
];

// Seeded accounts, shown on the login page for quick testing
export const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@mams.com' },
  { label: 'Commander (Alpha)', email: 'alpha@mams.com' },
  { label: 'Logistics', email: 'logistics@mams.com' },
];
export const DEMO_PASSWORD = 'password123';
