export interface Customer {
  id: string;
  company_id?: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  gate_code?: string;
  service_notes?: string;
  billing_model?: 'per_month' | 'plus_chems' | 'per_stop' | 'with_chems';
  monthly_rate?: number;
  autopay_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerCreateInput {
  company_id?: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  gate_code?: string;
  service_notes?: string;
  billing_model?: 'per_month' | 'plus_chems' | 'per_stop' | 'with_chems';
  monthly_rate?: number;
  autopay_enabled?: boolean;
}

export interface CustomerUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  gate_code?: string;
  service_notes?: string;
  billing_model?: 'per_month' | 'plus_chems' | 'per_stop' | 'with_chems';
  monthly_rate?: number;
  autopay_enabled?: boolean;
}

export interface CustomerFilters {
  search?: string; // Search by name, address, or phone
  service_type?: string;
  payment_status?: string;
  route_assignment?: string;
  billing_model?: string;
  limit?: number;
  offset?: number;
}
