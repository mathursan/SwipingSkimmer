export interface Service {
  id: string;
  customer_id: string;
  route_id?: string;
  technician_id?: string;
  service_type: 'regular' | 'repair' | 'one_off';
  scheduled_date: Date;
  scheduled_time?: string; // TIME format HH:MM:SS
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: Date;
  service_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceCreateInput {
  customer_id: string;
  route_id?: string;
  technician_id?: string;
  service_type: 'regular' | 'repair' | 'one_off';
  scheduled_date: string; // ISO date string YYYY-MM-DD
  scheduled_time?: string; // TIME format HH:MM:SS
  status?: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  service_notes?: string;
}

export interface ServiceUpdateInput {
  customer_id?: string;
  route_id?: string;
  technician_id?: string;
  service_type?: 'regular' | 'repair' | 'one_off';
  scheduled_date?: string; // ISO date string YYYY-MM-DD
  scheduled_time?: string; // TIME format HH:MM:SS
  status?: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: Date;
  service_notes?: string;
}

export interface ServiceFilters {
  customer_id?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  start_date?: string; // ISO date string YYYY-MM-DD
  end_date?: string; // ISO date string YYYY-MM-DD
  limit?: number;
  offset?: number;
}
