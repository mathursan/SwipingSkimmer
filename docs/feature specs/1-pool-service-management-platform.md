# Feature: Pool Service Management Platform

Issue: #1  
Owner: AI Agent

## Customer 

Pool service companies of all sizes (from startups to enterprises managing 20,000+ pools) who need an all-in-one solution to manage their pool service business operations, including routing, scheduling, billing, customer management, and technician coordination.

## Customer's Desired Outcome

Pool service companies want to:
- **Get organized**: Keep all business information (routes, customers, billing) in one place
- **Increase efficiency**: Save 20+ hours per month by eliminating busywork and manual processes
- **Grow business**: Scale 3-4x faster by streamlining operations and taking on more customers
- **Manage reputation**: Provide excellent customer experience with automated communications and service reports
- **Reduce costs**: Travel 200+ miles less per month through route optimization
- **Get paid faster**: Process payments quickly with automated invoicing and AutoPay

## Customer Problem being solved

Pool service companies currently struggle with:
1. **Disorganized operations**: Using spreadsheets, paperwork, and separate systems for different business functions
2. **Inefficient routing**: Technicians waste time and fuel driving inefficient routes
3. **Manual processes**: Time-consuming paperwork, manual invoicing, and customer communication
4. **Poor visibility**: Lack of real-time visibility into business operations and technician activities
5. **Customer complaints**: Difficulty keeping customers informed about service visits and issues
6. **Payment delays**: Slow payment processing and manual invoice management
7. **Technician inefficiency**: Techs spend too much time on paperwork and not enough on service
8. **Lack of data**: No data-driven insights to make business decisions

## User Experience that will solve the problem

### 1. Back Office Web Application (Admin/Manager Experience)

#### Dashboard & Overview
- **Start**: Login to web dashboard
- **View**: Real-time business overview with key metrics:
  - Today's scheduled services
  - Active routes and technicians
  - Revenue and payment status
  - Customer satisfaction metrics
  - Route efficiency metrics
- **Navigate**: Quick access to routes, customers, billing, and reports

#### Route Management & Optimization
- **Access**: Navigate to "Routes" section
- **View**: Map view showing all service locations with optimized routes
- **Optimize**: Click "Optimize Routes" to automatically:
  - Group nearby stops
  - Minimize travel distance
  - Balance technician workloads
  - Account for service windows
- **Edit**: Manually adjust routes by dragging stops
- **Assign**: Assign routes to specific technicians
- **Track**: Real-time tracking of technician locations and progress
- **Result**: Routes optimized to reduce miles by 200+ per month

#### Customer Management (CRM)
- **Access**: Navigate to "Customers" section
- **View**: List of all customers with key information:
  - Service schedule
  - Payment status
  - Service history
  - Contact information
  - Pool equipment details
  - Gate codes and access instructions
- **Add**: Create new customer with all relevant details
- **Edit**: Update customer information, service preferences, billing details
- **Search**: Quick search by name, address, or phone
- **Filter**: Filter by service type, payment status, route assignment
- **View History**: Access complete service history with photos and notes

#### Scheduling
- **Access**: Navigate to "Schedule" section
- **View**: Calendar view showing all scheduled services
- **Create**: Schedule new service visits:
  - Select customer
  - Choose service type (regular cleaning, repair, one-off)
  - Assign technician
  - Set service window
- **Recurring**: Set up recurring service schedules (weekly, bi-weekly, monthly)
- **Reschedule**: Drag and drop to reschedule services
- **Skip**: Mark services as skipped with reason
- **Bulk Actions**: Schedule multiple services at once

#### Billing & Invoicing
- **Access**: Navigate to "Billing" section
- **View**: List of invoices with status (pending, paid, overdue)
- **Create**: Generate invoices:
  - Per month billing
  - Plus chemicals billing
  - Per stop billing
  - With chemicals included
- **Automate**: Set up automatic recurring invoices
- **Process Payments**: 
  - Accept credit/debit card payments
  - Set up AutoPay for customers
  - Process payments in 1 business day
- **Track**: View payment history and overdue invoices
- **Remind**: Automatic reminders for overdue invoices
- **Integrate**: Export to QuickBooks Online for accounting

#### Service Reports & Customer Communication
- **Access**: Navigate to "Reports" or "Communications" section
- **Configure**: Set up automated service report emails
- **Customize**: Customize email templates with company branding
- **View**: Review all sent communications
- **Send**: Manually send emails or text messages to customers
- **Include**: Service reports automatically include:
  - Service date and time
  - Chemical readings
  - Photos of pool condition
  - Work performed
  - Next service date
  - Billing information

#### Technician Management
- **Access**: Navigate to "Technicians" section
- **View**: List of all technicians with status
- **Manage**: Add/edit technician profiles
- **Assign**: Assign routes and customers to technicians
- **Track**: View real-time location and status
- **Review**: Review technician performance and efficiency metrics

### 2. Mobile Application (Technician Experience)

#### Login & Offline Mode
- **Start**: Open mobile app and login
- **Offline**: App works offline, syncs when connection restored
- **View**: Dashboard showing assigned route for the day

#### Route & Schedule View
- **Access**: View optimized route with all assigned stops
- **Navigate**: Tap on stop to see:
  - Customer name and address
  - Service instructions
  - Gate codes
  - Pool equipment details
  - Service history
  - Special notes
