# Feature: Pool Service Management Platform

Issue: #1  
Owner: AI Agent

## Customer 

Pool service companies of all sizes (from startups to enterprises managing 20,000+ pools) who need an all-in-one solution to manage their pool service business operations.

## Customer Problem being solved

Pool service companies struggle with:
1. Disorganized operations using spreadsheets, paperwork, and separate systems
2. Inefficient routing wasting time and fuel
3. Manual processes consuming 20+ hours per month
4. Poor visibility into business operations
5. Customer complaints due to lack of communication
6. Payment delays and manual invoice management
7. Technician inefficiency with paperwork
8. Lack of data-driven insights

## User Experience that will solve the problem

### Back Office Web Application
- **Dashboard**: Login → View real-time business metrics, scheduled services, active routes, revenue status
- **Route Management**: Navigate to Routes → View map with service locations → Click "Optimize Routes" → See optimized routes → Assign to technicians → Track in real-time
- **Customer Management**: Navigate to Customers → View list → Search/Filter → Add/Edit customer → View service history
- **Scheduling**: Navigate to Schedule → View calendar → Create recurring/one-off services → Reschedule by drag-drop → Mark as skipped
- **Billing**: Navigate to Billing → View invoices → Create invoices (per month/plus chems/per stop) → Process payments → Set up AutoPay → Export to QuickBooks
- **Service Reports**: Configure automated emails → Customize templates → View sent communications → Manual send emails/texts

### Mobile Application (Technician)
- **Login**: Open app → Login → View assigned route (works offline)
- **Route View**: See optimized route → Tap stop → View customer details, gate codes, service history
- **Service Execution**: Tap "Start Service" → Complete checklist → Enter chemical readings → App calculates LSI and dosages → Take photos → Add notes → Mark complete → Navigate to next stop
- **Offline Mode**: App works offline → Complete services → Sync when connection restored

### Customer Experience
- **Service Reports**: Receive automated email after service with readings, photos, work performed
- **Billing**: Receive invoice emails → Click to pay online → Set up AutoPay → View billing history
- **Communication**: Receive text messages for reminders, arrival notifications, completion confirmations

## Technical Details

### Architecture Overview
- **Backend API**: RESTful API server (Node.js/Express or Python/FastAPI)
- **Web Frontend**: React/Next.js single-page application
- **Mobile App**: React Native (iOS/Android) with offline-first architecture
- **Database**: PostgreSQL for relational data
- **Real-time**: WebSocket server for live tracking and updates
- **File Storage**: AWS S3 or similar for service photos
- **Payment Processing**: Stripe integration
- **Email/SMS**: SendGrid for emails, Twilio for SMS
- **Route Optimization**: Custom algorithm or integration with Google Maps API / Mapbox
- **Offline Sync**: Local SQLite database in mobile app with conflict resolution

### UI Changes

#### Web Application Components
- **Dashboard Component** (`/components/dashboard/Dashboard.tsx`):
  - Real-time metrics cards
  - Today's schedule widget
  - Route status map
  - Revenue summary
  - Quick actions

- **Route Management** (`/components/routes/RouteManager.tsx`):
  - Interactive map (Mapbox/Google Maps)
  - Route optimization controls
  - Technician assignment interface
  - Real-time tracking overlay

- **Customer Management** (`/components/customers/CustomerList.tsx`, `CustomerDetail.tsx`):
  - Searchable/filterable customer list
  - Customer detail view with tabs (info, history, billing, equipment)
  - Service history timeline
  - Photo gallery

- **Scheduling** (`/components/schedule/CalendarView.tsx`):
  - Full calendar view (month/week/day)
  - Drag-drop rescheduling
  - Recurring service configuration
  - Bulk operations

- **Billing** (`/components/billing/InvoiceList.tsx`, `InvoiceDetail.tsx`):
  - Invoice list with filters
  - Invoice creation wizard
  - Payment processing interface
  - AutoPay configuration
  - QuickBooks export

- **Service Reports** (`/components/reports/ReportConfig.tsx`, `ReportHistory.tsx`):
  - Email template editor
  - Report configuration
  - Communication history
  - Manual send interface

