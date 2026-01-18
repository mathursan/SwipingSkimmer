-- Create recurring_services table
CREATE TABLE IF NOT EXISTS recurring_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- 'regular', 'repair', 'one_off'
  frequency VARCHAR(50) NOT NULL, -- 'weekly', 'biweekly', 'monthly'
  day_of_week INTEGER, -- 0-6 (Sunday=0) for weekly/biweekly
  day_of_month INTEGER, -- 1-31 for monthly
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means no end date
  is_active BOOLEAN DEFAULT TRUE,
  technician_id UUID, -- nullable initially (users table doesn't exist yet, will add FK later)
  scheduled_time TIME, -- Optional: default time
  service_notes TEXT, -- Optional: default notes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- Constraints
  CONSTRAINT chk_frequency CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  CONSTRAINT chk_service_type CHECK (service_type IN ('regular', 'repair', 'one_off')),
  CONSTRAINT chk_day_of_week CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  CONSTRAINT chk_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
  CONSTRAINT chk_end_date_after_start CHECK (end_date IS NULL OR end_date >= start_date),
  -- Ensure day_of_week is set for weekly/biweekly
  CONSTRAINT chk_weekly_day CHECK (
    (frequency IN ('weekly', 'biweekly') AND day_of_week IS NOT NULL) OR
    (frequency = 'monthly' AND day_of_week IS NULL)
  ),
  -- Ensure day_of_month is set for monthly
  CONSTRAINT chk_monthly_day CHECK (
    (frequency = 'monthly' AND day_of_month IS NOT NULL) OR
    (frequency IN ('weekly', 'biweekly') AND day_of_month IS NULL)
  )
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recurring_services_customer ON recurring_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_services_active ON recurring_services(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_recurring_services_frequency ON recurring_services(frequency);
CREATE INDEX IF NOT EXISTS idx_recurring_services_start_date ON recurring_services(start_date);