- **Optimize**: Adjust route order if needed
- **Navigate**: Tap "Navigate" to open GPS directions
- **Start**: Tap "Start Service" when arriving at location

#### Service Checklist
- **Access**: After starting service, view customizable checklist
- **Complete**: Check off each service item:
  - Skim pool
  - Brush walls
  - Vacuum pool
  - Clean filter
  - Check equipment
  - Add chemicals (if needed)
- **Custom**: Company-specific checklist items
- **Required**: Some items marked as required before completing service

#### Chemical Readings & Dosages
- **Access**: Navigate to "Readings" section during service
- **Enter**: Input chemical readings:
  - Chlorine
  - pH
  - Alkalinity
  - Calcium hardness
  - Cyanuric acid
  - Temperature
- **Calculate**: App automatically calculates:
  - LSI (Langelier Saturation Index)
  - Required dosages for balance
- **Recommend**: View dosing recommendations
- **Record**: Record actual chemicals added
- **Save**: Save readings to service report

#### Service Completion
- **Access**: After completing checklist and readings
- **Photos**: Take photos of pool condition
- **Notes**: Add service notes or issues found
- **Complete**: Mark service as complete
- **Next**: Automatically navigate to next stop

#### Customer Information Access
- **Access**: Tap customer name at any time
- **View**: Access all customer details:
  - Full service history
  - Previous readings
  - Equipment information
  - Billing status
  - Contact information
  - Special instructions

### 3. Customer Experience

#### Service Report Emails
- **Receive**: Automated email after each service visit
- **View**: Email includes:
  - Service date and technician name
  - Chemical readings and balance status
  - Photos of pool
  - Work performed checklist
  - Next scheduled service date
  - Billing information
- **Customize**: Email branded with company logo and colors

#### Payment & Billing
- **Receive**: Automated invoice emails
- **Pay**: Click link to pay online with credit/debit card
- **AutoPay**: Set up automatic payments
- **View**: Access billing history online
- **Reminders**: Receive reminders for upcoming payments or overdue invoices

#### Communication
- **Receive**: Text messages for:
  - Service reminders
  - Technician arrival notifications
  - Service completion confirmations
  - Payment reminders
- **Contact**: Easy way to contact company through app/portal

## Validation Plan

### Functional Validation
1. **Route Optimization**:
   - Create 20+ service locations
   - Run route optimization
   - Verify routes reduce total distance by at least 15%
   - Validate routes are balanced across technicians

2. **Scheduling**:
   - Create recurring service schedules
   - Verify services appear on calendar
   - Test rescheduling and skipping services
   - Validate automatic service creation

3. **Mobile App**:
   - Test offline functionality (disable network, complete service, verify sync when online)
   - Test chemical reading entry and LSI calculation
   - Verify service checklist completion
   - Test photo upload and service report generation

4. **Billing**:
   - Create invoices with different billing models
   - Process test payment
   - Verify AutoPay setup and execution
   - Test QuickBooks integration

5. **Customer Communication**:
   - Complete service visit
   - Verify automated email sent with correct information
   - Verify photos included in email
   - Test text message notifications

### Performance Validation
- Route optimization completes in < 5 seconds for 100+ locations
- Mobile app syncs offline changes in < 10 seconds
- Service reports generate and send within 30 seconds
- Dashboard loads in < 2 seconds

### User Experience Validation
- Admin can complete full workflow (schedule → route → invoice → payment) in < 5 minutes
- Technician can complete service visit (checklist + readings + photos) in < 3 minutes
- Customer receives service report email within 5 minutes of service completion

## Alternatives

| Alternative | Why discard? |
|------------|--------------|
| Use separate tools (Google Maps for routing, QuickBooks for billing, Excel for scheduling) | Too many disconnected systems, data silos, manual data entry between systems, no real-time visibility |
| Build custom solution from scratch | High development cost, long time to market, maintenance burden |
| Use generic field service software (Jobber, ServiceTitan) | Not optimized for pool service industry needs (chemical readings, LSI calculations, pool-specific workflows) |
| Hire more staff to handle manual processes | Expensive, doesn't scale, doesn't solve efficiency problems |
| Use paper-based system | No route optimization, no real-time tracking, manual invoicing, poor customer communication |

## Competitive Landscape

| Competitor | How they solve the problem | What customers say |
|------------|---------------------------|-------------------|
| **Pool Brain** | Pool service management software with routing and billing | Mixed reviews on ease of use, some complaints about support |
| **Paythepoolman** | Billing-focused solution for pool services | Limited features beyond billing, not comprehensive |
| **Pool Office Manager** | Desktop-based pool service management | Outdated interface, no mobile app, limited cloud features |
| **ProValet** | Field service management for various industries | Not pool-specific, lacks chemical reading features |
| **POOL360 PoolService** | Pool service management platform | Less intuitive interface, fewer automation features |
| **Jobber** | Generic field service management | Not optimized for pool industry, lacks pool-specific features |
| **ServiceTitan** | Enterprise field service management | Over-engineered for small pool companies, expensive |

**Skimmer's Competitive Advantages** (from website):
- Most trusted by pool pros (30,000+ users)
- Best-in-class live support (real people, not chatbots)
- Pool industry-specific features (chemical readings, LSI calculations)
- Easy to use interface
- Comprehensive all-in-one solution
- Mobile-first technician experience
- Proven ROI (10-20x return on investment)