#### Mobile Application Screens
- **Login Screen** (`/screens/LoginScreen.tsx`)
- **Route Dashboard** (`/screens/RouteDashboard.tsx`): List of assigned stops
- **Stop Detail** (`/screens/StopDetail.tsx`): Customer info, service instructions
- **Service Execution** (`/screens/ServiceExecution.tsx`): Checklist, readings, photos
- **Chemical Readings** (`/screens/ChemicalReadings.tsx`): Input readings, view LSI calculations
- **Customer History** (`/screens/CustomerHistory.tsx`): Service history, previous readings

### API Surface (OpenAPI)

#### Authentication
- `POST /api/auth/login` - Admin/technician login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

#### Routes
- `GET /api/routes` - List all routes
- `POST /api/routes` - Create route
- `GET /api/routes/:id` - Get route details
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `POST /api/routes/optimize` - Optimize routes (accepts array of stops, returns optimized routes)
- `GET /api/routes/:id/live` - WebSocket endpoint for real-time route tracking

#### Customers
- `GET /api/customers` - List customers (with search/filter)
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/history` - Get service history
- `GET /api/customers/:id/equipment` - Get equipment info

#### Services
- `GET /api/services` - List services (with date range filter)
- `POST /api/services` - Create service
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `POST /api/services/:id/complete` - Mark service as complete
- `POST /api/services/recurring` - Create recurring service schedule

#### Service Reports
- `GET /api/services/:id/report` - Get service report
- `POST /api/services/:id/report` - Generate and send service report
- `GET /api/reports` - List all reports
- `PUT /api/reports/config` - Update report configuration

#### Chemical Readings
- `POST /api/services/:id/readings` - Record chemical readings
- `GET /api/services/:id/readings` - Get readings for service
- `POST /api/readings/calculate-lsi` - Calculate LSI from readings
- `POST /api/readings/dosing-recommendations` - Get dosing recommendations

#### Billing
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `POST /api/invoices/:id/pay` - Process payment
- `POST /api/invoices/:id/autopay` - Set up AutoPay
- `GET /api/invoices/export/quickbooks` - Export to QuickBooks format

#### Technicians
- `GET /api/technicians` - List technicians
- `POST /api/technicians` - Create technician
- `GET /api/technicians/:id` - Get technician details
- `PUT /api/technicians/:id` - Update technician
- `GET /api/technicians/:id/location` - Get current location (real-time)

#### Mobile Sync
- `POST /api/sync/push` - Push offline changes from mobile
- `GET /api/sync/pull` - Pull updates from server
- `POST /api/sync/resolve-conflicts` - Resolve sync conflicts

### Data Model / Schema Changes

#### Core Tables
```sql
-- Users (admins and technicians)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'technician'
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies (pool service businesses)
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  settings JSONB, -- Company-specific settings
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  gate_code VARCHAR(50),
  service_notes TEXT,
  billing_model VARCHAR(50), -- 'per_month', 'plus_chems', 'per_stop', 'with_chems'
  monthly_rate DECIMAL(10, 2),
  autopay_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Routes
