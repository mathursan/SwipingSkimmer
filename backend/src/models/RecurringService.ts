export interface RecurringService {
  id: string;
  customer_id: string;
  service_type: 'regular' | 'repair' | 'one_off';
  frequency: 'weekly' | 'biweekly' | 'monthly';
  day_of_week?: number; // 0-6 for weekly/biweekly
  day_of_month?: number; // 1-31 for monthly
  start_date: Date;
  end_date?: Date; // null means no end
  is_active: boolean;
  technician_id?: string;
  scheduled_time?: string; // HH:MM format
  service_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RecurringServiceCreateInput {
  customer_id: string;
  service_type: 'regular' | 'repair' | 'one_off';
  frequency: 'weekly' | 'biweekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  start_date: string; // ISO date string YYYY-MM-DD
  end_date?: string; // ISO date string YYYY-MM-DD
  technician_id?: string;
  scheduled_time?: string; // HH:MM format
  service_notes?: string;
}

export interface RecurringServiceUpdateInput {
  frequency?: 'weekly' | 'biweekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  start_date?: string; // ISO date string YYYY-MM-DD
  end_date?: string; // ISO date string YYYY-MM-DD or null
  is_active?: boolean;
  technician_id?: string;
  scheduled_time?: string; // HH:MM format
  service_notes?: string;
}

export interface RecurringServiceFilters {
  customer_id?: string;
  is_active?: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly';
}
