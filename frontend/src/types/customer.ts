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
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateInput {
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  gate_code?: string;
  service_notes?: string;
  billing_model?: 'per_month' | 'plus_chems' | 'per_stop' | 'with_chems';
  monthly_rate?: number;
  autopay_enabled?: boolean;
}

export interface CustomerFilters {
  search?: string;
  billing_model?: string;
  service_type?: string;
  payment_status?: string;
  route_assignment?: string;
}