CREATE TABLE routes (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  technician_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  optimized_order INTEGER[], -- Array of service IDs in optimized order
  total_distance DECIMAL(10, 2), -- in miles
  estimated_duration INTEGER, -- in minutes
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services (individual service visits)
CREATE TABLE services (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  route_id UUID REFERENCES routes(id),
  technician_id UUID REFERENCES users(id),
  service_type VARCHAR(50) NOT NULL, -- 'regular', 'repair', 'one_off'
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'skipped'
  completed_at TIMESTAMP,
  service_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recurring Service Schedules
CREATE TABLE recurring_services (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  frequency VARCHAR(50) NOT NULL, -- 'weekly', 'biweekly', 'monthly'
  day_of_week INTEGER, -- 0-6 for weekly/biweekly
  day_of_month INTEGER, -- 1-31 for monthly
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service Checklists
CREATE TABLE service_checklists (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL, -- Array of {id, name, required, order}
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service Checklist Completion
CREATE TABLE service_checklist_items (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  checklist_item_id VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chemical Readings
CREATE TABLE chemical_readings (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  chlorine DECIMAL(5, 2),
  ph DECIMAL(4, 2),
  alkalinity INTEGER,
  calcium_hardness INTEGER,
  cyanuric_acid INTEGER,
  temperature DECIMAL(5, 2),
  lsi DECIMAL(5, 2), -- Calculated LSI
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chemical Dosages
CREATE TABLE chemical_dosages (
  id UUID PRIMARY KEY,
  reading_id UUID REFERENCES chemical_readings(id),
  chemical_type VARCHAR(100) NOT NULL,
  amount DECIMAL(8, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- 'oz', 'lbs', 'gallons'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service Photos
CREATE TABLE service_photos (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  photo_url TEXT NOT NULL,
  photo_key VARCHAR(255) NOT NULL, -- S3 key
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  equipment_type VARCHAR(100) NOT NULL, -- 'pump', 'filter', 'heater', etc.
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  installation_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  company_id UUID REFERENCES companies(id),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  quickbooks_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service Reports
CREATE TABLE service_reports (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP,
  report_data JSONB, -- Full report data snapshot
  created_at TIMESTAMP DEFAULT NOW()
);

-- Technician Locations (for real-time tracking)
CREATE TABLE technician_locations (
  id UUID PRIMARY KEY,
  technician_id UUID REFERENCES users(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Mobile Sync Queue (for offline sync)
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL, -- 'service', 'reading', 'photo'
  entity_id UUID NOT NULL,
  operation VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced', 'conflict'
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);
```

### Failure Modes & Timeouts

#### API Timeouts
- Route optimization: 30 seconds timeout (can be long-running for large datasets)
- Payment processing: 10 seconds timeout (Stripe API)
- Email sending: 5 seconds timeout (SendGrid API)
- SMS sending: 5 seconds timeout (Twilio API)
- File upload: 60 seconds timeout (S3 upload)
- Database queries: 5 seconds timeout

#### Failure Handling
- **Route Optimization Failure**: Return error, allow manual route adjustment
- **Payment Processing Failure**: Return error with user-friendly message, allow retry
- **Email/SMS Failure**: Queue for retry, log error, don't block service completion
- **File Upload Failure**: Retry up to 3 times, then return error
- **Database Connection Failure**: Return 503 error, implement retry logic
- **Offline Sync Conflicts**: Detect conflicts, present resolution UI, merge when possible

### Telemetry & Analytics

#### Metrics to Track
- Route optimization time and distance savings
- Service completion time
- Payment processing success rate
- Email/SMS delivery rates
- Mobile app offline usage
- Sync conflict frequency
- API response times
- Error rates by endpoint
- User activity (logins, feature usage)

#### Logging
- All API requests with request/response logging
- Error logs with stack traces
- Payment transaction logs
- Email/SMS delivery logs
- Route optimization logs
- Sync operation logs

#### Alerts
- High error rate (>5% of requests)
- Payment processing failures
- Database connection issues
- Route optimization failures
- Email/SMS delivery failures
- Sync conflict spikes

## Confidence Level

**85%** - High confidence in the overall architecture and approach. The main areas of uncertainty:
- Route optimization algorithm performance for very large datasets (1000+ stops)
- Offline sync conflict resolution complexity
- Real-time tracking performance at scale
- LSI calculation accuracy and edge cases

These can be addressed through:
- Spike testing route optimization with sample data
- Prototyping offline sync with conflict scenarios
- Load testing real-time tracking
- Validating LSI calculations against known pool chemistry standards

## Validation Plan

| User Scenario | Expected Outcome | Validation Method |
|--------------|------------------|-------------------|
| Admin creates route with 20 stops and optimizes | Route optimized, total distance reduced by 15%+, balanced across technicians | UI validation: Check route map, verify distance metrics |
| Admin schedules recurring weekly service | Service appears on calendar, auto-creates weekly | Database validation: Check recurring_services and services tables |
| Technician completes service offline | Service saved locally, syncs when online | Mobile app validation: Complete service offline, verify sync status, check server |
| Technician enters chemical readings | LSI calculated correctly, dosing recommendations shown | API validation: POST readings, verify LSI calculation, check recommendations |
| Service completed, report sent | Customer receives email with photos and readings | Email validation: Check email inbox, verify all data included |
| Customer pays invoice | Payment processed, invoice marked paid, QuickBooks synced | Database + API validation: Check invoice status, verify Stripe payment, check QuickBooks export |
| Admin views real-time technician location | Map shows current technician position | UI validation: Check map, verify location updates |
| Route optimization for 100+ stops | Completes in < 30 seconds, reduces distance | API validation: POST optimize endpoint, measure time, verify results |

## Test Matrix

### Unit Tests
- **Route Optimization Algorithm** (`/tests/unit/routes/optimization.test.ts`):
  - Test distance calculation
  - Test route ordering
  - Test load balancing
  - Test edge cases (single stop, all stops same location)

- **LSI Calculation** (`/tests/unit/chemistry/lsi.test.ts`):
  - Test LSI formula with known values
  - Test edge cases (extreme pH, temperature)
  - Test dosing recommendations

- **Chemical Reading Validation** (`/tests/unit/chemistry/readings.test.ts`):
  - Test valid reading ranges
  - Test invalid input handling
  - Test unit conversions

- **Invoice Calculation** (`/tests/unit/billing/invoice.test.ts`):
  - Test subtotal calculation
  - Test tax calculation
  - Test different billing models
  - Test AutoPay logic

- **Service Report Generation** (`/tests/unit/reports/generation.test.ts`):
  - Test report data assembly
  - Test email template rendering
  - Test photo inclusion

- **Offline Sync Logic** (`/tests/unit/sync/sync.test.ts`):
  - Test conflict detection
  - Test merge logic
  - Test queue management

### Integration Tests
- **Route Management Flow** (`/tests/integration/routes.test.ts`):
  - Create route → Optimize → Assign technician → Track
  - Mock external services (maps API)

- **Service Completion Flow** (`/tests/integration/services.test.ts`):
  - Create service → Complete checklist → Enter readings → Upload photos → Generate report
  - Mock file storage (S3)

- **Billing Flow** (`/tests/integration/billing.test.ts`):
  - Create invoice → Process payment → Verify status → Export to QuickBooks
  - Mock Stripe API, QuickBooks API

- **Mobile Sync Flow** (`/tests/integration/sync.test.ts`):
  - Complete service offline → Sync → Verify data on server
  - Mock mobile app sync endpoint

- **Customer Communication Flow** (`/tests/integration/communication.test.ts`):
  - Complete service → Generate report → Send email/SMS
  - Mock SendGrid, Twilio

### E2E Tests
- **Complete Service Workflow** (`/tests/e2e/service-workflow.spec.ts`):
  - Admin schedules service → Technician completes on mobile → Customer receives report → Payment processed
  - No mocking, full stack test with test database

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|-------|-------------|------------|
| Route optimization too slow for large datasets | High | Medium | Implement caching, use approximate algorithms for 500+ stops, add progress indicators |
| Offline sync conflicts complex | Medium | Medium | Implement last-write-wins with conflict detection, provide manual resolution UI |
| Real-time tracking performance at scale | Medium | Low | Use WebSocket connection pooling, implement rate limiting, use efficient data structures |
| LSI calculation accuracy | Medium | Low | Validate against industry standards, provide manual override, log calculations for review |
| Payment processing failures | High | Low | Implement retry logic, use Stripe's idempotency, provide clear error messages |
| Email/SMS delivery failures | Medium | Medium | Queue for retry, implement exponential backoff, provide manual send option |
| Mobile app offline storage limits | Medium | Low | Implement data pruning, compress photos, limit history sync |
| Database performance at scale | High | Low | Implement proper indexing, use connection pooling, plan for read replicas |

## Observability (logs, metrics, alerts)

### Logging
- **Request Logging**: All API requests with method, path, user, response time, status
- **Error Logging**: Full stack traces with context (user, request data, timestamp)
- **Business Events**: Service completions, payments, route optimizations, report sends
- **Performance Logging**: Slow queries (>1s), long-running operations

### Metrics
- **API Metrics**: Request rate, response time (p50, p95, p99), error rate by endpoint
- **Business Metrics**: Services completed per day, routes optimized, payments processed, reports sent
- **System Metrics**: Database connection pool usage, WebSocket connections, file storage usage
- **Mobile Metrics**: Offline usage, sync success rate, conflict rate

### Alerts
- **Critical**: Payment processing failures, database connection issues, authentication failures
- **Warning**: High error rate (>5%), slow API responses (>2s p95), email/SMS delivery failures
- **Info**: Route optimization completions, large sync operations, new customer signups

### Dashboards
- **Operations Dashboard**: API health, error rates, response times, system resources
- **Business Dashboard**: Services completed, revenue, customer satisfaction, route efficiency
- **Mobile Dashboard**: Offline usage, sync status, conflict resolution, app performance
