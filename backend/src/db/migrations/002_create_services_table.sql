-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  route_id UUID, -- nullable initially (routes table doesn't exist yet, will add FK later)
  technician_id UUID, -- nullable initially (users table doesn't exist yet, will add FK later)
  service_type VARCHAR(50) NOT NULL, -- 'regular', 'repair', 'one_off'
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'skipped'
  completed_at TIMESTAMP,
  service_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_services_customer_id ON services(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_scheduled_date ON services(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_route_id ON services(route_id);
