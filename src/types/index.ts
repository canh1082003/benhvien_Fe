// TypeScript interfaces matching Django API responses

export interface AssetCategory {
  id: number;
  code: string;
  name: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  country: string;
}

export interface Vendor {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface StatusInfo {
  status: string;
  text: string;
  badge: string;
}

export interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  serial_no: string;
  model_name_manual: string;
  barcode: string;
  imei: string;
  current_status: AssetStatus;
  status_badge: string;
  category_name: string;
  owner_dept_name: string;
  manufacturer_name: string;
  building: string;
  floor: string;
  room: string;
  risk_class: string;
  criticality: string;
  inspection_required: boolean;
  inspection_expiry_date: string | null;
  pm_required: boolean;
  pm_next_due_date: string | null;
  commissioned_at: string | null;
  useful_life_years: number | null;
  warranty_end_at: string | null;
  updated_at: string;
  inspection_status: StatusInfo;
  pm_status: StatusInfo;
  eol_status: StatusInfo;
  // Detail fields
  category?: AssetCategory;
  owner_dept?: Department;
  manufacturer?: Manufacturer;
  vendor?: Vendor;
  purchase_price?: string;
  purchase_at?: string | null;
  warranty_start_at?: string | null;
  notes?: string;
  created_at?: string;
}

export type AssetStatus =
  | 'IN_SERVICE'
  | 'STANDBY'
  | 'UNDER_MAINTENANCE'
  | 'BREAKDOWN'
  | 'OUT_OF_SERVICE'
  | 'DECOMMISSIONED';

export interface KPI {
  total: number;
  in_service: number;
  standby: number;
  under_maintenance: number;
  breakdown: number;
  out_of_service: number;
  inspection_overdue: number;
  inspection_soon: number;
  pm_overdue: number;
  pm_soon: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
