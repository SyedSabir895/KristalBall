import api from './client';

// Drop empty filters so the URL stays clean: { base_id: '', category: 'WEAPON' } → { category: 'WEAPON' }
function clean(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
}

const get = (url, params) => api.get(url, { params: clean(params) }).then((r) => r.data);
const post = (url, body) => api.post(url, body).then((r) => r.data);

// One object per backend resource → pages never write URLs themselves
export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
  me: () => get('/auth/me'),
};

export const lookupApi = {
  bases: () => get('/lookup/bases'),
  equipmentTypes: () => get('/lookup/equipment-types'),
  stock: (base_id, equipment_type_id) => get('/lookup/stock', { base_id, equipment_type_id }),
};

export const dashboardApi = {
  summary: (filters) => get('/dashboard', filters),
  netMovement: (filters) => get('/dashboard/net-movement', filters),
};

export const purchaseApi = {
  list: (filters) => get('/purchases', filters),
  create: (body) => post('/purchases', body),
};

export const transferApi = {
  list: (filters) => get('/transfers', filters),
  create: (body) => post('/transfers', body),
};

export const assignmentApi = {
  list: (filters) => get('/assignments', filters),
  create: (body) => post('/assignments', body),
};

export const expenditureApi = {
  list: (filters) => get('/expenditures', filters),
  create: (body) => post('/expenditures', body),
};

export const auditApi = {
  list: (filters) => get('/audit-logs', filters),
};
