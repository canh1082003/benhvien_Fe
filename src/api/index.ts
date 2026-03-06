import axios from 'axios';
import type { Asset, AssetCategory, Department, KPI, Manufacturer, PaginatedResponse, Vendor } from '../types';

// Detect environment and set API base URL
// - Local: use relative path (Vite proxy to localhost:8000)
// - Production: use VITE_API_BASE_URL from environment
const isProduction = import.meta.env.PROD;
const apiBase = isProduction 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://benhvien-be.onrender.com/api')
  : '/api';

console.log('[API] Environment:', { isProduction, apiBase });

export const api = axios.create({ baseURL: apiBase });

// Request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AssetFilters {
  search?: string;
  status?: string;
  dept?: string;
  category?: string;
  quick?: string;
  page?: number;
}

export const assetsApi = {
  list: (filters: AssetFilters = {}) => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.dept) params.dept = filters.dept;
    if (filters.category) params.category = filters.category;
    if (filters.quick) params.quick = filters.quick;
    if (filters.page && filters.page > 1) params.page = String(filters.page);
    return api.get<PaginatedResponse<Asset>>('/assets/', { params });
  },
  get: (id: number) => api.get<Asset>(`/assets/${id}/`),
  kpi: () => api.get<KPI>('/assets/kpi/'),
  create: (data: Partial<Asset>) => api.post<Asset>('/assets/', data),
  update: (id: number, data: Partial<Asset>) => api.patch<Asset>(`/assets/${id}/`, data),
  delete: (id: number) => api.delete(`/assets/${id}/`),
};

export const departmentsApi = {
  list: () => api.get<PaginatedResponse<Department>>('/departments/'),
};

export const categoriesApi = {
  list: () => api.get<PaginatedResponse<AssetCategory>>('/categories/'),
};

export const manufacturersApi = {
  list: () => api.get<PaginatedResponse<Manufacturer>>('/manufacturers/'),
};

export const vendorsApi = {
  list: () => api.get<PaginatedResponse<Vendor>>('/vendors/'),
};
