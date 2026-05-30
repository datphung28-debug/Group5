import axios from 'axios';

// Tạo axios instance với base URL trỏ tới backend
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: tự động đính kèm token JWT
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (zustand persist)
    const authData = localStorage.getItem('gpp-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý lỗi 401 (hết hạn token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa auth state và redirect về login
      localStorage.removeItem('gpp-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Medicines ─────────────────────────────────────────────────────────────
export const medicineAPI = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  getExpiring: (days = 90) => api.get('/medicines/expiring', { params: { days } }),
};

// ─── Config (Categories / Suppliers / Units) ────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/config/categories'),
  create: (data) => api.post('/config/categories', data),
  update: (id, data) => api.put(`/config/categories/${id}`, data),
  delete: (id) => api.delete(`/config/categories/${id}`),
};

export const supplierAPI = {
  getAll: (params) => api.get('/config/suppliers', { params }),
  getById: (id) => api.get(`/config/suppliers/${id}`),
  create: (data) => api.post('/config/suppliers', data),
  update: (id, data) => api.put(`/config/suppliers/${id}`, data),
  delete: (id) => api.delete(`/config/suppliers/${id}`),
};

export const unitAPI = {
  getAll: () => api.get('/config/units'),
  create: (data) => api.post('/config/units', data),
  update: (id, data) => api.put(`/config/units/${id}`, data),
  delete: (id) => api.delete(`/config/units/${id}`),
};

// ─── Customers ─────────────────────────────────────────────────────────────
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// ─── Sales ─────────────────────────────────────────────────────────────────
export const saleAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
};

// ─── Imports ───────────────────────────────────────────────────────────────
export const importAPI = {
  getAll: (params) => api.get('/imports', { params }),
  getById: (id) => api.get(`/imports/${id}`),
  create: (data) => api.post('/imports', data),
};

// ─── Cashbook ──────────────────────────────────────────────────────────────
export const cashbookAPI = {
  getAll: (params) => api.get('/cashbook', { params }),
  create: (data) => api.post('/cashbook', data),
};

// ─── Prescriptions ─────────────────────────────────────────────────────────
export const prescriptionAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
};

// ─── Reports ───────────────────────────────────────────────────────────────
export const reportAPI = {
  getDashboard: (params) => api.get('/reports/dashboard', { params }),
  getRevenue: (params) => api.get('/reports/revenue', { params }),
  getTopMedicines: (params) => api.get('/reports/top-medicines', { params }),
  getInventory: (params) => api.get('/reports/inventory', { params }),
};
