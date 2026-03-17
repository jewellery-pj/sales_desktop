import axios from 'axios';

// const API_BASE_URL =  'http://127.0.0.1:8000/api';
const API_BASE_URL =  'https://kpi.29jewellery.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log('API Request:', config.url, 'Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization);
    } else {
      console.log('No auth token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.config?.url, error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - API server may not be running');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  employeeLogin: (credentials: { staff_id: string; password: string }) =>
    api.post('/employee-login', credentials),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/user'),
};

export const salesAPI = {
  getSales: (params?: any) => api.get('/mobile/sales', { params }),
  createSale: (data: any) => api.post('/mobile/sales', data),
  getStats: () => api.get('/mobile/sales/stats'),
};

export const saleAnalyticsAPI = {
  getBranches: () => api.get('/sale-analytics/helpers/branches'),
  getEmployees: (branchId: number) => api.get(`/sale-analytics/helpers/employees?branch_id=${branchId}`),
  getSaleStatuses: () => api.get('/sale-analytics/helpers/sale-statuses'),
  getRecordById: (id: number) => api.get(`/sale-analytics/${id}`),
  createRecord: (data: any) => api.post('/sale-analytics', data),
  updateRecord: (id: number, data: any) => api.put(`/sale-analytics/${id}`, data),
  getRecords: (filters?: { sale_status_id?: number; date_from?: string; date_to?: string; item_code?: string; invoice_number?: string }) => {
    return api.get('/sale-analytics', { params: filters });
  },
};

export { API_BASE_URL };
export default api;
