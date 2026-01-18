export interface Service {
  id: string;
  customer_id: string;
  route_id?: string;
  technician_id?: string;
  service_type: 'regular' | 'repair' | 'one_off';
  scheduled_date: string; // ISO date string
  scheduled_time?: string; // TIME format HH:MM:SS
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string; // ISO timestamp
  service_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceFilters {
  customer_id?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  start_date?: string; // ISO date string YYYY-MM-DD
  end_date?: string; // ISO date string YYYY-MM-DD
}
